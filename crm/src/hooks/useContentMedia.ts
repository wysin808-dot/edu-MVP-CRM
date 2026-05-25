"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { ContentMedia } from "@/lib/types";

// ── List media for a content ──
export function useContentMedia(contentId: string) {
  return useQuery({
    queryKey: ["content-media", contentId],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("content_media")
        .select("*")
        .eq("content_id", contentId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data as ContentMedia[]) || [];
    },
    enabled: !!contentId,
  });
}

// ── Upload file to Supabase Storage + insert record ──
export function useUploadMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contentId,
      file,
    }: {
      contentId: string;
      file: File;
    }) => {
      const supabase = createClient();

      // Determine file type category
      let fileType = "document";
      if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("video/")) fileType = "video";

      // Generate unique file path
      const ext = file.name.split(".").pop() || "bin";
      const path = `${contentId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("content-media")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("content-media")
        .getPublicUrl(path);

      // Get current max sort_order
      const { data: existing } = await supabase
        .from("content_media")
        .select("sort_order")
        .eq("content_id", contentId)
        .order("sort_order", { ascending: false })
        .limit(1);

      const nextOrder = (existing?.[0]?.sort_order ?? -1) + 1;

      // Insert record
      const { data, error } = await supabase
        .from("content_media")
        .insert({
          content_id: contentId,
          file_url: urlData.publicUrl,
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
          sort_order: nextOrder,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ContentMedia;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content-media", variables.contentId],
      });
    },
  });
}

// ── Delete media file ──
export function useDeleteMedia() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      media,
    }: {
      media: ContentMedia;
    }) => {
      const supabase = createClient();

      // Extract storage path from URL
      const url = new URL(media.file_url);
      const pathMatch = url.pathname.match(/\/content-media\/(.+)$/);
      if (pathMatch) {
        await supabase.storage
          .from("content-media")
          .remove([pathMatch[1]]);
      }

      // Delete record
      const { error } = await supabase
        .from("content_media")
        .delete()
        .eq("id", media.id);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["content-media", variables.media.content_id],
      });
    },
  });
}
