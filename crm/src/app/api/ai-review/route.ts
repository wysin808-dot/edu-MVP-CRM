import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  // Auth check — prevent unauthenticated access
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "DEEPSEEK_API_KEY not configured" },
      { status: 500 }
    );
  }

  const body = await request.json();
  const {
    title,
    account,
    funnelStage,
    emotionalTrigger,
    contentType,
    cta,
    leadMagnet,
    primaryKeyword,
    references,
    audiencePersona,
    waceFocus,
    topicCluster,
    notes,
    repurposeStatus,
  } = body;

  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const prompt = `你是 BCI 国际学校自媒体内容审核 AI。请从专业内容运营角度审核以下内容，给出审核意见。

## 待审核内容信息
- 标题：${title}
- 账号：${account || "未知"}
- 漏斗阶段：${funnelStage || "未标注"}
- 情绪钩子：${emotionalTrigger || "未标注"}
- 内容类型：${contentType || "未标注"}
- CTA（行动引导）：${cta || "未设置"}
- 钩子资料（Lead Magnet）：${leadMagnet || "未设置"}
- 主关键词：${primaryKeyword || "未设置"}
- 引用资料：${references || "未引用"}
- 目标受众：${(audiencePersona || []).join("、") || "未指定"}
- WACE Focus：${waceFocus ? "是" : "否"}
- 主题簇：${topicCluster || "未标注"}
- 复用状态：${repurposeStatus || "未标注"}
- 备注：${notes || "无"}

## 审核要求
请从以下 10 个维度评估，每个维度给出合格或需改进：

1. **资料引用**：是否引用了知识库的数据来源
2. **漏斗阶段**：是否标记了内容在转化漏斗中的位置
3. **情绪钩子**：标题是否有吸引力，情绪钩子是否合理
4. **CTA 设置**：是否有明确的行动引导
5. **Lead Magnet**：是否挂载了钩子资料来促进转化
6. **SEO 关键词**：是否设置了主关键词
7. **受众匹配**：目标受众是否明确，内容是否匹配
8. **内容类型**：内容类型是否标注
9. **标题规范**：标题长度是否合适
10. **WACE 相关**：如果是 WACE Focus 内容，主题簇是否匹配

## 输出格式
第一行输出审核结论，只能是以下三个之一：
RESULT:approve
RESULT:revise
RESULT:reject

然后空一行，输出审核报告（中文），格式如下：
- 先列出合格项
- 再列出需改进项（附具体修改建议）
- 最后一行写综合建议

注意：只有所有维度都合格才给 approve；有 1-3 个问题给 revise；4 个以上问题给 reject。`;

  try {
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "你是专业的自媒体内容审核专家，服务于新加坡 BCI 国际学校的招生获客团队。审核要严谨但建设性，重点关注内容是否能有效吸引目标家长群体并推动招生转化。",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `DeepSeek API error: ${response.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse result
    let suggestion = "revise";
    if (content.includes("RESULT:approve")) suggestion = "approve";
    else if (content.includes("RESULT:reject")) suggestion = "reject";
    else if (content.includes("RESULT:revise")) suggestion = "revise";

    // Clean up: remove the RESULT line from the comment
    const comment = content
      .replace(/RESULT:(approve|revise|reject)\s*/gi, "")
      .trim();

    return NextResponse.json({
      suggestion,
      comment: `【DeepSeek AI 审核报告】\n${comment}`,
      model: data.model || "deepseek-chat",
      tokens: data.usage?.total_tokens || 0,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to call DeepSeek API", detail: message },
      { status: 500 }
    );
  }
}
