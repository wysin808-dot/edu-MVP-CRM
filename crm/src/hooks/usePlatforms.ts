"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

// 与旧的 PLATFORMS 常量同形（id/name/label/icon/budgetPercent），保证各页面无缝替换
export interface Platform {
  id: string;
  name: string;
  label: string;
  icon: string;
  budgetPercent: number;
  sort_order: number;
}

interface PlatformRow {
  id: string;
  label: string;
  icon: string | null;
  budget_percent: number | null;
  sort_order: number | null;
  active: boolean;
}

function toPlatform(r: PlatformRow): Platform {
  return {
    id: r.id,
    name: r.id,
    label: r.label || r.id,
    icon: r.icon || "📱",
    budgetPercent: Number(r.budget_percent || 0),
    sort_order: r.sort_order ?? 100,
  };
}

// 启用中的平台列表（下拉、统计、图标查找都用它）
export function usePlatforms() {
  return useQuery({
    queryKey: ["platforms"],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return ((data as PlatformRow[]) || []).map(toPlatform);
    },
  });
}

// 全部平台（含停用），系统设置管理用
export function useAllPlatforms() {
  return useQuery({
    queryKey: ["platforms", "all"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("platforms")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as PlatformRow[]) || [];
    },
  });
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["platforms"] });
}

export function useSavePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (p: { id: string; label: string; icon: string; budget_percent: number; sort_order: number; active?: boolean }) => {
      const supabase = createClient();
      const { error } = await supabase.from("platforms").upsert({
        id: p.id,
        label: p.label,
        icon: p.icon,
        budget_percent: p.budget_percent,
        sort_order: p.sort_order,
        active: p.active ?? true,
      });
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}

export function useDeletePlatform() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("platforms").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => invalidate(qc),
  });
}
