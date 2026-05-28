"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import {
  useCoachDaily,
  useCoachHistory,
  useCoachGenerate,
  useCoachBatchGenerate,
  useCoachToggleSave,
  useCoachDelete,
} from "@/hooks/useCoach";
import {
  COACH_PLATFORMS,
  COACH_CONTENT_TYPES,
  COACH_TOPICS,
  COACH_AUDIENCE_TAGS,
  COACH_TONES,
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
    "2-14": { label: "情人节 · 家长的爱与教育", icon: "💕" },
    "3-8": { label: "妇女节 · 妈妈的教育选择", icon: "🌷" },
    "3-12": { label: "植树节 · 培养孩子的成长", icon: "🌱" },
    "4-1": { label: "愚人节 · 别被教育误区骗了", icon: "🃏" },
    "5-1": { label: "劳动节 · 教育投资", icon: "💪" },
    "5-4": { label: "青年节 · 青春的规划", icon: "🏃" },
    "5-12": { label: "母亲节 · 妈妈的教育焦虑", icon: "🌹" },
    "5-20": { label: "520 · 给孩子最好的爱", icon: "❤️" },
    "6-1": { label: "儿童节 · 给孩子一个更大的世界", icon: "🎈" },
    "6-7": { label: "高考首日 · 还有另一条路", icon: "📝" },
    "6-8": { label: "高考 · 国际教育新出路", icon: "🌏" },
    "6-9": { label: "高考结束 · 规划国际教育", icon: "🎓" },
    "6-18": { label: "618 · 教育不打折但可以更聪明", icon: "🛒" },
    "6-20": { label: "父亲节 · 爸爸的教育期望", icon: "👔" },
    "7-1": { label: "暑假开始 · 暑期规划", icon: "☀️" },
    "8-1": { label: "八月 · 开学季准备", icon: "📚" },
    "9-1": { label: "开学季 · 新学期新起点", icon: "🏫" },
    "9-10": { label: "教师节 · 好老师的重要性", icon: "🍎" },
    "10-1": { label: "国庆 · 假期也是规划期", icon: "🇨🇳" },
    "10-24": { label: "霜降 · 秋季升学规划", icon: "🍂" },
    "11-1": { label: "十一月 · 年底冲刺规划", icon: "📅" },
    "11-11": { label: "双十一 · 教育是最好的投资", icon: "🎯" },
    "12-25": { label: "圣诞节 · 给孩子的礼物：未来", icon: "🎄" },
    "12-31": { label: "跨年 · 新一年升学计划", icon: "🎆" },
  };

  const key = `${m}-${d}`;
  if (holidays[key]) topics.push(holidays[key]);

  // Season-based
  if (m >= 5 && m <= 6) {
    topics.push(
      { label: "毕业季升学规划", icon: "🎓" },
      { label: "暑假提前准备", icon: "☀️" },
      { label: "中考后的国际教育选择", icon: "🔀" },
    );
  } else if (m >= 7 && m <= 8) {
    topics.push(
      { label: "暑期游学体验", icon: "✈️" },
      { label: "开学倒计时准备", icon: "⏰" },
      { label: "秋季入学申请", icon: "📋" },
    );
  } else if (m >= 9 && m <= 10) {
    topics.push(
      { label: "开学适应期攻略", icon: "🏫" },
      { label: "秋季招生季", icon: "🍁" },
      { label: "期中考试备考", icon: "📖" },
    );
  } else if (m >= 11 && m <= 12) {
    topics.push(
      { label: "年终升学总结", icon: "📊" },
      { label: "寒假规划建议", icon: "❄️" },
      { label: "春季入学准备", icon: "🌸" },
    );
  } else {
    topics.push(
      { label: "春季新学期", icon: "🌿" },
      { label: "新年教育规划", icon: "🎯" },
      { label: "寒假学习安排", icon: "📚" },
    );
  }

  return topics;
}

