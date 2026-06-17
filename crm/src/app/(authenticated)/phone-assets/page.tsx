"use client";

import { useState } from "react";
import {
  usePhoneNumberList,
  useCreatePhoneNumber,
  useUpdatePhoneNumber,
  useDeletePhoneNumber,
  useAddRecharge,
  useDeleteRecharge,
} from "@/hooks/usePhoneNumbers";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { PhoneNumber } from "@/lib/types";

const CARRIERS = ["移动", "联通", "电信", "广电", "其他"];
const STATUSES = ["在用", "停用", "已注销"];
const RECHARGE_CHANNELS = ["支付宝", "微信", "营业厅", "话费卡", "其他"];

const emptyForm = {
  phone: "",
  real_name: "",
  id_card: "",
  carrier: "",
  region: "",
  monthly_fee: 0,
  wechat_id: "",
  wechat_user: "",
  registered_accounts: "",
  status: "在用",
  notes: "",
};

function statusColor(s: string): "info" | "warning" | "success" | "default" {
  switch (s) {
    case "在用": return "success";
    case "停用": return "warning";
    case "已注销": return "default";
    default: return "default";
  }
}

function maskIdCard(id: string | null) {
  if (!id) return "-";
  if (id.length <= 6) return id;
  return id.slice(0, 4) + "****" + id.slice(-4);
}

