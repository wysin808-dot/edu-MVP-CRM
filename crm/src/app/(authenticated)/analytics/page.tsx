"use client";

import { useMemo } from "react";
import { useContentList } from "@/hooks/useContents";
import { useCrmLeadList } from "@/hooks/useCrmLeads";
import { PLATFORMS, CRM_STAGES, FUNNEL_STAGES, CONTENT_TYPES } from "@/lib/constants";
import { Badge } from "@/components/ui/Badge";
import { getWeekStart, localDateStr } from "@/lib/utils";

export default function AnalyticsPage() {
  const { data: contents, isLoading: loadingContents } = useContentList();
  const { data: leads, isLoading: loadingLeads } = useCrmLeadList();

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
    const weekStartStr = localDateStr(weekStart);
    const waceThisWeek = contents.filter((c) =>
      c.wace_focus && c.created_at >= weekStartStr
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

  if (loadingContents || loadingLeads) return <PageSkeleton />;

  return (
    <div className="max-w-7xl mx-auto">
      <h2 className="text-lg font-bold mb-6" style={{ color: "var(--ink)" }}>数据复盘</h2>

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
            {funnelData.map((item, idx) => {
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

        {/* Content Strategy Distribution */}
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
                  <span className="text-xs w-12 text-right shrink-0" style={{ color: "var(--ink)" }}>{item.count} ({percent}%)</span>
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
        <div className="rounded-xl p-6 lg:col-span-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>
            WACE 周报追踪
          </h3>
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
                    ? "✅ 已达标！保持 WACE 内容产出节奏"
                    : `⚠️ 还需 ${waceWeekly.target - waceWeekly.current} 篇 WACE 内容达标`
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
        <div className="h-32 rounded-xl lg:col-span-2" style={{ background: "var(--surface-soft)" }} />
      </div>
    </div>
  );
}
