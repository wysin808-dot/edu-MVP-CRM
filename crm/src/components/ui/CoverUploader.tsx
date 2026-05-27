"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CoverUploaderProps {
  value: string;            // current cover URL
  onChange: (url: string) => void;  // callback with new URL
  label?: string;
}

export function CoverUploader({ value, onChange, label = "封面图" }: CoverUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件（JPG、PNG、GIF、WebP）");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("图片不能超过 10MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `covers/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("content-media")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("content-media")
        .getPublicUrl(path);

      onChange(urlData.publicUrl);
    } catch (err) {
      setError("上传失败: " + (err instanceof Error ? err.message : "未知错误"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>{label}</label>

      {value ? (
        /* Preview with remove/replace buttons */
        <div className="relative rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
          <img src={value} alt="封面预览" className="w-full h-36 object-cover" />
          <div className="absolute top-2 right-2 flex gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs px-2 py-1 rounded border-none cursor-pointer"
              style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
            >
              更换
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="text-xs px-2 py-1 rounded border-none cursor-pointer"
              style={{ background: "rgba(220,38,38,0.8)", color: "#fff" }}
            >
              删除
            </button>
          </div>
        </div>
      ) : (
        /* Upload area */
        <div
          className="rounded-lg p-6 text-center cursor-pointer transition-all"
          style={{
            border: "2px dashed var(--border)",
            background: "var(--surface-soft)",
          }}
          onClick={() => !uploading && fileInputRef.current?.click()}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
        >
          {uploading ? (
            <div className="text-sm" style={{ color: "var(--muted)" }}>
              <span className="animate-pulse">上传中...</span>
            </div>
          ) : (
            <>
              <div className="text-2xl mb-1">📷</div>
              <div className="text-xs" style={{ color: "var(--muted)" }}>
                点击上传封面图片
              </div>
              <div className="text-xs mt-0.5" style={{ color: "var(--muted)", opacity: 0.6 }}>
                支持 JPG、PNG、GIF、WebP，最大 10MB
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="text-xs mt-1" style={{ color: "var(--red, #dc2626)" }}>⚠️ {error}</p>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
