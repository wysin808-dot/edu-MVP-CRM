import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// OpenRouter DALL-E 3 image generation
const OPENROUTER_IMAGE_URL = "https://openrouter.ai/api/v1/images/generations";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENROUTER_API_KEY not configured" }, { status: 500 });
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

  // 直接用内容文字生成配图，让 DALL-E 理解上下文
  let imagePrompt: string;
  if (contentText) {
    imagePrompt = `根据以下朋友圈内容，生成一张适合配图的高质量照片。要求：真实感强、光线温暖、构图精美、适合微信朋友圈或小红书发布。不要包含任何文字。

内容：${contentText.slice(0, 500)}`;
  } else {
    const styleMap: Record<string, string> = {
      "教育观点": "A warm, sunlit modern classroom with neat desks, notebooks and a green campus view outside the window",
      "家长共情": "A cozy reading corner with a cup of coffee, family photos and education brochures in warm soft light",
      "招生转化": "A beautiful Singapore school campus with modern buildings, tropical gardens, blue sky",
      "小红书": "Aesthetic flat lay of notebooks, colorful sticky notes, stationery and milk tea on white desk, clean style",
      "私聊跟进": "Professional desk close-up with laptop, education planning handbook and tea cup, warm lighting",
    };
    imagePrompt = styleMap[contentType] || styleMap["教育观点"];
    imagePrompt += `. Related to: ${topic}. High quality professional photography, sharp, well-lit, modern minimalist style.`;
  }

  try {
    const response = await fetch(OPENROUTER_IMAGE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://edu-mvp-crm.vercel.app",
        "X-Title": "SEDA OS",
      },
      body: JSON.stringify({
        model: "openai/dall-e-3",
        prompt: imagePrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
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