// ── Canvas Image Generator ──
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const char of text) {
    const test = current + char;
    if (ctx.measureText(test).width > maxWidth) {
      lines.push(current);
      current = char;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function generateCardImage(topic: string, contentType: string, _text: string): string {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;
  const W = 1080, H = 1080;

  // Pick a random visual style each time
  const styleIdx = Math.floor(Math.random() * 3);

  // Color schemes: [bg1, bg2, accent, accentSoft]
  const schemes: Record<string, [string, string, string, string]> = {
    "教育观点": ["#f8fafc", "#e2e8f0", "#e87a2e", "#fed7aa"],
    "家长共情": ["#fdf2f8", "#fce7f3", "#db2777", "#fbcfe8"],
    "校园氛围": ["#ecfdf5", "#d1fae5", "#059669", "#a7f3d0"],
    "招生转化": ["#fff7ed", "#ffedd5", "#ea580c", "#fed7aa"],
    "私聊跟进": ["#eef2ff", "#e0e7ff", "#4f46e5", "#c7d2fe"],
    "小红书": ["#fff1f2", "#ffe4e6", "#e11d48", "#fecdd3"],
    "视频脚本": ["#f0f9ff", "#e0f2fe", "#0284c7", "#bae6fd"],
    "学生成长": ["#f0fdfa", "#ccfbf1", "#0d9488", "#99f6e4"],
    "升学路径": ["#f5f3ff", "#ede9fe", "#7c3aed", "#ddd6fe"],
  };
  const [bg1, bg2, accent, accentSoft] = schemes[contentType] || schemes["教育观点"];

  if (styleIdx === 0) {
    // === Style 1: Clean white card with accent strip ===
    // Soft gradient background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, bg1);
    grad.addColorStop(1, bg2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Large accent circle decoration (top-right)
    ctx.fillStyle = accentSoft;
    ctx.globalAlpha = 0.4;
    ctx.beginPath(); ctx.arc(W - 100, 100, 300, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.arc(150, H - 150, 250, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Left accent strip
    ctx.fillStyle = accent;
    roundRect(ctx, 0, 0, 12, H, 0);
    ctx.fill();

    // Topic title — centered, large
    ctx.font = 'bold 72px "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#1a1a1a";
    ctx.textAlign = "center";
    const topicLines = wrapText(ctx, topic, 800);
    const totalHeight = topicLines.length * 90;
    const startY = (H - totalHeight) / 2 + 30;
    topicLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, W / 2, startY + i * 90);
    });

    // Accent underline
    ctx.fillStyle = accent;
    const underY = startY + Math.min(topicLines.length, 3) * 90 + 10;
    ctx.fillRect(W / 2 - 60, underY, 120, 5);

    // Brand at bottom
    ctx.font = '28px "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText("SEDA \xb7 BCI 国际教育", W / 2, H - 60);

  } else if (styleIdx === 1) {
    // === Style 2: Bold colored background, white text ===
    // Full accent background
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, accent);
    grad.addColorStop(1, accentSoft);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Geometric decorations
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.beginPath(); ctx.arc(W - 80, 80, 200, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(80, H - 80, 180, 0, Math.PI * 2); ctx.fill();

    // Diagonal stripe
    ctx.fillStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.moveTo(W * 0.6, 0);
    ctx.lineTo(W, 0);
    ctx.lineTo(W, H * 0.4);
    ctx.fill();

    // Topic title — big, white, centered
    ctx.font = 'bold 76px "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    const topicLines = wrapText(ctx, topic, 800);
    const totalHeight = topicLines.length * 96;
    const startY = (H - totalHeight) / 2 + 20;
    topicLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, W / 2, startY + i * 96);
    });

    // Brand at bottom
    ctx.font = '26px "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.textAlign = "center";
    ctx.fillText("SEDA \xb7 BCI 国际教育", W / 2, H - 55);

  } else {
    // === Style 3: Split layout — color block + white ===
    // Top half: accent color
    const topH = H * 0.45;
    ctx.fillStyle = accent;
    ctx.fillRect(0, 0, W, topH);

    // Bottom half: white
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, topH, W, H - topH);

    // Decorative circle at boundary
    ctx.fillStyle = accentSoft;
    ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.arc(W - 200, topH, 180, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // Content type in top section
    ctx.font = '600 30px "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.textAlign = "left";
    ctx.fillText(contentType, 80, 80);

    // Large emoji/icon in top section
    const icons: Record<string, string> = {
      "教育观点": "🎓", "家长共情": "💛", "校园氛围": "🏫",
      "招生转化": "🎯", "私聊跟进": "💬", "小红书": "📕",
      "视频脚本": "🎬", "学生成长": "🌱", "升学路径": "🛤️",
    };
    ctx.font = "120px serif";
    ctx.textAlign = "center";
    ctx.fillText(icons[contentType] || "📚", W / 2, topH - 60);

    // Topic title in bottom section
    ctx.font = 'bold 60px "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#1a1a1a";
    ctx.textAlign = "center";
    const topicLines = wrapText(ctx, topic, 860);
    const startY = topH + 100;
    topicLines.slice(0, 3).forEach((line, i) => {
      ctx.fillText(line, W / 2, startY + i * 78);
    });

    // Accent line
    const lineY = startY + Math.min(topicLines.length, 3) * 78 + 20;
    ctx.fillStyle = accent;
    ctx.fillRect(W / 2 - 50, lineY, 100, 4);

    // Brand at bottom
    ctx.font = '26px "PingFang SC", "Noto Sans SC", sans-serif';
    ctx.fillStyle = "#bbb";
    ctx.textAlign = "center";
    ctx.fillText("SEDA \xb7 BCI 国际教育", W / 2, H - 55);
  }

  return canvas.toDataURL("image/png");
}

