"use client";

import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "submitting" | "polling" | "done" | "error";

export default function VideoGenButton({
  defaultPrompt,
  imageUrl,
  ratio = "9:16",
  label = "🎬 生成视频",
}: {
  defaultPrompt: string;
  imageUrl?: string;
  ratio?: string;
  label?: string;
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, []);

  function stopTimers() {
    if (pollRef.current) clearInterval(pollRef.current);
    if (tickRef.current) clearInterval(tickRef.current);
    pollRef.current = null;
    tickRef.current = null;
  }

  async function start() {
    setError(null);
    setVideoUrl(null);
    setElapsed(0);
    setPhase("submitting");
    try {
      const res = await fetch("/api/coach/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageUrl: imageUrl || undefined, ratio, duration: 5 }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "创建失败");
        setPhase("error");
        return;
      }
      const taskId = json.taskId;
      setPhase("polling");
      tickRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`/api/coach/video?taskId=${encodeURIComponent(taskId)}`);
          const j = await r.json();
          if (j.status === "succeeded" && j.videoUrl) {
            stopTimers();
            setVideoUrl(j.videoUrl);
            setPhase("done");
          } else if (j.status === "failed" || j.status === "cancelled") {
            stopTimers();
            setError(j.error || "生成失败");
            setPhase("error");
          }
        } catch {
          /* 单次轮询失败忽略，继续 */
        }
      }, 5000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "网络错误");
      setPhase("error");
    }
  }

  if (!open && phase === "idle") {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs px-3 py-1.5 rounded-lg border border-[var(--border,#e5e7eb)] text-[var(--ink,#1a1a2e)] hover:border-pink-400 hover:text-pink-600 transition"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border,#e5e7eb)] bg-gray-50 p-3 mt-2 w-full">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-[var(--ink,#1a1a2e)]">🎬 即梦 AI 视频{imageUrl ? "（图生视频）" : "（文生视频）"}</span>
        <span className="text-[11px] text-[var(--muted,#9ca3af)]">比例 {ratio} · 约 5 秒</span>
      </div>

      {imageUrl && (
        <p className="text-[11px] text-[var(--muted,#6b7280)] mb-2">将基于这张配图生成动态短片;下方可补充画面/运镜描述。</p>
      )}

      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={2}
        placeholder="画面描述,如:镜头缓缓推进,新加坡校园清晨阳光,学生走进教学楼"
        disabled={phase === "submitting" || phase === "polling"}
        className="w-full rounded-md border border-[var(--border,#e5e7eb)] px-2 py-1.5 text-xs outline-none focus:border-pink-400 resize-none mb-2 disabled:opacity-60"
      />

      {phase === "idle" || phase === "error" ? (
        <div className="flex items-center gap-2">
          <button
            onClick={start}
            disabled={!prompt.trim() && !imageUrl}
            className="text-xs px-3 py-1.5 rounded-lg bg-pink-600 text-white font-semibold hover:bg-pink-700 disabled:opacity-50"
          >
            {phase === "error" ? "重试生成" : "开始生成"}
          </button>
          <button onClick={() => { setOpen(false); setPhase("idle"); }} className="text-xs text-[var(--muted,#9ca3af)] hover:text-gray-700">取消</button>
          {error && <span className="text-[11px] text-red-600">{error}</span>}
        </div>
      ) : phase === "submitting" || phase === "polling" ? (
        <div className="flex items-center gap-2 text-xs text-[var(--muted,#6b7280)]">
          <span className="animate-spin">⏳</span>
          {phase === "submitting" ? "提交任务中…" : `即梦生成中…已等待 ${elapsed}s（通常 1–2 分钟）`}
        </div>
      ) : null}

      {phase === "done" && videoUrl && (
        <div className="mt-1">
          <video src={videoUrl} controls className="w-full max-w-xs rounded-lg" />
          <div className="flex items-center gap-3 mt-1.5">
            <a href={videoUrl} target="_blank" rel="noreferrer" className="text-xs text-pink-600 font-medium hover:underline">⬇ 下载视频</a>
            <button onClick={start} className="text-xs text-[var(--muted,#6b7280)] hover:text-gray-800">重新生成</button>
          </div>
        </div>
      )}
    </div>
  );
}
