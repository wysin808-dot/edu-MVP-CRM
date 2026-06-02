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

// ── 每日额度状态（次数）──
export interface QuotaStatus {
  limits: { text: number; image: number; video: number };
  used: { text: number; image: number; video: number };
}
export function useCoachQuota() {
  return useQuery<QuotaStatus>({
    queryKey: ["coach-quota"],
    queryFn: async () => {
      const res = await fetch("/api/coach/quota");
      if (!res.ok) throw new Error("额度查询失败");
      return res.json();
    },
    refetchInterval: 30000,
  });
}

// ── Generate daily batch ──
export function useCoachBatchGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: {
      topic: string;
      platform?: string;
      style?: string;
      audience?: string;
      keywords?: string;
      extra?: string;
      presenter?: string;
      channelHint?: string;
    }) => {
      const res = await fetch("/api/coach/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: params.topic,
          batchMode: true,
          platform: params.platform,
          style: params.style,
          audience: params.audience,
          keywords: params.keywords,
          extra: params.extra,
          presenter: params.presenter,
          channelHint: params.channelHint,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "批量生成失败");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-history"] });
      queryClient.invalidateQueries({ queryKey: ["coach-quota"] });
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