function downloadImage(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ── Auto-resize textarea ──
function AutoTextarea({ value, onChange, className, style }: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
      style={{ ...style, overflow: "hidden", resize: "none" }}
    />
  );
}

type TabId = "daily" | "generate" | "history";

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<TabId>("daily");
  const [batchTopic, setBatchTopic] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: dailyItems, isLoading: dailyLoading } = useCoachDaily();
  const { data: history, isLoading: historyLoading } = useCoachHistory();
  const batchGenerate = useCoachBatchGenerate();
  const toggleSave = useCoachToggleSave();
  const deleteContent = useCoachDelete();

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleBatchGenerate = () => {
    if (batchGenerate.isPending || !batchTopic.trim()) return;
    batchGenerate.mutate(batchTopic);
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "daily", label: "今日推荐", icon: "✨" },
    { id: "generate", label: "自定义生成", icon: "🎯" },
    { id: "history", label: "历史记录", icon: "📋" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>
            🎓 朋友圈教练
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            每天为招生老师提供可直接使用的内容半成品
          </p>
        </div>
      </div>

      <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: "var(--surface-soft)" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-medium border-none cursor-pointer transition-all"
            style={{
              background: activeTab === tab.id ? "var(--surface)" : "transparent",
              color: activeTab === tab.id ? "var(--brand)" : "var(--muted)",
              boxShadow: activeTab === tab.id ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "daily" && (
        <DailyTab
          items={dailyItems || []}
          isLoading={dailyLoading}
          batchTopic={batchTopic}
          setBatchTopic={setBatchTopic}
          onGenerate={handleBatchGenerate}
          isGenerating={batchGenerate.isPending}
          onCopy={handleCopy}
          copiedId={copiedId}
          onToggleSave={(id, saved) => toggleSave.mutate({ id, is_saved: saved })}
          onDelete={(id) => deleteContent.mutate(id)}
        />
      )}

      {activeTab === "generate" && (
        <GenerateTab
          onCopy={handleCopy}
          copiedId={copiedId}
          onToggleSave={(id, saved) => toggleSave.mutate({ id, is_saved: saved })}
        />
      )}

      {activeTab === "history" && (
        <HistoryTab
          items={history || []}
          isLoading={historyLoading}
          onCopy={handleCopy}
          copiedId={copiedId}
          onToggleSave={(id, saved) => toggleSave.mutate({ id, is_saved: saved })}
          onDelete={(id) => deleteContent.mutate(id)}
        />
      )}
    </div>
  );
}

