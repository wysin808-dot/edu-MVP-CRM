import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";

const PORT = Number(process.env.PORT || 3005);
const ROOT = resolve(import.meta.dirname);
const PUBLIC_DIR = join(ROOT, "public");
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const CONSULTATION_SUFFIX = "如需获得个性化升学规划，请联系顾问老师。";

loadEnv(join(ROOT, ".env"));
loadEnv(join(ROOT, "../crm/.env.local"));
loadEnv(join(ROOT, "../crm/.env.production"));

const SYSTEM_PROMPT = `你是AI升学顾问。

主要回答：
- AEIS
- O-Level
- WACE
- 新加坡国际学校
- 新加坡私立学校
- 新加坡大学
- 香港大学
- 澳洲大学

回答要求：
1. 简单易懂
2. 不编造信息
3. 不承诺录取
4. 优先引导咨询老师
5. 回答控制在300字以内

回答结尾统一增加：
${CONSULTATION_SUFFIX}`;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

function loadEnv(filePath) {
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, "utf8");
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index === -1) continue;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

function getIp(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) return forwarded.split(",")[0].trim();
  return request.socket.remoteAddress || "unknown";
}

function readJsonBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 8000) {
        request.destroy();
        rejectBody(new Error("Body too large"));
      }
    });
    request.on("end", () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {});
      } catch {
        rejectBody(new Error("Invalid JSON"));
      }
    });
    request.on("error", rejectBody);
  });
}

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(data));
}

function normalizeAnswer(answer) {
  const trimmed = answer.trim();
  if (!trimmed) return CONSULTATION_SUFFIX;
  if (trimmed.includes(CONSULTATION_SUFFIX)) return trimmed;
  return `${trimmed}\n\n${CONSULTATION_SUFFIX}`;
}

async function insertSupabase(table, payload) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return;

  await fetch(`${url}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
}

async function handleChat(request, response) {
  let body;
  try {
    body = await readJsonBody(request);
  } catch {
    sendJson(response, 400, { error: "请求格式错误" });
    return;
  }

  const question = String(body.question || "").trim();
  if (!question) {
    sendJson(response, 400, { error: "请输入问题" });
    return;
  }

  if (question.length > 500) {
    sendJson(response, 400, { error: "问题请控制在500字以内" });
    return;
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    sendJson(response, 500, { error: "DEEPSEEK_API_KEY 未配置" });
    return;
  }

  try {
    const aiResponse = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: question },
        ],
        temperature: 0.3,
        max_tokens: 600,
      }),
    });

    if (!aiResponse.ok) {
      const message =
        aiResponse.status === 401
          ? "DeepSeek API Key 无效或已过期，请检查配置"
          : `DeepSeek API错误：${aiResponse.status}`;
      sendJson(response, 502, { error: message });
      return;
    }

    const data = await aiResponse.json();
    const answer = normalizeAnswer(data.choices?.[0]?.message?.content || "");

    await insertSupabase("ai_assistant_chats", {
      ip_address: getIp(request),
      question,
      answer,
    });

    sendJson(response, 200, { answer });
  } catch {
    sendJson(response, 500, { error: "AI服务暂时无法连接" });
  }
}

async function handleWechatClick(request, response) {
  await insertSupabase("ai_assistant_events", {
    event_type: "wechat_click",
    ip_address: getIp(request),
  });
  sendJson(response, 200, { ok: true });
}

async function serveStatic(pathname, response) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = resolve(PUBLIC_DIR, `.${safePath}`);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream",
    });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host}`);

  if (request.method === "POST" && url.pathname === "/api/chat") {
    await handleChat(request, response);
    return;
  }

  if (request.method === "POST" && url.pathname === "/api/wechat-click") {
    await handleWechatClick(request, response);
    return;
  }

  if (request.method === "GET" && url.pathname === "/api/config") {
    sendJson(response, 200, {
      wechatId:
        process.env.NEXT_PUBLIC_ADVISOR_WECHAT_ID ||
        process.env.NEXT_PUBLIC_SEDA_WECHAT_ID ||
        "请配置顾问微信号",
      wechatQrUrl:
        process.env.NEXT_PUBLIC_ADVISOR_WECHAT_QR_URL ||
        process.env.NEXT_PUBLIC_SEDA_WECHAT_QR_URL ||
        "",
    });
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    await serveStatic(url.pathname, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`AI升学助手独立服务已启动：http://localhost:${PORT}`);
});
