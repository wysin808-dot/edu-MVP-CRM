import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 火山引擎 SeedDream 3.0 (豆包文生图)
const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ARK_API_KEY;
  const endpointId = process.env.ARK_IMAGE_ENDPOINT;
  if (!apiKey || !endpointId) {
    return NextResponse.json({ error: "ARK_API_KEY or ARK_IMAGE_ENDPOINT not configured" }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { topic, contentType, contentText } = body;
  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  // 根据内容文字智能生成配图 prompt
  let imagePrompt: string;
  if (contentText) {
    // 从内容文字提取核心场景
    const summary = contentText.slice(0, 200).replace(/[\n\r]/g, " ");
    imagePrompt = `根据以下内容生成一张适合微信朋友圈的高质量配图：${summary}。要求：真实感强、光线温暖、构图精美、画面清晰、现代简约风格`;
  } else {
    const sceneMap: Record<string, string> = {
      "教育观点": "现代化国际学校教室，阳光洒进窗户，整洁的书桌上摆着课本和笔记本，窗外是绿色校园",
      "家长共情": "温馨的家庭书房，一杯咖啡旁放着教育资料，窗边有绿植，柔和暖光",
      "招生转化": "美丽的新加坡国际学校校园全景，现代化教学楼和热带花园，蓝天白云",
      "小红书": "精致平铺摄影，笔记本、彩色便签、文具和一杯奶茶整齐排列在白色桌面上",
      "私聊跟进": "专业的办公桌面特写，笔记本电脑旁放着升学规划手册和茶杯，温暖灯光",
    };
    imagePrompt = (sceneMap[contentType] || sceneMap["教育观点"]) + `，与${topic}相关，高品质专业摄影`;
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
        prompt: imagePrompt,
        size: "1920x1920",
        response_format: "url",
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      return NextResponse.json(
        { error: `Image API error: ${response.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url || "";

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
