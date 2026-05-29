import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

  const { topic, contentType, contentText } = body;
  if (!topic) {
    return NextResponse.json({ error: "Missing topic" }, { status: 400 });
  }

  // 从内容文字中提取关键场景，生成英文 prompt（Kolors 英文效果更好）
  const sceneKeywords = extractScene(topic, contentType, contentText);

  const imagePrompt = `${sceneKeywords}, professional photography, sharp focus, warm natural lighting, modern minimalist style, high quality, 4k, no text, no watermark, no people, no faces`;
  const negativePrompt = "person, people, human, face, portrait, eyes, hands, fingers, ugly, deformed, blurry, low quality, text, watermark, logo, cartoon, anime";

  try {
    const response = await fetch(SILICONFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "Tongyi-MAI/Z-Image-Turbo",
        prompt: imagePrompt,
        negative_prompt: negativePrompt,
        image_size: "1024x1024",
        num_inference_steps: 25,
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

// 根据内容文字智能提取场景关键词，生成英文 prompt
function extractScene(topic: string, contentType: string, contentText?: string): string {
  // 关键词 → 场景映射
  const sceneMap: [RegExp, string][] = [
    [/O-Level|考试|备考|成绩/, "exam preparation scene, study desk with textbooks and notes, calculator, pencils neatly arranged"],
    [/WACE|国际高中|课程/, "international school hallway, modern architecture, tropical plants, glass windows"],
    [/AEIS|转轨|转学/, "airport departure hall with suitcase, passport and school brochure on a table"],
    [/英文|英语|语言/, "English learning materials, dictionary, notebook with handwriting, coffee cup on wooden desk"],
    [/校园|学校|教室/, "beautiful school campus aerial view, modern buildings, green field, blue sky, Singapore"],
    [/暑假|假期|游学/, "summer travel scene, airplane window view of tropical island, sunlight"],
    [/升学|规划|路径/, "career planning board with colorful sticky notes and arrows, organized desk"],
    [/家长|妈妈|爸爸|父母/, "cozy home study room, warm lamp light, bookshelf, family photo frames on wall"],
    [/毕业|毕业季/, "graduation cap and diploma on a wooden table with flowers, celebration"],
    [/开学|新学期/, "brand new school supplies, backpack, notebooks and colorful pens on clean desk"],
    [/小红书/, "aesthetic flat lay, pink notebook, dried flowers, polaroid photos, pastel tones, Instagram style"],
    [/招生|咨询|报名/, "modern consultation office, glass table, brochures, laptop showing campus, natural light"],
    [/NTU|NUS|大学/, "university campus panoramic view, grand architecture, students walking paths, autumn trees"],
  ];

  // 优先匹配内容文字
  const text = contentText || topic;
  for (const [pattern, scene] of sceneMap) {
    if (pattern.test(text)) return scene;
  }

  // 按内容类型 fallback
  const typeMap: Record<string, string> = {
    "教育观点": "modern classroom interior, sunlight through large windows, neat desks with books",
    "家长共情": "warm cozy reading nook, coffee cup, educational magazine, soft afternoon light",
    "招生转化": "Singapore international school campus, modern architecture, tropical garden, inviting entrance",
    "小红书": "aesthetic desk flat lay, notebook, stationery, plant, coffee, clean minimalist style",
    "私聊跟进": "professional desk setup, laptop, planner, pen, warm desk lamp, organized workspace",
  };

  return typeMap[contentType] || typeMap["教育观点"];
}
