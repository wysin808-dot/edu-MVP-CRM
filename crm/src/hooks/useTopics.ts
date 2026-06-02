"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Topic {
  id: string;
  user_id: string;
  user_name: string | null;
  team: string;
  keyword: string;
  batch_id: string | null;
  category: string | null;
  title: string;
  angle: string | null;
  status: string;
  used_count: number;
  created_at: string;
}

// 选题历史（同团队/本人可见，按批次倒序）
export function useTopicList() {
  return useQuery({
    queryKey: ["topics"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("topics")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data as Topic[]) || [];
    },
  });
}

interface GenerateParams {
  keyword: string;
  perCategory?: number;
}

export function useTopicGenerate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: GenerateParams) => {
      const res = await fetch("/api/topics/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "生成失败");
      return json as {
        batchId: string;
        keyword: string;
        topics: Topic[];
        count: number;
        tokens: number;
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

// 标记选题状态（已生成 / 已弃用 / 待用）并累加使用次数
export function useTopicUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      bumpUsed,
    }: {
      id: string;
      status?: string;
      bumpUsed?: boolean;
    }) => {
      const supabase = createClient();
      const patch: Record<string, unknown> = {};
      if (status) patch.status = status;
      if (bumpUsed) {
        const { data: cur } = await supabase
          .from("topics")
          .select("used_count")
          .eq("id", id)
          .single();
        patch.used_count = ((cur?.used_count as number) || 0) + 1;
      }
      const { error } = await supabase.from("topics").update(patch).eq("id", id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}

// 删除一整批选题
export function useTopicDeleteBatch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (batchId: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("topics").delete().eq("batch_id", batchId);
      if (error) throw error;
      return batchId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["topics"] });
    },
  });
}
