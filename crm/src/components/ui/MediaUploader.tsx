"use client";

import { useRef, useState } from "react";
import { useContentMedia, useUploadMedia, useDeleteMedia } from "@/hooks/useContentMedia";
import type { ContentMedia } from "@/lib/types";

interface MediaUploaderProps {
  contentId: string;
  /** If true, hide the gallery and only show upload buttons */
  compact?: boolean;
}

const FILE_TYPE_ACCEPT: Record<string, string> = {
  image: "image/jpeg,image/png,image/gif,image/webp",
  video: "video/mp4,video/quicktime,video/webm",
  document: "application/pdf",
};

const FILE_TYPE_LABELS: Record<string, { icon: string; label: string }> = {
  image: { icon: "🖼️", label: "图片" },
  video: { icon: "🎬", label: "视频" },
  document: { icon: "📄", label: "文档" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MediaUploader({ contentId, compact }: MediaUploaderProps) {
  const { data: mediaList, isLoading } = useContentMedia(contentId);
  const uploadMedia = useUploadMedia();
  const deleteMedia = useDeleteMedia();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<string>("image");
  const [uploading, setUploading] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<ContentMedia | null>(null);

  const handleUploadClick = (type: string) => {
    setUploadType(type);
    if (fileInputRef.current) {
      fileInputRef.current.accept = FILE_TYPE_ACCEPT[type] || "*/*";
      fileInputRef.current.multiple = true;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await uploadMedia.mutateAsync({ contentId, file: files[i] });
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
      // Reset input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (media: ContentMedia) => {
    if (!confirm(`确定删除 "${media.file_name}" 吗？`)) return;
    await deleteMedia.mutateAsync({ media });
  };

  const images = (mediaList || []).filter((m) => m.file_type === "image");
  const videos = (mediaList || []).filter((m) => m.file_type === "video");
  const docs = (mediaList || []).filter((m) => m.file_type === "document");

  return (
    <div>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Upload Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(FILE_TYPE_LABELS).map(([type, { icon, label }]) => (
          <button
            key={type}
            onClick={() => handleUploadClick(type)}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            style={{
              background: "var(--surface-soft)",
              border: "1px dashed var(--border)",
              color: "var(--ink)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--brand)";
              e.currentTarget.style.color = "var(--brand)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border)";
              e.currentTarget.style.color = "var(--ink)";
            }}
          >
            <span>{icon}</span>
            <span>上传{label}</span>
          </button>
        ))}
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: "var(--surface-soft)" }}>
          <div className="w-4 h-4 border-2 rounded-full animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--brand)" }} />
          <span className="text-sm" style={{ color: "var(--muted)" }}>上传中...</span>
        </div>
      )}

      {/* Gallery */}
      {!compact && !isLoading && (
        <>
          {/* Images Grid */}
          {images.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
                🖼️ 图片 ({images.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {images.map((media) => (
                  <div
                    key={media.id}
                    className="relative group rounded-lg overflow-hidden cursor-pointer"
                    style={{ border: "1px solid var(--border)", aspectRatio: "1" }}
                    onClick={() => setPreviewMedia(media)}
                  >
                    <img
                      src={media.file_url}
                      alt={media.file_name}
                      className="w-full h-full object-cover"
                    />
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end"
                      style={{ background: "linear-gradient(transparent 50%, rgba(0,0,0,0.6))" }}
                    >
                      <div className="w-full p-2 flex items-center justify-between">
                        <span className="text-xs text-white truncate flex-1">{media.file_name}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(media); }}
                          className="text-white text-xs px-1.5 py-0.5 rounded hover:bg-red-500/80 transition-colors ml-1"
                          style={{ background: "rgba(239,68,68,0.6)" }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {videos.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
                🎬 视频 ({videos.length})
              </h4>
              <div className="flex flex-col gap-2">
                {videos.map((media) => (
                  <div key={media.id} className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <video
                      src={media.file_url}
                      controls
                      className="w-full"
                      style={{ maxHeight: "360px" }}
                    />
                    <div className="flex items-center justify-between px-3 py-2" style={{ background: "var(--surface-soft)" }}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs truncate" style={{ color: "var(--ink)" }}>{media.file_name}</span>
                        <span className="text-xs shrink-0" style={{ color: "var(--muted)" }}>{formatFileSize(media.file_size)}</span>
                      </div>
                      <button
                        onClick={() => handleDelete(media)}
                        className="text-xs px-2 py-1 rounded transition-colors shrink-0"
                        style={{ color: "var(--red)", background: "transparent" }}
                        onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                        onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {docs.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-medium mb-2" style={{ color: "var(--muted)" }}>
                📄 文档 ({docs.length})
              </h4>
              <div className="flex flex-col gap-2">
                {docs.map((media) => (
                  <div
                    key={media.id}
                    className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: "var(--surface-soft)", border: "1px solid var(--border)" }}
                  >
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <a
                        href={media.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium truncate block no-underline"
                        style={{ color: "var(--brand)" }}
                      >
                        {media.file_name}
                      </a>
                      <span className="text-xs" style={{ color: "var(--muted)" }}>{formatFileSize(media.file_size)}</span>
                    </div>
                    <button
                      onClick={() => handleDelete(media)}
                      className="text-xs px-2 py-1 rounded transition-colors shrink-0"
                      style={{ color: "var(--red)", background: "transparent" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239,68,68,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      删除
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && images.length === 0 && videos.length === 0 && docs.length === 0 && !uploading && (
            <div className="text-center py-6 rounded-lg" style={{ background: "var(--surface-soft)", border: "1px dashed var(--border)" }}>
              <div className="text-2xl mb-2">📎</div>
              <p className="text-xs" style={{ color: "var(--muted)" }}>
                点击上方按钮上传图片、视频或文档
              </p>
            </div>
          )}
        </>
      )}

      {/* Compact media count */}
      {compact && mediaList && mediaList.length > 0 && (
        <div className="flex gap-3 text-xs" style={{ color: "var(--muted)" }}>
          {images.length > 0 && <span>🖼️ {images.length} 张图片</span>}
          {videos.length > 0 && <span>🎬 {videos.length} 个视频</span>}
          {docs.length > 0 && <span>📄 {docs.length} 个文档</span>}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.8)" }}
          onClick={() => setPreviewMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] mx-4">
            <img
              src={previewMedia.file_url}
              alt={previewMedia.file_name}
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="absolute top-2 right-2 flex gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setPreviewMedia(null); }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                ✕
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-sm text-white">{previewMedia.file_name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
