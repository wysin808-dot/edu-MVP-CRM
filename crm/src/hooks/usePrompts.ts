"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { AiPrompt, AiPromptInsert } from "@/lib/types";

const supabase = createClient();

export function usePromptList(filters?: {
  category?: string;
  platform?: string;
}) {
  return useQuery({
    queryKey: ["ai_prompts", filters],
    queryFn: async () => {
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
      // Fetch current count, increment
      const { data: current } = await supabase
        .from("ai_prompts")
        .select("use_count")
        .eq("id", id)
        .single();

      const { error } = await supabase
        .from("ai_prompts")
        .update({
          use_count: (current?.use_count || 0) + 1,
          last_used_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai_prompts"] });
    },
  });
}
