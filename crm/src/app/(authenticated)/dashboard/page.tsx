"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { useContentList } from "@/hooks/useContents";
import GrowthBoard from "@/components/dashboard/GrowthBoard";
import TodayPublishing from "@/components/dashboard/TodayPublishing";
import { useCrmLeadList } from "@/hooks/useCrmLeads";
import { useTaskList } from "@/hooks/useTasks";
import { localDateStr, getWeekStart } from "@/lib/utils";
import { generateNotifications, type Notification } from "@/lib/notifications";

export default function DashboardPage() {
  const { user, profile, loading, role } = useAuth();
  // 运营/AI 工作台只看自己的数据（不看团队）
  const selfOnly = role === "operator" || role === "ai";
  const selfName = selfOnly ? (profile?.display_name || undefined) : undefined;
  const { data: taskData } = useTaskList();
  const { data: pendingContents } = useContentList({ status: "待审核", authorName: selfName });
  const { data: allContents } = useContentList({ authorName: selfName });
  const { data: allLeads } = useCrmLeadList({ assignedTo: selfName });
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  // Generate notifications from all data
  const notifications = useMemo(() => {
    if (!allContents || !allLeads) return [];
    const weekStart = getWeekStart(new Date());
    weekStart.setHours(0, 0, 0, 0);
    const weekStartTime = weekStart.getTime();
    const waceThisWeek = allContents.filter(
      (c) => c.wace_focus && new Date(c.created_at).getTime() >= weekStartTime
    ).length;
    return generateNotifications({
      contents: allContents,
      leads: allLeads,
      waceThisWeek,
      waceTarget: 2,
    });
  }, [allContents, allLeads]);

  const highPriorityCount = notifications.filter((n) => n.priority === "high").length;
  const visibleNotifications = showAllNotifications ? notifications : notifications.slice(0, 5);

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

  // 我的任务（分配给当前用户的，工作台直接呈现）
  const allTasks = taskData?.tasks || [];
  const myTasks = allTasks.filter((t) => t.assignee_id === user?.id);
  const myActiveTasks = myTasks
    .filter((t) => t.status !== "已完成")
    .sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return (a.due_date || "9999").localeCompare(b.due_date || "9999");
    });
  const canManageTasks = profile?.role === "lead" || profile?.role === "admin";

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

      {/* 今日发布 —— 工作台第一优先，置顶、加品牌色描边强调 */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: "var(--surface)", border: "2px solid var(--brand)", boxShadow: "0 4px 16px color-mix(in srgb, var(--brand) 12%, transparent)" }}>
        <TodayPublishing />
      </div>

      {/* GrowthOS 看板（真实数据） */}
      <GrowthBoard />

      {/* My Tasks（任务中心合并到工作台：员工首页直接看到自己的任务与进度） */}
      {myActiveTasks.length > 0 && (
        <div
          className="rounded-xl p-6 mb-6"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--ink)" }}>
              ✅ 我的任务
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "var(--surface-soft)", color: "var(--muted)" }}>
                进行中 {myActiveTasks.length}
              </span>
            </h3>
            {canManageTasks && (
              <Link href="/tasks" className="text-xs" style={{ color: "var(--brand)", textDecoration: "none" }}>
                管理任务 →
              </Link>
            )}
          </div>
          <div className="flex flex-col gap-3">
            {myActiveTasks.slice(0, 5).map((t) => {
              const barColor = t.overdue ? "var(--red)" : t.percent >= 100 ? "var(--green)" : t.percent >= 50 ? "var(--blue)" : "var(--amber)";
              return (
                <div key={t.id} className="rounded-lg px-4 py-3" style={{ background: "var(--surface-soft)" }}>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-sm font-medium truncate" style={{ color: "var(--ink)" }}>{t.title}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {t.overdue && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "var(--red)" }}>逾期</span>
                      )}
                      <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>{t.done}/{t.target_total}</span>
                    </div>
                  </div>
                  <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                    <div className="h-full rounded-full transition-all" style={{ width: `${t.percent}%`, background: barColor }} />
                  </div>
                  {t.due_date && (
                    <p className="text-xs mt-1.5" style={{ color: t.overdue ? "var(--red)" : "var(--muted)" }}>
                      截止 {t.due_date} · {t.percent}% 完成
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          <p className="text-xs mt-3" style={{ color: "var(--muted)" }}>
            进度按你在「内容生成」里的实际产出自动统计
          </p>
        </div>
      )}

      {/* 待办与提醒（通知中心 + 优先待办 合并，去重复、更紧凑） */}
      <div className="rounded-xl p-6 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: "var(--ink)" }}>
            📌 待办与提醒
            {highPriorityCount > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(239,68,68,0.15)", color: "var(--red)" }}>
                {highPriorityCount} 条紧急
              </span>
            )}
          </h3>
        </div>

        {priorityItems.length === 0 && notifications.length === 0 ? (
          <div className="text-center py-8" style={{ color: "var(--muted)" }}>
            <div className="text-3xl mb-2">🎉</div>
            <p className="text-sm">暂无待办</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {/* 优先待办：要立即处理的 */}
            {priorityItems.map((item) => (
              <Link key={item.id} href={item.href}
                className="flex items-center gap-3 rounded-lg px-4 py-3 transition-colors"
                style={{ background: "var(--surface-soft)", textDecoration: "none", color: "inherit" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--border)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}>
                <span className="text-lg flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium flex-1 truncate" style={{ color: "var(--ink)" }}>{item.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ background: `color-mix(in srgb, ${item.badgeColor} 15%, transparent)`, color: item.badgeColor }}>
                  {item.badge}
                </span>
                <span className="text-xs flex-shrink-0 hidden sm:inline" style={{ color: "var(--muted)" }}>{item.hint}</span>
              </Link>
            ))}

            {/* 系统提醒（通知） */}
            {visibleNotifications.map((notif) => (
              <NotificationRow key={notif.id} notification={notif} />
            ))}

            {notifications.length > 5 && (
              <button
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                className="w-full mt-1 text-xs py-2 rounded-lg transition-colors"
                style={{ color: "var(--brand)", background: "transparent" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-soft)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                {showAllNotifications ? "收起提醒" : `查看全部 ${notifications.length} 条提醒`}
              </button>
            )}
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

function NotificationRow({ notification }: { notification: Notification }) {
  const priorityStyles: Record<string, { bg: string; border: string }> = {
    high: { bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.15)" },
    medium: { bg: "rgba(245,158,11,0.05)", border: "rgba(245,158,11,0.15)" },
    low: { bg: "var(--surface-soft)", border: "var(--border)" },
  };
  const style = priorityStyles[notification.priority] || priorityStyles.low;

  const content = (
    <div
      className="flex items-start gap-3 rounded-lg px-4 py-3 transition-colors"
      style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
      onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
    >
      <span className="text-lg flex-shrink-0 mt-0.5">{notification.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
            {notification.title}
          </span>
          <span
            className="text-xs px-1.5 py-0.5 rounded font-medium flex-shrink-0"
            style={{
              background:
                notification.priority === "high"
                  ? "rgba(239,68,68,0.15)"
                  : notification.priority === "medium"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(148,163,184,0.15)",
              color:
                notification.priority === "high"
                  ? "var(--red)"
                  : notification.priority === "medium"
                  ? "var(--amber)"
                  : "var(--muted)",
            }}
          >
            {notification.priority === "high" ? "紧急" : notification.priority === "medium" ? "注意" : "提示"}
          </span>
        </div>
        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--muted)" }}>
          {notification.message}
        </p>
      </div>
    </div>
  );

  if (notification.href) {
    return (
      <Link href={notification.href} style={{ textDecoration: "none", color: "inherit" }}>
        {content}
      </Link>
    );
  }
  return content;
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
