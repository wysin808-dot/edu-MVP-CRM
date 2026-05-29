import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// 阿里云 DashScope 通义万相 API (async mode)
const DASHSCOPE_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis";
const DASHSCOPE_TASK_URL = "https://dashscope.aliyuncs.com/api/v1/tasks";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "DASHSCOPE_API_KEY not configured" }, { status: 500 });
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

  // 根据内容类型构建中文 prompt
  const styleMap: Record<string, string> = {
    "教育观点": "专业教育场景，温暖的光线，现代化教室或办公室",
    "家长共情": "温馨的家庭场景，家长与孩子互动，柔和的自然光",
    "招生转化": "充满活力的校园，学生们在学习或活动，积极向上的氛围",
    "小红书": "精致的平铺摄影，学习用品和书籍，清新文艺风格，高级感",
    "私聊跟进": "专业的咨询场景，一对一沟通，温暖舒适的室内环境",
  };

  const style = styleMap[contentType] || styleMap["教育观点"];
  const imagePrompt = `${style}，主题：${topic}，新加坡国际教育，高品质专业摄影，画面清晰锐利，光线充足，现代简约风格`;

  try {
    // Step 1: 提交生成任务
    const submitRes = await fetch(DASHSCOPE_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "X-DashScope-Async": "enable",
      },
      body: JSON.stringify({
        model: "wanx2.1-t2i-turbo",
        input: { prompt: imagePrompt },
        parameters: { size: "1024*1024", n: 1 },
      }),
    });

    if (!submitRes.ok) {
      const errBody = await submitRes.text();
      return NextResponse.json(
        { error: `DashScope submit error: ${submitRes.status}`, detail: errBody },
        { status: 502 }
      );
    }

    const submitData = await submitRes.json();
    const taskId = submitData.output?.task_id;

    if (!taskId) {
      return NextResponse.json({ error: "No task_id returned", detail: JSON.stringify(submitData) }, { status: 502 });
    }

    // Step 2: 轮询任务状态 (最多 60 秒)
    const maxAttempts = 30;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pollRes = await fetch(`${DASHSCOPE_TASK_URL}/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!pollRes.ok) continue;

      const pollData = await pollRes.json();
      const status = pollData.output?.task_status;

      if (status === "SUCCEEDED") {
        const imageUrl = pollData.output?.results?.[0]?.url || "";
        if (!imageUrl) {
          return NextResponse.json({ error: "No image URL in result" }, { status: 502 });
        }
        return NextResponse.json({ url: imageUrl });
      }

      if (status === "FAILED") {
        return NextResponse.json(
          { error: "Image generation failed", detail: pollData.output?.message || "Unknown" },
          { status: 502 }
        );
      }

      // PENDING or RUNNING — continue polling
    }

    return NextResponse.json({ error: "Image generation timed out" }, { status: 504 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to generate image", detail: message },
      { status: 500 }
    );
  }
}
