"use client";

import { useState } from "react";
import { useKnowledgeList, useCreateKnowledge, useUpdateKnowledge } from "@/hooks/useKnowledge";
import { usePromptList, useCreatePrompt, useUpdatePrompt, useIncrementPromptUsage } from "@/hooks/usePrompts";
import { usePersonaList } from "@/hooks/usePersonas";
import { PLATFORMS } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { relativeTime } from "@/lib/utils";
import type { KnowledgeItem, AiPrompt } from "@/lib/types";

const ITEM_TYPES = ["资料", "数据", "案例", "政策"];
const VISIBILITIES = ["内部", "公开", "仅管理"];
const SOURCE_TYPES = ["人工整理", "官方数据", "新闻报道", "研究报告"];
const REVIEW_CYCLES = ["每月", "每季", "每半年", "每年"];
const PROMPT_CATEGORIES = ["内容创作", "标题优化", "SEO优化", "评论互动", "私信话术", "数据分析", "其他"];

type TabKey = "knowledge" | "prompts";

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState<TabKey>("knowledge");

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>知识与 AI</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>管理参考资料和 AI Prompt 模板</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-1 mb-5 p-1 rounded-lg" style={{ background: "var(--surface-soft)", display: "inline-flex" }}>
        <TabButton active={activeTab === "knowledge"} onClick={() => setActiveTab("knowledge")} icon="📚" label="知识库" />
        <TabButton active={activeTab === "prompts"} onClick={() => setActiveTab("prompts")} icon="🤖" label="Prompt 模板" />
      </div>

      {activeTab === "knowledge" ? <KnowledgeTab /> : <PromptsTab />}
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: string; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-all"
      style={{
        background: active ? "var(--surface)" : "transparent",
        color: active ? "var(--ink)" : "var(--muted)",
        border: "none",
        cursor: "pointer",
        boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// ═══════════════════════════════════════
// Knowledge Tab
// ═══════════════════════════════════════

function KnowledgeTab() {
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
    } catch {
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

  if (isLoading) return <TabSkeleton rows={5} />;

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-3 flex-1">
          <Select label="" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
            options={[{ value: "", label: "全部类型" }, ...ITEM_TYPES.map((t) => ({ value: t, label: t }))]} />
          <Select label="" value={visFilter} onChange={(e) => setVisFilter(e.target.value)}
            options={[{ value: "", label: "全部可见性" }, ...VISIBILITIES.map((v) => ({ value: v, label: v }))]} />
          <div className="flex-1 min-w-[180px]">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索资料标题..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
        </div>
        <Button variant="primary" onClick={openCreate} className="ml-3 shrink-0">+ 新增资料</Button>
      </div>

      {/* Summary */}
      <div className="flex gap-3 mb-4">
        <MiniStat label="总资料" value={items?.length || 0} color="var(--brand)" />
        <MiniStat label="公开" value={items?.filter((i) => i.visibility === "公开").length || 0} color="var(--green)" />
        <MiniStat label="内部" value={items?.filter((i) => i.visibility === "内部").length || 0} color="var(--blue)" />
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
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{ background: "var(--surface-soft)" }}>
                {item.item_type === "数据" ? "📊" : item.item_type === "案例" ? "📋" : item.item_type === "政策" ? "📜" : "📄"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate" style={{ color: "var(--ink)" }}>{item.title}</div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {item.subject_tags?.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>{tag}</span>
                  ))}
                </div>
              </div>
              <Badge variant="outline">{item.item_type}</Badge>
              <Badge variant={visBadge(item.visibility)}>{item.visibility}</Badge>
              <div className="text-xs text-center shrink-0" style={{ color: "var(--muted)", width: "50px" }}>
                <div style={{ color: "var(--brand)", fontWeight: 600 }}>{item.used_count}</div>
                <div>引用</div>
              </div>
              <div className="text-xs shrink-0" style={{ color: "var(--muted)" }}>{item.review_cycle}</div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState icon="📚" message={search || typeFilter || visFilter ? "没有匹配的资料" : "还没有资料，点击上方按钮添加"} />
      )}

      {/* Knowledge Modal */}
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
    </>
  );
}

