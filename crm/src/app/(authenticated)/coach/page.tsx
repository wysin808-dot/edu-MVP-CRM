"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  useCoachBatchGenerate,
} from "@/hooks/useCoach";
import {
  COACH_TOPICS,
} from "@/lib/constants";
import type { CoachGenerated } from "@/lib/types";

// ── Date-aware topic suggestions ──
function getDateTopics(): { label: string; icon: string }[] {
  const now = new Date();
  const m = now.getMonth() + 1;
  const d = now.getDate();
  const topics: { label: string; icon: string }[] = [];

  const holidays: Record<string, { label: string; icon: string }> = {
    "1-1": { label: "元旦 · 新年教育规划", icon: "🎊" },
    "3-8": { label: "妇女节 · 妈妈的教育选择", icon: "🌷" },
    "5-1": { label: "劳动节 · 教育投资", icon: "💪" },
    "5-12": { label: "母亲节 · 妈妈的教育焦虑", icon: "🌹" },
    "6-1": { label: "儿童节 · 给孩子一个更大的世界", icon: "🎈" },
    "6-7": { label: "高考 · 还有另一条路", icon: "📝" },
    "6-8": { label: "高考 · 国际教育新出路", icon: "🌏" },
    "6-9": { label: "高考结束 · 规划国际教育", icon: "🎓" },
    "6-20": { label: "父亲节 · 爸爸的教育期望", icon: "👔" },
    "7-1": { label: "暑假开始 · 暑期规划", icon: "☀️" },
    "9-1": { label: "开学季 · 新学期新起点", icon: "🏫" },
    "9-10": { label: "教师节 · 好老师的重要性", icon: "🍎" },
    "10-1": { label: "国庆 · 假期也是规划期", icon: "🇨🇳" },
    "12-25": { label: "圣诞 · 给孩子的礼物：未来", icon: "🎄" },
  };

  const key = `${m}-${d}`;
  if (holidays[key]) topics.push(holidays[key]);

  if (m >= 5 && m <= 6) {
    topics.push(
      { label: "毕业季升学规划", icon: "🎓" },
      { label: "暑假提前准备", icon: "☀️" },
      { label: "中考后的国际教育选择", icon: "🔀" },
    );
  } else if (m >= 7 && m <= 8) {
    topics.push({ label: "暑期游学体验", icon: "✈️" }, { label: "秋季入学申请", icon: "📋" });
  } else if (m >= 9 && m <= 10) {
    topics.push({ label: "开学适应期攻略", icon: "🏫" }, { label: "秋季招生季", icon: "🍁" });
  } else if (m >= 11 && m <= 12) {
    topics.push({ label: "年终升学总结", icon: "📊" }, { label: "春季入学准备", icon: "🌸" });
  } else {
    topics.push({ label: "春季新学期", icon: "🌿" }, { label: "新年教育规划", icon: "🎯" });
  }

  return topics;
}

// Platform display config
const PLATFORM_DISPLAY: Record<string, { icon: string; label: string; color: string }> = {
  "朋友圈": { icon: "💬", label: "朋友圈", color: "#2563eb" },
  "小红书": { icon: "📕", label: "小红书", color: "#e11d48" },
  "家长私聊": { icon: "👨‍👩‍👧", label: "家长私聊", color: "#7c3aed" },
  "视频脚本": { icon: "🎬", label: "视频脚本", color: "#0284c7" },
};

