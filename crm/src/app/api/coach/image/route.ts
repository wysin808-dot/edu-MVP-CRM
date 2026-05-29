import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// SiliconFlow 快手可图 Kolors — 免费、中文理解好、1024x1024 高清
const SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/images/generations";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.SILICONFLOW_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "SILICONFLOW_API_KEY not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, contentType } = body;
  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  const styleMap: Record<string, string> = {
    "教育观点": "专业教育场景，温暖光线，现代化教室或办公环境",
    "家长共情": "温馨家庭场景，家长与孩子互动，柔和自然光",
    "招生转化": "活力校园，学生学习或活动场景，积极向上",
    "小红书": "精致平铺摄影，学习用品和书籍，清新文艺，高级质感",
    "私聊跟进": "专业咨询场景，一对一沟通，温暖舒适室内",
  };

  const style = styleMap[contentType] || styleMap["教育观点"];
  const imagePrompt = `${style}，主题：${topic}，新加坡国际教育，高品质专业摄影，画面清晰，光线充足，现代简约风格，无文字`;

  try {
    const response = await fetch(SILICONFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "Kwai-Kolors/Kolors",
        prompt: imagePrompt,
        image_size: "1024x1024",
        num_inference_steps: 20,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `SiliconFlow error: ${response.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const imageUrl = data.images?.[0]?.url || data.data?.[0]?.url || "";

    if (!imageUrl) {
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    return NextResponse.json({ url: imageUrl });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate image", detail: message },
      { status: 500 }
    );
  }
}
