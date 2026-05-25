"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useContentList } from "@/hooks/useContents";
import { useCrmLeadList } from "@/hooks/useCrmLeads";
import { localDateStr } from "@/lib/utils";

export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: pendingContents } = useContentList({ status: "待审核" });
  const { data: allLeads } = useCrmLeadList();

  if (loading) {
    return <PageSkeleton />;
  }

  // Filter leads whose next_followup is today or overdue
  const today = localDateStr(new Date());
  const overdueLeads = (allLeads || []).filter((lead) => {
    if (!lead.next_followup) return false;
    return lead.next_followup <= today;
  });

  // Build unified priority queue items
  const priorityItems: PriorityItem[] = [
    ...(pendingContents || []).map((c) => ({
      id: c.id,
      type: "content" as const,
      icon: "📋",
      title: c.title,
      badge: c.status,
      badgeColor: "var(--amber)",
      hint: `${c.platform} · 点击审核`,
      href: `/content/${c.id}`,
    })),
    ...overdueLeads.map((l) => ({
      id: l.id,
      type: "lead" as const,
      icon: "📞",
      title: l.name,
      badge: l.next_followup === today ? "今日跟进" : "已逾期",
      badgeColor: l.next_followup === today ? "var(--blue)" : "var(--red)",
      hint: `${l.stage} · ${l.interest_program || "未指定项目"}`,
      href: `/crm`,
    })),
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="mb-6">
        <h2 className="text-xl font-bold m-0" style={{ color: "var(--ink)" }}>
          你好, {profile?.display_name || "用户"} 👋
        </h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
          以下是你今天的工作概览
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          label="今日待发"
          value={statsLoading ? "--" : String(stats?.todayPublishing ?? 0)}
          icon="📤"
          color="var(--brand)"
        />
        <StatsCard
          label="待审核"
          value={statsLoading ? "--" : String(stats?.pendingReview ?? 0)}
          icon="📋"
          color="var(--amber)"
        />
        <StatsCard
          label="本周线索"
          value={statsLoading ? "--" : String(stats?.weeklyLeads ?? 0)}
          icon="🎯"
          color="var(--green)"
        />
        <StatsCard
          label="内容总量"
          value={statsLoading ? "--" : String(stats?.totalContents ?? 0)}
          icon="📝"
          color="var(--blue)"
        />
      </div>

      {/* Priority Queue */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--ink)" }}
        >
          优先待办
        </h3>

        {priorityItems.length === 0 ? (
          <div
            className="text-center py-8"
            style={{ color: "var(--muted)" }}
          >
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm">暂无待办</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {priorityItems.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                style={{
                  background: "var(--surface-soft)",
                  textDecoration: "none",
                  color: "inherit",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--border)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "var(--surface-soft)")
                }
              >
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span
                  className="text-sm font-medium flex-1 truncate"
                  style={{ color: "var(--ink)" }}
                >
                  {item.title}
                </span>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{
                    background: `color-mix(in srgb, ${item.badgeColor} 15%, transparent)`,
                    color: item.badgeColor,
                  }}
                >
                  {item.badge}
                </span>
                <span
                  className="text-xs flex-shrink-0 hidden sm:inline"
                  style={{ color: "var(--muted)" }}
                >
                  {item.hint}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div
        className="rounded-xl p-6"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
        }}
      >
        <h3
          className="text-sm font-semibold mb-4"
          style={{ color: "var(--ink)" }}
        >
          快捷操作
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickAction href="/content" icon="+" label="新建内容" color="var(--brand)" />
          <QuickAction href="/crm" icon="+" label="新增线索" color="var(--green)" />
          <QuickAction href="/calendar" icon="📅" label="内容日历" color="var(--blue)" />
          <QuickAction href="/analytics" icon="📊" label="数据复盘" color="var(--amber)" />
        </div>
      </div>
    </div>
  );
}

// ── Inline Types ──

interface PriorityItem {
  id: string;
  type: "content" | "lead";
  icon: string;
  title: string;
  badge: string;
  badgeColor: string;
  hint: string;
  href: string;
}

// ── Inline Components ──

function StatsCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string;
  icon: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-4 flex items-center gap-3"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
      }}
    >
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
        style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}
      >
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold" style={{ color: "var(--ink)" }}>
          {value}
        </div>
        <div className="text-xs" style={{ color: "var(--muted)" }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  color,
}: {
  href: string;
  icon: string;
  label: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
      style={{
        background: "var(--surface-soft)",
        color: "var(--ink)",
        textDecoration: "none",
        border: "1px solid var(--border)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = `color-mix(in srgb, ${color} 10%, var(--surface-soft))`;
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "var(--surface-soft)";
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.color = "var(--ink)";
      }}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto animate-pulse">
      <div className="h-8 w-48 rounded mb-2" style={{ background: "var(--surface-soft)" }} />
      <div className="h-4 w-64 rounded mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 rounded-xl"
            style={{ background: "var(--surface-soft)" }}
          />
        ))}
      </div>
      <div className="h-48 rounded-xl mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="h-24 rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
