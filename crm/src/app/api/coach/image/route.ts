import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// SiliconFlow FLUX image generation - free tier, 1024x1024
const SILICONFLOW_API_URL = "https://api.siliconflow.cn/v1/images/generations";

export async function POST(request: NextRequest) {
  // Auth check
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

  // Build a good image prompt based on topic and content type
  const styleHints: Record<string, string> = {
    "教育观点": "a professional educator giving advice, warm lighting, modern office setting",
    "家长共情": "a caring parent with child, warm family moment, soft natural light",
    "招生转化": "students celebrating success, bright campus environment, positive energy",
    "小红书": "aesthetic flat lay, trendy education materials, pastel colors, lifestyle photography",
    "私聊跟进": "professional consultant meeting, warm conversation, modern interior",
  };

  const style = styleHints[contentType] || styleHints["教育观点"];

  const imagePrompt = `${style}. Theme: ${topic}. Singapore international education. High quality professional photography, sharp details, well-lit, modern and clean aesthetic. No text overlay, no watermark.`;

  try {
    const response = await fetch(SILICONFLOW_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "black-forest-labs/FLUX.1-schnell",
        prompt: imagePrompt,
        image_size: "1024x1024",
        num_inference_steps: 4,
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
