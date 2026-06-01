import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions";
const CONSULTATION_SUFFIX = "如需获得个性化升学规划，请联系顾问老师。";

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

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

function normalizeAnswer(answer: string) {
  const trimmed = answer.trim();
  if (!trimmed) return CONSULTATION_SUFFIX;
  if (trimmed.includes(CONSULTATION_SUFFIX)) return trimmed;
  return `${trimmed}\n\n${CONSULTATION_SUFFIX}`;
}

export async function POST(request: NextRequest) {
  let body: { question?: string };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = body.question?.trim();
  if (!question) {
    return NextResponse.json({ error: "请输入问题" }, { status: 400 });
  }

  if (question.length > 500) {
    return NextResponse.json({ error: "问题请控制在500字以内" }, { status: 400 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY not configured" },
      { status: 500 }
    );
  }

  const ipAddress = getIp(request);
  let answer = "";

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
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

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status}`, detail },
        { status: 502 }
      );
    }

    const data = await response.json();
    answer = normalizeAnswer(data.choices?.[0]?.message?.content || "");
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to call DeepSeek API", detail },
      { status: 500 }
    );
  }

  const supabase = createPublicSupabaseClient();
  if (supabase) {
    await supabase.from("ai_assistant_chats").insert({
      ip_address: ipAddress,
      question,
      answer,
    });
  }

  return NextResponse.json({ answer });
}
