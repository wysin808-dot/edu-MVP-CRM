"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { CoachGenerated } from "@/lib/types";

// ── List generated content (most recent first) ──
export function useCoachHistory(limit = 50) {
  return useQuery({
    queryKey: ["coach-history", limit],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("coach_generated")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data as CoachGenerated[]) || [];
    },
  });
}

// ── Token / 生成量统计 ──
export function useCoachStats() {
  return useQuery({
    queryKey: ["coach-stats"],
    queryFn: async () => {
      const supabase = createClient();
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // 拉本月记录（含 total_tokens），在前端聚合
      const { data, error } = await supabase
        .from("coach_generated")
        .select("created_at,total_tokens")
        .gte("created_at", monthStart)
        .limit(5000);
      if (error) {
        // 表无 total_tokens 列等情况，降级只统计条数
        const fallback = await supabase
          .from("coach_generated")
          .select("created_at")
          .gte("created_at", monthStart)
          .limit(5000);
        const rows = fallback.data || [];
        const todayCount = rows.filter((r) => r.created_at >= todayStart).length;
        return { todayCount, monthCount: rows.length, monthTokens: 0 };
      }

      const rows = (data as { created_at: string; total_tokens: number | null }[]) || [];
      const todayCount = rows.filter((r) => r.created_at >= todayStart).length;
      const monthTokens = rows.reduce((sum, r) => sum + (r.total_tokens || 0), 0);
      return { todayCount, monthCount: rows.length, monthTokens };
    },
  });
}

// ── Get today's daily content ──
export function useCoachDaily() {
  const today = new Date().toISOString().split("T")[0];
  return useQuery({
    queryKey: ["coach-daily", today],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("coach_generated")
        .select("*")
        .eq("is_daily", true)
        .gte("created_at", `${today}T00:00:00`)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as CoachGenerated[]) || [];
    },
  });
}

// ── Generate single content ──
export function useCoachGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      topic: string;
      platform?: string;
      audienceTag?: string;
      tone?: string;
      contentType?: string;
      model?: string;
    }) => {
      const res = await fetch("/api/coach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "生成失败");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-history"] });
    },
  });
}

// ── Generate daily batch ──
export function useCoachBatchGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { topic: string; platform?: string }) => {
      const res = await fetch("/api/coach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: params.topic, batchMode: true, platform: params.platform }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "批量生成失败");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-daily"] });
      queryClient.invalidateQueries({ queryKey: ["coach-history"] });
    },
  });
}

// ── Toggle saved status ──
export function useCoachToggleSave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, is_saved }: { id: string; is_saved: boolean }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("coach_generated")
        .update({ is_saved })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-history"] });
      queryClient.invalidateQueries({ queryKey: ["coach-daily"] });
    },
  });
}

// ── Delete generated content ──
export function useCoachDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("coach_generated")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-history"] });
      queryClient.invalidateQueries({ queryKey: ["coach-daily"] });
    },
  });
}
