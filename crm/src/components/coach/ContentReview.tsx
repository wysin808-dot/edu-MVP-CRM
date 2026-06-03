"use client";

import { useState } from "react";

interface Review {
  score?: number;
  verdict?: string;
  highlights?: string[];
  problems?: string[];
  suggestions?: string[];
  compliance?: string;
  improved?: string;
}

const PLATFORMS = ["小红书", "知乎", "抖音", "视频号", "百家号", "公众号", "朋友圈", "通用"];

function scoreColor(s: number) {
  if (s >= 85) return "#059669";
  if (s >= 70) return "#2563eb";
  if (s >= 55) return "#d97706";
  return "#dc2626";
}

export default function ContentReview() {
  const [content, setContent] = useState("");
  const [platform, setPlatform] = useState("小红书");
  const [loading, setLoading] = useState(false);
  const [review, setReview] = useState<Review | null>(null);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);
    setReview(null);
    setRaw(null);
    try {
      const res = await fetch("/api/coach/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platform }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "体检失败");
        return;
      }
      setReview(json.review || null);
      setRaw(json.raw || null);
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  async function copyImproved() {
    if (!review?.improved) return;
    try {
      await navigator.clipboard.writeText(review.improved);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* ignore */ }
  }

  return (
    <div className="w-full max-w-3xl">
      {/* 输入区 */}
      <div className="rounded-xl border border-[var(--border,#e5e7eb)] bg-white p-4 mb-4">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="text-xs text-[var(--muted,#6b7280)]">平台：</span>
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className="rounded-full px-2.5 py-0.5 text-xs border transition"
              style={
                platform === p
                  ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" }
                  : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
              }
            >
              {p}
            </button>
          ))}
        </div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={7}
          placeholder="把要检查的内容粘贴进来（已发布的笔记、草稿、口播稿都行）…"
          className="w-full rounded-lg border border-[var(--border,#e5e7eb)] px-3 py-2 text-sm outline-none focus:border-blue-500 resize-y"
        />
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={run}
            disabled={loading || !content.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? "AI 体检中…" : "🔍 开始体检"}
          </button>
          <span className="text-xs text-[var(--muted,#9ca3af)]">{content.length} 字</span>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>

      {/* 结果 */}
      {review && (
        <div className="rounded-xl border border-[var(--border,#e5e7eb)] bg-white p-5 space-y-4">
          {/* 评分 + 总评 */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center rounded-xl w-20 h-20 shrink-0" style={{ background: "#f8fafc", border: `2px solid ${scoreColor(review.score ?? 0)}` }}>
              <span className="text-2xl font-bold" style={{ color: scoreColor(review.score ?? 0) }}>{review.score ?? "–"}</span>
              <span className="text-[10px] text-[var(--muted,#9ca3af)]">综合分</span>
            </div>
            {review.verdict && <p className="text-sm font-medium leading-relaxed">{review.verdict}</p>}
          </div>

          {review.highlights && review.highlights.length > 0 && (
            <Section title="✅ 亮点" color="#059669" items={review.highlights} />
          )}
          {review.problems && review.problems.length > 0 && (
            <Section title="⚠️ 问题" color="#dc2626" items={review.problems} />
          )}
          {review.suggestions && review.suggestions.length > 0 && (
            <Section title="💡 修改建议" color="#2563eb" items={review.suggestions} />
          )}

          {review.compliance && (
            <div className="rounded-lg p-3 text-sm" style={{ background: review.compliance.includes("无") ? "#f0fdf4" : "#fef2f2", color: review.compliance.includes("无") ? "#166534" : "#991b1b" }}>
              🛡 合规：{review.compliance}
            </div>
          )}

          {review.improved && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-semibold">✨ 改进版</span>
                <button onClick={copyImproved} className="text-xs px-3 py-1 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                  {copied ? "✅ 已复制" : "📋 复制"}
                </button>
              </div>
              <div className="rounded-lg bg-gray-50 border border-[var(--border,#e5e7eb)] p-3 text-sm whitespace-pre-wrap leading-relaxed">
                {review.improved}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 解析失败回退 */}
      {!review && raw && (
        <div className="rounded-xl border border-[var(--border,#e5e7eb)] bg-white p-4 text-sm whitespace-pre-wrap leading-relaxed">
          {raw}
        </div>
      )}
    </div>
  );
}

function Section({ title, color, items }: { title: string; color: string; items: string[] }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-1.5" style={{ color }}>{title}</div>
      <ul className="space-y-1">
        {items.map((it, i) => (
          <li key={i} className="text-sm leading-relaxed flex gap-2">
            <span style={{ color }}>•</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
