"use client";

import { useState } from "react";
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

type TabId = "daily" | "generate" | "history";

export default function CoachPage() {
  const [activeTab, setActiveTab] = useState<TabId>("daily");
  const [batchTopic, setBatchTopic] = useState<string>(COACH_TOPICS[0]);
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
      // Fallback
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
    if (batchGenerate.isPending) return;
    batchGenerate.mutate(batchTopic);
  };

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "daily", label: "今日推荐", icon: "✨" },
    { id: "generate", label: "自定义生成", icon: "🎯" },
    { id: "history", label: "历史记录", icon: "📋" },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
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

      {/* Tabs */}
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

      {/* Daily Tab */}
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

      {/* Generate Tab */}
      {activeTab === "generate" && (
        <GenerateTab
          onCopy={handleCopy}
          copiedId={copiedId}
          onToggleSave={(id, saved) => toggleSave.mutate({ id, is_saved: saved })}
        />
      )}

      {/* History Tab */}
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
  items,
  isLoading,
  batchTopic,
  setBatchTopic,
  onGenerate,
  isGenerating,
  onCopy,
  copiedId,
  onToggleSave,
  onDelete,
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
          选择一个主题，系统将自动生成 4 条朋友圈 + 1 条小红书 + 1 条视频脚本 + 3 条私聊话术
        </p>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <select
              value={batchTopic}
              onChange={(e) => setBatchTopic(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border-none outline-none"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              {COACH_TOPICS.map((t) => (
                <option key={t} value={t} style={{ color: "#333" }}>{t}</option>
              ))}
            </select>
          </div>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold border-none cursor-pointer whitespace-nowrap"
            style={{
              background: "rgba(255,255,255,0.95)",
              color: "var(--brand)",
              opacity: isGenerating ? 0.7 : 1,
            }}
          >
            {isGenerating ? "🔄 生成中..." : "✨ 生成今日内容"}
          </button>
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
  onCopy,
  copiedId,
  onToggleSave,
}: {
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onToggleSave: (id: string, saved: boolean) => void;
}) {
  const generate = useCoachGenerate();
  const [form, setForm] = useState({
    topic: COACH_TOPICS[0] as string,
    platform: "朋友圈",
    audienceTag: "",
    tone: "",
    contentType: "教育观点",
  });
  const [result, setResult] = useState<{ content: string; saved?: CoachGenerated } | null>(null);

  const handleGenerate = async () => {
    if (generate.isPending) return;
    try {
      const res = await generate.mutateAsync({
        topic: form.topic,
        platform: form.platform,
        audienceTag: form.audienceTag || undefined,
        tone: form.tone || undefined,
        contentType: form.contentType,
      });
      setResult(res);
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Form */}
      <div className="rounded-xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4 m-0" style={{ color: "var(--ink)" }}>
          🎯 自定义生成
        </h3>
        <div className="flex flex-col gap-4">
          <Select
            label="主题 *"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
            options={COACH_TOPICS.map((t) => ({ value: t, label: t }))}
          />
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
            disabled={generate.isPending}
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
            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-2">
                <Badge variant="default">{form.platform}</Badge>
                <Badge variant="outline">{form.contentType}</Badge>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => result.saved && onCopy(result.content, result.saved.id)}
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
            <div className="p-5">
              <pre
                className="text-sm whitespace-pre-wrap m-0 leading-relaxed"
                style={{ color: "var(--ink)", fontFamily: "inherit" }}
              >
                {result.content}
              </pre>
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
  items,
  isLoading,
  onCopy,
  copiedId,
  onToggleSave,
  onDelete,
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
      {/* Filters */}
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
              {/* Header */}
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

              {/* Expanded content */}
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
  item,
  onCopy,
  copiedId,
  onToggleSave,
  onDelete,
}: {
  item: CoachGenerated;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onToggleSave: (id: string, saved: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

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
        {/* Card Header */}
        <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border)" }}>
          <PlatformIcon platform={item.platform} />
          <Badge variant="outline">{item.content_type}</Badge>
          <span className="flex-1" />
          {item.is_saved && <span className="text-xs">⭐</span>}
        </div>

        {/* Card Body */}
        <div className="px-4 py-3 flex-1">
          <p className="text-xs font-medium mb-1" style={{ color: "var(--brand)" }}>
            {item.topic}
          </p>
          <p className="text-sm line-clamp-4 m-0 leading-relaxed" style={{ color: "var(--ink)" }}>
            {item.output_text}
          </p>
        </div>

        {/* Card Footer */}
        <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={(e) => { e.stopPropagation(); onCopy(item.output_text, item.id); }}
            className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
            style={{ background: "var(--brand)", color: "#fff" }}
          >
            {copiedId === item.id ? "✅ 已复制" : "📋 一键复制"}
          </button>
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); onToggleSave(item.id, !item.is_saved); }}
              className="text-xs px-2 py-1 rounded border-none cursor-pointer"
              style={{ background: "transparent", color: "var(--muted)" }}
            >
              {item.is_saved ? "⭐" : "☆"}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Modal */}
      <Modal isOpen={expanded} onClose={() => setExpanded(false)} title={`${item.platform} · ${item.content_type}`}
        footer={
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(item.output_text, item.id)}
              className="text-xs px-4 py-2 rounded-lg border-none cursor-pointer font-medium"
              style={{ background: "var(--brand)", color: "#fff" }}
            >
              {copiedId === item.id ? "✅ 已复制" : "📋 复制内容"}
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
          <pre
            className="text-sm whitespace-pre-wrap m-0 leading-relaxed"
            style={{ color: "var(--ink)", fontFamily: "inherit" }}
          >
            {item.output_text}
          </pre>
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
