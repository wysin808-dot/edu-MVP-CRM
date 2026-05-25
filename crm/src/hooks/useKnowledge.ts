"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeItem, KnowledgeInsert } from "@/lib/types";

const supabase = createClient();

export function useKnowledgeList(filters?: {
  itemType?: string;
  visibility?: string;
}) {
  return useQuery({
    queryKey: ["knowledge", filters],
    queryFn: async () => {
      let query = supabase
        .from("knowledge")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.itemType) query = query.eq("item_type", filters.itemType);
      if (filters?.visibility) query = query.eq("visibility", filters.visibility);

      const { data, error } = await query;
      if (error) throw error;
      return (data as KnowledgeItem[]) || [];
    },
  });
}

export function useKnowledge(id: string) {
  return useQuery({
    queryKey: ["knowledge", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as KnowledgeItem;
    },
    enabled: !!id,
  });
}

export function useCreateKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: KnowledgeInsert) => {
      const { data, error } = await supabase
        .from("knowledge")
        .insert(item)
        .select()
        .single();
      if (error) throw error;
      return data as KnowledgeItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}

export function useUpdateKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<KnowledgeItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("knowledge")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as KnowledgeItem;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
      queryClient.setQueryData(["knowledge", data.id], data);
    },
  });
}

export function useDeleteKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("knowledge").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
}
