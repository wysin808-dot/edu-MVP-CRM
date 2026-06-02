import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logUsage } from "@/lib/quota";

// 火山引擎 Ark (豆包) API
const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

const SYSTEM_PROMPT = `你是国际教育行业的爆款选题策划专家，精通小红书、知乎、抖音、百家号、视频号的流量逻辑和搜索词逻辑。
你服务的是新加坡国际教育招生团队（面向中国家长，主题涉及 WACE、O-Level、AEIS、A-Level、IB、新加坡/香港/澳洲升学、国际高中、陪读等）。
你的选题要：踩中家长真实搜索词与痛点、有点击欲望、利于平台推荐、利于后续转化招生线索。
绝不夸大、不承诺录取、不违反平台规则。`;

// 六大选题类型
const CATEGORIES = ["流量型", "焦虑型", "对比型", "申请型", "干货型", "热点型"] as const;

function buildPrompt(keyword: string, perCategory: number): string {
  return `请围绕关键词「${keyword}」，为招生团队策划 ${CATEGORIES.length * perCategory} 个高流量选题，分为 6 类，每类 ${perCategory} 个：

- 流量型：科普/搜索词型，家长会主动搜索的问题（如"XX是什么""XX难吗""XX适合中国学生吗"）
- 焦虑型：戳中家长升学焦虑与信息差的痛点选题（不可贩卖恐慌）
- 对比型：A vs B 的对比选题（如"WACE vs A-Level"）
- 申请型：与大学申请/录取相关的选题（如"用WACE申请NUS难吗"）
- 干货型：清单/攻略/避坑/时间表等实用型选题
- 热点型：结合时间节点/政策/时事的选题

每条选题还要判断它最适合的「生产方式」，给出三个标注：
1. 建议平台：从【小红书 / 知乎 / 抖音 / 视频号 / 百家号 / 公众号】里选 1 个最合适的
2. 内容形式：从【图文 / 视频】里选 1 个（信息密度高、需要深度讲解→图文；情绪/冲突/演示/口播→视频）
3. 真人出镜：从【需要真人 / 口播不出镜 / 不需要】里选 1 个（强信任/人设类→需要真人；纯讲解可口播；图文或纯素材→不需要）

输出格式（必须严格遵守，不要任何多余文字、不要解释、不要编号，每条一行，5 个字段用英文竖线 | 分隔）：
[流量型]
选题标题|一句话角度说明|建议平台|内容形式|真人出镜
选题标题|一句话角度说明|建议平台|内容形式|真人出镜
[焦虑型]
...以此类推，6 类都要输出，每类 ${perCategory} 条。`;
}

type ParsedTopic = {
  category: string;
  title: string;
  angle: string;
  platform: string;
  form: string;
  presenter: string;
};

const FORM_VALUES = ["图文", "视频"];
const PRESENTER_VALUES = ["需要真人", "口播不出镜", "不需要"];

function normForm(v: string): string {
  const s = (v || "").trim();
  if (s.includes("视频")) return "视频";
  if (s.includes("图文") || s.includes("图")) return "图文";
  return FORM_VALUES.includes(s) ? s : "图文";
}

function normPresenter(v: string): string {
  const s = (v || "").trim();
  if (s.includes("需要真人") || s === "真人" || s.includes("出镜")) {
    if (s.includes("不出镜") || s.includes("口播")) return "口播不出镜";
    if (s.includes("不需要")) return "不需要";
    return "需要真人";
  }
  if (s.includes("口播")) return "口播不出镜";
  if (s.includes("不需要") || s.includes("无")) return "不需要";
  return PRESENTER_VALUES.includes(s) ? s : "不需要";
}

