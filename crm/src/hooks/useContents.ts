"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Content, ContentUpdate } from "@/lib/types";

const supabase = createClient();

// ── Queries ──

export function useContentList(filters?: {
  platform?: string;
  status?: string;
  funnelStage?: string;
  topicCluster?: string;
}) {
  return useQuery({
    queryKey: ["contents", filters],
    queryFn: async () => {
      let query = supabase
        .from("contents")
        .select("*, account:accounts(*), persona:personas(*)")
        .order("created_at", { ascending: false });

      if (filters?.platform) query = query.eq("platform", filters.platform);
      if (filters?.status) query = query.eq("status", filters.status);
      if (filters?.funnelStage) query = query.eq("funnel_stage", filters.funnelStage);
      if (filters?.topicCluster) query = query.eq("topic_cluster", filters.topicCluster);

      const { data, error } = await query;
      if (error) throw error;
      return (data as Content[]) || [];
    },
  });
}

export function useContent(id: string) {
  return useQuery({
    queryKey: ["contents", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contents")
        .select(
          `*,
          account:accounts(*),
          persona:personas(*),
          reviews:content_reviews(*),
          comments:content_comments(*)`
        )
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Content;
    },
    enabled: !!id,
  });
}

export function useContentWithMetrics(id: string) {
  return useQuery({
    queryKey: ["contents", id, "metrics"],
    queryFn: async () => {
      const [contentResult, metricsResult, refsResult, childrenResult] =
        await Promise.all([
          supabase
            .from("contents")
            .select("*, account:accounts(*), persona:personas(*), reviews:content_reviews(*), comments:content_comments(*)")
            .eq("id", id)
            .single(),
          supabase
            .from("content_metrics")
            .select("*")
            .eq("content_id", id)
            .order("recorded_at", { ascending: false })
            .limit(1),
          supabase
            .from("content_knowledge_refs")
            .select("knowledge_id, knowledge(*)")
            .eq("content_id", id),
          supabase
            .from("contents")
            .select("id, title, platform, status")
            .eq("repurpose_parent_id", id),
        ]);

      if (contentResult.error) throw contentResult.error;

      const content = contentResult.data as Content;
      content.metrics = metricsResult.data?.[0] ?? undefined;
      content.knowledge_refs = refsResult.data?.map(
        (r: Record<string, unknown>) => r.knowledge
      ) as Content["knowledge_refs"];
      content.repurpose_children = childrenResult.data as Content[];

      return content;
    },
    enabled: !!id,
  });
}

// ── Today's publishing list ──

export function useTodayPublishing() {
  return useQuery({
    queryKey: ["contents", "today"],
    queryFn: async () => {
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      const { data, error } = await supabase
        .from("contents")
        .select("*, account:accounts(*)")
        .eq("publish_date", dateStr)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data as Content[]) || [];
    },
  });
}

// ── Mutations ──

export function useCreateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: Partial<Content>) => {
      const { data, error } = await supabase
        .from("contents")
        .insert(content)
        .select()
        .single();
      if (error) throw error;
      return data as Content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
}

export function useUpdateContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ContentUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("contents")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Content;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.setQueryData(["contents", data.id], data);
    },
  });
}

export function useDeleteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
}

// ── Content Reviews ──

export function useAddReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (review: {
      content_id: string;
      reviewer_name: string;
      action: "approve" | "reject" | "comment";
      comment?: string;
    }) => {
      const { data, error } = await supabase
        .from("content_reviews")
        .insert(review)
        .select()
        .single();
      if (error) throw error;

      // Update content status based on action
      if (review.action === "approve") {
        await supabase
          .from("contents")
          .update({ status: "已通过" })
          .eq("id", review.content_id);
      } else if (review.action === "reject") {
        await supabase
          .from("contents")
          .update({ status: "草稿" })
          .eq("id", review.content_id);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.content_id],
      });
    },
  });
}

// ── Content Comments ──

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (comment: {
      content_id: string;
      author_name: string;
      body: string;
    }) => {
      const { data, error } = await supabase
        .from("content_comments")
        .insert(comment)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.content_id],
      });
    },
  });
}

// ── Knowledge Refs ──

export function useLinkKnowledge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content_id,
      knowledge_id,
    }: {
      content_id: string;
      knowledge_id: string;
    }) => {
      const { error } = await supabase
        .from("content_knowledge_refs")
        .insert({ content_id, knowledge_id });
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.content_id],
      });
    },
  });
}

// ── Repurpose ──

export function useRepurposeContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      parentId,
      targetPlatform,
      title,
    }: {
      parentId: string;
      targetPlatform: string;
      title: string;
    }) => {
      const { data: parent } = await supabase
        .from("contents")
        .select("*")
        .eq("id", parentId)
        .single();

      if (!parent) throw new Error("Parent content not found");

      const { data, error } = await supabase
        .from("contents")
        .insert({
          title: `[${targetPlatform}] ${title}`,
          platform: targetPlatform,
          persona_id: parent.persona_id,
          author_name: parent.author_name,
          status: "草稿",
          funnel_stage: parent.funnel_stage,
          emotional_trigger: parent.emotional_trigger,
          content_type: parent.content_type,
          topic_cluster: parent.topic_cluster,
          wace_focus: parent.wace_focus,
          repurpose_status: "改写中",
          repurpose_parent_id: parentId,
          audience_personas: parent.audience_personas,
        })
        .select()
        .single();

      if (error) throw error;

      // Update parent repurpose status
      await supabase
        .from("contents")
        .update({ repurpose_status: "已发多平台" })
        .eq("id", parentId);

      return data as Content;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contents"] });
    },
  });
}

// ── Content Metrics ──

export function useUpdateMetrics() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (metrics: {
      content_id: string;
      reads?: number;
      likes?: number;
      comments?: number;
      shares?: number;
      private_messages?: number;
      leads?: number;
    }) => {
      const { data, error } = await supabase
        .from("content_metrics")
        .upsert(metrics, { onConflict: "content_id" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contents", variables.content_id, "metrics"],
      });
    },
  });
}
