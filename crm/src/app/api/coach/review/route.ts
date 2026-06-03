import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logUsage } from "@/lib/quota";

const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";

const SYSTEM_PROMPT = `你是 SEDA/BCI 国际教育自媒体的资深内容运营总监，精通小红书、知乎、抖音、视频号、百家号、公众号、微信朋友圈的流量与转化逻辑。
你的任务是给运营人员的内容做"体检"，从专业角度指出问题并给可直接落地的修改建议。
评判要点：
1. 钩子/标题：前 3 秒/前一句能否抓住目标家长，有没有点击/继续看的欲望
2. 结构与可读性：分段、节奏、信息密度，是否适配该平台的阅读习惯
3. 平台适配：长度、排版、标签、风格是否符合该平台
4. 信任与专业度：是否体现真实教育判断、是否空洞
5. 转化引导：结尾 CTA 是否自然有效（引导私信/咨询），不可硬推
6. 合规风险（重要）：是否出现"保证录取/100%升学/包过/最好/第一/唯一"等违规或夸大表达——这是红线，必须揪出
请务实、具体、可执行，不要空话套话。`;

function buildPrompt(content: string, platform: string): string {
  return `请对以下【${platform || "通用"}】内容做体检，并**只输出一个 JSON 对象**（不要任何额外文字、不要 markdown 代码块），字段如下：
{
  "score": 数字(0-100，综合质量分),
  "verdict": "一句话总评",
  "highlights": ["亮点1","亮点2"],
  "problems": ["问题1（要具体）","问题2"],
  "suggestions": ["可直接照做的修改建议1","建议2","建议3"],
  "compliance": "合规风险提示；若无风险写'无明显风险'",
  "improved": "按建议改写后的内容（保持同平台风格，简洁完整）"
}

待体检内容：
"""
${content.slice(0, 4000)}
"""`;
}

type Review = {
  score?: number;
  verdict?: string;
  highlights?: string[];
  problems?: string[];
  suggestions?: string[];
  compliance?: string;
  improved?: string;
};

function parseReview(text: string): Review | null {
  // 去掉可能的 markdown 代码块围栏
  let t = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  // 截取第一个 { 到最后一个 }
  const start = t.indexOf("{");
  const end = t.lastIndexOf("}");
  if (start >= 0 && end > start) t = t.slice(start, end + 1);
  try {
    return JSON.parse(t) as Review;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const content = (body?.content || "").trim();
  const platform = (body?.platform || "通用").trim();
  if (!content || content.length < 5) {
    return NextResponse.json({ error: "请粘贴要检查的内容（至少几个字）" }, { status: 400 });
  }

  try {
    const response = await fetch(ARK_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: endpointId,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildPrompt(content, platform) },
        ],
        temperature: 0.4,
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json({ error: `Ark API error: ${response.status}`, detail: errBody }, { status: 502 });
    }

    const data = await response.json();
    const outputText = data.choices?.[0]?.message?.content || "";
    const usage = data.usage || {};
    const review = parseReview(outputText);

    await logUsage(supabase, {
      userId: user.id,
      userName: user.email?.split("@")[0] || null,
      kind: "text",
      count: 1,
      tokens: usage.total_tokens || 0,
      detail: `内容体检 · ${platform}`,
    });

    if (!review) {
      // 解析失败时回退为纯文本
      return NextResponse.json({ review: null, raw: outputText, tokens: usage.total_tokens || 0 });
    }
    return NextResponse.json({ review, tokens: usage.total_tokens || 0 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "体检失败", detail: message }, { status: 500 });
  }
}
