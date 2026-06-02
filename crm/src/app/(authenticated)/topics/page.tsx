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
    const res = await generate.mutateAsync({ keyword: k, perCategory });
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
                {/* 生产属性徽章 */}
                {(t.suggest_platform || t.content_form || t.needs_presenter) && (
                  <div className="flex flex-wrap gap-1.5">
                    {t.suggest_platform && (
                      <span className="rounded-md bg-gray-100 text-gray-600 px-1.5 py-0.5 text-[11px]">📍 {t.suggest_platform}</span>
                    )}
                    {t.content_form && (
                      <span
                        className="rounded-md px-1.5 py-0.5 text-[11px] font-medium"
                        style={
                          t.content_form === "视频"
                            ? { background: "#fdf2f8", color: "#db2777" }
                            : { background: "#eff6ff", color: "#2563eb" }
                        }
                      >
                        {t.content_form === "视频" ? "🎬 视频" : "🖼 图文"}
                      </span>
                    )}
                    {t.content_form === "视频" && t.needs_presenter && (
                      <span className="rounded-md bg-amber-50 text-amber-700 px-1.5 py-0.5 text-[11px]">
                        {t.needs_presenter === "需要真人" ? "🧑 真人出镜" : t.needs_presenter === "口播不出镜" ? "🎙 口播" : "🤖 无需出镜"}
                      </span>
                    )}
                  </div>
                )}
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
