export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "DEEPSEEK_API_KEY not configured" });

  const { title, account, funnelStage, emotionalTrigger, contentType, cta, leadMagnet, primaryKeyword, references, audiencePersona, waceFocus, topicCluster, notes, repurposeStatus } = req.body;

  if (!title) return res.status(400).json({ error: "Missing title" });

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
请从以下 10 个维度评估，每个维度给出 ✅（合格）或 ⚠️（需改进）：

1. **资料引用**：是否引用了真实资料库的数据来源
2. **漏斗阶段**：是否标记了内容在转化漏斗中的位置（Awareness/Consideration/Trust/Visit/Enroll）
3. **情绪钩子**：标题是否有吸引力，情绪钩子是否合理
4. **CTA 设置**：是否有明确的行动引导（评论关键词、私信、链接等）
5. **Lead Magnet**：是否挂载了钩子资料来促进转化
6. **SEO 关键词**：是否设置了主关键词，有利于搜索流量
7. **受众匹配**：目标受众是否明确，内容是否匹配
8. **内容类型**：内容类型是否标注（干货/案例/情绪/对比/校园/政策）
9. **标题规范**：标题长度是否合适（小红书建议 20 字以内，公众号可稍长）
10. **WACE 相关**：如果是 WACE Focus 内容，主题簇是否匹配

## 输出格式（严格按此格式）
第一行输出审核结论，只能是以下三个之一：
RESULT:approve
RESULT:revise
RESULT:reject

然后空一行，输出审核报告（中文），格式如下：
- 先列出合格项（✅ 开头）
- 再列出需改进项（⚠️ 开头，附具体修改建议）
- 最后一行写综合建议（一句话总结）

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
          { role: "system", content: "你是专业的自媒体内容审核专家，服务于新加坡 BCI 国际学校的招生获客团队。审核要严谨但建设性，重点关注内容是否能有效吸引目标家长群体并推动招生转化。" },
          { role: "user", content: prompt },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return res.status(502).json({ error: `DeepSeek API error: ${response.status}`, detail: errBody });
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

    return res.status(200).json({
      suggestion,
      comment: `【DeepSeek AI 审核报告】\n${comment}`,
      model: data.model || "deepseek-chat",
      tokens: data.usage?.total_tokens || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: "Failed to call DeepSeek API", detail: err.message });
  }
}
