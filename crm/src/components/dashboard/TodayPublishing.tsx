"use client";

import { useState } from "react";
import Link from "next/link";
import { useTodayPublishing, useUpdateContent } from "@/hooks/useContents";
import { useAuth } from "@/components/providers/AuthProvider";
import { usePlatforms } from "@/hooks/usePlatforms";
import { PlatformLogo } from "@/components/ui/PlatformLogo";
import { Button } from "@/components/ui/Button";
import { Badge, statusVariant } from "@/components/ui/Badge";
import { localDateStr } from "@/lib/utils";

// 今日发布（原 /publishing 页面，现并入工作台，可复用）
export default function TodayPublishing() {
  const PLATFORMS = usePlatforms().data ?? [];
  const today = localDateStr(new Date());
  const { profile } = useAuth();
  const { data: todayContents, isLoading } = useTodayPublishing();
  const updateContent = useUpdateContent();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const publishedCount = todayContents?.filter((c) => c.status === "已发布").length || 0;
  const totalCount = todayContents?.length || 0;
  const kpiTarget = profile?.daily_publish_target || 0;
  const effectiveTarget = kpiTarget > 0 ? kpiTarget : totalCount;
  const progressPercent = effectiveTarget > 0 ? Math.min(100, Math.round((publishedCount / effectiveTarget) * 100)) : 0;

  const getPlatformInfo = (id: string) => PLATFORMS.find((p) => p.id === id);

  const handleMarkPublished = async (contentId: string) => {
    try {
      await updateContent.mutateAsync({ id: contentId, status: "已发布" });
    } catch {
      alert("操作失败，请重试");
    }
  };

  const handleMarkDelayed = async (contentId: string) => {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      await updateContent.mutateAsync({ id: contentId, publish_date: localDateStr(tomorrow) });
    } catch {
      alert("操作失败，请重试");
    }
  };

  if (isLoading) {
    return <div className="h-40 rounded-xl animate-pulse" style={{ background: "var(--surface-soft)" }} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold m-0 flex items-center gap-2" style={{ color: "var(--ink)" }}>
            📤 今日发布
            <Link href="/publish-log" className="text-xs font-medium" style={{ color: "var(--brand)", textDecoration: "none" }}>
              发布记录 →
            </Link>
          </h3>
          <p className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{today}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            完成度: {publishedCount}/{effectiveTarget}
          </div>
          {kpiTarget > 0 && (
            <p className="text-xs mt-0.5" style={{ color: publishedCount >= kpiTarget ? "var(--green)" : "var(--brand)" }}>
              🎯 KPI 目标: {kpiTarget} 篇/日
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl p-4 mb-4" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-soft)" }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%`, background: progressPercent === 100 ? "var(--green)" : "var(--brand)" }} />
            </div>
          </div>
          <span className="text-lg font-bold shrink-0" style={{ color: progressPercent === 100 ? "var(--green)" : "var(--brand)" }}>
            {progressPercent}%
          </span>
        </div>
        {progressPercent === 100 && effectiveTarget > 0 && (
          <p className="text-xs mt-2 text-center" style={{ color: "var(--green)" }}>
            🎉 {kpiTarget > 0 ? "今日 KPI 已达标！" : "今日任务全部完成！"}
          </p>
        )}
        {kpiTarget > 0 && publishedCount < kpiTarget && totalCount > 0 && (
          <p className="text-xs mt-2 text-center" style={{ color: "var(--amber)" }}>
            📌 还需发布 {kpiTarget - publishedCount} 篇达成今日 KPI
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
              <div key={content.id} className="rounded-xl overflow-hidden transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", opacity: isPublished ? 0.7 : 1 }}>
                <div className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : content.id)}>
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: isPublished ? "var(--green)" : "var(--amber)" }} />
                  <span className="text-sm shrink-0 inline-flex items-center gap-1.5" style={{ color: "var(--muted)" }}>
                    {platform ? <><PlatformLogo icon={platform.icon} logoUrl={platform.logo_url} label={platform.label} size={16} />{platform.label}</> : content.platform}
                  </span>
                  <span className="flex-1 text-sm font-medium truncate"
                    style={{ color: "var(--ink)", textDecoration: isPublished ? "line-through" : "none" }}>
                    {content.title}
                  </span>
                  <Badge variant={statusVariant(content.status)}>{content.status}</Badge>
                  <span className="text-xs" style={{ color: "var(--muted)", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>▼</span>
                </div>
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
                          disabled={updateContent.isPending}>✓ 标记已发布</Button>
                        <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); handleMarkDelayed(content.id); }}
                          disabled={updateContent.isPending}>延期至明天</Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-3xl mb-2">📤</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>今日没有排期发布的内容</p>
          <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>在内容日历中把发布日期设为今天即可出现在这里</p>
        </div>
      )}
    </div>
  );
}
