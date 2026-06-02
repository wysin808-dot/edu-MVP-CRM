import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkQuota, logUsage } from "@/lib/quota";

// 火山引擎 Ark 即梦/Seedance 视频生成（异步任务）
const TASKS_URL = "https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks";

// ── POST：创建视频生成任务（文生视频 / 图生视频）──
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ARK_API_KEY;
  const endpointId = process.env.ARK_VIDEO_ENDPOINT;
  if (!apiKey || !endpointId) {
    return NextResponse.json(
      { error: "视频功能尚未配置：请在火山方舟开通即梦/Seedance 视频模型，并把 endpoint 配到环境变量 ARK_VIDEO_ENDPOINT", needConfig: true },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const prompt = (body?.prompt || "").trim();
  const imageUrl = (body?.imageUrl || "").trim();
  const ratio = body?.ratio || "16:9";   // 9:16 竖屏 / 16:9 横屏 / 1:1
  const duration = Math.min(10, Math.max(3, Number(body?.duration) || 5));
  if (!prompt && !imageUrl) {
    return NextResponse.json({ error: "缺少视频提示词或图片" }, { status: 400 });
  }

  // 视频额度检查（每条视频计 1 次）
  const quota = await checkQuota(supabase, user.id, "video", 1);
  if (!quota.ok) {
    return NextResponse.json({ error: quota.message, quotaExceeded: true }, { status: 429 });
  }

  // 拼接 Seedance 参数命令（火山约定：--ratio / --dur / --rs）
  const promptText = `${prompt || "根据画面自然生成视频"} --ratio ${ratio} --dur ${duration} --rs 720p`;
  const content: Array<Record<string, unknown>> = [{ type: "text", text: promptText }];
  if (imageUrl) {
    content.push({ type: "image_url", image_url: { url: imageUrl } });
  }

  try {
    const res = await fetch(TASKS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model: endpointId, content }),
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: `Ark 视频任务创建失败: ${res.status}`, detail: data?.error?.message || JSON.stringify(data).slice(0, 300) },
        { status: 502 }
      );
    }
    return NextResponse.json({ taskId: data.id, status: "submitted" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "创建视频任务失败", detail: message }, { status: 500 });
  }
}

// ── GET：轮询任务状态 ──
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const apiKey = process.env.ARK_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "ARK_API_KEY not configured" }, { status: 500 });

  const taskId = request.nextUrl.searchParams.get("taskId");
  if (!taskId) return NextResponse.json({ error: "Missing taskId" }, { status: 400 });

  try {
    const res = await fetch(`${TASKS_URL}/${taskId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json({ error: `查询失败: ${res.status}`, detail: data?.error?.message }, { status: 502 });
    }

    const status: string = data.status || "running"; // queued|running|succeeded|failed|cancelled
    const videoUrl: string | null = data?.content?.video_url || null;

    // 成功出片时记一次视频额度
    if (status === "succeeded" && videoUrl) {
      await logUsage(supabase, {
        userId: user.id,
        userName: user.email?.split("@")[0] || null,
        kind: "video",
        count: 1,
        tokens: 0,
        detail: `即梦视频 · ${taskId.slice(0, 12)}`,
      });
    }

    return NextResponse.json({
      taskId,
      status,
      videoUrl,
      error: data?.error?.message || null,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: "查询视频任务失败", detail: message }, { status: 500 });
  }
}
