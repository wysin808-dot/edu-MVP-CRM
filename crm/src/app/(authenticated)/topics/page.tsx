"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useTopicList,
  useTopicGenerate,
  useTopicUpdate,
  useTopicDeleteBatch,
  type Topic,
} from "@/hooks/useTopics";

const CATEGORY_META: Record<string, { color: string; bg: string; icon: string }> = {
  流量型: { color: "#2563eb", bg: "#eff6ff", icon: "🚀" },
  焦虑型: { color: "#dc2626", bg: "#fef2f2", icon: "😰" },
  对比型: { color: "#7c3aed", bg: "#f5f3ff", icon: "⚖️" },
  申请型: { color: "#059669", bg: "#ecfdf5", icon: "🎓" },
  干货型: { color: "#d97706", bg: "#fffbeb", icon: "📚" },
  热点型: { color: "#db2777", bg: "#fdf2f8", icon: "🔥" },
  其他: { color: "#6b7280", bg: "#f3f4f6", icon: "💡" },
};

const HOT_KEYWORDS = ["WACE", "O-Level", "AEIS", "新加坡国际学校", "陪读妈妈", "高考后留学", "NUS 申请", "国际高中择校"];

const PLATFORM_OPTIONS = ["小红书", "知乎", "抖音", "视频号", "百家号", "公众号"];
const FORM_OPTIONS = ["图文", "视频"];
const PRESENTER_OPTIONS = ["需要真人", "口播不出镜", "不需要"];

