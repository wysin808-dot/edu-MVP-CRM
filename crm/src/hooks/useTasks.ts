"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Task {
  id: string;
  team: string;
  created_by: string;
  created_by_name: string | null;
  assignee_id: string;
  assignee_name: string | null;
  title: string;
  description: string | null;
  target_total: number;
  platform_targets: Record<string, number> | null;
  start_date: string | null;
  due_date: string | null;
  status: string;
  manual_done: number | null;
  created_at: string;
  // 计算字段（由 API 注入）
  auto_done: number;
  done: number;
  percent: number;
  overdue: boolean;
}

export function useTaskList() {
  return useQuery({
    queryKey: ["tasks"],
    refetchInterval: 60000,
    queryFn: async () => {
      const res = await fetch("/api/tasks");
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "加载失败");
      return json as { tasks: Task[]; role: string };
    },
  });
}

interface CreateTaskInput {
  assignee_id: string;
  assignee_name?: string;
  title: string;
  description?: string;
  target_total?: number;
  platform_targets?: Record<string, number> | null;
  start_date?: string;
  due_date?: string;
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTaskInput) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "创建失败");
      return json.task as Task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id: string; status?: string; manual_done?: number | null }) => {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "更新失败");
      return json.task as Task;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks?id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "删除失败");
      return id;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });
}
