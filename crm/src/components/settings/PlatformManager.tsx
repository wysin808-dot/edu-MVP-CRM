"use client";

import { useState } from "react";
import { useAllPlatforms, useSavePlatform, useDeletePlatform } from "@/hooks/usePlatforms";
import { Button } from "@/components/ui/Button";

const inputCls =
  "px-2 py-1.5 rounded-lg text-sm outline-none bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--ink)] focus:border-blue-500";

const emptyAdd = { id: "", icon: "📱", budget_percent: 0, sort_order: 99 };

export default function PlatformManager() {
  const { data: platforms, isLoading } = useAllPlatforms();
  const save = useSavePlatform();
  const del = useDeletePlatform();
  const [add, setAdd] = useState(emptyAdd);
  const [editing, setEditing] = useState<Record<string, { icon: string; budget_percent: number; sort_order: number }>>({});

  const handleAdd = async () => {
    const name = add.id.trim();
    if (!name) { alert("请填写平台名称"); return; }
    try {
      await save.mutateAsync({
        id: name, label: name, icon: add.icon.trim() || "📱",
        budget_percent: Number(add.budget_percent) || 0,
        sort_order: Number(add.sort_order) || 99,
      });
      setAdd(emptyAdd);
    } catch (e) {
      alert("添加失败：" + (e instanceof Error ? e.message : "未知错误"));
    }
  };

  const handleSaveEdit = async (id: string, label: string) => {
    const e = editing[id];
    if (!e) return;
    await save.mutateAsync({ id, label, icon: e.icon.trim() || "📱", budget_percent: Number(e.budget_percent) || 0, sort_order: Number(e.sort_order) || 99 });
    setEditing((prev) => { const n = { ...prev }; delete n[id]; return n; });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`删除平台「${id}」？\n已有数据里这个平台的内容/账号不会被删除，但会失去图标。`)) return;
    await del.mutateAsync(id);
  };

  return (
    <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--ink)" }}>平台配置</h3>
      <p className="text-xs mb-4" style={{ color: "var(--muted)" }}>
        管理员可在这里增删平台。新增的平台会出现在账号矩阵、内容等的平台下拉里。
      </p>

      {isLoading ? (
        <div className="h-20 rounded-lg animate-pulse" style={{ background: "var(--surface-soft)" }} />
      ) : (
        <div className="flex flex-col gap-2">
          {(platforms || []).map((p) => {
            const ed = editing[p.id];
            return (
              <div key={p.id} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: "var(--surface-soft)" }}>
                {ed ? (
                  <>
                    <input value={ed.icon} onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: { ...ed, icon: e.target.value } }))} className={inputCls + " w-14 text-center"} />
                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--ink)" }}>{p.label}</span>
                    <label className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>预算%
                      <input type="number" value={ed.budget_percent} onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: { ...ed, budget_percent: parseFloat(e.target.value) || 0 } }))} className={inputCls + " w-16"} /></label>
                    <label className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>排序
                      <input type="number" value={ed.sort_order} onChange={(e) => setEditing((prev) => ({ ...prev, [p.id]: { ...ed, sort_order: parseInt(e.target.value) || 99 } }))} className={inputCls + " w-14"} /></label>
                    <Button variant="primary" size="sm" onClick={() => handleSaveEdit(p.id, p.label)} disabled={save.isPending}>保存</Button>
                    <Button variant="secondary" size="sm" onClick={() => setEditing((prev) => { const n = { ...prev }; delete n[p.id]; return n; })}>取消</Button>
                  </>
                ) : (
                  <>
                    <span className="text-lg w-8 text-center">{p.icon || "📱"}</span>
                    <span className="flex-1 text-sm font-medium" style={{ color: "var(--ink)" }}>{p.label}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>预算占比 {Number(p.budget_percent || 0)}%</span>
                    <button onClick={() => setEditing((prev) => ({ ...prev, [p.id]: { icon: p.icon || "📱", budget_percent: Number(p.budget_percent || 0), sort_order: p.sort_order ?? 99 } }))}
                      className="text-xs px-2 py-1 rounded cursor-pointer border-none" style={{ color: "var(--brand)", background: "transparent" }}>编辑</button>
                    <button onClick={() => handleDelete(p.id)}
                      className="text-xs px-2 py-1 rounded cursor-pointer border-none" style={{ color: "var(--red)", background: "transparent" }}>删除</button>
                  </>
                )}
              </div>
            );
          })}

          {/* 新增平台 */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg mt-1" style={{ border: "1px dashed var(--border)" }}>
            <input value={add.icon} onChange={(e) => setAdd({ ...add, icon: e.target.value })} className={inputCls + " w-14 text-center"} placeholder="图标" />
            <input value={add.id} onChange={(e) => setAdd({ ...add, id: e.target.value })} className={inputCls + " flex-1"} placeholder="平台名称，如 Threads / 知乎" />
            <label className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>预算%
              <input type="number" value={add.budget_percent} onChange={(e) => setAdd({ ...add, budget_percent: parseFloat(e.target.value) || 0 })} className={inputCls + " w-16"} /></label>
            <label className="text-xs flex items-center gap-1" style={{ color: "var(--muted)" }}>排序
              <input type="number" value={add.sort_order} onChange={(e) => setAdd({ ...add, sort_order: parseInt(e.target.value) || 99 })} className={inputCls + " w-14"} /></label>
            <Button variant="primary" size="sm" onClick={handleAdd} disabled={save.isPending}>+ 添加</Button>
          </div>
        </div>
      )}
    </div>
  );
}
