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
