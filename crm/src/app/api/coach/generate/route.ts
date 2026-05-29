import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_AI_MODEL } from "@/lib/constants";

const MASTER_PROMPT = `你是 BCI/SEDA 国际教育的招生内容教练。你的任务是帮助招生老师生成适合微信朋友圈、小红书、视频号和家长私聊的内容。

你必须遵守以下规则：
1. 不要硬广，内容要像真人招生老师写的
2. 不要夸大承诺，不要保证录取
3. 内容要体现教育专业判断和家长共情
4. 内容要围绕新加坡国际教育、O-Level、WACE、AEIS、英文提升、升学路径等主题
5. 每条内容需要有轻 CTA，但不要强销售
6. 输出必须自然、温和、可信

绝对禁止出现的表达：
- 保证录取、100% 升学、确保进入政府学校/NTU/NUS
- 最好、第一、唯一、官方指定合作
- 包过、零基础也能轻松拿高分、低分逆袭名校保证

推荐使用的表达：
- 适合部分学生、需要根据学生情况评估
- 帮助学生建立更清晰的路径、提供多元升学选择
- 以官方要求为准、建议提前规划
- 先评估英文与数学基础

朋友圈内容结构要求（70-20-10法则）：
- 70% 教育价值：教育观点、路径分析、家长认知差、学习规划建议
- 20% 真人感："今天和一位家长聊到……"、"最近很多家长问我……"
- 10% 轻转化："如果孩子也在这个阶段，可以先做一次路径评估。"`;

// OpenRouter API configuration
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

function getOpenRouterHeaders(apiKey: string) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "HTTP-Referer": "https://edu-mvp-crm.vercel.app",
    "X-Title": "SEDA OS",
  };
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, platform, audienceTag, tone, contentType, batchMode, model } = body;
  const selectedModel = model || DEFAULT_AI_MODEL;

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  if (batchMode) {
    return handleBatchGenerate(supabase, user, apiKey, selectedModel, topic);
  }

  // Single content generation
  const userPrompt = buildSinglePrompt(topic, platform, audienceTag, tone, contentType);

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: getOpenRouterHeaders(apiKey),
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: MASTER_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const outputText = data.choices?.[0]?.message?.content || "";

    const { data: saved, error: saveError } = await supabase
      .from("coach_generated")
      .insert({
        user_id: user.id,
        user_name: user.email?.split("@")[0] || "unknown",
        topic,
        platform: platform || "朋友圈",
        audience_tag: audienceTag || null,
        tone: tone || null,
        content_type: contentType || "教育观点",
        output_text: outputText,
        is_daily: false,
        batch_id: null,
        is_saved: false,
      })
      .select()
      .single();

    if (saveError) {
      console.error("Save error:", saveError);
    }

    return NextResponse.json({
      content: outputText,
      saved: saved || null,
      model: data.model || selectedModel,
      tokens: data.usage?.total_tokens || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to call OpenRouter API", detail: message },
      { status: 500 }
    );
  }
}

function buildSinglePrompt(
  topic: string,
  platform?: string,
  audienceTag?: string,
  tone?: string,
  contentType?: string
): string {
  const platformMap: Record<string, string> = {
    "朋友圈": "微信朋友圈（200字以内，分段清晰，结尾有轻CTA）",
    "小红书": "小红书（需要吸引人的标题 + emoji + 正文800字左右 + 话题标签）",
    "视频脚本": "60秒短视频脚本（包含：开头钩子、中间内容、结尾CTA，标注画面建议）",
    "家长私聊": "家长微信私聊话术（温和、专业、不推销，引导家长主动了解）",
    "FAQ": "常见问题解答（Q&A格式，专业但易懂）",
  };

  const platformDesc = platformMap[platform || "朋友圈"] || platformMap["朋友圈"];

  let prompt = `请为招生老师生成一条${platform || "朋友圈"}内容。

## 要求
- 主题：${topic}
- 发布平台：${platformDesc}
- 内容类型：${contentType || "教育观点"}`;

  if (audienceTag) {
    prompt += `\n- 目标家长画像：${audienceTag}（请根据这类家长的关注点和痛点来调整内容角度）`;
  }
  if (tone) {
    prompt += `\n- 语气风格：${tone}`;
  }

  prompt += `\n\n请直接输出可以复制使用的内容，不要加任何解释说明。`;
  return prompt;
}

