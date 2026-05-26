"use client";

import { useState, useRef } from "react";
import { useCrmLeadList, useCreateCrmLead, useUpdateCrmLead, useMoveCrmLead } from "@/hooks/useCrmLeads";
import { CRM_STAGES, PLATFORMS } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { relativeTime, localDateStr } from "@/lib/utils";
import type { CrmLead } from "@/lib/types";

const INTEREST_PROGRAMS = ["WACE", "A-Level", "IB", "VCE", "预科", "其他"];

export default function CrmPage() {
  const { data: leads, isLoading } = useCrmLeadList();
  const createLead = useCreateCrmLead();
  const updateLead = useUpdateCrmLead();
  const moveLead = useMoveCrmLead();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CrmLead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const dragItem = useRef<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", child_name: "", child_grade: "",
    source_platform: "", interest_program: "", assigned_to: "",
    notes: "", next_followup: "", stage: "新线索",
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "", phone: "", child_name: "", child_grade: "",
      source_platform: "", interest_program: "", assigned_to: "",
      notes: "", next_followup: "", stage: "新线索",
    });
    setShowModal(true);
  };

  const openEdit = (lead: CrmLead) => {
    setEditing(lead);
    setForm({
      name: lead.name, phone: lead.phone || "",
      child_name: lead.child_name || "", child_grade: lead.child_grade || "",
      source_platform: lead.source_platform || "",
      interest_program: lead.interest_program || "",
      assigned_to: lead.assigned_to || "", notes: lead.notes || "",
      next_followup: lead.next_followup || "", stage: lead.stage,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    const payload = {
      name: form.name.trim(),
      phone: form.phone || null,
      child_name: form.child_name || null,
      child_grade: form.child_grade || null,
      source_platform: form.source_platform || null,
      interest_program: form.interest_program || null,
      assigned_to: form.assigned_to || null,
      notes: form.notes || null,
      next_followup: form.next_followup || null,
    };
    try {
      if (editing) {
        await updateLead.mutateAsync({ id: editing.id, ...payload, stage: form.stage });
      } else {
        await createLead.mutateAsync({ ...payload, stage: "新线索", source_content_id: null });
      }
      setShowModal(false);
    } catch (err) {
      alert("保存失败，请重试");
    }
  };

  const handleDragStart = (leadId: string) => {
    dragItem.current = leadId;
  };

  const handleDragOver = (e: React.DragEvent, stage: string) => {
    e.preventDefault();
    setDragOverStage(stage);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear highlight when leaving the column container itself,
    // not when hovering over child elements within the column
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (stage: string) => {
    setDragOverStage(null);
    if (dragItem.current) {
      try {
        await moveLead.mutateAsync({ id: dragItem.current, newStage: stage });
      } catch (err) {
        alert("移动失败，请重试");
      }
      dragItem.current = null;
    }
  };

  const getLeadsByStage = (stage: string) =>
    leads?.filter((l) => l.stage === stage) || [];

  const isOverdue = (lead: CrmLead) => {
    if (!lead.next_followup) return false;
    // Compare date strings directly to avoid timezone parsing issues
    const today = localDateStr(new Date());
    return lead.next_followup < today;
  };

  const stageColor = (stage: string) => {
    switch (stage) {
      case "新线索": return "var(--blue)";
      case "已咨询": return "var(--brand)";
      case "预约到访": return "var(--amber)";
      case "已缴费": return "var(--green)";
      case "已流失": return "var(--red)";
      default: return "var(--muted)";
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-full mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>招生 CRM</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            共 {leads?.length || 0} 条线索 · 拖拽卡片切换阶段
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ 新增线索</Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 220px)" }}>
        {CRM_STAGES.map((stage) => {
          const stageLeads = getLeadsByStage(stage);
          return (
            <div
              key={stage}
              className="min-w-[280px] flex-1 rounded-xl flex flex-col"
              style={{
                background: dragOverStage === stage ? "var(--surface)" : "var(--surface-soft)",
                border: dragOverStage === stage ? "2px dashed var(--brand)" : "1px solid var(--border)",
                transition: "all 0.15s",
              }}
              onDragOver={(e) => handleDragOver(e, stage)}
              onDragLeave={(e) => handleDragLeave(e)}
              onDrop={() => handleDrop(stage)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between p-4 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: stageColor(stage) }} />
                  <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{stage}</span>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "var(--surface)", color: "var(--muted)" }}
                >
                  {stageLeads.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 pt-0 flex flex-col gap-2">
                {stageLeads.length > 0 ? stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => handleDragStart(lead.id)}
                    onClick={() => openEdit(lead)}
                    className="rounded-lg p-3 cursor-pointer transition-all"
                    style={{
                      background: "var(--surface)",
                      border: isOverdue(lead) ? "1px solid var(--red)" : "1px solid var(--border)",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
                    onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
                  >
                    {/* Lead Name + Program */}
                    <div className="flex items-start justify-between mb-1.5">
                      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{lead.name}</span>
                      {lead.interest_program && (
                        <Badge variant="outline">{lead.interest_program}</Badge>
                      )}
                    </div>

                    {/* Child info */}
                    {(lead.child_name || lead.child_grade) && (
                      <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                        {[lead.child_name, lead.child_grade].filter(Boolean).join(" · ")}
                      </div>
                    )}

                    {/* Source */}
                    {lead.source_platform && (
                      <div className="text-xs mb-1.5" style={{ color: "var(--muted)" }}>
                        来源: {lead.source_platform}
                      </div>
                    )}

                    {/* Footer: assigned + followup */}
                    <div className="flex items-center justify-between pt-1.5" style={{ borderTop: "1px solid var(--border)" }}>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>
                        {lead.assigned_to || "未分配"}
                      </span>
                      {lead.next_followup && (
                        <span className="text-xs" style={{ color: isOverdue(lead) ? "var(--red)" : "var(--muted)" }}>
                          {isOverdue(lead) ? "⚠️ " : ""}
                          {lead.next_followup}
                        </span>
                      )}
                    </div>

                    {/* Time */}
                    <div className="text-xs mt-1" style={{ color: "var(--muted)", opacity: 0.6 }}>
                      {relativeTime(lead.created_at)}
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-xs" style={{ color: "var(--muted)" }}>暂无线索</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? `编辑线索: ${editing.name}` : "新增线索"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSubmit}
              disabled={createLead.isPending || updateLead.isPending}>
              {createLead.isPending || updateLead.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        }>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>家长姓名 *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                required className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
                placeholder="家长姓名" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>联系电话</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>孩子姓名</label>
              <input type="text" value={form.child_name} onChange={(e) => setForm({ ...form, child_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>年级</label>
              <input type="text" value={form.child_grade} onChange={(e) => setForm({ ...form, child_grade: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
                placeholder="例: 10年级" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="来源平台" value={form.source_platform}
              onChange={(e) => setForm({ ...form, source_platform: e.target.value })}
              options={[{ value: "", label: "选择平台" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
            <Select label="意向课程" value={form.interest_program}
              onChange={(e) => setForm({ ...form, interest_program: e.target.value })}
              options={[{ value: "", label: "选择课程" }, ...INTEREST_PROGRAMS.map((p) => ({ value: p, label: p }))]} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>负责人</label>
              <input type="text" value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>下次跟进</label>
              <input type="date" value={form.next_followup} onChange={(e) => setForm({ ...form, next_followup: e.target.value })}
                className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>备注</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3} className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
          {editing && (
            <Select label="线索阶段" value={form.stage}
              onChange={(e) => setForm({ ...form, stage: e.target.value })}
              options={CRM_STAGES.map((s) => ({ value: s, label: s }))} />
          )}
        </form>
      </Modal>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-full mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 rounded" style={{ background: "var(--surface-soft)" }} />
          <div className="h-4 w-48 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="flex gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="min-w-[280px] flex-1 h-96 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    </div>
  );
}
