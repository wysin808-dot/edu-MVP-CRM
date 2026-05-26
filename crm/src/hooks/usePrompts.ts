"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { AiPrompt, AiPromptInsert } from "@/lib/types";

export function usePromptList(filters?: {
  category?: string;
  platform?: string;
}) {
  return useQuery({
    queryKey: ["ai_prompts", filters],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("ai_prompts")
        .select("*, persona:personas(*)")
        .order("use_count", { ascending: false });

      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.platform)
        query = query.eq("target_platform", filters.platform);

      const { data, error } = await query;
      if (error) throw error;
      return (data as AiPrompt[]) || [];
    },
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prompt: AiPromptInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ai_prompts")
        .insert(prompt)
        .select()
        .single();
      if (error) throw error;
      return data as AiPrompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_prompts"] });
    },
  });
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<AiPrompt> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ai_prompts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as AiPrompt;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_prompts"] });
    },
  });
}

export function useIncrementPromptUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      // Use raw SQL to atomically increment, avoiding race condition
      const { error } = await supabase.rpc("increment_prompt_usage", { prompt_id: id });
      if (error) {
        // Only fallback if RPC function doesn't exist (42883), re-throw other errors
        if (error.code === "42883") {
          // Fallback: read-then-write (acceptable for low-concurrency usage)
          const { data: current, error: readErr } = await supabase
            .from("ai_prompts")
            .select("use_count")
            .eq("id", id)
            .single();
          if (readErr) throw readErr;
          const { error: updateErr } = await supabase
            .from("ai_prompts")
            .update({
              use_count: (current?.use_count || 0) + 1,
              last_used_at: new Date().toISOString(),
            })
            .eq("id", id);
          if (updateErr) throw updateErr;
        } else {
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_prompts"] });
    },
  });
}
