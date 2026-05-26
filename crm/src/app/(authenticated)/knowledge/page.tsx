"use client";

import { useState } from "react";
import { useKnowledgeList, useCreateKnowledge, useUpdateKnowledge } from "@/hooks/useKnowledge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { KnowledgeItem } from "@/lib/types";

const ITEM_TYPES = ["资料", "数据", "案例", "政策"];
const VISIBILITIES = ["内部", "公开", "仅管理"];
const SOURCE_TYPES = ["人工整理", "官方数据", "新闻报道", "研究报告"];
const REVIEW_CYCLES = ["每月", "每季", "每半年", "每年"];

export default function KnowledgePage() {
  const [typeFilter, setTypeFilter] = useState("");
  const [visFilter, setVisFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: items, isLoading } = useKnowledgeList({
    itemType: typeFilter || undefined,
    visibility: visFilter || undefined,
  });
  const createKnowledge = useCreateKnowledge();
  const updateKnowledge = useUpdateKnowledge();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<KnowledgeItem | null>(null);
  const [form, setForm] = useState({
    title: "", detail: "", source_url: "", source_type: "人工整理",
    subject_tags: "", item_type: "资料", numeric_data: "",
    review_cycle: "每年", visibility: "内部", verified_by: "",
  });

  const filtered = items?.filter((item) =>
    !search || item.title.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "", detail: "", source_url: "", source_type: "人工整理",
      subject_tags: "", item_type: "资料", numeric_data: "",
      review_cycle: "每年", visibility: "内部", verified_by: "",
    });
    setShowModal(true);
  };

  const openEdit = (item: KnowledgeItem) => {
    setEditing(item);
    setForm({
      title: item.title, detail: item.detail || "", source_url: item.source_url || "",
      source_type: item.source_type, subject_tags: (item.subject_tags || []).join(", "),
      item_type: item.item_type, numeric_data: item.numeric_data || "",
      review_cycle: item.review_cycle, visibility: item.visibility, verified_by: item.verified_by || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    const payload = {
      title: form.title.trim(),
      detail: form.detail || null,
      source_url: form.source_url || null,
      source_type: form.source_type,
      subject_tags: form.subject_tags ? form.subject_tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      item_type: form.item_type,
      numeric_data: form.numeric_data || null,
      review_cycle: form.review_cycle,
      visibility: form.visibility,
      verified_by: form.verified_by || null,
    };
    try {
      if (editing) {
        await updateKnowledge.mutateAsync({ id: editing.id, ...payload });
      } else {
        await createKnowledge.mutateAsync({ ...payload, last_verified: null, used_count: 0 });
      }
      setShowModal(false);
    } catch (err) {
      alert("保存失败，请重试");
    }
  };

  const visBadge = (v: string): "success" | "info" | "warning" => {
    switch (v) {
      case "公开": return "success";
      case "内部": return "info";
      case "仅管理": return "warning";
      default: return "info";
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>真实资料库</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            共 {filtered?.length || 0} 条资料
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ 新增资料</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select label="" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
          options={[{ value: "", label: "全部类型" }, ...ITEM_TYPES.map((t) => ({ value: t, label: t }))]} />
        <Select label="" value={visFilter} onChange={(e) => setVisFilter(e.target.value)}
          options={[{ value: "", label: "全部可见性" }, ...VISIBILITIES.map((v) => ({ value: v, label: v }))]} />
        <div className="flex-1 min-w-[200px]">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 搜索资料标题..."
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
        </div>
      </div>

      {/* Knowledge List */}
      {filtered && filtered.length > 0 ? (
        <div className="flex flex-col gap-2">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="rounded-xl p-4 cursor-pointer transition-all flex items-center gap-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              onClick={() => openEdit(item)}
              onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)")}
              onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
            >
              {/* Type icon */}
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: "var(--surface-soft)" }}>
                {item.item_type === "数据" ? "📊" : item.item_type === "案例" ? "📋" : item.item_type === "政策" ? "📜" : "📄"}
              </div>

              {/* Title + tags */}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: "var(--ink)" }}>{item.title}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.subject_tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Metadata */}
              <Badge variant="outline">{item.item_type}</Badge>
              <Badge variant={visBadge(item.visibility)}>{item.visibility}</Badge>
              <div className="text-xs text-center shrink-0" style={{ color: "var(--muted)", width: "60px" }}>
                <div style={{ color: "var(--brand)" }}>{item.used_count}</div>
                <div>引用</div>
              </div>
              <div className="text-xs shrink-0" style={{ color: "var(--muted)", width: "60px" }}>
                {item.review_cycle}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {search || typeFilter || visFilter ? "没有匹配的资料" : "还没有资料，点击上方按钮添加"}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? `编辑: ${editing.title}` : "新增资料"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSubmit}
              disabled={createKnowledge.isPending || updateKnowledge.isPending}>
              {createKnowledge.isPending || updateKnowledge.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        }>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>标题 *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              required className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="资料标题" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>详细内容</label>
            <textarea value={form.detail} onChange={(e) => setForm({ ...form, detail: e.target.value })}
              rows={4} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>来源 URL</label>
              <input type="url" value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
            <Select label="来源类型" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value })}
              options={SOURCE_TYPES.map((s) => ({ value: s, label: s }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>学科标签 (逗号分隔)</label>
            <input type="text" value={form.subject_tags} onChange={(e) => setForm({ ...form, subject_tags: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="例: 数学, WACE, 12年级" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="资料类型" value={form.item_type} onChange={(e) => setForm({ ...form, item_type: e.target.value })}
              options={ITEM_TYPES.map((t) => ({ value: t, label: t }))} />
            <Select label="复查周期" value={form.review_cycle} onChange={(e) => setForm({ ...form, review_cycle: e.target.value })}
              options={REVIEW_CYCLES.map((r) => ({ value: r, label: r }))} />
            <Select label="可见性" value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}
              options={VISIBILITIES.map((v) => ({ value: v, label: v }))} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>核实人</label>
            <input type="text" value={form.verified_by} onChange={(e) => setForm({ ...form, verified_by: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
        </form>
      </Modal>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 rounded" style={{ background: "var(--surface-soft)" }} />
          <div className="h-4 w-32 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="h-9 w-24 rounded-lg" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    </div>
  );
}