export default function TopicsPage() {
  const router = useRouter();
  const { data: topics = [], isLoading } = useTopicList();
  const generate = useTopicGenerate();
  const update = useTopicUpdate();
  const deleteBatch = useTopicDeleteBatch();

  const [keyword, setKeyword] = useState("");
  const [perCategory, setPerCategory] = useState(5);
  const [activeBatch, setActiveBatch] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>("全部");
  const [selPlatforms, setSelPlatforms] = useState<string[]>([]); // 目标平台（空=AI自由判断）
  const [selForm, setSelForm] = useState<string>(""); // 内容形式（""=不限）

  function togglePlatform(p: string) {
    setSelPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  // 按批次分组历史
  const batches = useMemo(() => {
    const map = new Map<string, { batchId: string; keyword: string; createdAt: string; count: number }>();
    for (const t of topics) {
      if (!t.batch_id) continue;
      const ex = map.get(t.batch_id);
      if (ex) ex.count++;
      else map.set(t.batch_id, { batchId: t.batch_id, keyword: t.keyword, createdAt: t.created_at, count: 1 });
    }
    return Array.from(map.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [topics]);

  const currentBatchId = activeBatch || batches[0]?.batchId || null;

  const currentTopics = useMemo(() => {
    let list = topics.filter((t) => t.batch_id === currentBatchId);
    if (filterCat !== "全部") list = list.filter((t) => t.category === filterCat);
    return list;
  }, [topics, currentBatchId, filterCat]);

  const categoriesInBatch = useMemo(() => {
    const set = new Set<string>();
    topics.filter((t) => t.batch_id === currentBatchId).forEach((t) => t.category && set.add(t.category));
    return ["全部", ...Array.from(set)];
  }, [topics, currentBatchId]);

  async function handleGenerate(kw?: string) {
    const k = (kw ?? keyword).trim();
    if (!k) return;
    setKeyword(k);
    const res = await generate.mutateAsync({
      keyword: k,
      perCategory,
      platforms: selPlatforms,
      form: selForm || undefined,
    });
    setActiveBatch(res.batchId);
    setFilterCat("全部");
  }

  function useTopicForContent(t: Topic) {
    update.mutate({ id: t.id, status: "已生成", bumpUsed: true });
    const params = new URLSearchParams({ topic: t.title });
    if (t.content_form) params.set("form", t.content_form);
    if (t.needs_presenter) params.set("presenter", t.needs_presenter);
    if (t.suggest_platform) params.set("channel", t.suggest_platform);
    router.push(`/coach?${params.toString()}`);
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-1">
      {/* 标题 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold flex items-center gap-2">💡 选题中心</h1>
        <p className="text-sm text-[var(--muted,#6b7280)] mt-1">
          输入一个关键词，AI 帮你产出 6 类高流量选题 —— 选对题，是内容有流量的第一步。
        </p>
      </div>

      {/* 输入区 */}
      <div className="rounded-xl border border-[var(--border,#e5e7eb)] bg-white p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
            placeholder="输入关键词，如 WACE、AEIS、新加坡陪读…"
            className="flex-1 rounded-lg border border-[var(--border,#e5e7eb)] px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
          <select
            value={perCategory}
            onChange={(e) => setPerCategory(Number(e.target.value))}
            className="rounded-lg border border-[var(--border,#e5e7eb)] px-2 py-2 text-sm"
            title="每类生成几个"
          >
            <option value={3}>每类 3 个</option>
            <option value={5}>每类 5 个</option>
            <option value={8}>每类 8 个</option>
          </select>
          <button
            onClick={() => handleGenerate()}
            disabled={generate.isPending || !keyword.trim()}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-700 whitespace-nowrap"
          >
            {generate.isPending ? "AI 策划中…" : "🚀 生成选题"}
          </button>
        </div>

        {/* 目标平台 + 内容形式 选择器 */}
        <div className="mt-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--muted,#6b7280)] mr-1">目标平台：</span>
            {PLATFORM_OPTIONS.map((p) => {
              const on = selPlatforms.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => togglePlatform(p)}
                  className="rounded-full px-2.5 py-0.5 text-xs border transition"
                  style={
                    on
                      ? { background: "#2563eb", color: "#fff", borderColor: "#2563eb" }
                      : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
                  }
                >
                  {p}
                </button>
              );
            })}
            <span className="text-[11px] text-[var(--muted,#9ca3af)] ml-1">
              {selPlatforms.length === 0 ? "(不选=AI自动判断)" : `已选 ${selPlatforms.length}`}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-[var(--muted,#6b7280)] mr-1">内容形式：</span>
            {["", ...FORM_OPTIONS].map((f) => {
              const on = selForm === f;
              return (
                <button
                  key={f || "any"}
                  onClick={() => setSelForm(f)}
                  className="rounded-full px-2.5 py-0.5 text-xs border transition"
                  style={
                    on
                      ? { background: "#7c3aed", color: "#fff", borderColor: "#7c3aed" }
                      : { background: "#fff", color: "#4b5563", borderColor: "var(--border,#e5e7eb)" }
                  }
                >
                  {f === "" ? "不限" : f === "视频" ? "🎬 视频" : "🖼 图文"}
                </button>
              );
            })}
          </div>
        </div>

        {/* 热门关键词 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          <span className="text-xs text-[var(--muted,#9ca3af)] self-center mr-1">热门：</span>
          {HOT_KEYWORDS.map((k) => (
            <button
              key={k}
              onClick={() => handleGenerate(k)}
              disabled={generate.isPending}
              className="rounded-full border border-[var(--border,#e5e7eb)] px-2.5 py-0.5 text-xs text-[var(--muted,#4b5563)] hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
            >
              {k}
            </button>
          ))}
        </div>

        {generate.isError && (
          <p className="text-xs text-red-600 mt-2">
            {(generate.error as Error)?.message || "生成失败，请重试"}
          </p>
        )}
      </div>

      {/* 历史批次切换 */}
      {batches.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-3">
          <span className="text-xs text-[var(--muted,#9ca3af)]">历史选题：</span>
          {batches.slice(0, 12).map((b) => (
            <button
              key={b.batchId}
              onClick={() => {
                setActiveBatch(b.batchId);
                setFilterCat("全部");
              }}
              className={`rounded-full px-2.5 py-0.5 text-xs border ${
                b.batchId === currentBatchId
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-[var(--border,#e5e7eb)] text-[var(--muted,#4b5563)] hover:border-blue-400"
              }`}
            >
              {b.keyword} · {b.count}
            </button>
          ))}
        </div>
      )}

      {/* 分类筛选 */}
      {currentTopics.length > 0 || filterCat !== "全部" ? (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {categoriesInBatch.map((c) => {
            const meta = CATEGORY_META[c] || CATEGORY_META["其他"];
            const active = filterCat === c;
            return (
              <button
                key={c}
                onClick={() => setFilterCat(c)}
                className="rounded-full px-3 py-1 text-xs font-medium border"
                style={
                  active
                    ? { background: meta.color, color: "#fff", borderColor: meta.color }
                    : { background: "#fff", color: meta.color, borderColor: "var(--border,#e5e7eb)" }
                }
              >
                {c === "全部" ? "全部" : `${meta.icon} ${c}`}
              </button>
            );
          })}
          {currentBatchId && (
            <button
              onClick={() => {
                if (confirm("删除这批选题？")) {
                  deleteBatch.mutate(currentBatchId);
                  setActiveBatch(null);
                }
              }}
              className="ml-auto rounded-full px-3 py-1 text-xs text-red-500 hover:bg-red-50"
            >
              🗑 删除此批
            </button>
          )}
        </div>
      ) : null}

      {/* 选题卡片 */}
      {isLoading ? (
        <p className="text-sm text-[var(--muted,#9ca3af)] py-10 text-center">加载中…</p>
      ) : currentTopics.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border,#e5e7eb)] py-14 text-center">
          <p className="text-3xl mb-2">💡</p>
          <p className="text-sm text-[var(--muted,#6b7280)]">
            输入一个关键词，点「生成选题」，AI 会帮你想 30 个能带流量的选题
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-2.5 pb-10">
          {currentTopics.map((t) => {
            const meta = CATEGORY_META[t.category || "其他"] || CATEGORY_META["其他"];
            const dropped = t.status === "已弃用";
            return (
              <div
                key={t.id}
                className={`rounded-xl border p-3.5 flex flex-col gap-2 transition ${
                  dropped ? "opacity-40" : "hover:shadow-sm"
                }`}
                style={{ borderColor: "var(--border,#e5e7eb)", background: "#fff" }}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.icon} {t.category}
                  </span>
                  {t.status === "已生成" && (
                    <span className="text-[11px] text-green-600">✓ 已生成</span>
                  )}
                </div>
                <p className="text-sm font-semibold leading-snug">{t.title}</p>
                {t.angle && <p className="text-xs text-[var(--muted,#6b7280)] leading-relaxed">{t.angle}</p>}
                {/* 生产属性：可编辑下拉 */}
                <div className="flex flex-wrap gap-1.5">
                  <select
                    value={t.suggest_platform || ""}
                    onChange={(e) => update.mutate({ id: t.id, suggest_platform: e.target.value })}
                    className="rounded-md border border-[var(--border,#e5e7eb)] bg-gray-50 px-1.5 py-0.5 text-[11px] text-gray-700 outline-none"
                    title="建议平台"
                  >
                    <option value="">📍 平台?</option>
                    {PLATFORM_OPTIONS.map((p) => (
                      <option key={p} value={p}>📍 {p}</option>
                    ))}
                  </select>
                  <select
                    value={t.content_form || ""}
                    onChange={(e) => {
                      const form = e.target.value;
                      update.mutate({
                        id: t.id,
                        content_form: form,
                        ...(form === "图文" ? { needs_presenter: "不需要" } : {}),
                      });
                    }}
                    className="rounded-md border border-[var(--border,#e5e7eb)] px-1.5 py-0.5 text-[11px] outline-none"
                    style={t.content_form === "视频" ? { background: "#fdf2f8", color: "#db2777" } : { background: "#eff6ff", color: "#2563eb" }}
                    title="内容形式"
                  >
                    <option value="">形式?</option>
                    {FORM_OPTIONS.map((f) => (
                      <option key={f} value={f}>{f === "视频" ? "🎬 视频" : "🖼 图文"}</option>
                    ))}
                  </select>
                  {t.content_form === "视频" && (
                    <select
                      value={t.needs_presenter || ""}
                      onChange={(e) => update.mutate({ id: t.id, needs_presenter: e.target.value })}
                      className="rounded-md border border-[var(--border,#e5e7eb)] bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-700 outline-none"
                      title="真人出镜"
                    >
                      <option value="">出镜?</option>
                      {PRESENTER_OPTIONS.map((p) => (
                        <option key={p} value={p}>
                          {p === "需要真人" ? "🧑 真人出镜" : p === "口播不出镜" ? "🎙 口播" : "🤖 无需出镜"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-auto pt-1">
                  <button
                    onClick={() => useTopicForContent(t)}
                    disabled={dropped}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    ✍️ 用它生成内容
                  </button>
                  <button
                    onClick={() =>
                      update.mutate({ id: t.id, status: dropped ? "待用" : "已弃用" })
                    }
                    className="rounded-lg px-2.5 py-1.5 text-xs text-[var(--muted,#6b7280)] hover:bg-gray-100"
                  >
                    {dropped ? "恢复" : "弃用"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
