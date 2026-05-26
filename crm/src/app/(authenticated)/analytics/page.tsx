"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useContentList } from "@/hooks/useContents";
import { useCrmLeadList } from "@/hooks/useCrmLeads";
import { PLATFORMS, CRM_STAGES, FUNNEL_STAGES, CONTENT_TYPES, CONTENT_STATUSES } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { getWeekStart } from "@/lib/utils";

// Fetch aggregated metrics from content_metrics table
function useAggregatedMetrics() {
  return useQuery({
    queryKey: ["content_metrics", "aggregated"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("content_metrics")
        .select("reads, likes, comments, shares, private_messages, leads");
      if (error) throw error;
      const totals = { reads: 0, likes: 0, comments: 0, shares: 0, private_messages: 0, leads: 0 };
      (data || []).forEach((row) => {
        totals.reads += row.reads || 0;
        totals.likes += row.likes || 0;
        totals.comments += row.comments || 0;
        totals.shares += row.shares || 0;
        totals.private_messages += row.private_messages || 0;
        totals.leads += row.leads || 0;
      });
      return totals;
    },
  });
}

export default function AnalyticsPage() {
  const { data: contents, isLoading: loadingContents } = useContentList();
  const { data: leads, isLoading: loadingLeads } = useCrmLeadList();
  const { data: metrics } = useAggregatedMetrics();

  // Platform performance
  const platformStats = useMemo(() => {
    if (!contents || !leads) return [];
    return PLATFORMS.map((p) => {
      const platformContents = contents.filter((c) => c.platform === p.id);
      const platformLeads = leads.filter((l) => l.source_platform === p.id);
      const published = platformContents.filter((c) => c.status === "已发布").length;
      return {
        ...p,
        total: platformContents.length,
        published,
        leads: platformLeads.length,
        conversionRate: published > 0 ? ((platformLeads.length / published) * 100).toFixed(1) : "0.0",
      };
    }).filter((p) => p.total > 0);
  }, [contents, leads]);

  // CRM funnel
  const funnelData = useMemo(() => {
    if (!leads) return CRM_STAGES.map((s) => ({ stage: s, count: 0 }));
    return CRM_STAGES.map((stage) => ({
      stage,
      count: leads.filter((l) => l.stage === stage).length,
    }));
  }, [leads]);

  const totalLeads = leads?.length || 0;

  // Content status distribution
  const statusDist = useMemo(() => {
    if (!contents) return [];
    return CONTENT_STATUSES.map((status) => ({
      status,
      count: contents.filter((c) => c.status === status).length,
    })).filter((s) => s.count > 0);
  }, [contents]);

  // Content strategy distribution
  const funnelDist = useMemo(() => {
    if (!contents) return [];
    return FUNNEL_STAGES.map((stage) => ({
      stage,
      count: contents.filter((c) => c.funnel_stage === stage).length,
    }));
  }, [contents]);

  const typeDist = useMemo(() => {
    if (!contents) return [];
    return CONTENT_TYPES.map((type) => ({
      type,
      count: contents.filter((c) => c.content_type === type).length,
    }));
  }, [contents]);

  // WACE weekly tracker
  const waceWeekly = useMemo(() => {
    if (!contents) return { current: 0, target: 2 };
    const weekStart = getWeekStart(new Date());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTime = weekStart.getTime();
    const waceThisWeek = contents.filter((c) =>
      c.wace_focus && new Date(c.created_at).getTime() >= weekStartTime
    ).length;
    return { current: waceThisWeek, target: 2 };
  }, [contents]);

  const funnelColors: Record<string, string> = {
    "新线索": "var(--blue)",
    "已咨询": "var(--brand)",
    "预约到访": "var(--amber)",
    "已缴费": "var(--green)",
    "已流失": "var(--red)",
  };

  const statusColors: Record<string, string> = {
    "草稿": "#94a3b8",
    "待审核": "#f59e0b",
    "审核中": "#3b82f6",
    "已通过": "#10b981",
    "已发布": "#e87a2e",
    "已归档": "#6b7280",
  };

  if (loadingContents || loadingLeads) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg font-bold mb-6" style={{ color: "var(--ink)" }}>数据复盘</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[
          { label: "总阅读", value: metrics?.reads || 0, icon: "👁️", color: "var(--ink)" },
          { label: "总点赞", value: metrics?.likes || 0, icon: "👍", color: "var(--brand)" },
          { label: "总评论", value: metrics?.comments || 0, icon: "💬", color: "var(--blue)" },
          { label: "总分享", value: metrics?.shares || 0, icon: "🔗", color: "var(--green)" },
          { label: "总私信", value: metrics?.private_messages || 0, icon: "✉️", color: "var(--amber)" },
          { label: "总线索", value: metrics?.leads || 0, icon: "🎯", color: "var(--red)" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl p-4 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-lg mb-1">{stat.icon}</div>
            <div className="text-xl font-bold" style={{ color: stat.color }}>{stat.value.toLocaleString()}</div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform Performance Table */}
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>平台线索表现</h3>
          {platformStats.length > 0 ? (
            <table className="w-full" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["平台", "内容数", "已发布", "线索数", "转化率"].map((h) => (
                    <th key={h} className="text-left text-xs font-medium px-2 py-2" style={{ color: "var(--muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {platformStats.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-2 py-2 text-sm">{p.icon} {p.label}</td>
                    <td className="px-2 py-2 text-sm" style={{ color: "var(--ink)" }}>{p.total}</td>
                    <td className="px-2 py-2 text-sm" style={{ color: "var(--green)" }}>{p.published}</td>
                    <td className="px-2 py-2 text-sm font-medium" style={{ color: "var(--brand)" }}>{p.leads}</td>
                    <td className="px-2 py-2 text-sm" style={{ color: "var(--muted)" }}>{p.conversionRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>暂无数据</p>
          )}
        </div>

        {/* Enrollment Funnel */}
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
            招生漏斗 <span className="font-normal text-xs" style={{ color: "var(--muted)" }}>· 共 {totalLeads} 条线索</span>
          </h3>
          <div className="flex flex-col gap-3">
            {funnelData.map((item) => {
              const maxCount = Math.max(...funnelData.map((f) => f.count), 1);
              const widthPercent = Math.max((item.count / maxCount) * 100, 8);
              return (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-xs w-16 shrink-0" style={{ color: "var(--muted)" }}>{item.stage}</span>
                  <div className="flex-1">
                    <div className="h-7 rounded-md flex items-center px-2 transition-all"
                      style={{
                        width: `${widthPercent}%`,
                        background: funnelColors[item.stage] || "var(--brand)",
                        opacity: 0.85,
                        minWidth: "40px",
                      }}>
                      <span className="text-xs font-bold text-white">{item.count}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Status Distribution */}
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
            内容状态分布 <span className="font-normal text-xs" style={{ color: "var(--muted)" }}>· 共 {contents?.length || 0} 条</span>
          </h3>
          {statusDist.length > 0 ? (
            <>
              {/* Visual bar */}
              <div className="h-8 rounded-lg overflow-hidden flex mb-4">
                {statusDist.map((item) => {
                  const percent = ((item.count / (contents?.length || 1)) * 100);
                  return (
                    <div key={item.status} className="h-full flex items-center justify-center transition-all"
                      style={{
                        width: `${percent}%`,
                        background: statusColors[item.status] || "var(--muted)",
                        minWidth: percent > 0 ? "24px" : "0",
                      }}>
                      {percent >= 10 && <span className="text-xs font-bold text-white">{item.count}</span>}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="flex flex-wrap gap-3">
                {statusDist.map((item) => (
                  <div key={item.status} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm" style={{ background: statusColors[item.status] || "var(--muted)" }} />
                    <span className="text-xs" style={{ color: "var(--muted)" }}>{item.status} ({item.count})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>暂无内容</p>
          )}
        </div>

        {/* Content Funnel Stage Distribution */}
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>内容漏斗阶段分布</h3>
          <div className="flex flex-col gap-2">
            {funnelDist.map((item) => {
              const total = contents?.length || 1;
              const percent = ((item.count / total) * 100).toFixed(0);
              return (
                <div key={item.stage} className="flex items-center gap-3">
                  <span className="text-xs w-24 shrink-0" style={{ color: "var(--muted)" }}>{item.stage}</span>
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "var(--surface-soft)" }}>
                    <div className="h-full rounded-full" style={{ width: `${percent}%`, background: "var(--brand)", minWidth: item.count > 0 ? "20px" : "0" }} />
                  </div>
                  <span className="text-xs w-16 text-right shrink-0" style={{ color: "var(--ink)" }}>{item.count} ({percent}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Type Distribution */}
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>内容类型分布</h3>
          <div className="flex flex-wrap gap-3">
            {typeDist.map((item) => (
              <div key={item.type} className="flex flex-col items-center p-3 rounded-lg min-w-[80px]"
                style={{ background: "var(--surface-soft)" }}>
                <span className="text-lg font-bold" style={{ color: "var(--brand)" }}>{item.count}</span>
                <span className="text-xs mt-1" style={{ color: "var(--muted)" }}>{item.type}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WACE Weekly Tracker */}
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>WACE 周报追踪</h3>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{
                  background: waceWeekly.current >= waceWeekly.target
                    ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                    : "linear-gradient(135deg, #fef3c7, #fde68a)",
                }}>
                <span className="text-2xl font-bold" style={{
                  color: waceWeekly.current >= waceWeekly.target ? "var(--green)" : "var(--amber)",
                }}>
                  {waceWeekly.current}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                  本周 WACE 内容: {waceWeekly.current}/{waceWeekly.target} 篇
                </div>
                <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  {waceWeekly.current >= waceWeekly.target
                    ? "已达标！保持 WACE 内容产出节奏"
                    : `还需 ${waceWeekly.target - waceWeekly.current} 篇 WACE 内容达标`
                  }
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="h-4 rounded-full overflow-hidden" style={{ background: "var(--surface-soft)" }}>
                <div className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((waceWeekly.current / waceWeekly.target) * 100, 100)}%`,
                    background: waceWeekly.current >= waceWeekly.target ? "var(--green)" : "var(--amber)",
                  }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-6 w-24 rounded mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-24 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-64 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
    </div>
  );
}
