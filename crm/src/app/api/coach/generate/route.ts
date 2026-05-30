import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkQuota, logUsage } from "@/lib/quota";

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

// 内容风格基调
const STYLE_GUIDE: Record<string, string> = {
  "焦虑型": "戳中家长的升学焦虑与信息差，营造适度紧迫感，但不可贩卖恐慌、不可夸大",
  "数据型": "以数据、录取率、排名、对比说话，理性可信，少抒情",
  "故事型": "用一个真实可信的学生/家长故事切入，以情动人，自然引出主题",
  "高端型": "面向高净值家庭，强调品质、资源、稀缺性与专属感，措辞克制大气",
  "专家型": "以资深教育者口吻，给出专业判断与路径建议，体现权威与洞察",
  "转化型": "在自然叙述中强化行动引导，结尾 CTA 更明确（但不强推）",
};

function buildStyleDirective(style?: string): string {
  if (!style || !STYLE_GUIDE[style]) return "";
  return `\n\n## 整体风格基调：${style}\n${STYLE_GUIDE[style]}\n（以上内容都要统一体现这个风格基调）`;
}

type SupabaseServer = ReturnType<typeof createClient> extends Promise<infer T> ? T : never;

type KnowledgeRow = {
  id: string;
  title: string;
  detail: string | null;
  numeric_data: string | null;
  subject_tags: string[] | null;
  used_count?: number | null;
};

