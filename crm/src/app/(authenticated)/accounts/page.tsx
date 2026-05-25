"use client";

import { useState } from "react";
import { useAccountList, useCreateAccount, useUpdateAccount } from "@/hooks/useAccounts";
import { usePersonaList } from "@/hooks/usePersonas";
import { PLATFORMS, ACCOUNT_STAGES } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { formatNumber } from "@/lib/utils";
import type { Account } from "@/lib/types";

export default function AccountsPage() {
  const [platformFilter, setPlatformFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");

  const { data: accounts, isLoading } = useAccountList({
    platform: platformFilter || undefined,
    stage: stageFilter || undefined,
  });
  const { data: personas } = usePersonaList();
  const createAccount = useCreateAccount();
  const updateAccount = useUpdateAccount();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [form, setForm] = useState({
    account_name: "",
    platform: "",
    persona_id: "",
    operator_name: "",
    stage: "养号",
    follower_count: 0,
    total_posts: 0,
    total_leads: 0,
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      account_name: "", platform: "", persona_id: "", operator_name: "",
      stage: "养号", follower_count: 0, total_posts: 0, total_leads: 0,
    });
    setShowModal(true);
  };

  const openEdit = (a: Account) => {
    setEditing(a);
    setForm({
      account_name: a.account_name, platform: a.platform,
      persona_id: a.persona_id || "", operator_name: a.operator_name || "",
      stage: a.stage, follower_count: a.follower_count,
      total_posts: a.total_posts, total_leads: a.total_leads,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.account_name.trim() || !form.platform) return;
    const payload = {
      account_name: form.account_name.trim(),
      platform: form.platform,
      persona_id: form.persona_id || null,
      operator_name: form.operator_name || null,
      stage: form.stage,
      follower_count: form.follower_count,
      total_posts: form.total_posts,
      total_leads: form.total_leads,
    };
    if (editing) {
      await updateAccount.mutateAsync({ id: editing.id, ...payload });
    } else {
      await createAccount.mutateAsync(payload);
    }
    setShowModal(false);
  };

  const getPlatformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);
  const stageColor = (stage: string): "info" | "warning" | "success" | "default" => {
    switch (stage) {
      case "养号": return "info";
      case "增长号": return "warning";
      case "转化号": return "success";
      default: return "default";
    }
  };

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>账号矩阵</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>管理所有平台账号及运营状态</p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ 新建账号</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <Select label="" value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)}
          options={[{ value: "", label: "全部平台" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
        <Select label="" value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}
          options={[{ value: "", label: "全部阶段" }, ...ACCOUNT_STAGES.map((s) => ({ value: s, label: s }))]} />
      </div>

      {/* Table */}
      {accounts && accounts.length > 0 ? (
        <div className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["平台", "账号名", "IP角色", "运营人", "阶段", "粉丝", "发布", "线索"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => {
                const platform = getPlatformInfo(account.platform);
                return (
                  <tr key={account.id} className="cursor-pointer transition-colors"
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onClick={() => openEdit(account)}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <td className="px-4 py-3 text-sm">{platform ? `${platform.icon} ${platform.label}` : account.platform}</td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "var(--ink)" }}>{account.account_name}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{account.persona?.name || "-"}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--muted)" }}>{account.operator_name || "-"}</td>
                    <td className="px-4 py-3"><Badge variant={stageColor(account.stage)}>{account.stage}</Badge></td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--ink)" }}>{formatNumber(account.follower_count)}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--ink)" }}>{account.total_posts}</td>
                    <td className="px-4 py-3 text-sm" style={{ color: "var(--brand)" }}>{account.total_leads}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">📱</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>还没有账号，点击上方按钮创建第一个</p>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? `编辑账号: ${editing.account_name}` : "新建账号"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
            <Button variant="primary" onClick={handleSubmit}
              disabled={createAccount.isPending || updateAccount.isPending}>
              {createAccount.isPending || updateAccount.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        }>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>账号名称 *</label>
            <input type="text" value={form.account_name}
              onChange={(e) => setForm({ ...form, account_name: e.target.value })} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="例: BCI留学日记" />
          </div>
          <Select label="平台 *" value={form.platform}
            onChange={(e) => setForm({ ...form, platform: e.target.value })}
            options={[{ value: "", label: "选择平台" }, ...PLATFORMS.map((p) => ({ value: p.id, label: `${p.icon} ${p.label}` }))]} />
          <Select label="IP 角色" value={form.persona_id}
            onChange={(e) => setForm({ ...form, persona_id: e.target.value })}
            options={[{ value: "", label: "选择 IP" }, ...(personas?.map((p) => ({ value: p.id, label: p.name })) || [])]} />
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>运营人</label>
            <input type="text" value={form.operator_name}
              onChange={(e) => setForm({ ...form, operator_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
          </div>
          <Select label="账号阶段" value={form.stage}
            onChange={(e) => setForm({ ...form, stage: e.target.value })}
            options={ACCOUNT_STAGES.map((s) => ({ value: s, label: s }))} />
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "粉丝数", key: "follower_count" as const },
              { label: "发布数", key: "total_posts" as const },
              { label: "线索数", key: "total_leads" as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>{label}</label>
                <input type="number" min={0} value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
              </div>
            ))}
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
      <div className="h-64 rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
