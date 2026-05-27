"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { AiPrompt, AiPromptInsert } from "@/lib/types";

function useTeamFilter() {
  const { profile, role } = useAuth();
  return role === "admin" ? null : profile?.team || null;
}

export function usePromptList(filters?: {
  category?: string;
  platform?: string;
}) {
  const team = useTeamFilter();

  return useQuery({
    queryKey: ["ai_prompts", filters, { team }],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("ai_prompts")
        .select("*, persona:personas(*)")
        .order("use_count", { ascending: false });

      if (filters?.category) query = query.eq("category", filters.category);
      if (filters?.platform)
        query = query.eq("target_platform", filters.platform);
      if (team) query = query.eq("team", team);

      const { data, error } = await query;
      if (error) throw error;
      return (data as AiPrompt[]) || [];
    },
  });
}

export function useCreatePrompt() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (prompt: AiPromptInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("ai_prompts")
        .insert({ ...prompt, team: profile?.team || "china" })
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
      const { error } = await supabase.rpc("increment_prompt_usage", { prompt_id: id });
      if (error) {
        if (error.code === "42883") {
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
