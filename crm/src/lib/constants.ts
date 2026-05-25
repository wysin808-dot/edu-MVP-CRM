// ── Platform Configuration ──
export const PLATFORMS = [
  { id: "小红书", name: "小红书", label: "小红书", icon: "📕", priority: 5, budgetPercent: 35 },
  { id: "抖音", name: "抖音", label: "抖音", icon: "🎵", priority: 4, budgetPercent: 20 },
  { id: "视频号", name: "视频号", label: "视频号", icon: "📹", priority: 3, budgetPercent: 15 },
  { id: "公众号", name: "公众号", label: "公众号", icon: "📰", priority: 3, budgetPercent: 8 },
  { id: "独立站SEO", name: "独立站SEO", label: "独立站SEO", icon: "🌐", priority: 4, budgetPercent: 12 },
  { id: "知乎", name: "知乎", label: "知乎", icon: "💡", priority: 2, budgetPercent: 5 },
  { id: "Google/YouTube", name: "Google/YouTube", label: "Google/YouTube", icon: "▶️", priority: 2, budgetPercent: 3 },
  { id: "Facebook/IG", name: "Facebook/IG", label: "Facebook/IG", icon: "📘", priority: 2, budgetPercent: 2 },
] as const;

export const PLATFORM_NAMES = PLATFORMS.map((p) => p.name);
export const PLATFORM_ICON_MAP: Record<string, string> = Object.fromEntries(
  PLATFORMS.map((p) => [p.name, p.icon])
);

// ── Content Status Flow ──
export const CONTENT_STATUSES = [
  "草稿",
  "待审核",
  "审核中",
  "已通过",
  "已发布",
  "已归档",
] as const;

// ── Content Strategy Tags ──
export const FUNNEL_STAGES = [
  "Awareness",
  "Consideration",
  "Trust",
  "Visit",
  "Enroll",
] as const;

export const EMOTIONAL_TRIGGERS = [
  "反常识",
  "焦虑共鸣",
  "向往",
  "痛点直击",
  "好奇驱动",
  "数字震撼",
  "案例代入",
] as const;

export const CONTENT_TYPES = [
  "干货",
  "情绪",
  "案例",
  "校园",
  "对比",
  "政策",
] as const;

export const TOPIC_CLUSTERS = [
  "WACE",
  "A-Level",
  "IB",
  "升学",
  "择校",
  "陪读",
  "校园",
  "其他",
] as const;

export const LEAD_MAGNETS = [
  "路径选择表",
  "评估表",
  "学费明细",
  "选课指南",
  "校历日程",
  "家长手册",
  "面试准备",
] as const;

export const REPURPOSE_STATUSES = [
  "原稿",
  "改写中",
  "已发多平台",
  "归档",
  "弃用",
] as const;

// ── CRM Stages ──
export const CRM_STAGES = [
  "新线索",
  "已咨询",
  "预约到访",
  "已缴费",
  "已流失",
] as const;

// ── Account Stages ──
export const ACCOUNT_STAGES = ["养号", "增长号", "转化号"] as const;

// ── Knowledge ──
export const REVIEW_CYCLES = ["每月", "每季", "每半年", "每年"] as const;
export const SOURCE_TYPES = ["官方数据", "行业报告", "人工整理", "第三方平台"] as const;
export const VISIBILITY_OPTIONS = ["内部", "公开", "受限"] as const;

// ── Role Configuration ──
export type UserRole = "admin" | "lead" | "operator" | "ai" | "admission";

export interface RoleConfig {
  title: string;
  summary: string;
  nav: string[];
  defaultUser: string;
  team: string;
}

export const ROLE_CONFIG: Record<UserRole, RoleConfig> = {
  operator: {
    title: "运营人员",
    summary: "负责账号内容生产、提交审核、发布归档和数据回填。",
    nav: ["dashboard", "publishing", "content", "knowledge", "calendar", "crm"],
    defaultUser: "运营 A",
    team: "china",
  },
  lead: {
    title: "部门负责人",
    summary: "集中检查待审核内容、账号发布进度、内容效果和线索来源。",
    nav: [
      "dashboard", "publishing", "content", "knowledge", "ai",
      "personas", "accounts", "calendar", "crm", "analytics", "settings",
    ],
    defaultUser: "Ocean Wang",
    team: "hq",
  },
  admin: {
    title: "超级管理员",
    summary: "管理用户、角色、账号、IP、资料库和全局数据权限。",
    nav: [
      "dashboard", "publishing", "content", "knowledge", "ai",
      "personas", "accounts", "calendar", "crm", "analytics", "team", "settings",
    ],
    defaultUser: "管理员",
    team: "hq",
  },
  ai: {
    title: "AI 内容编辑",
    summary: "基于真实资料库生成内容，保存 prompt、版本和采用记录。",
    nav: ["dashboard", "content", "knowledge", "ai", "calendar"],
    defaultUser: "AI 编辑",
    team: "china",
  },
  admission: {
    title: "招生顾问",
    summary: "跟进分配线索，查看来源内容，记录到访、报名和流失结果。",
    nav: ["dashboard", "crm"],
    defaultUser: "招生顾问",
    team: "china",
  },
};

// ── Navigation Items ──
export interface NavItem {
  id: string;
  label: string;
  icon: string;
  href: string;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "工作台", icon: "📊", href: "/dashboard" },
  { id: "publishing", label: "今日发布", icon: "📤", href: "/publishing" },
  { id: "content", label: "内容资产库", icon: "📝", href: "/content" },
  { id: "knowledge", label: "真实资料库", icon: "📚", href: "/knowledge" },
  { id: "ai", label: "AI 内容库", icon: "🤖", href: "/ai" },
  { id: "personas", label: "IP 矩阵", icon: "👤", href: "/personas" },
  { id: "accounts", label: "账号矩阵", icon: "📱", href: "/accounts" },
  { id: "calendar", label: "内容日历", icon: "📅", href: "/calendar" },
  { id: "crm", label: "招生 CRM", icon: "🎯", href: "/crm" },
  { id: "analytics", label: "数据复盘", icon: "📈", href: "/analytics" },
  { id: "settings", label: "系统设置", icon: "⚙️", href: "/settings" },
];
