"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/Badge";
import {
  useCoachBatchGenerate,
  useCoachHistory,
  useCoachDelete,
  useCoachQuota,
} from "@/hooks/useCoach";
import {
  COACH_TOPICS,
} from "@/lib/constants";
import type { CoachGenerated } from "@/lib/types";
import TopicFinder from "@/components/coach/TopicFinder";
import VideoGenButton from "@/components/coach/VideoGenButton";
import ContentReview from "@/components/coach/ContentReview";
import type { Topic } from "@/hooks/useTopics";

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
  "微信群": { icon: "👥", label: "微信群", color: "#16a34a" },
  "FAQ": { icon: "❓", label: "FAQ", color: "#d97706" },
  "家长私聊": { icon: "👨‍👩‍👧", label: "家长私聊", color: "#7c3aed" },
  "视频脚本": { icon: "🎬", label: "视频脚本", color: "#0284c7" },
};

export default function CoachPage() {
  const [view, setView] = useState<"generate" | "history" | "review">("generate");
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState<"朋友圈" | "小红书" | "微信群" | "FAQ" | "家长私聊" | "视频脚本">("朋友圈");
  const [style, setStyle] = useState<string>("");
  const [audience, setAudience] = useState<string>("");
  const [keywords, setKeywords] = useState<string>("");
  const [extra, setExtra] = useState<string>("");
  const [presenter, setPresenter] = useState<string>(""); // 真人出镜方式（仅视频脚本）
  const [channelHint, setChannelHint] = useState<string>(""); // 来自选题的建议平台
  const [items, setItems] = useState<CoachGenerated[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState<string | null>(null);
  const [imageData, setImageData] = useState<Record<string, { cover: string | null; pages: string[] }>>({});
  const [editedTexts, setEditedTexts] = useState<Record<string, string>>({});

  // 兼容旧的 /coach?topic= 深链：挂载后一次性读取并预填（合法的外部同步）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("topic");
    if (!t) return;
    const form = params.get("form");
    const pres = params.get("presenter");
    const channel = params.get("channel");
    // 清掉 query，避免刷新后又预填
    window.history.replaceState(null, "", window.location.pathname);
    /* eslint-disable react-hooks/set-state-in-effect -- 一次性从 URL 深链同步到表单状态 */
    setTopic(t);
    setView("generate");
    if (form === "视频") setPlatform("视频脚本");
    if (pres) setPresenter(pres);
    if (channel) setChannelHint(channel);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const batchGenerate = useCoachBatchGenerate();
  const { data: history, isLoading: historyLoading } = useCoachHistory();
  const { data: quota } = useCoachQuota();
  const deleteContent = useCoachDelete();
  const dateTopics = getDateTopics();

  // 从选题卡片选中 → 填充内容生成控制区
  function handlePickTopic(t: Topic) {
    setTopic(t.title);
    setPlatform(t.content_form === "视频" ? "视频脚本" : "小红书");
    if (t.needs_presenter) setPresenter(t.needs_presenter);
    if (t.suggest_platform) setChannelHint(t.suggest_platform);
    setTimeout(() => {
      document.getElementById("content-gen-controls")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  }

  const handleGenerate = async () => {
    if (batchGenerate.isPending || !topic.trim()) return;
    // Clear old content
    setItems([]);
    setImageData({});
    setEditedTexts({});
    setCopiedId(null);
    try {
      const res = await batchGenerate.mutateAsync({
        topic,
        platform,
        style: style || undefined,
        audience: audience || undefined,
        keywords: keywords || undefined,
        extra: extra || undefined,
        presenter: platform === "视频脚本" ? presenter || undefined : undefined,
        channelHint: channelHint || undefined,
      });
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

  // mode: "moments"(朋友圈多图) | "cover"(小红书封面) | "page"(小红书内页)
  const handleGenerateImage = async (item: CoachGenerated, mode: string, count: number) => {
    if (imageLoading) return;
    setImageLoading(item.id);
    try {
      const res = await fetch("/api/coach/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: item.topic,
          contentType: item.content_type,
          contentText: editedTexts[item.id] || item.output_text,
          platform: item.platform,
          mode,
          count,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "配图生成失败");
      }
      const data = await res.json();
      const urls: string[] = data.urls || [];
      setImageData((prev) => {
        const cur = prev[item.id] || { cover: null, pages: [] };
        if (mode === "cover") {
          return { ...prev, [item.id]: { ...cur, cover: urls[0] || null } };
        }
        // moments 或 page：替换 pages
        return { ...prev, [item.id]: { ...cur, pages: urls } };
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "配图生成失败，请重试");
    } finally {
      setImageLoading(null);
    }
  };

  const handleDownloadImage = (url: string, name: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name}.png`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>
            💡 内容生产
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            选题 → 选渠道/形式 → 一键生成图文或视频脚本，每条可一键配图
          </p>
        </div>
        {/* View tabs */}
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: "var(--surface-soft)" }}>
          {([["generate", "✨ 生成"], ["review", "🔍 AI 检查"], ["history", "📋 历史记录"]] as const).map(([v, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="px-4 py-1.5 rounded-md text-sm font-medium border-none cursor-pointer transition-all"
              style={{
                background: view === v ? "var(--surface)" : "transparent",
                color: view === v ? "var(--brand)" : "var(--muted)",
                boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 额度状态栏 */}
      {quota && (
        <div className="flex gap-3 mb-5 flex-wrap">
          {[
            { key: "text", label: "今日文案", icon: "📝" },
            { key: "image", label: "今日配图", icon: "🎨" },
            { key: "video", label: "今日视频", icon: "🎬" },
          ].map((q) => {
            const limit = quota.limits[q.key as "text" | "image" | "video"];
            const used = quota.used[q.key as "text" | "image" | "video"];
            const unlimited = limit < 0;
            const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
            const danger = !unlimited && pct >= 80;
            const full = !unlimited && used >= limit;
            const barColor = full ? "#dc2626" : danger ? "#f59e0b" : "var(--brand)";
            return (
              <div
                key={q.key}
                className="flex-1 min-w-[150px] rounded-xl px-4 py-3"
                style={{ background: "var(--surface)", border: `1px solid ${full ? "#dc2626" : "var(--border)"}` }}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>{q.icon} {q.label}</span>
                  <span className="text-xs font-semibold" style={{ color: full ? "#dc2626" : "var(--ink)" }}>
                    {unlimited ? "不限" : `${used} / ${limit}`}
                  </span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-soft)" }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${unlimited ? 0 : pct}%`, background: barColor }} />
                </div>
                {full && <div className="text-xs mt-1" style={{ color: "#dc2626" }}>额度已用完</div>}
              </div>
            );
          })}
        </div>
      )}

      {view === "review" ? (
        <ContentReview />
      ) : view === "history" ? (
        <HistoryView
          items={history || []}
          isLoading={historyLoading}
          onCopy={handleCopy}
          copiedId={copiedId}
          onDelete={(id) => deleteContent.mutate(id)}
        />
      ) : (
      <>
      {/* 第一步：选题（合并选题中心） */}
      <TopicFinder onPick={handlePickTopic} />

      {/* 第二步：生成内容（浅色调） */}
      <div id="content-gen-controls" className="rounded-xl p-5 mb-6 bg-white border border-[var(--border,#e5e7eb)]">
        <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
          ✍️ 第二步 · 生成内容
          <span className="text-xs font-normal text-[var(--muted,#9ca3af)]">选好主题与形式，一键出 5 条可发布内容</span>
        </h3>

        {/* Platform toggle */}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          {([
            ["朋友圈", "💬 微信朋友圈"],
            ["小红书", "📕 小红书"],
            ["微信群", "👥 微信群"],
            ["家长私聊", "👨‍👩‍👧 家长私聊"],
            ["视频脚本", "🎬 视频脚本"],
            ["FAQ", "❓ FAQ"],
          ] as const).map(([p, label]) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium cursor-pointer transition-all border"
              style={
                platform === p
                  ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb", fontWeight: 600 }
                  : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
              }
            >
              {label}
            </button>
          ))}
          <span className="text-xs self-center ml-1 text-[var(--muted,#9ca3af)]">
            {platform === "朋友圈"
              ? "（5条200字短文 · 方形配图）"
              : platform === "小红书"
              ? "（5条图文笔记 · 竖版配图）"
              : platform === "微信群"
              ? "（5条群发文案：通知/介绍/邀请/引导/答疑）"
              : platform === "家长私聊"
              ? "（5种话术：标准/招生版/跟进/破冰/激活）"
              : platform === "视频脚本"
              ? "（3个脚本：30秒/60秒/90秒，含镜头/旁白/字幕）"
              : "（5组家长FAQ：学费/学制/升学/住宿/签证）"}
          </span>
        </div>

        {/* Style selector */}
        <div className="flex gap-2 mb-3 flex-wrap items-center">
          <span className="text-xs text-[var(--muted,#6b7280)]">🎨 风格：</span>
          {["", "焦虑型", "数据型", "故事型", "高端型", "专家型", "转化型"].map((s) => (
            <button
              key={s || "default"}
              onClick={() => setStyle(s)}
              className="text-xs px-3 py-1 rounded-full cursor-pointer transition-all border"
              style={
                style === s
                  ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb", fontWeight: 600 }
                  : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
              }
            >
              {s === "" ? "默认" : s}
            </button>
          ))}
        </div>

        {/* 真人出镜（仅视频脚本） */}
        {platform === "视频脚本" && (
          <div className="flex gap-2 mb-3 flex-wrap items-center">
            <span className="text-xs text-[var(--muted,#6b7280)]">🎥 真人出镜：</span>
            {["需要真人", "口播不出镜", "不需要"].map((p) => (
              <button
                key={p}
                onClick={() => setPresenter(presenter === p ? "" : p)}
                className="text-xs px-3 py-1 rounded-full cursor-pointer transition-all border"
                style={
                  presenter === p
                    ? { background: "#d97706", color: "#fff", borderColor: "#d97706", fontWeight: 600 }
                    : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
                }
              >
                {p === "需要真人" ? "🧑 需要真人" : p === "口播不出镜" ? "🎙 口播不出镜" : "🤖 不需要"}
              </button>
            ))}
          </div>
        )}

        {/* 来自选题的建议平台 */}
        {channelHint && (
          <div className="mb-3 text-xs flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full" style={{ background: "#eff6ff", color: "#2563eb" }}>
              📍 来自选题 · 建议平台：{channelHint}
            </span>
            <button onClick={() => setChannelHint("")} className="text-[var(--muted,#9ca3af)] hover:text-gray-700" style={{ background: "none", border: "none", cursor: "pointer" }}>✕</button>
          </div>
        )}

        <div className="flex gap-3 items-end mb-3">
          <div className="flex-1">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="主题（可手写，或从上方选题点「用它写内容」自动填入）"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none border border-[var(--border,#e5e7eb)] focus:border-blue-500"
              onKeyDown={(e) => { if (e.key === "Enter") handleGenerate(); }}
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={batchGenerate.isPending || !topic.trim()}
            className="px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {batchGenerate.isPending ? "🔄 生成中..." : platform === "视频脚本" ? "✨ 生成 3 个脚本" : "✨ 生成 5 条内容"}
          </button>
        </div>

        {/* 结构化字段：目标人群 / 关键词 / 补充说明 */}
        <div className="flex gap-3 mb-3 flex-wrap">
          <input
            type="text"
            value={audience}
            onChange={(e) => setAudience(e.target.value)}
            placeholder="🎯 目标人群（如：初三家长 / 高一学生 / 陪读妈妈）"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none border border-[var(--border,#e5e7eb)] focus:border-blue-500"
          />
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="🔑 关键词/项目（如：O-Level、AEIS、政府中学）"
            className="flex-1 min-w-[200px] px-3 py-2 rounded-lg text-sm outline-none border border-[var(--border,#e5e7eb)] focus:border-blue-500"
          />
        </div>
        <input
          type="text"
          value={extra}
          onChange={(e) => setExtra(e.target.value)}
          placeholder="📝 补充说明（可选，如：强调升学路径，结尾引导家长私信咨询）"
          className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3 border border-[var(--border,#e5e7eb)] focus:border-blue-500"
        />

        {/* Date topics */}
        {dateTopics.length > 0 && (
          <div className="mb-2">
            <span className="text-xs mr-2 text-[var(--muted,#9ca3af)]">📅 今日推荐：</span>
            {dateTopics.map((t) => (
              <button
                key={t.label}
                onClick={() => setTopic(topic === t.label ? "" : t.label)}
                className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all mr-2 mb-1 border"
                style={
                  topic === t.label
                    ? { background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe", fontWeight: 600 }
                    : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
                }
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        )}

        {/* Common topics */}
        <div>
          <span className="text-xs mr-2 text-[var(--muted,#9ca3af)]">🔖 常用：</span>
          {COACH_TOPICS.slice(0, 8).map((t) => (
            <button
              key={t}
              onClick={() => setTopic(topic === t ? "" : t)}
              className="text-xs px-3 py-1.5 rounded-full cursor-pointer transition-all mr-2 mb-1 border"
              style={
                topic === t
                  ? { background: "#eff6ff", color: "#2563eb", borderColor: "#bfdbfe", fontWeight: 600 }
                  : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
              }
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
            const imgs = imageData[item.id];
            const isLoadingThis = imageLoading === item.id;
            const isXhs = item.platform === "小红书";
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
                  <button
                    onClick={() => handleCopy(editedTexts[item.id] || item.output_text, item.id)}
                    className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-semibold"
                    style={{ background: "var(--brand)", color: "#fff" }}
                  >
                    {copiedId === item.id ? "✅ 已复制" : "📋 复制"}
                  </button>
                </div>

                {/* Image controls */}
                <div className="px-4 pt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs" style={{ color: "var(--muted)" }}>🎨 配图：</span>
                  {isXhs ? (
                    <>
                      <button
                        onClick={() => handleGenerateImage(item, "cover", 1)}
                        disabled={isLoadingThis}
                        className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
                        style={{ background: "var(--brand)", color: "#fff", opacity: isLoadingThis ? 0.6 : 1 }}
                      >
                        {isLoadingThis ? "🔄 生成中..." : "✨ 封面"}
                      </button>
                      <span className="text-xs ml-1" style={{ color: "var(--muted)" }}>内页：</span>
                      {[1, 2, 3, 4].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleGenerateImage(item, "page", c)}
                          disabled={isLoadingThis}
                          className="text-xs px-2.5 py-1.5 rounded-lg border cursor-pointer"
                          style={{ background: "var(--surface-soft)", color: "var(--ink)", borderColor: "var(--border)", opacity: isLoadingThis ? 0.6 : 1 }}
                        >
                          {c}张
                        </button>
                      ))}
                    </>
                  ) : (
                    <>
                      {[4, 9].map((c) => (
                        <button
                          key={c}
                          onClick={() => handleGenerateImage(item, "moments", c)}
                          disabled={isLoadingThis}
                          className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-medium"
                          style={{ background: "var(--brand)", color: "#fff", opacity: isLoadingThis ? 0.6 : 1 }}
                        >
                          {isLoadingThis ? "🔄 生成中..." : `${c}张图`}
                        </button>
                      ))}
                    </>
                  )}
                </div>

                {/* Loading hint */}
                {isLoadingThis && (
                  <div className="px-4 pt-2">
                    <p className="text-xs" style={{ color: "var(--muted)" }}>🤖 配图生成中，多张约需 10-30 秒...</p>
                  </div>
                )}

                {/* 视频：文生视频（即梦 AI） */}
                <div className="px-4 pt-3 flex items-start gap-2 flex-wrap">
                  <span className="text-xs mt-2" style={{ color: "var(--muted)" }}>🎬 视频：</span>
                  <VideoGenButton
                    defaultPrompt={item.topic || ""}
                    ratio={item.platform === "小红书" || item.platform === "视频脚本" ? "9:16" : "16:9"}
                    label="🎬 生成视频"
                  />
                </div>

                {/* Cover (小红书) */}
                {imgs?.cover && (
                  <div className="px-4 pt-3">
                    <p className="text-xs mb-1 font-medium" style={{ color: "var(--brand)" }}>📌 封面</p>
                    <div className="rounded-lg overflow-hidden inline-block relative" style={{ border: "2px solid var(--brand)", maxWidth: 240 }}>
                      <img src={imgs.cover} alt="封面" className="w-full" style={{ display: "block" }} />
                      <button
                        onClick={() => handleDownloadImage(imgs.cover!, `${item.topic}-封面`)}
                        className="absolute bottom-1 right-1 text-xs px-2 py-1 rounded border-none cursor-pointer"
                        style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                      >
                        📥
                      </button>
                    </div>
                    <div className="mt-2 max-w-md">
                      <VideoGenButton defaultPrompt={item.topic || ""} imageUrl={imgs.cover} ratio="9:16" label="🎬 封面转动态视频" />
                    </div>
                  </div>
                )}

                {/* Image grid */}
                {imgs?.pages && imgs.pages.length > 0 && (
                  <div className="px-4 pt-3">
                    {isXhs && <p className="text-xs mb-1 font-medium" style={{ color: "var(--muted)" }}>🖼 内页</p>}
                    <div
                      className="grid gap-1.5"
                      style={{ gridTemplateColumns: `repeat(${imgs.pages.length >= 9 ? 3 : imgs.pages.length >= 4 ? 2 : imgs.pages.length}, 1fr)`, maxWidth: imgs.pages.length >= 4 ? 480 : 600 }}
                    >
                      {imgs.pages.map((url, i) => (
                        <div key={i} className="rounded-lg overflow-hidden relative" style={{ border: "1px solid var(--border)", aspectRatio: isXhs ? "3/4" : "1/1" }}>
                          <img src={url} alt={`配图${i + 1}`} className="w-full h-full" style={{ display: "block", objectFit: "cover" }} />
                          <button
                            onClick={() => handleDownloadImage(url, `${item.topic}-${i + 1}`)}
                            className="absolute bottom-1 right-1 text-xs px-1.5 py-0.5 rounded border-none cursor-pointer"
                            style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
                          >
                            📥
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content - editable */}
                <div className="p-4">
                  <textarea
                    value={editedTexts[item.id] ?? item.output_text}
                    onChange={(e) => setEditedTexts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    className="w-full text-sm whitespace-pre-wrap leading-relaxed border-none outline-none resize-none p-0 m-0"
                    style={{
                      color: "var(--ink)",
                      fontFamily: "inherit",
                      background: "transparent",
                      minHeight: 120,
                      fieldSizing: "content" as never,
                    }}
                  />
                  {editedTexts[item.id] && editedTexts[item.id] !== item.output_text && (
                    <button
                      onClick={() => setEditedTexts((prev) => { const n = { ...prev }; delete n[item.id]; return n; })}
                      className="text-xs px-2 py-1 rounded border-none cursor-pointer mt-1"
                      style={{ color: "var(--muted)", background: "var(--surface-soft)" }}
                    >
                      ↩ 恢复原文
                    </button>
                  )}
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
            选一个主题，点击「生成内容」
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            先选平台（朋友圈/小红书），生成 5 条不同角度的内容，配图也自动匹配平台尺寸
          </p>
        </div>
      )}
      </>
      )}
    </div>
  );
}

// ── History View ──
function HistoryView({
  items, isLoading, onCopy, copiedId, onDelete,
}: {
  items: CoachGenerated[];
  isLoading: boolean;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onDelete: (id: string) => void;
}) {
  const [filter, setFilter] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = filter
    ? items.filter((it) => it.platform === filter)
    : items;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div
        className="rounded-xl p-12 text-center"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <div className="text-4xl mb-3">📋</div>
        <p className="text-sm" style={{ color: "var(--muted)" }}>还没有生成记录</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filter */}
      <div className="flex gap-2 mb-4 items-center">
        {["", "朋友圈", "小红书", "微信群", "FAQ"].map((p) => (
          <button
            key={p || "all"}
            onClick={() => setFilter(p)}
            className="text-xs px-3 py-1.5 rounded-full border-none cursor-pointer"
            style={{
              background: filter === p ? "var(--brand)" : "var(--surface-soft)",
              color: filter === p ? "#fff" : "var(--muted)",
            }}
          >
            {p === "" ? "全部" : `${PLATFORM_DISPLAY[p]?.icon || ""} ${PLATFORM_DISPLAY[p]?.label || p}`}
          </button>
        ))}
        <span className="text-xs ml-auto" style={{ color: "var(--muted)" }}>共 {filtered.length} 条</span>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((item) => {
          const pd = PLATFORM_DISPLAY[item.platform] || PLATFORM_DISPLAY["朋友圈"];
          const expanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="rounded-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="flex items-center justify-between px-4 py-3 cursor-pointer gap-2"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                style={{ borderBottom: expanded ? "1px solid var(--border)" : "none" }}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap"
                    style={{ background: pd.color, color: "#fff" }}
                  >
                    {pd.icon} {pd.label}
                  </span>
                  <Badge variant="outline">{item.content_type}</Badge>
                  <span className="text-sm truncate" style={{ color: "var(--ink)" }}>{item.topic}</span>
                </div>
                <span className="text-xs whitespace-nowrap" style={{ color: "var(--muted)" }}>
                  {formatTime(item.created_at)}
                </span>
                <span className="text-xs" style={{ color: "var(--muted)" }}>{expanded ? "▲" : "▼"}</span>
              </div>

              {expanded && (
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
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer font-semibold"
                      style={{ background: "var(--brand)", color: "#fff" }}
                    >
                      {copiedId === item.id ? "✅ 已复制" : "📋 复制"}
                    </button>
                    <button
                      onClick={() => { if (confirm("确定删除这条记录？")) onDelete(item.id); }}
                      className="text-xs px-3 py-1.5 rounded-lg border-none cursor-pointer"
                      style={{ background: "var(--surface-soft)", color: "var(--red, #dc2626)" }}
                    >
                      🗑 删除
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
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
