"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { KnowledgeMedia } from "@/lib/types";

// ── List media for a knowledge item ──
export function useKnowledgeMedia(knowledgeId: string) {
  return useQuery({
    queryKey: ["knowledge-media", knowledgeId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("knowledge_media")
        .select("*")
        .eq("knowledge_id", knowledgeId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as KnowledgeMedia[]) || [];
    },
    enabled: !!knowledgeId,
  });
}

// ── Upload file to Supabase Storage + insert record ──
export function useUploadKnowledgeMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      knowledgeId,
      file,
    }: {
      knowledgeId: string;
      file: File;
    }) => {
      const supabase = createClient();

      // Determine file type category
      let fileType = "document";
      if (file.type.startsWith("image/")) fileType = "image";

      // Generate unique file path
      const ext = file.name.split(".").pop() || "bin";
      const path = `${knowledgeId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("knowledge-media")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("knowledge-media")
        .getPublicUrl(path);

      // Get current max sort_order
      const { data: existing } = await supabase
        .from("knowledge_media")
        .select("sort_order")
        .eq("knowledge_id", knowledgeId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      // Insert record
      const { data, error } = await supabase
        .from("knowledge_media")
        .insert({
          knowledge_id: knowledgeId,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as KnowledgeMedia;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge-media", variables.knowledgeId],
      });
    },
  });
}

// ── Delete media file ──
export function useDeleteKnowledgeMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      media,
    }: {
      media: KnowledgeMedia;
    }) => {
      const supabase = createClient();

      // Try to clean up storage file (best effort)
      try {
        const url = new URL(media.file_url);
        const pathMatch = url.pathname.match(/\/knowledge-media\/(.+)$/);
        if (pathMatch) {
          await supabase.storage
            .from("knowledge-media")
            .remove([decodeURIComponent(pathMatch[1])]);
        }
      } catch {
        // Storage cleanup failed, continue with DB record deletion
      }

      // Delete record
      const { error } = await supabase
        .from("knowledge_media")
        .delete()
        .eq("id", media.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["knowledge-media", variables.media.knowledge_id],
      });
    },
  });
}