function parseTopics(text: string): ParsedTopic[] {
  const out: ParsedTopic[] = [];
  let current = "";
  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const headerMatch = line.match(/^[\[【]\s*(.+?)\s*[\]】]$/);
    if (headerMatch) {
      const cat = headerMatch[1].trim();
      current = (CATEGORIES as readonly string[]).includes(cat) ? cat : cat;
      continue;
    }
    // 去掉可能的序号前缀 "1. " "1、"
    const cleaned = line.replace(/^\d+[.、)]\s*/, "");
    const parts = cleaned.split(/\s*[|｜]\s*/);
    const title = (parts[0] || "").trim();
    const angle = (parts[1] || "").trim();
    const platform = (parts[2] || "").trim();
    const form = normForm(parts[3] || "");
    const presenter = form === "图文" ? "不需要" : normPresenter(parts[4] || "");
    if (title && title.length >= 2) {
      out.push({ category: current || "其他", title, angle, platform: platform || "小红书", form, presenter });
    }
  }
  return out;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ARK_API_KEY;
  const endpointId = process.env.ARK_TEXT_ENDPOINT;
  if (!apiKey || !endpointId) {
    return NextResponse.json(
      { error: "ARK_API_KEY or ARK_TEXT_ENDPOINT not configured" },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const keyword = (body?.keyword || "").trim();
  const perCategory = Math.min(8, Math.max(3, Number(body?.perCategory) || 5));
  if (!keyword) {
    return NextResponse.json({ error: "Missing keyword" }, { status: 400 });
  }

  // 取当前用户 team（best-effort）
  let team = "china";
  try {
    const { data: prof } = await supabase
      .from("user_profiles")
      .select("team")
      .eq("id", user.id)
      .single();
    if (prof?.team) team = prof.team;
  } catch {
    /* ignore */
  }

  try {
    const response = await fetch(ARK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: endpointId,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(keyword, perCategory) },
        ],
        temperature: 0.9,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `Ark API error: ${response.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const outputText = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || {};

    const parsed = parseTopics(outputText);
    if (parsed.length === 0) {
      return NextResponse.json(
        { error: "未能解析出选题，请重试", raw: outputText.slice(0, 500) },
        { status: 502 }
      );
    }

    const batchId = `topic_${new Date().toISOString().split("T")[0]}_${Date.now()}`;
    const userName = user.email?.split("@")[0] || "unknown";

    const rows = parsed.map((p) => ({
      user_id: user.id,
      user_name: userName,
      team,
      keyword,
      batch_id: batchId,
      category: p.category,
      title: p.title,
      angle: p.angle || null,
      suggest_platform: p.platform || null,
      content_form: p.form,
      needs_presenter: p.presenter,
      status: "待用",
      used_count: 0,
    }));

    // 先按带属性列插入；若库里还没跑 012 迁移（缺列），自动回退为不带属性插入，保证不失败
    let saved, saveError;
    {
      const r = await supabase.from("topics").insert(rows).select();
      saved = r.data;
      saveError = r.error;
      if (saveError) {
        const fallbackRows = parsed.map((p) => ({
          user_id: user.id,
          user_name: userName,
          team,
          keyword,
          batch_id: batchId,
          category: p.category,
          title: p.title,
          angle: p.angle || null,
          status: "待用",
          used_count: 0,
        }));
        const r2 = await supabase.from("topics").insert(fallbackRows).select();
        saved = r2.data;
        saveError = r2.error;
      }
    }

    if (saveError) {
      console.error("Topic save error:", saveError);
      return NextResponse.json(
        { error: "保存选题失败", detail: saveError.message },
        { status: 500 }
      );
    }

    await logUsage(supabase, {
      userId: user.id,
      userName,
      kind: "text",
      count: 1,
      tokens: usage.total_tokens || 0,
      detail: `选题中心 · ${keyword}（${parsed.length}个）`,
    });

    return NextResponse.json({
      batchId,
      keyword,
      topics: saved || [],
      count: parsed.length,
      tokens: usage.total_tokens || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate topics", detail: message },
      { status: 500 }
    );
  }
}