// ── Daily Tab ──
function DailyTab({
  items, isLoading, batchTopic, setBatchTopic, onGenerate, isGenerating, onCopy, copiedId, onToggleSave, onDelete,
}: {
  items: CoachGenerated[];
  isLoading: boolean;
  batchTopic: string;
  setBatchTopic: (t: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onToggleSave: (id: string, saved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const dateTopics = getDateTopics();

  return (
    <div>
      {/* Generate banner */}
      <div
        className="rounded-xl p-5 mb-6"
        style={{
          background: "linear-gradient(135deg, var(--brand), color-mix(in srgb, var(--brand) 80%, #000))",
          color: "#fff",
        }}
      >
        <h3 className="text-base font-semibold mb-2 m-0">⚡ 一键生成今日内容</h3>
        <p className="text-sm mb-4 opacity-90">
          输入主题或选择推荐，生成 4 条朋友圈 + 1 条小红书 + 1 条视频脚本 + 3 条私聊话术
        </p>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <input
                type="text"
                value={batchTopic}
                onChange={(e) => setBatchTopic(e.target.value)}
                placeholder="输入自定义主题，如：中考后的国际教育选择..."
                className="w-full px-3 py-2.5 rounded-lg text-sm border-none outline-none"
                style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
              />
            </div>
            <button
              onClick={onGenerate}
              disabled={isGenerating || !batchTopic.trim()}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer whitespace-nowrap"
              style={{
                background: !batchTopic.trim() ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.95)",
                color: !batchTopic.trim() ? "rgba(255,255,255,0.6)" : "var(--brand)",
                opacity: isGenerating ? 0.7 : 1,
                cursor: !batchTopic.trim() ? "not-allowed" : "pointer",
              }}
            >
              {isGenerating ? "🔄 生成中..." : "✨ 生成今日内容"}
            </button>
          </div>

          {/* Date-aware topics */}
          {dateTopics.length > 0 && (
            <div>
              <span className="text-xs opacity-60 mr-2">📅 今日推荐：</span>
              {dateTopics.map((t) => (
                <button
                  key={t.label}
                  onClick={() => setBatchTopic(batchTopic === t.label ? "" : t.label)}
                  className="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer transition-all mr-2 mb-1"
                  style={{
                    background: batchTopic === t.label ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                    color: "#fff",
                    fontWeight: batchTopic === t.label ? 600 : 400,
                    border: batchTopic === t.label ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                  }}
                >
                  {t.icon} {t.label} {batchTopic === t.label ? "✕" : ""}
                </button>
              ))}
            </div>
          )}

          {/* Regular topics */}
          <div>
            <span className="text-xs opacity-60 mr-2">🔖 常用主题：</span>
            {COACH_TOPICS.slice(0, 8).map((t) => (
              <button
                key={t}
                onClick={() => setBatchTopic(batchTopic === t ? "" : t)}
                className="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer transition-all mr-2 mb-1"
                style={{
                  background: batchTopic === t ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
                  color: "#fff",
                  fontWeight: batchTopic === t ? 600 : 400,
                  border: batchTopic === t ? "1px solid rgba(255,255,255,0.4)" : "1px solid transparent",
                }}
              >
                {t} {batchTopic === t ? "✕" : ""}
              </button>
            ))}
            <details className="relative" style={{ display: "inline-block" }}>
              <summary
                className="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer list-none"
                style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
              >
                更多 ▾
              </summary>
              <div
                className="absolute bottom-full left-0 mb-2 p-2 rounded-lg flex flex-wrap gap-2 z-50"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", minWidth: 300 }}
              >
                {COACH_TOPICS.slice(8).map((t) => (
                  <button
                    key={t}
                    onClick={() => setBatchTopic(batchTopic === t ? "" : t)}
                    className="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer"
                    style={{
                      background: batchTopic === t ? "var(--brand)" : "var(--surface-soft)",
                      color: batchTopic === t ? "#fff" : "var(--ink)",
                    }}
                  >
                    {t} {batchTopic === t ? "✕" : ""}
                  </button>
                ))}
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Daily content grid */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : items.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              onCopy={onCopy}
              copiedId={copiedId}
              onToggleSave={onToggleSave}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3">🌅</div>
          <p className="text-sm font-medium mb-1" style={{ color: "var(--ink)" }}>
            今天还没有生成内容
          </p>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            选择上方主题，点击"生成今日内容"开始
          </p>
        </div>
      )}
    </div>
  );
}