// ═══════════════════════════════════════
// Prompts Tab
// ═══════════════════════════════════════

function PromptsTab() {
  const [catFilter, setCatFilter] = useState("");
  const [platFilter, setPlatFilter] = useState("");
  const [search, setSearch] = useState("");

  const { data: prompts, isLoading } = usePromptList({
    category: catFilter || undefined,
    platform: platFilter || undefined,
  });
  const { data: personas } = usePersonaList();
  const createPrompt = useCreatePrompt();
  const updatePrompt = useUpdatePrompt();
  const incrementUsage = useIncrementPromptUsage();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AiPrompt | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AiPrompt | null>(null);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    name: "", category: "内容创作", persona_id: "",
    target_platform: "", prompt_text: "",
  });

  const filtered = prompts?.filter((p) =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.prompt_text.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", category: "内容创作", persona_id: "", target_platform: "", prompt_text: "" });
    setShowModal(true);
  };

  const openEdit = (prompt: AiPrompt) => {
    setEditing(prompt);
    setForm({
      name: prompt.name, category: prompt.category || "内容创作",
      persona_id: prompt.persona_id || "", target_platform: prompt.target_platform || "",
      prompt_text: prompt.prompt_text,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.prompt_text.trim()) return;
    const payload = {
      name: form.name.trim(),
      category: form.category || null,
      persona_id: form.persona_id || null,
      target_platform: form.target_platform || null,
      prompt_text: form.prompt_text.trim(),
    };
    try {
      if (editing) {
        await updatePrompt.mutateAsync({ id: editing.id, ...payload });
      } else {
        await createPrompt.mutateAsync({ ...payload, use_count: 0, last_used_at: null });
      }
      setShowModal(false);
    } catch {
      alert("保存失败，请重试");
    }
  };

  const handleUsePrompt = (prompt: AiPrompt) => {
    setSelectedPrompt(prompt);
    setShowGenerator(true);
    incrementUsage.mutate(prompt.id);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert("复制失败，请手动复制");
    }
  };

  const getPlatformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);

  if (isLoading) return <TabSkeleton rows={6} grid />;

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-3 flex-1">
          <Select label="" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
            options={[{ value: "", label: "全部分类" }, ...PROMPT_CATEGORIES.map((c) => ({ value: c, label: c }))]} />
          <Select label="" value={platFilter} onChange={(e) => setPlatFilter(e.target.value)}
            options={[{ value: "", label: "全部平台" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
          <div className="flex-1 min-w-[180px]">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索 Prompt..."
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
        </div>
        <Button variant="primary" onClick={openCreate} className="ml-3 shrink-0">+ 新建 Prompt</Button>
      </div>

      {/* Summary */}
      <div className="flex gap-3 mb-4">
        <MiniStat label="总模板" value={prompts?.length || 0} color="var(--brand)" />
        <MiniStat label="总使用" value={prompts?.reduce((sum, p) => sum + p.use_count, 0) || 0} color="var(--green)" />
      </div>

      {/* Prompt Grid */}
      {filtered && filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((prompt) => {
            const platform = prompt.target_platform ? getPlatformInfo(prompt.target_platform) : null;
            return (
              <div key={prompt.id}
                className="rounded-xl p-4 cursor-pointer transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                onClick={() => openEdit(prompt)}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "none"; }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold m-0 line-clamp-1" style={{ color: "var(--ink)" }}>{prompt.name}</h3>
                  {prompt.category && <Badge variant="outline">{prompt.category}</Badge>}
                </div>
                <p className="text-xs line-clamp-3 mb-3" style={{ color: "var(--muted)", lineHeight: "1.5" }}>
                  {prompt.prompt_text}
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {platform && <Badge variant="outline">{platform.icon} {platform.label}</Badge>}
                  {prompt.persona && <Badge variant="info">{prompt.persona.name}</Badge>}
                </div>
                <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--brand)" }}>使用 {prompt.use_count} 次</span>
                    {prompt.last_used_at && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>· {relativeTime(prompt.last_used_at)}</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleUsePrompt(prompt); }}>使用</Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState icon="🤖" message={search || catFilter || platFilter ? "没有匹配的 Prompt 模板" : "还没有 Prompt 模板，点击上方按钮创建"} />
      )}

      {/* Prompt Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? `编辑 Prompt: ${editing.name}` : "新建 Prompt"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSubmit}
              disabled={createPrompt.isPending || updatePrompt.isPending}>
              {createPrompt.isPending || updatePrompt.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        }>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>模板名称 *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              required className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="例: 小红书WACE科普文" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="分类" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={PROMPT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <Select label="目标平台" value={form.target_platform} onChange={(e) => setForm({ ...form, target_platform: e.target.value })}
              options={[{ value: "", label: "通用" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
            <Select label="绑定 IP" value={form.persona_id} onChange={(e) => setForm({ ...form, persona_id: e.target.value })}
              options={[{ value: "", label: "不绑定" }, ...(personas?.map((p) => ({ value: p.id, label: p.name })) || [])]} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>Prompt 内容 *</label>
            <textarea value={form.prompt_text} onChange={(e) => setForm({ ...form, prompt_text: e.target.value })}
              rows={8} required className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none font-mono"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="输入 Prompt 模板内容..." />
          </div>
        </form>
      </Modal>

      {/* Generator / Use Modal */}
      <Modal isOpen={showGenerator} onClose={() => setShowGenerator(false)}
        title={`使用 Prompt: ${selectedPrompt?.name || ""}`}
        width="700px"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowGenerator(false)}>关闭</Button>
            <Button variant="primary" onClick={() => selectedPrompt && copyToClipboard(selectedPrompt.prompt_text)}>
              {copied ? "✅ 已复制" : "📋 复制 Prompt"}
            </Button>
          </div>
        }>
        {selectedPrompt && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {selectedPrompt.category && <Badge variant="outline">{selectedPrompt.category}</Badge>}
              {selectedPrompt.target_platform && (
                <Badge variant="outline">
                  {getPlatformInfo(selectedPrompt.target_platform)?.icon} {getPlatformInfo(selectedPrompt.target_platform)?.label}
                </Badge>
              )}
              {selectedPrompt.persona && <Badge variant="info">{selectedPrompt.persona.name}</Badge>}
              <Badge variant="default">使用 {selectedPrompt.use_count + 1} 次</Badge>
            </div>
            <div className="rounded-lg p-4 font-mono text-sm whitespace-pre-wrap"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)", lineHeight: "1.6" }}>
              {selectedPrompt.prompt_text}
            </div>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              点击"复制 Prompt"后粘贴到 AI 工具中使用。
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}

// ═══════════════════════════════════════
// Shared UI Components
// ═══════════════════════════════════════

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
      style={{ background: `color-mix(in srgb, ${color} 8%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 15%, transparent)` }}>
      <span className="text-sm font-bold" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: "var(--muted)" }}>{label}</span>
    </div>
  );
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-sm" style={{ color: "var(--muted)" }}>{message}</p>
    </div>
  );
}

function TabSkeleton({ rows, grid }: { rows: number; grid?: boolean }) {
  return (
    <div className="animate-pulse">
      <div className="flex gap-3 mb-4">
        {[1, 2, 3].map((i) => <div key={i} className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-soft)" }} />)}
      </div>
      {grid ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {Array.from({ length: rows }, (_, i) => (
            <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface-soft)" }} />
          ))}
        </div>
      )}
    </div>
  );
}
