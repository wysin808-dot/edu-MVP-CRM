import type { Content, CrmLead } from "@/lib/types";
import { localDateStr } from "@/lib/utils";

// ── 14 种通知类型 ──

export interface Notification {
  id: string;
  type: NotificationType;
  icon: string;
  title: string;
  message: string;
  href?: string;
  priority: "high" | "medium" | "low";
  timestamp?: string;
}

export type NotificationType =
  | "review_pending"        // 1. 有内容待审核
  | "review_approved"       // 2. 内容审核通过
  | "review_rejected"       // 3. 内容被退回
  | "publish_today"         // 4. 今日有内容待发布
  | "publish_overdue"       // 5. 内容超期未发布
  | "lead_new"              // 6. 新线索进入
  | "lead_followup_today"   // 7. 今日需跟进线索
  | "lead_followup_overdue" // 8. 线索跟进已逾期
  | "lead_no_followup"      // 9. 线索无下次跟进日期
  | "wace_weekly_low"       // 10. WACE 本周产出不足
  | "wace_weekly_done"      // 11. WACE 本周达标
  | "content_no_metrics"    // 12. 已发布内容无数据回填
  | "content_draft_stale"   // 13. 草稿超过7天未更新
  | "content_high_leads";   // 14. 高线索内容提醒

/**
 * Generate all notifications based on current data.
 * This is a pure function — no side effects, no API calls.
 */
