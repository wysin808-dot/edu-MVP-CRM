"use client";

import { useMemo, useState } from "react";
import { useTaskList, useCreateTask, useUpdateTask, useDeleteTask, type Task } from "@/hooks/useTasks";
import { useColleagues } from "@/hooks/useMessages";

const PLATFORM_OPTIONS = ["小红书", "知乎", "百家号", "视频号", "抖音", "公众号"];

function ProgressBar({ percent, overdue }: { percent: number; overdue: boolean }) {
  const color = overdue ? "#dc2626" : percent >= 100 ? "#059669" : percent >= 50 ? "#2563eb" : "#d97706";
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${percent}%`, background: color }} />
    </div>
  );
}

export default function TasksPage() {
  const { data, isLoading } = useTaskList();
  const colleagues = useColleagues();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();

  const tasks = data?.tasks || [];
  const role = data?.role || "operator";
  const canAssign = role === "lead" || role === "admin";

  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<"全部" | "进行中" | "已完成" | "已逾期">("全部");

  const filtered = useMemo(() => {
    if (filter === "全部") return tasks;
    if (filter === "已逾期") return tasks.filter((t) => t.overdue);
    return tasks.filter((t) => t.status === filter);
  }, [tasks, filter]);

  // 排行榜：按被指派者聚合已完成产出
  const leaderboard = useMemo(() => {
    const map = new Map<string, { name: string; done: number; target: number; tasks: number }>();
    for (const t of tasks) {
      const key = t.assignee_id;
      const ex = map.get(key) || { name: t.assignee_name || "?", done: 0, target: 0, tasks: 0 };
      ex.done += t.done;
      ex.target += t.target_total;
      ex.tasks += 1;
      map.set(key, ex);
    }
    return Array.from(map.values()).sort((a, b) => b.done - a.done);
  }, [tasks]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === "已完成" || t.percent >= 100).length;
    const overdue = tasks.filter((t) => t.overdue).length;
    return { total, done, overdue, doing: total - done };
  }, [tasks]);

  return (
    <div className="w-full max-w-5xl mx-auto px-1">
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">✅ 任务中心</h1>
          <p className="text-sm text-[var(--muted,#6b7280)] mt-1">
            {canAssign
              ? "派发任务、追踪每个人的产出 —— 进度根据「内容生成」里的产出自动统计。"
              : "你的任务清单 —— 在「内容生成」里产出内容，进度会自动更新。"}
          </p>
        </div>
        {canAssign && (
          <button
            onClick={() => setShowForm((s) => !s)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
          >
            {showForm ? "收起" : "+ 派发任务"}
          </button>
        )}
      </div>

      {/* 统计条 */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: "总任务", value: stats.total, color: "#2563eb" },
          { label: "进行中", value: stats.doing, color: "#d97706" },
          { label: "已完成", value: stats.done, color: "#059669" },
          { label: "已逾期", value: stats.overdue, color: "#dc2626" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-[var(--border,#e5e7eb)] bg-white p-3 text-center">
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--muted,#6b7280)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* 派发表单 */}
      {canAssign && showForm && (
        <TaskForm
          colleagues={(colleagues.data || []).map((c) => ({ id: c.id, name: c.display_name || "未命名" }))}
          submitting={createTask.isPending}
          error={(createTask.error as Error)?.message}
          onSubmit={async (input) => {
            await createTask.mutateAsync(input);
            setShowForm(false);
          }}
        />
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* 任务列表 */}
        <div className="lg:col-span-2">
          <div className="flex gap-1.5 mb-3">
            {(["全部", "进行中", "已完成", "已逾期"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-xs font-medium border ${
                  filter === f ? "bg-blue-600 text-white border-blue-600" : "border-[var(--border,#e5e7eb)] text-[var(--muted,#4b5563)]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="text-sm text-[var(--muted,#9ca3af)] py-10 text-center">加载中…</p>
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--border,#e5e7eb)] py-14 text-center">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm text-[var(--muted,#6b7280)]">
                {canAssign ? "还没有任务，点右上角「派发任务」开始" : "暂时没有分配给你的任务"}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((t) => (
                <TaskCard
                  key={t.id}
                  task={t}
                  canAssign={canAssign}
                  onComplete={() => updateTask.mutate({ id: t.id, status: t.status === "已完成" ? "进行中" : "已完成" })}
                  onDelete={() => confirm("删除该任务？") && deleteTask.mutate(t.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* 排行榜 */}
        <div>
          <div className="rounded-xl border border-[var(--border,#e5e7eb)] bg-white p-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-1.5">🏆 产出排行榜</h3>
            {leaderboard.length === 0 ? (
              <p className="text-xs text-[var(--muted,#9ca3af)]">暂无数据</p>
            ) : (
              <div className="space-y-2.5">
                {leaderboard.map((m, i) => {
                  const medal = ["🥇", "🥈", "🥉"][i] || `${i + 1}.`;
                  const pct = m.target > 0 ? Math.min(100, Math.round((m.done / m.target) * 100)) : 0;
                  return (
                    <div key={m.name + i} className="flex items-center gap-2">
                      <span className="w-6 text-center text-sm">{medal}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium truncate">{m.name}</span>
                          <span className="text-[var(--muted,#6b7280)]">{m.done}/{m.target}</span>
                        </div>
                        <div className="mt-1"><ProgressBar percent={pct} overdue={false} /></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <p className="text-[11px] text-[var(--muted,#9ca3af)] mt-3 leading-relaxed">
              产出 = 该成员在「内容生成」里实际生产的内容条数（自任务开始日起）
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  canAssign,
  onComplete,
  onDelete,
}: {
  task: Task;
  canAssign: boolean;
  onComplete: () => void;
  onDelete: () => void;
}) {
  const isDone = task.status === "已完成" || task.percent >= 100;
  return (
    <div className="rounded-xl border bg-white p-4" style={{ borderColor: task.overdue ? "#fecaca" : "var(--border,#e5e7eb)" }}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-snug">{task.title}</p>
          <p className="text-xs text-[var(--muted,#6b7280)] mt-0.5">
            👤 {task.assignee_name || "?"}
            {task.due_date && <span className={task.overdue ? "text-red-600 font-medium" : ""}> · 截止 {task.due_date}</span>}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {task.overdue && <span className="rounded-full bg-red-50 text-red-600 px-2 py-0.5 text-[11px] font-semibold">逾期</span>}
          {isDone && <span className="rounded-full bg-green-50 text-green-600 px-2 py-0.5 text-[11px] font-semibold">✓ 完成</span>}
        </div>
      </div>

      {task.description && <p className="text-xs text-[var(--muted,#6b7280)] mt-2">{task.description}</p>}

      {task.platform_targets && Object.keys(task.platform_targets).length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {Object.entries(task.platform_targets).map(([p, n]) => (
            <span key={p} className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600">{p} {n}</span>
          ))}
        </div>
      )}

      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-[var(--muted,#6b7280)]">进度（自动统计）</span>
          <span className="font-semibold">{task.done}/{task.target_total} · {task.percent}%</span>
        </div>
        <ProgressBar percent={task.percent} overdue={task.overdue} />
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          onClick={onComplete}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
            isDone ? "bg-gray-100 text-gray-600" : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isDone ? "↺ 重新开启" : "✓ 标记完成"}
        </button>
        {canAssign && (
          <button onClick={onDelete} className="rounded-lg px-2.5 py-1.5 text-xs text-red-500 hover:bg-red-50">
            删除
          </button>
        )}
      </div>
    </div>
  );
}

function TaskForm({
  colleagues,
  submitting,
  error,
  onSubmit,
}: {
  colleagues: { id: string; name: string }[];
  submitting: boolean;
  error?: string;
  onSubmit: (input: {
    assignee_id: string;
    assignee_name: string;
    title: string;
    description?: string;
    target_total: number;
    platform_targets: Record<string, number> | null;
    due_date?: string;
  }) => void;
}) {
  const [assigneeId, setAssigneeId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [platTargets, setPlatTargets] = useState<Record<string, number>>({});

  const targetTotal = Object.values(platTargets).reduce((a, b) => a + (b || 0), 0);

  function setPlat(p: string, v: number) {
    setPlatTargets((prev) => {
      const next = { ...prev };
      if (v > 0) next[p] = v;
      else delete next[p];
      return next;
    });
  }

  function submit() {
    if (!assigneeId || !title.trim()) return;
    const name = colleagues.find((c) => c.id === assigneeId)?.name || "";
    onSubmit({
      assignee_id: assigneeId,
      assignee_name: name,
      title: title.trim(),
      description: description.trim() || undefined,
      target_total: targetTotal,
      platform_targets: Object.keys(platTargets).length ? platTargets : null,
      due_date: dueDate || undefined,
    });
  }

  return (
    <div className="rounded-xl border border-[var(--border,#e5e7eb)] bg-white p-4 mb-5 space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-[var(--muted,#4b5563)]">指派给</label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border,#e5e7eb)] px-3 py-2 text-sm"
          >
            <option value="">选择成员…</option>
            {colleagues.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-[var(--muted,#4b5563)]">截止日期</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[var(--border,#e5e7eb)] px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--muted,#4b5563)]">任务标题</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="如：本周 WACE 主题内容产出"
          className="mt-1 w-full rounded-lg border border-[var(--border,#e5e7eb)] px-3 py-2 text-sm"
        />
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--muted,#4b5563)]">分平台目标（条数，合计 {targetTotal}）</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {PLATFORM_OPTIONS.map((p) => (
            <div key={p} className="flex items-center gap-1.5">
              <span className="text-xs w-14 shrink-0">{p}</span>
              <input
                type="number"
                min={0}
                value={platTargets[p] || ""}
                onChange={(e) => setPlat(p, Number(e.target.value))}
                placeholder="0"
                className="w-full rounded-lg border border-[var(--border,#e5e7eb)] px-2 py-1 text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-[var(--muted,#4b5563)]">补充说明（可选）</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="如：重点突出升学路径，结尾引导私信咨询"
          className="mt-1 w-full rounded-lg border border-[var(--border,#e5e7eb)] px-3 py-2 text-sm resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          disabled={submitting || !assigneeId || !title.trim()}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50 hover:bg-blue-700"
        >
          {submitting ? "派发中…" : "派发任务"}
        </button>
      </div>
    </div>
  );
}
