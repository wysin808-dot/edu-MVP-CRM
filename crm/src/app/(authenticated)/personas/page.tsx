"use client";

import { useState } from "react";
import { usePersonaList, useCreatePersona, useUpdatePersona } from "@/hooks/usePersonas";
import { PLATFORMS } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Persona } from "@/lib/types";

export default function PersonasPage() {
  const { data: personas, isLoading } = usePersonaList();
  const createPersona = useCreatePersona();
  const updatePersona = useUpdatePersona();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Persona | null>(null);

  // Form state
  const [form, setForm] = useState({
    name: "",
    role_title: "",
    tone: "",
    platforms: [] as string[],
    monthly_target: 0,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", role_title: "", tone: "", platforms: [], monthly_target: 0 });
    setShowModal(true);
  };

  const openEdit = (p: Persona) => {
    setEditing(p);
    setForm({
      name: p.name,
      role_title: p.role_title || "",
      tone: p.tone || "",
      platforms: p.platforms || [],
      monthly_target: p.monthly_target,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload = {
      name: form.name.trim(),
      role_title: form.role_title || null,
      tone: form.tone || null,
      platforms: form.platforms,
      monthly_target: form.monthly_target,
    };

    try {
      if (editing) {
        await updatePersona.mutateAsync({ id: editing.id, ...payload });
      } else {
        await createPersona.mutateAsync({ ...payload, avatar_url: null });
      }
      setShowModal(false);
    } catch {
      alert("保存失败，请重试");
    }
  };

  const togglePlatform = (platformId: string) => {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>
            IP 矩阵
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            管理内容 IP 角色定位与渠道分配
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          + 新建 IP
        </Button>
      </div>

      {/* Personas Grid */}
      {personas && personas.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <div
              key={persona.id}
              className="rounded-xl p-5 cursor-pointer transition-all"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
              }}
              onClick={() => openEdit(persona)}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "none";
              }}
            >
              {/* Avatar + Name */}
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: "var(--brand)" }}
                >
                  {persona.name.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold" style={{ color: "var(--ink)" }}>
                    {persona.name}
                  </div>
                  {persona.role_title && (
                    <div className="text-xs" style={{ color: "var(--muted)" }}>
                      {persona.role_title}
                    </div>
                  )}
                </div>
              </div>

              {/* Tone */}
              {persona.tone && (
                <div className="text-xs mb-3" style={{ color: "var(--muted)" }}>
                  风格: {persona.tone}
                </div>
              )}

              {/* Platforms */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {persona.platforms?.map((pid) => {
                  const platform = PLATFORMS.find((p) => p.id === pid);
                  return (
                    <Badge key={pid} variant="outline">
                      {platform ? `${platform.icon} ${platform.label}` : pid}
                    </Badge>
                  );
                })}
                {(!persona.platforms || persona.platforms.length === 0) && (
                  <span className="text-xs" style={{ color: "var(--muted)" }}>
                    未设置渠道
                  </span>
                )}
              </div>

              {/* Monthly Target */}
              <div
                className="flex items-center justify-between pt-3"
                style={{ borderTop: "1px solid var(--border)" }}
              >
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  月度目标
                </span>
                <span className="text-sm font-semibold" style={{ color: "var(--brand)" }}>
                  {persona.monthly_target} 篇
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="text-4xl mb-3">👤</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            还没有 IP 角色，点击上方按钮创建第一个
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? `编辑 IP: ${editing.name}` : "新建 IP 角色"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              取消
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={createPersona.isPending || updatePersona.isPending}
            >
              {createPersona.isPending || updatePersona.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>
              IP 名称 *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
              placeholder="例: 海外教育博主"
            />
          </div>

          {/* Role Title */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>
              角色定位
            </label>
            <input
              type="text"
              value={form.role_title}
              onChange={(e) => setForm({ ...form, role_title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
              placeholder="例: WACE课程资深导师"
            />
          </div>

          {/* Tone */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>
              内容风格
            </label>
            <input
              type="text"
              value={form.tone}
              onChange={(e) => setForm({ ...form, tone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
              placeholder="例: 专业+亲切"
            />
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>
              活跃渠道
            </label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  className="px-3 py-1.5 rounded-lg text-xs cursor-pointer transition-all border-none"
                  style={{
                    background: form.platforms.includes(platform.id)
                      ? "var(--brand)"
                      : "var(--surface-soft)",
                    color: form.platforms.includes(platform.id)
                      ? "white"
                      : "var(--ink)",
                    border: `1px solid ${form.platforms.includes(platform.id) ? "var(--brand)" : "var(--border)"}`,
                  }}
                  onClick={() => togglePlatform(platform.id)}
                >
                  {platform.icon} {platform.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monthly Target */}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>
              月度产出目标 (篇)
            </label>
            <input
              type="number"
              min={0}
              value={form.monthly_target}
              onChange={(e) =>
                setForm({ ...form, monthly_target: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
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
          <div className="h-4 w-48 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="h-9 w-24 rounded-lg" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    </div>
  );
}