export function generateNotifications({
  contents,
  leads,
  waceThisWeek,
  waceTarget = 2,
}: {
  contents: Content[];
  leads: CrmLead[];
  waceThisWeek: number;
  waceTarget?: number;
}): Notification[] {
  const notifications: Notification[] = [];
  const today = localDateStr(new Date());
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 86_400_000;

  // ── 1. 待审核内容 ──
  const pendingReview = contents.filter((c) => c.status === "待审核" || c.status === "审核中");
  if (pendingReview.length > 0) {
    notifications.push({
      id: "review_pending",
      type: "review_pending",
      icon: "📋",
      title: "待审核内容",
      message: `有 ${pendingReview.length} 条内容等待审核`,
      href: "/content?status=待审核",
      priority: "high",
    });
  }

  // ── 2 & 3. 最近审核通过/退回的内容 ──
  contents.forEach((c) => {
    if (c.reviews && c.reviews.length > 0) {
      const latestReview = c.reviews[c.reviews.length - 1];
      const reviewTime = new Date(latestReview.created_at).getTime();
      // Only show recent reviews (within 24 hours)
      if (now - reviewTime < 86_400_000) {
        if (latestReview.action === "approve") {
          notifications.push({
            id: `approved_${c.id}`,
            type: "review_approved",
            icon: "✅",
            title: "审核通过",
            message: `「${c.title}」已通过审核`,
            href: `/content/${c.id}`,
            priority: "medium",
            timestamp: latestReview.created_at,
          });
        } else if (latestReview.action === "reject") {
          notifications.push({
            id: `rejected_${c.id}`,
            type: "review_rejected",
            icon: "❌",
            title: "内容被退回",
            message: `「${c.title}」被退回${latestReview.comment ? `: ${latestReview.comment}` : ""}`,
            href: `/content/${c.id}`,
            priority: "high",
            timestamp: latestReview.created_at,
          });
        }
      }
    }
  });

  // ── 4. 今日待发布 ──
  const todayPublish = contents.filter((c) => c.publish_date === today && c.status !== "已发布" && c.status !== "已归档");
  if (todayPublish.length > 0) {
    notifications.push({
      id: "publish_today",
      type: "publish_today",
      icon: "📤",
      title: "今日待发布",
      message: `${todayPublish.length} 条内容计划今日发布`,
      href: "/publishing",
      priority: "high",
    });
  }

  // ── 5. 超期未发布 ──
  const overdue = contents.filter((c) =>
    c.publish_date && c.publish_date < today &&
    c.status !== "已发布" && c.status !== "已归档"
  );
  if (overdue.length > 0) {
    notifications.push({
      id: "publish_overdue",
      type: "publish_overdue",
      icon: "⏰",
      title: "发布已逾期",
      message: `${overdue.length} 条内容已过计划发布日期`,
      href: "/content",
      priority: "high",
    });
  }

  // ── 6. 新线索（24小时内） ──
  const newLeads = leads.filter((l) =>
    l.stage === "新线索" && (now - new Date(l.created_at).getTime()) < 86_400_000
  );
  if (newLeads.length > 0) {
    notifications.push({
      id: "lead_new",
      type: "lead_new",
      icon: "🎯",
      title: "新线索",
      message: `今日新增 ${newLeads.length} 条线索`,
      href: "/crm",
      priority: "medium",
    });
  }

  // ── 7. 今日需跟进 ──
  const followupToday = leads.filter((l) => l.next_followup === today);
  if (followupToday.length > 0) {
    notifications.push({
      id: "lead_followup_today",
      type: "lead_followup_today",
      icon: "📞",
      title: "今日跟进",
      message: `${followupToday.length} 条线索需要今日跟进`,
      href: "/crm",
      priority: "high",
    });
  }

  // ── 8. 跟进已逾期 ──
  const followupOverdue = leads.filter((l) =>
    l.next_followup && l.next_followup < today &&
    l.stage !== "已缴费" && l.stage !== "已流失"
  );
  if (followupOverdue.length > 0) {
    notifications.push({
      id: "lead_followup_overdue",
      type: "lead_followup_overdue",
      icon: "🚨",
      title: "跟进已逾期",
      message: `${followupOverdue.length} 条线索跟进已逾期`,
      href: "/crm",
      priority: "high",
    });
  }

  // ── 9. 无跟进日期 ──
  const noFollowup = leads.filter((l) =>
    !l.next_followup && l.stage !== "已缴费" && l.stage !== "已流失"
  );
  if (noFollowup.length > 3) {
    notifications.push({
      id: "lead_no_followup",
      type: "lead_no_followup",
      icon: "⚠️",
      title: "未设跟进",
      message: `${noFollowup.length} 条线索未设置下次跟进日期`,
      href: "/crm",
      priority: "low",
    });
  }

  // ── 10 & 11. WACE 周报 ──
  if (waceThisWeek >= waceTarget) {
    notifications.push({
      id: "wace_weekly_done",
      type: "wace_weekly_done",
      icon: "🎉",
      title: "WACE 达标",
      message: `本周已产出 ${waceThisWeek} 篇 WACE 内容，达标！`,
      href: "/analytics",
      priority: "low",
    });
  } else {
    // Only show warning from Wednesday onwards (give time to catch up)
    const dayOfWeek = new Date().getDay();
    if (dayOfWeek >= 3) { // Wednesday+
      notifications.push({
        id: "wace_weekly_low",
        type: "wace_weekly_low",
        icon: "📊",
        title: "WACE 产出不足",
        message: `本周 WACE 内容仅 ${waceThisWeek}/${waceTarget} 篇，还需 ${waceTarget - waceThisWeek} 篇`,
        href: "/content",
        priority: "medium",
      });
    }
  }

  // ── 12. 已发布无数据 ──
  const publishedNoMetrics = contents.filter((c) =>
    c.status === "已发布" && !c.metrics &&
    c.publish_date && c.publish_date < today
  );
  if (publishedNoMetrics.length > 0) {
    notifications.push({
      id: "content_no_metrics",
      type: "content_no_metrics",
      icon: "📊",
      title: "数据待回填",
      message: `${publishedNoMetrics.length} 条已发布内容未回填数据`,
      href: "/content?status=已发布",
      priority: "medium",
    });
  }

  // ── 13. 草稿超7天 ──
  const staleDrafts = contents.filter((c) =>
    c.status === "草稿" && new Date(c.updated_at).getTime() < sevenDaysAgo
  );
  if (staleDrafts.length > 0) {
    notifications.push({
      id: "content_draft_stale",
      type: "content_draft_stale",
      icon: "📝",
      title: "陈旧草稿",
      message: `${staleDrafts.length} 条草稿超过7天未更新`,
      href: "/content?status=草稿",
      priority: "low",
    });
  }

  // ── 14. 高线索内容 ──
  const highLeadContents = contents.filter((c) =>
    c.metrics && c.metrics.leads >= 5
  );
  if (highLeadContents.length > 0) {
    highLeadContents.forEach((c) => {
      notifications.push({
        id: `high_leads_${c.id}`,
        type: "content_high_leads",
        icon: "🔥",
        title: "高线索内容",
        message: `「${c.title}」已产生 ${c.metrics!.leads} 条线索，考虑复用`,
        href: `/content/${c.id}`,
        priority: "medium",
      });
    });
  }

  // Sort: high > medium > low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return notifications;
}
