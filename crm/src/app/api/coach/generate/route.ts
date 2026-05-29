import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MASTER_PROMPT = `你是 BCI/SEDA 国际教育的招生内容教练。你的任务是帮助招生老师生成适合微信朋友圈、小红书、视频号和家长私聊的内容。

你必须遵守以下规则：
1. 不要硬广，内容要像真人招生老师写的
2. 不要夸大承诺，不要保证录取
3. 内容要体现教育专业判断和家长共情
4. 内容要围绕新加坡国际教育、O-Level、WACE、AEIS、英文提升、升学路径等主题
5. 每条内容需要有轻 CTA，但不要强销售
6. 输出必须自然、温和、可信
7. 善用 emoji 表情和排版（小标题、分点、空行）让内容更生动易读，但要克制、不堆砌

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

// 火山引擎 Ark (豆包) API
const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ARK_API_KEY;
  const endpointId = process.env.ARK_TEXT_ENDPOINT;
  if (!apiKey || !endpointId) {
    return NextResponse.json({ error: "ARK_API_KEY or ARK_TEXT_ENDPOINT not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, platform, audienceTag, tone, contentType, batchMode } = body;

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  if (batchMode) {
    return handleBatchGenerate(supabase, user, apiKey, endpointId, topic, platform || "朋友圈");
  }

  // Single content generation
  const userPrompt = buildSinglePrompt(topic, platform, audienceTag, tone, contentType);

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
        { error: `Ark API error: ${response.status}`, detail: errBody },
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
      model: data.model || "doubao",
      tokens: data.usage?.total_tokens || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to call Ark API", detail: message },
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
  endpointId: string,
  topic: string,
  platform: string
) {
  const batchId = `daily_${new Date().toISOString().split("T")[0]}_${Date.now()}`;

  let batchItems: { platform: string; contentType: string }[];
  let batchPrompt: string;

  if (platform === "小红书") {
    batchItems = [
      { platform: "小红书", contentType: "干货笔记" },
      { platform: "小红书", contentType: "经验分享" },
      { platform: "小红书", contentType: "避坑指南" },
      { platform: "小红书", contentType: "对比测评" },
      { platform: "小红书", contentType: "故事种草" },
    ];
    batchPrompt = `请围绕主题「${topic}」，一次性生成以下5条小红书笔记，招生老师可以直接发布。

排版与风格要求（重要）：
- 标题：用 emoji 开头，吸引眼球，如"📍""✨""🔥""💡"
- 正文：每个要点前用 emoji 做小标题（如 "✅""📚""⚠️""👉""💰"），分点清晰，段落之间空行
- 适当用 emoji 点缀句子，营造活泼亲切感，但不要每句都用、不要堆砌
- 结尾：3-5 个话题标签，每个用 # 开头

每条内容之间用 ===SPLIT=== 分隔。

1. 【干货笔记】实用信息、清单、攻略类，标题要有"收藏""必看""整理"等词
2. 【经验分享】"作为从业X年的老师，我的真实建议"，第一人称真诚分享
3. 【避坑指南】"千万别踩这些坑！"，列出家长常见误区
4. 【对比测评】对比不同选择/路径的优劣，客观分析
5. 【故事种草】通过一个真实学生/家长故事引出，结尾自然种草

请直接输出可发布的内容，不要加说明。每条之间用 ===SPLIT=== 分隔。`;
  } else {
    batchItems = [
      { platform: "朋友圈", contentType: "教育观点" },
      { platform: "朋友圈", contentType: "家长共情" },
      { platform: "朋友圈", contentType: "校园氛围" },
      { platform: "朋友圈", contentType: "招生转化" },
      { platform: "朋友圈", contentType: "干货分享" },
    ];
    batchPrompt = `请围绕主题「${topic}」，一次性生成以下5条微信朋友圈文案，招生老师可以直接发布。

排版与风格要求（重要）：
- 200字以内，口语化、真人感强
- 开头可用 1 个 emoji 引出主题（如 "🎓""💭""🌏""📌"）
- 分段清晰，关键信息或列点前用 emoji 标记（如 "✅""👉""💡"）
- 适当用 emoji 点缀，温暖亲切，但克制使用、不要堆砌（整条 3-6 个为宜）
- 结尾有轻 CTA

每条内容之间用 ===SPLIT=== 分隔。

1. 【教育观点】展示专业教育判断，有观点有态度
2. 【家长共情】"最近和一位家长聊到..."风格，引发共鸣
3. 【校园氛围】描述学校/学生的真实状态，有画面感
4. 【招生轻转化】结尾自然引导咨询，但不强推
5. 【干货分享】实用小知识或建议，体现专业度

请直接输出可发布的内容，不要加说明。每条之间用 ===SPLIT=== 分隔。`;
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
        { error: `Ark API error: ${response.status}`, detail: errBody },
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
      model: data.model || "doubao",
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
