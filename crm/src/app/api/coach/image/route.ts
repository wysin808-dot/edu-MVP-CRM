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

  // 避免生成人脸（AI人脸容易崩），用场景/物品/环境图更适合朋友圈配图
  const styleMap: Record<string, string> = {
    "教育观点": "现代化教室空间，整洁的书桌上摆着课本和笔记本，窗外是绿色校园，温暖的阳光洒进来",
    "家长共情": "温馨的书房角落，一杯咖啡旁放着家庭相册和教育资料，窗边有绿植，柔和暖光",
    "招生转化": "美丽的新加坡校园远景，现代化教学楼和热带花园，蓝天白云，充满活力",
    "小红书": "精致平铺摄影，笔记本、彩色便签、文具和一杯奶茶整齐排列在白色桌面上，清新文艺风格",
    "私聊跟进": "专业办公桌面特写，笔记本电脑旁放着升学规划手册和茶杯，温暖柔和的灯光",
  };

  const style = styleMap[contentType] || styleMap["教育观点"];
  const imagePrompt = `${style}，与${topic}相关，高品质专业摄影，画面清晰锐利，光线充足，现代简约风格，无人物，无文字，无水印`;

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
        negative_prompt: "人物, 人脸, 面部, 眼睛, portrait, face, person, people, human, ugly, deformed, blurry, low quality",
        image_size: "1024x1024",
        num_inference_steps: 25,
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
