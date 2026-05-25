"use client";

import { useState } from "react";
import { usePromptList, useCreatePrompt, useUpdatePrompt, useIncrementPromptUsage } from "@/hooks/usePrompts";
import { usePersonaList } from "@/hooks/usePersonas";
import { PLATFORMS } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { relativeTime } from "@/lib/utils";
import type { AiPrompt } from "@/lib/types";

const PROMPT_CATEGORIES = ["内容创作", "标题优化", "SEO优化", "评论互动", "私信话术", "数据分析", "其他"];

export default function AiPage() {
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
    if (editing) {
      await updatePrompt.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createPrompt.mutateAsync({ ...payload, use_count: 0, last_used_at: null });
    }
    setShowModal(false);
  };

  const handleUsePrompt = (prompt: AiPrompt) => {
    setSelectedPrompt(prompt);
    setShowGenerator(true);
    incrementUsage.mutate(prompt.id);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getPlatformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>AI 内容库</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            共 {filtered?.length || 0} 个 Prompt 模板
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ 新建 Prompt</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <Select label="" value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          options={[{ value: "", label: "全部分类" }, ...PROMPT_CATEGORIES.map((c) => ({ value: c, label: c }))]} />
        <Select label="" value={platFilter} onChange={(e) => setPlatFilter(e.target.value)}
          options={[{ value: "", label: "全部平台" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
        <div className="flex-1 min-w-[200px]">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍 搜索 Prompt..."
            className="w-full px-3 py-2 rounded-lg text-sm outline-none"
            style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
        </div>
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
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-sm font-semibold m-0 line-clamp-1" style={{ color: "var(--ink)" }}>
                    {prompt.name}
                  </h3>
                  {prompt.category && <Badge variant="outline">{prompt.category}</Badge>}
                </div>

                {/* Prompt Preview */}
                <p className="text-xs line-clamp-3 mb-3" style={{ color: "var(--muted)", lineHeight: "1.5" }}>
                  {prompt.prompt_text}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {platform && (
                    <Badge variant="outline">{platform.icon} {platform.label}</Badge>
                  )}
                  {prompt.persona && (
                    <Badge variant="info">{prompt.persona.name}</Badge>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs" style={{ color: "var(--brand)" }}>使用 {prompt.use_count} 次</span>
                    {prompt.last_used_at && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        · {relativeTime(prompt.last_used_at)}
                      </span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleUsePrompt(prompt); }}>
                    使用
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {search || catFilter || platFilter ? "没有匹配的 Prompt 模板" : "还没有 Prompt 模板，点击上方按钮创建第一个"}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
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
            <Select label="分类" value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={PROMPT_CATEGORIES.map((c) => ({ value: c, label: c }))} />
            <Select label="目标平台" value={form.target_platform}
              onChange={(e) => setForm({ ...form, target_platform: e.target.value })}
              options={[{ value: "", label: "通用" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
            <Select label="绑定 IP" value={form.persona_id}
              onChange={(e) => setForm({ ...form, persona_id: e.target.value })}
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
              📋 复制 Prompt
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
        <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="flex gap-3 mb-5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-32 rounded-lg" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    </div>
  );
}