async function handleBatchGenerate(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  user: { id: string; email?: string | null },
  apiKey: string,
  selectedModel: string,
  topic: string
) {
  const batchId = `daily_${new Date().toISOString().split("T")[0]}_${Date.now()}`;

  const batchItems = [
    { platform: "朋友圈", contentType: "教育观点" },
    { platform: "朋友圈", contentType: "家长共情" },
    { platform: "朋友圈", contentType: "校园氛围" },
    { platform: "朋友圈", contentType: "招生转化" },
    { platform: "小红书", contentType: "小红书" },
    { platform: "视频脚本", contentType: "视频脚本" },
    { platform: "家长私聊", contentType: "私聊跟进" },
    { platform: "家长私聊", contentType: "私聊跟进" },
    { platform: "家长私聊", contentType: "私聊跟进" },
  ];

  const batchPrompt = `请围绕主题「${topic}」，一次性生成以下9条招生老师可以直接使用的内容。

每条内容之间用 ===SPLIT=== 分隔。

1. 【教育观点朋友圈】200字以内，展示专业教育判断
2. 【家长共情朋友圈】200字以内，"最近和一位家长聊到..."风格
3. 【校园氛围朋友圈】200字以内，展示学校环境和学生状态
4. 【招生轻转化朋友圈】200字以内，结尾引导咨询但不强推
5. 【小红书笔记】标题 + 800字正文 + 话题标签
6. 【60秒视频脚本】开头钩子 + 中间内容 + 结尾CTA + 画面建议
7. 【家长私聊话术1】初次咨询的破冰回复
8. 【家长私聊话术2】犹豫中家长的跟进话术
9. 【家长私聊话术3】沉默家长的激活话术

请直接输出可使用的内容，不要加说明。每条之间用 ===SPLIT=== 分隔。`;

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: getOpenRouterHeaders(apiKey),
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: "system", content: MASTER_PROMPT },
          { role: "user", content: batchPrompt },
        ],
        temperature: 0.8,
        max_tokens: 6000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `OpenRouter API error: ${response.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const fullOutput = data.choices?.[0]?.message?.content || "";

    const pieces = splitBatchOutput(fullOutput);

    const savedItems = [];
    for (let i = 0; i < Math.min(pieces.length, batchItems.length); i++) {
      const item = batchItems[i];
      const { data: saved } = await supabase
        .from("coach_generated")
        .insert({
          user_id: user.id,
          user_name: user.email?.split("@")[0] || "unknown",
          topic,
          platform: item.platform,
          audience_tag: null,
          tone: null,
          content_type: item.contentType,
          output_text: pieces[i].trim(),
          is_daily: true,
          batch_id: batchId,
          is_saved: false,
        })
        .select()
        .single();

      if (saved) savedItems.push(saved);
    }

    return NextResponse.json({
      batchId,
      items: savedItems,
      model: data.model || selectedModel,
      tokens: data.usage?.total_tokens || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate batch content", detail: message },
      { status: 500 }
    );
  }
}

function splitBatchOutput(text: string): string[] {
  // Try ===SPLIT=== first
  let pieces = text.split(/={3,}SPLIT={3,}/).filter((p) => p.trim());
  if (pieces.length >= 5) return pieces;

  // Try === separator
  pieces = text.split(/={3,}/).filter((p) => p.trim());
  if (pieces.length >= 5) return pieces;

  // Try 【n】 markers
  pieces = text.split(/【\d+】/).filter((p) => p.trim());
  if (pieces.length >= 5) return pieces;

  // Try numbered patterns
  pieces = text.split(/\n\d+[.、]\s*【/).filter((p) => p.trim());

  return pieces;
}