export default function CoachPage() {
  const [topic, setTopic] = useState("");
  const [items, setItems] = useState<CoachGenerated[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const batchGenerate = useCoachBatchGenerate();
  const dateTopics = getDateTopics();

  const handleGenerate = async () => {
    if (batchGenerate.isPending || !topic.trim()) return;
    // Clear old content
    setItems([]);
    setImageUrls({});
    setCopiedId(null);
    try {
      const res = await batchGenerate.mutateAsync({ topic });
      setItems(res.items || []);
    } catch {
      // error handled by mutation
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateImage = async (item: CoachGenerated) => {
    if (imageLoading) return;
    setImageLoading(item.id);
    try {
      const res = await fetch("/api/coach/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: item.topic, contentType: item.content_type }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "配图生成失败");
      }
      const data = await res.json();
      setImageUrls((prev) => ({ ...prev, [item.id]: data.url }));
    } catch (e) {
      alert(e instanceof Error ? e.message : "配图生成失败，请重试");
    } finally {
      setImageLoading(null);
    }
  };

  const handleDownloadImage = (url: string, topic: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${topic}-配图.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>
          🎓 朋友圈教练
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          选主题 → 一键生成 5 条内容 → 复制粘贴
        </p>
      </div>

      {/* Topic + Generate */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 80%, #000))",
          color: "#fff",
        }}
      >
        <div className="flex gap-3 items-end mb-3">
          <div className="flex-1">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="输入主题，如：AEIS考试准备、暑假规划..."
              className="w-full px-3 py-2.5 rounded-lg text-sm border-none outline-none"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={batchGenerate.isPending || !topic.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer whitespace-nowrap"
            style={{
              background: !topic.trim() ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.95)",
              color: !topic.trim() ? "rgba(255,255,255,0.6)" : "var(--brand)",
              opacity: batchGenerate.isPending ? 0.7 : 1,
              cursor: !topic.trim() ? "not-allowed" : "pointer",
            }}
          >
            {batchGenerate.isPending ? "🔄 生成中..." : "✨ 生成 5 条内容"}
          </button>
        </div>

        {/* Date topics */}
        {dateTopics.length > 0 && (
          <div className="mb-2">
            <span className="text-xs opacity-60 mr-2">📅 今日推荐：</span>
            {dateTopics.map((t) => (
              <button
                key={t.label}
                onClick={() => setTopic(topic === t.label ? "" : t.label)}
                className="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer transition-all mr-2 mb-1"
                style={{
                  background: topic === t.label ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontWeight: topic === t.label ? 600 : 400,
                }}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Common topics */}
        <div>
          <span className="text-xs opacity-60 mr-2">🔖 常用：</span>
          {COACH_TOPICS.slice(0, 8).map((t) => (
            <button
              key={t}
              onClick={() => setTopic(topic === t ? "" : t)}
              className="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer transition-all mr-2 mb-1"
              style={{
                background: topic === t ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                color: "#fff",
                fontWeight: topic === t ? 600 : 400,
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {batchGenerate.isError && (
        <div
          className="p-4 rounded-xl text-sm mb-4"
          style={{ background: "color-mix(in srgb, var(--red, #dc2626) 10%, transparent)", color: "var(--red, #dc2626)" }}
        >
          ⚠️ {batchGenerate.error?.message || "生成失败，请重试"}
        </div>
      )}

      {/* Loading */}
      {batchGenerate.isPending && (
        <div
          className="rounded-xl p-8 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3 animate-bounce">🤖</div>
          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>AI 正在创作 5 条内容...</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>通常需要 10-20 秒</p>
        </div>
      )}

      {/* Results */}
      {items.length > 0 && !batchGenerate.isPending && (
        <div className="flex flex-col gap-4">
          {items.map((item, idx) => {
            const pd = PLATFORM_DISPLAY[item.platform] || PLATFORM_DISPLAY["朋友圈"];
            const imgUrl = imageUrls[item.id];
            return (
              <div
                key={item.id}
                className="rounded-xl overflow-hidden"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                {/* Card header */}
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: pd.color, color: "#fff" }}
                    >
                      {pd.icon} {pd.label}
                    </span>
                    <Badge variant="outline">{item.content_type}</Badge>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>#{idx + 1}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopy(item.output_text, item.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-semibold"
                      style={{ background: "var(--brand)", color: "#fff" }}
                    >
                      {copiedId === item.id ? "✅ 已复制" : "📋 复制"}
                    </button>
                    <button
                      onClick={() => imgUrl ? setImageUrls((prev) => { const n = { ...prev }; delete n[item.id]; return n; }) : handleGenerateImage(item)}
                      disabled={imageLoading === item.id}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      style={{
                        background: imgUrl ? "var(--brand-light, #dbeafe)" : "var(--surface-soft)",
                        color: imgUrl ? "var(--brand)" : "var(--muted)",
                        opacity: imageLoading === item.id ? 0.6 : 1,
                      }}
                    >
                      {imageLoading === item.id ? "🔄 生成中..." : imgUrl ? "🖼 隐藏配图" : "🎨 AI 配图"}
                    </button>
                  </div>
                </div>

                {/* AI generated image */}
                {imgUrl && (
                  <div className="px-4 pt-3">
                    <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                      <img src={imgUrl} alt="AI 配图" className="w-full" style={{ display: "block", maxHeight: 400, objectFit: "cover" }} />
                      <div className="flex gap-2 p-2" style={{ background: "var(--surface-soft)" }}>
                        <button
                          onClick={() => handleDownloadImage(imgUrl, item.topic)}
                          className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
                          style={{ background: "var(--brand)", color: "#fff" }}
                        >
                          📥 下载
                        </button>
                        <button
                          onClick={() => handleGenerateImage(item)}
                          disabled={imageLoading === item.id}
                          className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                          style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                        >
                          🔄 换一张
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="p-4">
                  <pre
                    className="text-sm whitespace-pre-wrap m-0 leading-relaxed"
                    style={{ color: "var(--ink)", fontFamily: "inherit" }}
                  >
                    {item.output_text}
                  </pre>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {items.length === 0 && !batchGenerate.isPending && (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3">💡</div>
          <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            选一个主题，点击"生成 5 条内容"
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            生成 2 条朋友圈 + 1 条招生转化 + 1 条小红书 + 1 条私聊话术
          </p>
        </div>
      )}
    </div>
  );
}
