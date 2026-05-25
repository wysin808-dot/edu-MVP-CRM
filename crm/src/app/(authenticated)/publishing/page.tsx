"use client";

import { useState } from "react";
import { useTodayPublishing, useUpdateContent } from "@/hooks/useContents";
import { PLATFORMS } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { localDateStr } from "@/lib/utils";

export default function PublishingPage() {
  const today = localDateStr(new Date());
  const { data: todayContents, isLoading: loadingContents } = useTodayPublishing();
  const updateContent = useUpdateContent();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const publishedCount = todayContents?.filter((c) => c.status === "已发布").length || 0;
  const totalCount = todayContents?.length || 0;
  const progressPercent = totalCount > 0 ? Math.round((publishedCount / totalCount) * 100) : 0;

  const getPlatformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);

  const handleMarkPublished = async (contentId: string) => {
    await updateContent.mutateAsync({ id: contentId, status: "已发布" });
  };

  const handleMarkDelayed = async (contentId: string) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await updateContent.mutateAsync({
      id: contentId,
      publish_date: localDateStr(tomorrow),
    });
  };

  if (loadingContents) return <PageSkeleton />;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>今日发布</h2>
          <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>{today}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            完成度: {publishedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl p-4 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-soft)" }}>
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${progressPercent}%`,
                  background: progressPercent === 100 ? "var(--green)" : "var(--brand)",
                }}
              />
            </div>
          </div>
          <span className="text-lg font-bold shrink-0" style={{ color: progressPercent === 100 ? "var(--green)" : "var(--brand)" }}>
            {progressPercent}%
          </span>
        </div>
        {progressPercent === 100 && totalCount > 0 && (
          <p className="text-xs mt-2 text-center" style={{ color: "var(--green)" }}>
            🎉 今日任务全部完成！
          </p>
        )}
      </div>

      {/* Content List */}
      {todayContents && todayContents.length > 0 ? (
        <div className="flex flex-col gap-2">
          {todayContents.map((content) => {
            const platform = getPlatformInfo(content.platform);
            const isExpanded = expandedId === content.id;
            const isPublished = content.status === "已发布";

            return (
              <div
                key={content.id}
                className="rounded-xl overflow-hidden transition-all"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  opacity: isPublished ? 0.7 : 1,
                }}
              >
                {/* Main Row */}
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : content.id)}
                >
                  {/* Status indicator */}
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{
                      background: isPublished ? "var(--green)" : "var(--amber)",
                    }}
                  />

                  {/* Platform */}
                  <span className="text-sm shrink-0" style={{ color: "var(--muted)" }}>
                    {platform ? `${platform.icon} ${platform.label}` : content.platform}
                  </span>

                  {/* Title */}
                  <span className="flex-1 text-sm font-medium truncate" style={{
                    color: "var(--ink)",
                    textDecoration: isPublished ? "line-through" : "none",
                  }}>
                    {content.title}
                  </span>

                  {/* Status Badge */}
                  <Badge variant={statusVariant(content.status)}>{content.status}</Badge>

                  {/* Expand arrow */}
                  <span className="text-xs" style={{ color: "var(--muted)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    ▼
                  </span>
                </div>

                {/* Expanded Actions */}
                {isExpanded && (
                  <div className="px-4 pb-4 flex items-center gap-3" style={{ borderTop: "1px solid var(--border)", paddingTop: "12px" }}>
                    {content.author_name && (
                      <span className="text-xs" style={{ color: "var(--muted)" }}>作者: {content.author_name}</span>
                    )}
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{content.funnel_stage}</span>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{content.content_type}</span>
                    {content.wace_focus && <Badge variant="warning">WACE</Badge>}
                    <div className="flex-1" />
                    {!isPublished && (
                      <>
                        <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleMarkPublished(content.id); }}
                          disabled={updateContent.isPending}>
                          ✓ 标记已发布
                        </Button>
                        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleMarkDelayed(content.id); }}
                          disabled={updateContent.isPending}>
                          延期至明天
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl p-12 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">📤</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            今日没有排期发布的内容
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
            在内容资产库或日历中设置发布日期为今天即可出现在这里
          </p>
        </div>
      )}
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-5xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 w-24 rounded" style={{ background: "var(--surface-soft)" }} />
          <div className="h-4 w-32 rounded mt-2" style={{ background: "var(--surface-soft)" }} />
        </div>
        <div className="h-6 w-20 rounded" style={{ background: "var(--surface-soft)" }} />
      </div>
      <div className="h-12 rounded-xl mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    </div>
  );
}