export default function PhoneAssetsPage() {
  const { role } = useAuth();
  const canManage = role === "admin" || role === "lead";

  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const { data: rows, isLoading } = usePhoneNumberList({
    status: statusFilter || undefined,
    q: search.trim() || undefined,
  });

  const createPhone = useCreatePhoneNumber();
  const updatePhone = useUpdatePhoneNumber();
  const deletePhone = useDeletePhoneNumber();
  const addRecharge = useAddRecharge();
  const deleteRecharge = useDeleteRecharge();

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PhoneNumber | null>(null);
  const [form, setForm] = useState(emptyForm);

  // 充值表单
  const [rcAmount, setRcAmount] = useState("");
  const [rcDate, setRcDate] = useState("");
  const [rcChannel, setRcChannel] = useState("微信");
  const [rcNote, setRcNote] = useState("");

  if (!canManage) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>号码资产台账仅管理员和负责人可查看</p>
        </div>
      </div>
    );
  }

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    resetRecharge();
    setShowModal(true);
  };

  const openEdit = (p: PhoneNumber) => {
    setEditing(p);
    setForm({
      phone: p.phone, real_name: p.real_name || "", id_card: p.id_card || "",
      carrier: p.carrier || "", region: p.region || "",
      monthly_fee: p.monthly_fee || 0,
      wechat_id: p.wechat_id || "", wechat_user: p.wechat_user || "",
      registered_accounts: p.registered_accounts || "",
      status: p.status, notes: p.notes || "",
    });
    resetRecharge();
    setShowModal(true);
  };

  const resetRecharge = () => {
    setRcAmount(""); setRcDate(""); setRcChannel("微信"); setRcNote("");
  };

  const handleSubmit = async () => {
    if (!form.phone.trim()) { alert("请填写号码"); return; }
    const payload = {
      phone: form.phone.trim(),
      real_name: form.real_name.trim() || null,
      id_card: form.id_card.trim() || null,
      carrier: form.carrier || null,
      region: form.region.trim() || null,
      monthly_fee: Number(form.monthly_fee) || 0,
      wechat_id: form.wechat_id.trim() || null,
      wechat_user: form.wechat_user.trim() || null,
      registered_accounts: form.registered_accounts.trim() || null,
      status: form.status,
      notes: form.notes.trim() || null,
    };
    try {
      if (editing) {
        await updatePhone.mutateAsync({ id: editing.id, ...payload });
      } else {
        await createPhone.mutateAsync(payload);
      }
      setShowModal(false);
    } catch (err) {
      alert("保存失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const handleDelete = async () => {
    if (!editing) return;
    if (!confirm(`确定删除号码 ${editing.phone}？充值记录会一并删除，无法恢复。`)) return;
    try {
      await deletePhone.mutateAsync(editing.id);
      setShowModal(false);
    } catch (err) {
      alert("删除失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const handleAddRecharge = async () => {
    if (!editing) return;
    const amount = Number(rcAmount);
    if (!amount || amount <= 0) { alert("请填写充值金额"); return; }
    try {
      await addRecharge.mutateAsync({
        phone_id: editing.id,
        amount,
        recharged_at: rcDate || undefined,
        channel: rcChannel || null,
        note: rcNote.trim() || null,
      });
      // 本地刷新 editing 的充值列表：直接重置输入，列表由 invalidate 触发刷新
      resetRecharge();
    } catch (err) {
      alert("添加充值失败: " + (err instanceof Error ? err.message : "未知错误"));
    }
  };

  const handleDeleteRecharge = async (id: string) => {
    if (!confirm("删除这条充值记录？")) return;
    await deleteRecharge.mutateAsync(id);
  };

  // editing 跟随列表刷新（rows 更新后取最新的 recharges）
  const liveEditing = editing ? rows?.find((r) => r.id === editing.id) || editing : null;

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>号码资产</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
            公司所有手机号/SIM 卡：实名身份、归属地、月租、注册账号、充值记录
          </p>
        </div>
        <Button variant="primary" onClick={openCreate}>+ 新建号码</Button>
      </div>

      {/* 汇总 */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatCard label="号码总数" value={String(rows?.length || 0)} />
        <StatCard label="月租合计 / 月" value={`¥${(rows || []).reduce((s, r) => s + Number(r.monthly_fee || 0), 0).toLocaleString()}`} />
        <StatCard label="累计充值" value={`¥${(rows || []).reduce((s, r) => s + Number(r.total_recharged || 0), 0).toLocaleString()}`} />
      </div>

      {/* 筛选 */}
      <div className="flex gap-3 mb-4 items-end flex-wrap">
        <Select label="" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          options={[{ value: "", label: "全部状态" }, ...STATUSES.map((s) => ({ value: s, label: s }))]} />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 搜索号码 / 实名 / 归属地 / 账号"
          className="px-3 py-2 rounded-lg text-sm outline-none flex-1 min-w-[220px]"
          style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }} />
      </div>

      {/* 表格 */}
      {rows && rows.length > 0 ? (
        <div className="rounded-xl overflow-x-auto" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["号码", "实名", "身份证", "运营商", "归属地", "月租", "注册账号", "累计充值", "状态"].map((h) => (
                  <th key={h} className="text-left text-xs font-medium px-4 py-3 whitespace-nowrap" style={{ color: "var(--muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="cursor-pointer transition-colors"
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onClick={() => openEdit(p)}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap" style={{ color: "var(--ink)" }}>{p.phone}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--ink)" }}>{p.real_name || "-"}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--muted)" }}>{maskIdCard(p.id_card)}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--muted)" }}>{p.carrier || "-"}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--muted)" }}>{p.region || "-"}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--ink)" }}>¥{Number(p.monthly_fee || 0)}</td>
                  <td className="px-4 py-3 text-sm max-w-[240px]" style={{ color: "var(--muted)" }}>
                    {(p.linked_accounts && p.linked_accounts.length > 0) || p.wechat_id || p.wechat_user ? (
                      <span className="truncate inline-block max-w-[240px] align-bottom"
                        title={[
                          ...(p.linked_accounts || []).map((a) => `${a.platform}·${a.account_name}${a.operator_name ? "(运营 " + a.operator_name + ")" : ""}`),
                          (p.wechat_id || p.wechat_user) ? `微信 ${p.wechat_id || ""}${p.wechat_user ? "(用:" + p.wechat_user + ")" : ""}` : "",
                        ].filter(Boolean).join("，")}>
                        <span style={{ color: "var(--brand)" }}>{p.linked_accounts?.length || 0}</span> 平台
                        {(p.wechat_id || p.wechat_user) ? " ＋ 微信" : ""}
                      </span>
                    ) : p.registered_accounts ? (
                      <span className="truncate inline-block max-w-[240px] align-bottom" title={p.registered_accounts}>{p.registered_accounts}</span>
                    ) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap" style={{ color: "var(--brand)" }}>¥{Number(p.total_recharged || 0)}</td>
                  <td className="px-4 py-3"><Badge variant={statusColor(p.status)}>{p.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">📞</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            {search || statusFilter ? "没有匹配的号码" : "还没有号码，点击上方按钮录入第一个"}
          </p>
        </div>
      )}

      {/* 新建/编辑 + 充值 弹窗 */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? `📞 ${editing.phone}` : "新建号码"}
        footer={
          <div className="flex justify-between items-center w-full">
            {editing ? (
              <Button variant="secondary" onClick={handleDelete}>🗑 删除号码</Button>
            ) : <span />}
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>取消</Button>
              <Button variant="primary" onClick={handleSubmit}
                disabled={createPhone.isPending || updatePhone.isPending}>
                {createPhone.isPending || updatePhone.isPending ? "保存中..." : "保存"}
              </Button>
            </div>
          </div>
        }>
        <div className="flex flex-col gap-4">
          <Field label="号码 *">
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className={inputCls} placeholder="例: 13800138000" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="实名持有人">
              <input type="text" value={form.real_name} onChange={(e) => setForm({ ...form, real_name: e.target.value })}
                className={inputCls} placeholder="身份证上的姓名" />
            </Field>
            <Field label="身份证号">
              <input type="text" value={form.id_card} onChange={(e) => setForm({ ...form, id_card: e.target.value })}
                className={inputCls} placeholder="实名登记的身份证" />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Select label="运营商" value={form.carrier} onChange={(e) => setForm({ ...form, carrier: e.target.value })}
              options={[{ value: "", label: "选择" }, ...CARRIERS.map((c) => ({ value: c, label: c }))]} />
            <Field label="归属地">
              <input type="text" value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })}
                className={inputCls} placeholder="如 广东深圳" />
            </Field>
            <Field label="月租(元)">
              <input type="number" min={0} value={form.monthly_fee}
                onChange={(e) => setForm({ ...form, monthly_fee: parseFloat(e.target.value) || 0 })} className={inputCls} />
            </Field>
          </div>
          {/* 微信（手机号绑定的，1 个号码 1 个微信） */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="微信号">
              <input type="text" value={form.wechat_id} onChange={(e) => setForm({ ...form, wechat_id: e.target.value })}
                className={inputCls} placeholder="此号码绑定的微信号" />
            </Field>
            <Field label="微信谁在用">
              <input type="text" value={form.wechat_user} onChange={(e) => setForm({ ...form, wechat_user: e.target.value })}
                className={inputCls} placeholder="微信使用人" />
            </Field>
          </div>

          {/* 此号码注册了什么：自媒体平台（账号矩阵自动关联）+ 微信 */}
          {editing && (
            <div className="rounded-lg p-3" style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}>
              {(() => {
                const accs = liveEditing?.linked_accounts || [];
                const hasWechat = !!(form.wechat_id.trim() || form.wechat_user.trim());
                return (
                  <>
                    <div className="text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
                      📇 此号码注册了：
                      <span style={{ color: "var(--brand)" }}> {accs.length} </span>个自媒体平台
                      {hasWechat ? " ＋ 微信" : ""}
                    </div>
                    {/* 微信 */}
                    {hasWechat && (
                      <div className="flex items-center gap-2 text-sm mb-2 px-2 py-1.5 rounded" style={{ background: "var(--surface)" }}>
                        <span>💬</span>
                        <span style={{ color: "var(--ink)" }}>微信 {form.wechat_id || "(未填号)"}</span>
                        <span style={{ color: "var(--muted)" }}>· 使用人 {form.wechat_user || "(未填)"}</span>
                      </div>
                    )}
                    {/* 自媒体平台账号 + 运营人 */}
                    {accs.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {accs.map((a) => (
                          <div key={a.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded" style={{ background: "var(--surface)" }}>
                            <span className="rounded px-1.5 py-0.5 text-xs" style={{ background: "var(--surface-soft)", color: "var(--ink)" }}>{a.platform}</span>
                            <span style={{ color: "var(--ink)" }}>{a.account_name}</span>
                            <span style={{ color: "var(--muted)" }}>· 运营 {a.operator_name || "未指定"}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs" style={{ color: "var(--muted)" }}>
                        还没有自媒体账号关联到这个号码。去「账号矩阵」编辑账号，把「注册号码」选成它即可。
                      </p>
                    )}
                  </>
                );
              })()}
            </div>
          )}
          <Field label="其他账号备注（手填，可选）">
            <textarea value={form.registered_accounts} onChange={(e) => setForm({ ...form, registered_accounts: e.target.value })}
              rows={2} className={inputCls + " resize-y"} placeholder="不在账号矩阵里的账号可以记在这，如：微信-xxx" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Select label="状态" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              options={STATUSES.map((s) => ({ value: s, label: s }))} />
            <Field label="备注">
              <input type="text" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputCls} placeholder="选填" />
            </Field>
          </div>

          {/* 充值记录（仅编辑已有号码时显示） */}
          {editing && liveEditing && (
            <div className="rounded-lg p-3 mt-1" style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>💰 充值记录</span>
                <span className="text-xs" style={{ color: "var(--brand)" }}>
                  累计 ¥{Number(liveEditing.total_recharged || 0).toLocaleString()}
                </span>
              </div>

              {/* 添加充值 */}
              <div className="flex gap-2 items-end flex-wrap mb-3">
                <input type="number" min={0} value={rcAmount} onChange={(e) => setRcAmount(e.target.value)}
                  placeholder="金额" className={inputCls + " w-20"} />
                <input type="date" value={rcDate} onChange={(e) => setRcDate(e.target.value)} className={inputCls + " w-36"} />
                <select value={rcChannel} onChange={(e) => setRcChannel(e.target.value)} className={inputCls + " w-24"}>
                  {RECHARGE_CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <input type="text" value={rcNote} onChange={(e) => setRcNote(e.target.value)}
                  placeholder="备注" className={inputCls + " flex-1 min-w-[80px]"} />
                <Button variant="primary" onClick={handleAddRecharge} disabled={addRecharge.isPending}>+ 充值</Button>
              </div>

              {/* 列表 */}
              {(liveEditing.recharges && liveEditing.recharges.length > 0) ? (
                <div className="flex flex-col gap-1 max-h-44 overflow-y-auto">
                  {[...liveEditing.recharges]
                    .sort((a, b) => (b.recharged_at || "").localeCompare(a.recharged_at || ""))
                    .map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded"
                      style={{ background: "var(--surface)" }}>
                      <span className="font-medium" style={{ color: "var(--ink)" }}>¥{Number(r.amount)}</span>
                      <span style={{ color: "var(--muted)" }}>{r.recharged_at || "-"}</span>
                      <span style={{ color: "var(--muted)" }}>{r.channel || "-"}</span>
                      <span className="flex-1 truncate px-2" style={{ color: "var(--muted)" }} title={r.note || ""}>{r.note || ""}</span>
                      <button onClick={() => handleDeleteRecharge(r.id)}
                        className="text-red-500 hover:text-red-700 px-1" title="删除">✕</button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs" style={{ color: "var(--muted)" }}>暂无充值记录</p>
              )}
            </div>
          )}
          {!editing && (
            <p className="text-xs" style={{ color: "var(--muted)" }}>💡 保存号码后，可在编辑时录入充值记录</p>
          )}
        </div>
      </Modal>
    </div>
  );
}

const inputCls =
  "px-3 py-2 rounded-lg text-sm outline-none w-full bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--ink)] focus:border-blue-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>{label}</span>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <p className="text-xs mb-1" style={{ color: "var(--muted)" }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: "var(--ink)" }}>{value}</p>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 rounded" style={{ background: "var(--surface-soft)" }} />
          <div className="h-4 w-64 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="h-9 w-24 rounded-lg" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="h-64 rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
