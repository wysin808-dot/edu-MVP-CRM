"use client";

import { useState, useRef, useMemo } from "react";
import { useCrmLeadList, useCreateCrmLead, useUpdateCrmLead, useMoveCrmLead } from "@/hooks/useCrmLeads";
import { usePersonaList } from "@/hooks/usePersonas";
import { useAccountList } from "@/hooks/useAccounts";
import { CRM_STAGES } from "@/lib/constants";
import { usePlatforms } from "@/hooks/usePlatforms";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { relativeTime, localDateStr } from "@/lib/utils";
import type { CrmLead } from "@/lib/types";

const INTEREST_PROGRAMS = ["WACE", "A-Level", "IB", "VCE", "预科", "其他"];

const STAGE_CONFIG: Record<string, { color: string; icon: string }> = {
  "新线索":   { color: "#3b82f6", icon: "🔵" },
  "已咨询":   { color: "#e87a2e", icon: "🟠" },
  "预约到访": { color: "#f59e0b", icon: "🟡" },
  "已缴费":   { color: "#10b981", icon: "🟢" },
  "已流失":   { color: "#ef4444", icon: "🔴" },
};

export default function CrmPage() {
  const PLATFORMS = usePlatforms().data ?? [];
  const { data: leads, isLoading } = useCrmLeadList();
  const { data: personas } = usePersonaList();
  const { data: accounts } = useAccountList();
  const createLead = useCreateCrmLead();
  const updateLead = useUpdateCrmLead();
  const moveLead = useMoveCrmLead();

  const personaMap = useMemo(() => new Map((personas || []).map((p) => [p.id, p.name])), [personas]);
  const accountMap = useMemo(() => new Map((accounts || []).map((a) => [a.id, a.account_name])), [accounts]);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<CrmLead | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const dragItem = useRef<string | null>(null);

  const [form, setForm] = useState({
    name: "", phone: "", child_name: "", child_grade: "",
    source_platform: "", source_persona_id: "", source_account_id: "",
    interest_program: "", assigned_to: "",
    notes: "", next_followup: "", stage: "新线索",
  });

  // Stage counts
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CRM_STAGES.forEach((s) => { counts[s] = 0; });
    (leads || []).forEach((l) => { counts[l.stage] = (counts[l.stage] || 0) + 1; });
    return counts;
  }, [leads]);

  // Filtered leads
  const filteredLeads = useMemo(() => {
    if (!leads) return [];
    if (!searchQuery.trim()) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter((l) =>
      l.name.toLowerCase().includes(q) ||
      (l.child_name && l.child_name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q)) ||
      (l.interest_program && l.interest_program.toLowerCase().includes(q)) ||
      (l.assigned_to && l.assigned_to.toLowerCase().includes(q))
    );
  }, [leads, searchQuery]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "", phone: "", child_name: "", child_grade: "",
      source_platform: "", source_persona_id: "", source_account_id: "",
      interest_program: "", assigned_to: "",
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
      source_persona_id: lead.source_persona_id || "",
      source_account_id: lead.source_account_id || "",
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
      source_persona_id: form.source_persona_id || null,
      source_account_id: form.source_account_id || null,
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
    } catch {
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
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverStage(null);
    }
  };

  const handleDrop = async (stage: string) => {
    setDragOverStage(null);
    if (dragItem.current) {
      try {
        await moveLead.mutateAsync({ id: dragItem.current, newStage: stage });
      } catch {
        alert("移动失败，请重试");
      }
      dragItem.current = null;
    }
  };

  const getLeadsByStage = (stage: string) =>
    filteredLeads.filter((l) => l.stage === stage);

  const isOverdue = (lead: CrmLead) => {
    if (!lead.next_followup) return false;
    const today = localDateStr(new Date());
    return lead.next_followup < today;
  };

  const isToday = (lead: CrmLead) => {
    if (!lead.next_followup) return false;
    return lead.next_followup === localDateStr(new Date());
  };

  if (isLoading) return <PageSkeleton />;

  // Overdue count for alert
  const overdueCount = (leads || []).filter(isOverdue).length;
  const todayCount = (leads || []).filter(isToday).length;

  return (
    <div className="max-w-full mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>招生 CRM</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            共 {leads?.length || 0} 条线索
            {overdueCount > 0 && (
              <span style={{ color: "var(--red)", fontWeight: 500 }}> · {overdueCount} 条逾期</span>
            )}
            {todayCount > 0 && (
              <span style={{ color: "var(--blue)", fontWeight: 500 }}> · {todayCount} 条今日跟进</span>
            )}
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ 新增线索</Button>
      </div>

      {/* Stage Summary Pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {CRM_STAGES.map((stage) => {
          const cfg = STAGE_CONFIG[stage];
          return (
            <div
              key={stage}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm"
              style={{
                background: `color-mix(in srgb, ${cfg.color} 10%, transparent)`,
                border: `1px solid color-mix(in srgb, ${cfg.color} 25%, transparent)`,
              }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
              <span style={{ color: cfg.color, fontWeight: 600 }}>{stageCounts[stage]}</span>
              <span className="text-xs" style={{ color: "var(--muted)" }}>{stage}</span>
            </div>
          );
        })}
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索姓名、电话、课程、负责人..."
            className="w-full px-3 py-2 pl-9 rounded-lg text-sm outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--ink)",
            }}
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: "var(--muted)" }}>🔍</span>
        </div>
        <div
          className="flex rounded-lg overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <button
            onClick={() => setViewMode("kanban")}
            className="px-3 py-2 text-xs font-medium transition-colors"
            style={{
              background: viewMode === "kanban" ? "var(--brand)" : "var(--surface)",
              color: viewMode === "kanban" ? "#fff" : "var(--muted)",
              border: "none",
              cursor: "pointer",
            }}
          >
            看板
          </button>
          <button
            onClick={() => setViewMode("list")}
            className="px-3 py-2 text-xs font-medium transition-colors"
            style={{
              background: viewMode === "list" ? "var(--brand)" : "var(--surface)",
              color: viewMode === "list" ? "#fff" : "var(--muted)",
              border: "none",
              borderLeft: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            列表
          </button>
        </div>
      </div>

      {/* View: Kanban */}
      {viewMode === "kanban" && (
        <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 320px)" }}>
          {CRM_STAGES.map((stage) => {
            const stageLeads = getLeadsByStage(stage);
            const cfg = STAGE_CONFIG[stage];
            return (
              <div
                key={stage}
                className="flex-1 rounded-xl flex flex-col"
                style={{
                  minWidth: "220px",
                  maxWidth: "320px",
                  background: dragOverStage === stage ? "var(--surface)" : "var(--surface-soft)",
                  border: dragOverStage === stage ? `2px dashed ${cfg.color}` : "1px solid var(--border)",
                  transition: "all 0.15s",
                }}
                onDragOver={(e) => handleDragOver(e, stage)}
                onDragLeave={(e) => handleDragLeave(e)}
                onDrop={() => handleDrop(stage)}
              >
                {/* Column Header */}
                <div
                  className="flex items-center justify-between px-3 py-2.5"
                  style={{ borderBottom: `2px solid ${cfg.color}` }}
                >
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                    <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{stage}</span>
                  </div>
                  <span
                    className="text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold"
                    style={{ background: `color-mix(in srgb, ${cfg.color} 15%, transparent)`, color: cfg.color }}
                  >
                    {stageLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
                  {stageLeads.length > 0 ? stageLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      isOverdue={isOverdue(lead)}
                      isToday={isToday(lead)}
                      onDragStart={() => handleDragStart(lead.id)}
                      onClick={() => openEdit(lead)}
                      personaName={lead.source_persona_id ? personaMap.get(lead.source_persona_id) : undefined}
                      accountName={lead.source_account_id ? accountMap.get(lead.source_account_id) : undefined}
                    />
                  )) : (
                    <div className="flex-1 flex items-center justify-center py-8">
                      <p className="text-xs" style={{ color: "var(--muted)" }}>暂无线索</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View: List */}
      {viewMode === "list" && (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["姓名", "孩子", "来源", "课程", "阶段", "负责人", "下次跟进", "创建时间"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "var(--muted)", background: "var(--surface-soft)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredLeads.length > 0 ? filteredLeads.map((lead) => {
                const cfg = STAGE_CONFIG[lead.stage];
                const overdue = isOverdue(lead);
                const today = isToday(lead);
                return (
                  <tr
                    key={lead.id}
                    className="cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onClick={() => openEdit(lead)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>{lead.name}</span>
                      {lead.phone && <span className="text-xs ml-2" style={{ color: "var(--muted)" }}>{lead.phone}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                      {[lead.child_name, lead.child_grade].filter(Boolean).join(" · ") || "–"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                      <div>{lead.source_platform || "–"}</div>
                      {(lead.source_persona_id || lead.source_account_id) && (
                        <div className="text-[11px] mt-0.5">
                          {lead.source_persona_id && <span>👤 {personaMap.get(lead.source_persona_id) || "?"}</span>}
                          {lead.source_account_id && <span> 📱 {accountMap.get(lead.source_account_id) || "?"}</span>}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {lead.interest_program ? <Badge variant="outline">{lead.interest_program}</Badge> : <span className="text-xs" style={{ color: "var(--muted)" }}>–</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `color-mix(in srgb, ${cfg.color} 15%, transparent)`, color: cfg.color }}
                      >
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                      {lead.assigned_to || "未分配"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: overdue ? "var(--red)" : today ? "var(--blue)" : "var(--muted)" }}>
                      {overdue && "⚠️ "}
                      {today && "📌 "}
                      {lead.next_followup || "未设置"}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "var(--muted)" }}>
                      {relativeTime(lead.created_at)}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm" style={{ color: "var(--muted)" }}>
                    {searchQuery ? "未找到匹配线索" : "暂无线索，点击右上角新增"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

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
            <Select label="来源 IP（人设）" value={form.source_persona_id}
              onChange={(e) => setForm({ ...form, source_persona_id: e.target.value, source_account_id: "" })}
              options={[{ value: "", label: "选择 IP" }, ...(personas || []).map((p) => ({ value: p.id, label: p.name }))]} />
            <Select label="来源账号" value={form.source_account_id}
              onChange={(e) => {
                const acc = (accounts || []).find((a) => a.id === e.target.value);
                setForm({ ...form, source_account_id: e.target.value, source_persona_id: form.source_persona_id || acc?.persona_id || "" });
              }}
              options={[{ value: "", label: "选择账号" }, ...(accounts || [])
                .filter((a) => !form.source_persona_id || a.persona_id === form.source_persona_id)
                .map((a) => ({ value: a.id, label: `${a.account_name}${a.platform ? ` · ${a.platform}` : ""}` }))]} />
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

// ── Lead Card Component ──

function LeadCard({
  lead,
  isOverdue,
  isToday,
  onDragStart,
  onClick,
  personaName,
  accountName,
}: {
  lead: CrmLead;
  isOverdue: boolean;
  isToday: boolean;
  onDragStart: () => void;
  onClick: () => void;
  personaName?: string;
  accountName?: string;
}) {
  const borderColor = isOverdue ? "var(--red)" : isToday ? "var(--blue)" : "var(--border)";

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="rounded-lg p-3 cursor-pointer transition-all"
      style={{
        background: "var(--surface)",
        border: `1px solid ${borderColor}`,
        borderLeft: isOverdue ? "3px solid var(--red)" : isToday ? "3px solid var(--blue)" : `1px solid ${borderColor}`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Name + Program */}
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold truncate" style={{ color: "var(--ink)" }}>{lead.name}</span>
        {lead.interest_program && (
          <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0 ml-1"
            style={{ background: "rgba(232,122,46,0.1)", color: "var(--brand)" }}>
            {lead.interest_program}
          </span>
        )}
      </div>

      {/* Child info */}
      {(lead.child_name || lead.child_grade) && (
        <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
          👤 {[lead.child_name, lead.child_grade].filter(Boolean).join(" · ")}
        </div>
      )}

      {/* Source */}
      {(lead.source_platform || personaName || accountName) && (
        <div className="text-xs mb-1" style={{ color: "var(--muted)" }}>
          {lead.source_platform && <span>📱 {lead.source_platform}</span>}
          {personaName && <span>{lead.source_platform ? " · " : ""}👤 {personaName}</span>}
          {accountName && <span> @{accountName}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid var(--border)" }}>
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {lead.assigned_to || "未分配"}
        </span>
        {lead.next_followup ? (
          <span className="text-xs font-medium" style={{ color: isOverdue ? "var(--red)" : isToday ? "var(--blue)" : "var(--muted)" }}>
            {isOverdue ? "⚠️ " : isToday ? "📌 " : "📅 "}
            {lead.next_followup}
          </span>
        ) : (
          <span className="text-xs" style={{ color: "var(--muted)", opacity: 0.5 }}>未设跟进</span>
        )}
      </div>
    </div>
  );
}

// ── Skeleton ──

function PageSkeleton() {
  return (
    <div className="max-w-full mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="h-6 w-24 rounded" style={{ background: "var(--surface-soft)" }} />
          <div className="h-4 w-48 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="h-9 w-28 rounded-lg" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-8 w-24 rounded-full" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
      <div className="h-10 rounded-lg mb-4" style={{ background: "var(--surface-soft)" }} />
      <div className="flex gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-1 h-80 rounded-xl" style={{ background: "var(--surface-soft)", minWidth: "220px" }} />
        ))}
      </div>
    </div>
  );
}