// ── Generate Tab ──
function GenerateTab({
  onCopy, copiedId, onToggleSave,
}: {
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onToggleSave: (id: string, saved: boolean) => void;
}) {
  const generate = useCoachGenerate();
  const [genImage, setGenImage] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<string>("");
  const dateTopics = getDateTopics();
  const [form, setForm] = useState({
    topic: "" as string,
    platform: "朋友圈",
    audienceTag: "",
    tone: "",
    contentType: "教育观点",
  });
  const [result, setResult] = useState<{ content: string; saved?: CoachGenerated } | null>(null);

  const handleGenerate = async () => {
    if (generate.isPending || !form.topic.trim()) return;
    setGenImage(null);
    try {
      const res = await generate.mutateAsync({
        topic: form.topic,
        platform: form.platform,
        audienceTag: form.audienceTag || undefined,
        tone: form.tone || undefined,
        contentType: form.contentType,
      });
      setResult(res);
      setEditedContent(res.content);
    } catch {
      // Error handled by mutation
    }
  };

  const handleGenerateImage = () => {
    const textToUse = editedContent || result?.content || "";
    const img = generateCardImage(form.topic, form.contentType, textToUse);
    setGenImage(img);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4 m-0" style={{ color: "var(--ink)" }}>
          🎯 自定义生成
        </h3>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--muted)" }}>
              主题 *
            </label>
            <input
              type="text"
              value={form.topic}
              onChange={(e) => setForm({ ...form, topic: e.target.value })}
              placeholder="输入自定义主题，如：AEIS考试准备..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-2"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
            {/* Date-aware topics */}
            {dateTopics.length > 0 && (
              <div className="mb-2">
                <span className="text-xs mr-1" style={{ color: "var(--muted)" }}>📅 今日：</span>
                {dateTopics.slice(0, 3).map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setForm({ ...form, topic: form.topic === t.label ? "" : t.label })}
                    className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all mr-1.5 mb-1"
                    style={{
                      background: form.topic === t.label ? "var(--brand)" : "var(--surface-soft)",
                      color: form.topic === t.label ? "#fff" : "var(--muted)",
                      border: `1px solid ${form.topic === t.label ? "var(--brand)" : "var(--border)"}`,
                      fontWeight: form.topic === t.label ? 600 : 400,
                    }}
                  >
                    {t.icon} {t.label} {form.topic === t.label ? "✕" : ""}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              <span className="text-xs mr-0.5 py-1" style={{ color: "var(--muted)" }}>🔖</span>
              {COACH_TOPICS.slice(0, 6).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm({ ...form, topic: form.topic === t ? "" : t })}
                  className="text-xs px-2.5 py-1 rounded-full cursor-pointer transition-all"
                  style={{
                    background: form.topic === t ? "var(--brand)" : "var(--surface-soft)",
                    color: form.topic === t ? "#fff" : "var(--muted)",
                    border: `1px solid ${form.topic === t ? "var(--brand)" : "var(--border)"}`,
                    fontWeight: form.topic === t ? 600 : 400,
                  }}
                >
                  {t} {form.topic === t ? "✕" : ""}
                </button>
              ))}
              <details className="relative" style={{ display: "inline-block" }}>
                <summary
                  className="text-xs px-2.5 py-1 rounded-full cursor-pointer list-none"
                  style={{ background: "var(--surface-soft)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  更多 ▾
                </summary>
                <div
                  className="absolute top-full left-0 mt-1 p-2 rounded-lg flex flex-wrap gap-1.5 z-50"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", minWidth: 260, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}
                >
                  {COACH_TOPICS.slice(6).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm({ ...form, topic: form.topic === t ? "" : t })}
                      className="text-xs px-2.5 py-1 rounded-full border-none cursor-pointer"
                      style={{
                        background: form.topic === t ? "var(--brand)" : "var(--surface-soft)",
                        color: form.topic === t ? "#fff" : "var(--ink)",
                      }}
                    >
                      {t} {form.topic === t ? "✕" : ""}
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </div>
          <Select
            label="发布平台 *"
            value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            options={COACH_PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))}
          />
          <Select
            label="内容类型"
            value={form.contentType}
            onChange={(e) => setForm({ ...form, contentType: e.target.value })}
            options={COACH_CONTENT_TYPES.map((t) => ({ value: t, label: t }))}
          />
          <Select
            label="家长画像"
            value={form.audienceTag}
            onChange={(e) => setForm({ ...form, audienceTag: e.target.value })}
            options={[
              { value: "", label: "不指定（通用）" },
              ...COACH_AUDIENCE_TAGS.map((t) => ({ value: t, label: t })),
            ]}
          />
          <Select
            label="语气风格"
            value={form.tone}
            onChange={(e) => setForm({ ...form, tone: e.target.value })}
            options={[
              { value: "", label: "不指定（默认）" },
              ...COACH_TONES.map((t) => ({ value: t.id, label: `${t.label} — ${t.description}` })),
            ]}
          />

          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={generate.isPending || !form.topic.trim()}
          >
            {generate.isPending ? "🔄 生成中..." : "✨ 生成内容"}
          </Button>

          {generate.isError && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "color-mix(in srgb, var(--red, #dc2626) 10%, transparent)", color: "var(--red, #dc2626)" }}>
              ⚠️ {generate.error?.message || "生成失败，请重试"}
            </div>
          )}
        </div>
      </div>

      {/* Result */}
      <div>
        {generate.isPending ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-4xl mb-3 animate-bounce">🤖</div>
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>AI 正在创作中...</p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>通常需要 5-15 秒</p>
          </div>
        ) : result ? (
          <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            {/* Header toolbar */}
            <div className="px-5 py-3 flex items-center justify-between flex-wrap gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <Badge variant="default">{form.platform}</Badge>
                <Badge variant="outline">{form.contentType}</Badge>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => result.saved && onCopy(editedContent, result.saved.id)}
                  className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer transition-all"
                  style={{ background: "var(--brand)", color: "#fff" }}
                >
                  {copiedId === result.saved?.id ? "✅ 已复制" : "📋 复制"}
                </button>
                {result.saved && (
                  <button
                    onClick={() => onToggleSave(result.saved!.id, !result.saved!.is_saved)}
                    className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                    style={{
                      background: result.saved.is_saved ? "var(--brand-light)" : "var(--surface-soft)",
                      color: result.saved.is_saved ? "var(--brand)" : "var(--muted)",
                    }}
                  >
                    {result.saved.is_saved ? "⭐ 已收藏" : "☆ 收藏"}
                  </button>
                )}
                <button
                  onClick={handleGenerate}
                  className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                  style={{ background: "var(--surface-soft)", color: "var(--muted)" }}
                >
                  🔄 重新生成
                </button>
              </div>
            </div>

            {/* Image generation area */}
            <div className="px-5 pt-4">
              {!genImage ? (
                <button
                  onClick={handleGenerateImage}
                  className="w-full py-4 rounded-xl border-2 border-dashed cursor-pointer text-sm font-medium transition-all"
                  style={{
                    background: "var(--surface-soft)",
                    borderColor: "var(--border)",
                    color: "var(--ink)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink)"; }}
                >
                  🎨 生成配图（随机风格，可多次点击换样式）
                </button>
              ) : (
                <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                  <img src={genImage} alt="配图" className="w-full" style={{ display: "block", maxHeight: 500, objectFit: "contain", background: "#111" }} />
                  <div className="flex gap-2 p-3" style={{ background: "var(--surface-soft)" }}>
                    <button
                      onClick={() => downloadImage(genImage, `${form.topic}-${form.contentType}.png`)}
                      className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer font-medium"
                      style={{ background: "var(--brand)", color: "#fff" }}
                    >
                      📥 下载配图
                    </button>
                    <button
                      onClick={handleGenerateImage}
                      className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer"
                      style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                    >
                      🔄 重新生成配图
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Editable content */}
            <div className="p-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs" style={{ color: "var(--muted)" }}>✏️ 文字内容（可编辑，复制后粘贴到朋友圈）</span>
                {editedContent !== result.content && (
                  <button
                    onClick={() => setEditedContent(result.content)}
                    className="text-xs px-2 py-1 rounded border-none cursor-pointer"
                    style={{ color: "var(--muted)" }}
                  >
                    ↩ 恢复原文
                  </button>
                )}
              </div>
              <AutoTextarea
                value={editedContent}
                onChange={setEditedContent}
                className="w-full text-sm whitespace-pre-wrap m-0 leading-relaxed border-none outline-none p-3 rounded-lg"
                style={{
                  color: "var(--ink)",
                  fontFamily: "inherit",
                  background: "var(--surface-soft)",
                  minHeight: 200,
                }}
              />
            </div>
          </div>
        ) : (
          <div
            className="rounded-xl p-8 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <div className="text-4xl mb-3">💡</div>
            <p className="text-sm font-medium" style={{ color: "var(--ink)" }}>
              选择参数后点击"生成内容"
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              系统会根据主题、平台和家长画像生成定制内容
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── History Tab ──
function HistoryTab({
  items, isLoading, onCopy, copiedId, onToggleSave, onDelete,
}: {
  items: CoachGenerated[];
  isLoading: boolean;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onToggleSave: (id: string, saved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = useState({ platform: "", saved: "" });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (filter.platform && item.platform !== filter.platform) return false;
    if (filter.saved === "saved" && !item.is_saved) return false;
    if (filter.saved === "unsaved" && item.is_saved) return false;
    return true;
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div>
      <div className="flex gap-3 mb-5">
        <Select
          value={filter.platform}
          onChange={(e) => setFilter({ ...filter, platform: e.target.value })}
          options={[
            { value: "", label: "全部平台" },
            ...COACH_PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` })),
          ]}
        />
        <Select
          value={filter.saved}
          onChange={(e) => setFilter({ ...filter, saved: e.target.value })}
          options={[
            { value: "", label: "全部内容" },
            { value: "saved", label: "⭐ 已收藏" },
            { value: "unsaved", label: "未收藏" },
          ]}
        />
        <div className="flex items-center text-xs" style={{ color: "var(--muted)" }}>
          共 {filtered.length} 条
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="flex flex-col gap-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                style={{ borderBottom: expandedId === item.id ? "1px solid var(--border)" : "none" }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <PlatformIcon platform={item.platform} />
                  <Badge variant="outline">{item.content_type}</Badge>
                  <span className="text-sm truncate" style={{ color: "var(--ink)" }}>
                    {item.topic}
                  </span>
                  {item.is_saved && <span className="text-xs">⭐</span>}
                  {item.is_daily && <Badge variant="default">每日</Badge>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {formatTime(item.created_at)}
                  </span>
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    {expandedId === item.id ? "▲" : "▼"}
                  </span>
                </div>
              </div>

              {expandedId === item.id && (
                <div className="p-4">
                  <pre
                    className="text-sm whitespace-pre-wrap m-0 mb-3 leading-relaxed"
                    style={{ color: "var(--ink)", fontFamily: "inherit" }}
                  >
                    {item.output_text}
                  </pre>
                  <div className="flex gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                      onClick={() => onCopy(item.output_text, item.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      style={{ background: "var(--brand)", color: "#fff" }}
                    >
                      {copiedId === item.id ? "✅ 已复制" : "📋 复制"}
                    </button>
                    <button
                      onClick={() => onToggleSave(item.id, !item.is_saved)}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      style={{
                        background: item.is_saved ? "var(--brand-light)" : "var(--surface-soft)",
                        color: item.is_saved ? "var(--brand)" : "var(--muted)",
                      }}
                    >
                      {item.is_saved ? "⭐ 已收藏" : "☆ 收藏"}
                    </button>
                    <button
                      onClick={() => { if (confirm("确定删除？")) onDelete(item.id); }}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      style={{ background: "var(--surface-soft)", color: "var(--red, #dc2626)" }}
                    >
                      🗑 删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>还没有生成记录</p>
        </div>
      )}
    </div>
  );
}

// ── Content Card Component ──
function ContentCard({
  item, onCopy, copiedId, onToggleSave, onDelete,
}: {
  item: CoachGenerated;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onToggleSave: (id: string, saved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [editText, setEditText] = useState(item.output_text);

  const handleGenerateImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const img = generateCardImage(item.topic, item.content_type, editText);
    setCardImage(img);
    setExpanded(true);
  };

  return (
    <>
      <div
        className="rounded-xl overflow-hidden transition-all cursor-pointer h-full flex flex-col"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        onClick={() => setExpanded(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.transform = "none";
        }}
      >
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
          <PlatformIcon platform={item.platform} />
          <Badge variant="outline">{item.content_type}</Badge>
          <span className="flex-1" />
          {item.is_saved && <span className="text-xs">⭐</span>}
        </div>

        <div className="px-4 py-3 flex-1">
          <p className="text-xs font-medium mb-1" style={{ color: "var(--brand)" }}>
            {item.topic}
          </p>
          <p className="text-sm line-clamp-4 m-0 leading-relaxed" style={{ color: "var(--ink)" }}>
            {item.output_text}
          </p>
        </div>

        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onCopy(editText, item.id); }}
              className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              {copiedId === item.id ? "✅ 已复制" : "📋 复制"}
            </button>
            <button
              onClick={handleGenerateImage}
              className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
              style={{ background: "var(--surface-soft)", color: "var(--ink)" }}
            >
              🎨 配图
            </button>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleSave(item.id, !item.is_saved); }}
            className="text-xs px-2 py-1 rounded border-none cursor-pointer"
            style={{ background: "transparent", color: "var(--muted)" }}
          >
            {item.is_saved ? "⭐" : "☆"}
          </button>
        </div>
      </div>

      {/* Expanded Modal */}
      <Modal isOpen={expanded} onClose={() => setExpanded(false)} title={`${item.platform} · ${item.content_type}`}
        footer={
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => onCopy(editText, item.id)}
              className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer font-medium"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              {copiedId === item.id ? "✅ 已复制" : "📋 复制内容"}
            </button>
            <button
              onClick={() => handleGenerateImage()}
              className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer font-medium"
              style={{ background: "var(--surface-soft)", color: "var(--ink)" }}
            >
              🎨 生成配图
            </button>
            <button
              onClick={() => onToggleSave(item.id, !item.is_saved)}
              className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer"
              style={{
                background: item.is_saved ? "var(--brand-light)" : "var(--surface-soft)",
                color: item.is_saved ? "var(--brand)" : "var(--muted)",
              }}
            >
              {item.is_saved ? "⭐ 已收藏" : "☆ 收藏"}
            </button>
            <button
              onClick={() => { if (confirm("确定删除？")) { onDelete(item.id); setExpanded(false); } }}
              className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer"
              style={{ background: "var(--surface-soft)", color: "var(--red, #dc2626)" }}
            >
              🗑 删除
            </button>
          </div>
        }
      >
        <div>
          <div className="flex gap-2 mb-4">
            <Badge variant="default">{item.platform}</Badge>
            <Badge variant="outline">{item.topic}</Badge>
            {item.audience_tag && <Badge variant="outline">{item.audience_tag}</Badge>}
            {item.tone && <Badge variant="outline">{item.tone}</Badge>}
          </div>

          {/* Image section */}
          {!cardImage ? (
            <button
              onClick={() => handleGenerateImage()}
              className="w-full py-3 mb-4 rounded-xl border-2 border-dashed cursor-pointer text-sm font-medium transition-all"
              style={{
                background: "var(--surface-soft)",
                borderColor: "var(--border)",
                color: "var(--ink)",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand)"; e.currentTarget.style.color = "var(--brand)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--ink)"; }}
            >
              🎨 生成配图（随机风格）
            </button>
          ) : (
            <div className="mb-4 rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
              <img src={cardImage} alt="配图" className="w-full" style={{ display: "block" }} />
              <div className="flex gap-2 p-3" style={{ background: "var(--surface-soft)" }}>
                <button
                  onClick={() => downloadImage(cardImage, `${item.topic}-${item.content_type}.png`)}
                  className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer font-medium"
                  style={{ background: "var(--brand)", color: "#fff" }}
                >
                  📥 下载配图
                </button>
                <button
                  onClick={() => handleGenerateImage()}
                  className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer"
                  style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}
                >
                  🔄 换一张
                </button>
              </div>
            </div>
          )}

          {/* Editable content */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs" style={{ color: "var(--muted)" }}>✏️ 可编辑内容</span>
            {editText !== item.output_text && (
              <button
                onClick={() => setEditText(item.output_text)}
                className="text-xs px-2 py-1 rounded border-none cursor-pointer"
                style={{ color: "var(--muted)" }}
              >
                ↩ 恢复原文
              </button>
            )}
          </div>
          <AutoTextarea
            value={editText}
            onChange={setEditText}
            className="w-full text-sm whitespace-pre-wrap m-0 leading-relaxed p-3 rounded-lg outline-none"
            style={{
              color: "var(--ink)",
              fontFamily: "inherit",
              background: "var(--surface-soft)",
              border: "1px solid var(--border)",
              minHeight: 150,
            }}
          />
        </div>
      </Modal>
    </>
  );
}

// ── Helper Components ──
function PlatformIcon({ platform }: { platform: string }) {
  const icons: Record<string, string> = {
    "朋友圈": "💬",
    "小红书": "📕",
    "视频脚本": "🎬",
    "家长私聊": "👨‍👩‍👧",
    "FAQ": "❓",
  };
  return <span className="text-base">{icons[platform] || "📄"}</span>;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60 * 1000) return "刚刚";
  if (diff < 3600 * 1000) return `${Math.floor(diff / 60000)} 分钟前`;
  if (diff < 86400 * 1000) return `${Math.floor(diff / 3600000)} 小时前`;
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" });
}

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
      ))}
    </div>
  );
}
