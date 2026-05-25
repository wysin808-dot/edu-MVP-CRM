"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PublishedPost } from "@/lib/types";

const supabase = createClient();

export function usePostList(filters?: { date?: string; status?: string }) {
  return useQuery({
    queryKey: ["published_posts", filters],
    queryFn: async () => {
      let query = supabase
        .from("published_posts")
        .select("*, content:contents(*), account:accounts(*)")
        .order("scheduled_time", { ascending: true });

      if (filters?.status) query = query.eq("status", filters.status);

      const { data, error } = await query;
      if (error) throw error;
      return (data as PublishedPost[]) || [];
    },
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: Partial<PublishedPost>) => {
      const { data, error } = await supabase
        .from("published_posts")
        .insert(post)
        .select()
        .single();
      if (error) throw error;
      return data as PublishedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["published_posts"] });
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<PublishedPost> & { id: string }) => {
      const { data, error } = await supabase
        .from("published_posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as PublishedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["published_posts"] });
    },
  });
}

export function useMarkPostPublished() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("published_posts")
        .update({
          status: "已发布",
          actual_time: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["published_posts"] });
    },
  });
}