// ── 知识库注入（标签/关键词匹配，无需向量库）──
// 根据主题从知识库捞出最相关的条目，供生成时引用真实数据
async function fetchRelevantKnowledge(
  supabase: SupabaseServer,
  topic: string
): Promise<KnowledgeRow[]> {
  try {
    const { data } = await supabase
      .from("knowledge")
      .select("id,title,detail,numeric_data,subject_tags,visibility,used_count")
      .neq("visibility", "受限")
      .limit(300);
    if (!data || data.length === 0) return [];

    const lowerTopic = topic.toLowerCase().trim();
    const tokens = lowerTopic
      .split(/[\s,，、。.\/\-—()（）「」【】]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 2);

    const scored = (data as KnowledgeRow[])
      .map((k) => {
        const hay = `${k.title} ${k.detail || ""} ${(k.subject_tags || []).join(" ")}`.toLowerCase();
        let score = 0;
        if (lowerTopic.length >= 2 && hay.includes(lowerTopic)) score += 5;
        for (const t of tokens) if (hay.includes(t)) score += 1;
        for (const tag of k.subject_tags || []) {
          if (tag && lowerTopic.includes(tag.toLowerCase())) score += 2;
        }
        return { k, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map((x) => x.k);

    // best-effort：累加引用次数（不阻塞生成）
    if (scored.length > 0) {
      void Promise.allSettled(
        scored.map((k) =>
          supabase
            .from("knowledge")
            .update({ used_count: (k.used_count || 0) + 1 })
            .eq("id", k.id)
        )
      );
    }
    return scored;
  } catch {
    return [];
  }
}

function buildKnowledgeContext(items: KnowledgeRow[]): string {
  if (!items.length) return "";
  const blocks = items
    .map((k, i) => {
      let s = `【资料${i + 1}】${k.title}`;
      if (k.detail) s += `\n${k.detail.slice(0, 500)}`;
      if (k.numeric_data) s += `\n关键数据：${k.numeric_data}`;
      return s;
    })
    .join("\n\n");
  return `\n\n## BCI 真实知识库资料（重要）
以下是经过核实的真实信息。文中涉及的学费、学制、升学数据、课程细节、录取要求等，必须严格基于以下资料，不得编造或杜撰。若某个具体数字资料中未提及，请用"可咨询了解""以官方为准"等表述，绝不要编造数字。

${blocks}`;
}

// 保存生成记录（带 token 统计）；若数据库尚未添加这些列，则自动回退为不带 token 的插入，保证生成不会失败
async function saveGenerated(
  supabase: SupabaseServer,
  base: Record<string, unknown>,
  tokenExtra: Record<string, unknown>
) {
  const first = await supabase
    .from("coach_generated")
    .insert({ ...base, ...tokenExtra })
    .select()
    .single();
  if (!first.error) return first;
  return await supabase.from("coach_generated").insert(base).select().single();
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
    return NextResponse.json({ error: "ARK_API_KEY or ARK_TEXT_ENDPOINT not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, platform, audienceTag, tone, contentType, batchMode, style, audience, keywords, extra } = body;

  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  // 额度检查：文案生成每次请求计 1 次
  const quota = await checkQuota(supabase, user.id, "text", 1);
  if (!quota.ok) {
    return NextResponse.json({ error: quota.message, quotaExceeded: true }, { status: 429 });
  }

  if (batchMode) {
    return handleBatchGenerate(supabase, user, apiKey, endpointId, topic, platform || "朋友圈", style, { audience, keywords, extra });
  }

  // Single content generation — 注入知识库相关资料
  const knowledge = await fetchRelevantKnowledge(supabase, topic);
  const userPrompt =
    buildSinglePrompt(topic, platform, audienceTag, tone, contentType) +
    buildStyleDirective(style) +
    buildKnowledgeContext(knowledge);

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
    const usage = data.usage || {};

    const { data: saved, error: saveError } = await saveGenerated(
      supabase,
      {
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
      },
      {
        model: data.model || "doubao",
        prompt_tokens: usage.prompt_tokens || 0,
        completion_tokens: usage.completion_tokens || 0,
        total_tokens: usage.total_tokens || 0,
      }
    );

    if (saveError) {
      console.error("Save error:", saveError);
    }

    await logUsage(supabase, {
      userId: user.id,
      userName: user.email?.split("@")[0] || null,
      kind: "text",
      count: 1,
      tokens: usage.total_tokens || 0,
      detail: `${platform || "朋友圈"} · ${topic}`,
    });

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
  platform: string,
  style?: string,
  ctx?: { audience?: string; keywords?: string; extra?: string }
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
  } else if (platform === "微信群") {
    batchItems = [
      { platform: "微信群", contentType: "简短通知" },
      { platform: "微信群", contentType: "详细介绍" },
      { platform: "微信群", contentType: "活动邀请" },
      { platform: "微信群", contentType: "限时引导" },
      { platform: "微信群", contentType: "互动答疑" },
    ];
    batchPrompt = `请围绕主题「${topic}」，一次性生成以下5条微信群推广文案，招生老师可以直接发到家长群。

排版与风格要求：
- 口语化、亲切，适合群里发，避免硬广感
- 适当用 emoji，但克制
- 每条结尾自然引导（私信/咨询/接龙等），不强推

每条内容之间用 ===SPLIT=== 分隔。

1. 【简短通知】100字以内，群发开场/信息同步
2. 【详细介绍】300字左右，完整介绍项目或政策
3. 【活动邀请】邀请家长参加讲座/咨询会/开放日
4. 【限时引导】结合时间节点（名额/截止）温和促进咨询
5. 【互动答疑】抛出一个家长关心的问题，引导群内互动

请直接输出可发布的内容，不要加说明。每条之间用 ===SPLIT=== 分隔。`;
  } else if (platform === "FAQ") {
    batchItems = [
      { platform: "FAQ", contentType: "学费" },
      { platform: "FAQ", contentType: "学制课程" },
      { platform: "FAQ", contentType: "升学路径" },
      { platform: "FAQ", contentType: "住宿监护" },
      { platform: "FAQ", contentType: "签证入学" },
    ];
    batchPrompt = `请围绕主题「${topic}」，一次性生成以下5组家长常见问题解答（FAQ），招生老师可直接用于答疑。

格式要求：
- 每组用「问：...」换行「答：...」格式
- 答案专业、易懂、口径统一
- 涉及具体数字（学费/学制/分数线等）必须基于知识库资料；资料没有的用"以官方为准 / 可咨询了解"，不要编造
- 不夸大、不承诺录取结果

每条内容之间用 ===SPLIT=== 分隔。

1. 【学费相关】费用、缴费方式、性价比
2. 【学制课程】课程设置、学制、上课安排
3. 【升学路径】毕业去向、大学申请、文凭认可度
4. 【住宿监护】住宿安排、监护服务、生活照顾
5. 【签证入学】签证、入学条件、报名流程

请直接输出可使用的内容，不要加说明。每条之间用 ===SPLIT=== 分隔。`;
  } else if (platform === "家长私聊") {
    batchItems = [
      { platform: "家长私聊", contentType: "标准回答" },
      { platform: "家长私聊", contentType: "招生版回答" },
      { platform: "家长私聊", contentType: "跟进话术" },
      { platform: "家长私聊", contentType: "破冰开场" },
      { platform: "家长私聊", contentType: "沉默激活" },
    ];
    batchPrompt = `家长就「${topic}」来咨询，请生成以下5种家长微信私聊话术，招生老师可直接复制使用。

要求：
- 口吻温和、专业、像真人老师，不机械、不硬推
- 涉及学费/学制/分数等数字必须基于知识库资料，没有的用"以官方为准 / 可帮您查一下"
- 每条结尾自然引导下一步（不强迫）

每条内容之间用 ===SPLIT=== 分隔。

1. 【标准回答】客观专业地回答家长这个问题
2. 【招生版回答】在专业回答基础上，自然带出 BCI 优势并引导深入了解
3. 【跟进话术】家长还在犹豫/比较时的跟进回复
4. 【破冰开场】家长初次咨询时的暖场开场白
5. 【沉默激活】家长很久没回复后，重新激活对话的话术

请直接输出可使用的话术，不要加说明。每条之间用 ===SPLIT=== 分隔。`;
  } else if (platform === "视频脚本") {
    batchItems = [
      { platform: "视频脚本", contentType: "30秒" },
      { platform: "视频脚本", contentType: "60秒" },
      { platform: "视频脚本", contentType: "90秒" },
    ];
    batchPrompt = `请围绕主题「${topic}」，生成以下3个不同时长的短视频脚本（视频号/抖音），招生老师可直接拍摄。

每个脚本格式：
- 分镜呈现，逐段标注【镜头】【旁白】【字幕】
- 开头3秒强钩子，结尾明确 CTA
- 涉及数字必须基于知识库资料，没有的不要编造
- 语言口语化、适合口播

每条内容之间用 ===SPLIT=== 分隔。

1. 【30秒版】快节奏，单一核心钩子 + CTA
2. 【60秒版】钩子 + 2-3个要点 + CTA
3. 【90秒版】完整：钩子 + 痛点 + 方案 + 案例/数据 + CTA

请直接输出可拍摄的脚本，不要加说明。每条之间用 ===SPLIT=== 分隔。`;
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

  // 注入目标人群/关键词/补充说明 + 风格基调 + 知识库相关资料
  const ctxLines: string[] = [];
  if (ctx?.audience) ctxLines.push(`- 目标人群：${ctx.audience}（按这类人群的关注点和痛点调整角度）`);
  if (ctx?.keywords) ctxLines.push(`- 关键词/产品：${ctx.keywords}（自然融入内容，可作为卖点）`);
  if (ctx?.extra) ctxLines.push(`- 补充要求：${ctx.extra}`);
  if (ctxLines.length) batchPrompt += `\n\n## 本次额外要求\n${ctxLines.join("\n")}`;
  batchPrompt += buildStyleDirective(style);
  const knowledge = await fetchRelevantKnowledge(supabase, topic);
  batchPrompt += buildKnowledgeContext(knowledge);

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

    const usage = data.usage || {};
    const count = Math.max(1, Math.min(pieces.length, batchItems.length));
    const modelName = data.model || "doubao";
    const perTotal = Math.round((usage.total_tokens || 0) / count);
    const perPrompt = Math.round((usage.prompt_tokens || 0) / count);
    const perCompletion = Math.round((usage.completion_tokens || 0) / count);

    const savedItems = [];
    for (let i = 0; i < Math.min(pieces.length, batchItems.length); i++) {
      const item = batchItems[i];
      const { data: saved } = await saveGenerated(
        supabase,
        {
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
        },
        {
          model: modelName,
          prompt_tokens: perPrompt,
          completion_tokens: perCompletion,
          total_tokens: perTotal,
        }
      );

      if (saved) savedItems.push(saved);
    }

    await logUsage(supabase, {
      userId: user.id,
      userName: user.email?.split("@")[0] || null,
      kind: "text",
      count: 1,
      tokens: usage.total_tokens || 0,
      detail: `${platform} · ${topic}（批量${savedItems.length}条）`,
    });

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
