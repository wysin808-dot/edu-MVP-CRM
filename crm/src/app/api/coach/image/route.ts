import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 火山引擎 SeedDream 3.0 (豆包文生图)
const ARK_API_URL = "https://ark.cn-beijing.volces.com/api/v3/images/generations";

const SCENE_MAP: Record<string, string> = {
  "教育观点": "现代化国际学校教室，阳光洒进窗户，整洁的书桌上摆着课本和笔记本，窗外是绿色校园",
  "家长共情": "温馨的家庭书房，一杯咖啡旁放着教育资料，窗边有绿植，柔和暖光",
  "校园氛围": "充满活力的国际学校校园，学生活动区，现代建筑与绿植，明亮自然光",
  "招生转化": "美丽的新加坡国际学校校园全景，现代化教学楼和热带花园，蓝天白云",
  "干货分享": "整洁的学习桌面，笔记本、文具、便签整齐排列，知识感强",
  "私聊跟进": "专业的办公桌面特写，笔记本电脑旁放着升学规划手册和茶杯，温暖灯光",
};

// 生成单张图片
async function generateOne(
  apiKey: string,
  endpointId: string,
  prompt: string,
  size: string
): Promise<string | null> {
  try {
    const response = await fetch(ARK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: endpointId,
        prompt,
        size,
        response_format: "url",
      }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data?.[0]?.url || null;
  } catch {
    return null;
  }
}

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

  const { topic, contentType, contentText, platform, count, mode } = body;
  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  // 朋友圈用 1:1 方图，小红书用 3:4 竖图
  const imageSize = platform === "小红书" ? "1920x2560" : "1920x1920";
  const n = Math.min(Math.max(parseInt(count) || 1, 1), 9);

  const summary = (contentText || "").slice(0, 180).replace(/[\n\r#]/g, " ").trim();
  const scene = SCENE_MAP[contentType] || SCENE_MAP["教育观点"];

  // 不同模式用不同的 prompt 风格
  const basePrompts: string[] = [];

  if (mode === "cover") {
    // 小红书封面：海报感、视觉冲击、有设计感
    basePrompts.push(
      `小红书封面图，主题「${topic}」。${summary ? "内容：" + summary + "。" : ""}要求：吸引眼球的封面海报风格，构图饱满，色彩明亮有高级感，主体突出，留白适当，竖版，真实摄影或精致质感，无文字水印`
    );
  } else {
    // 内页/朋友圈：场景照片，多张时变换角度
    const angles = [
      "正面构图，明亮自然光",
      "侧面视角，柔和光线",
      "特写细节，浅景深虚化背景",
      "俯拍视角，整洁布局",
      "远景全貌，环境氛围感",
      "近景局部，温暖色调",
      "对称构图，简约风格",
      "斜角度，有空间纵深感",
      "平铺摆拍，文艺清新",
    ];
    const baseDesc = summary
      ? `与以下内容相关的高质量配图：${summary}`
      : `${scene}，与${topic}相关`;
    for (let i = 0; i < n; i++) {
      basePrompts.push(
        `${baseDesc}，${angles[i % angles.length]}，专业摄影，画面清晰锐利，现代简约，无文字水印`
      );
    }
  }

  try {
    const urls = await Promise.all(
      basePrompts.map((p) => generateOne(apiKey, endpointId, p, imageSize))
    );
    const validUrls = urls.filter((u): u is string => !!u);

    if (validUrls.length === 0) {
      return NextResponse.json({ error: "No image returned" }, { status: 502 });
    }

    return NextResponse.json({ urls: validUrls });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate image", detail: message },
      { status: 500 }
    );
  }
}
