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
  "待定",
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
    nav: ["dashboard", "knowledge", "accounts", "calendar", "crm", "coach", "chat", "ai-assistant"],
    defaultUser: "运营 A",
    team: "china",
  },
  lead: {
    title: "部门负责人",
    summary: "集中检查待审核内容、账号发布进度、内容效果和线索来源。",
    nav: [
      "dashboard", "knowledge",
      "personas", "accounts", "phone-assets", "calendar", "crm", "coach", "tasks", "chat", "monitor", "ai-assistant", "analytics",
    ],
    defaultUser: "Ocean Wang",
    team: "hq",
  },
  admin: {
    title: "超级管理员",
    summary: "管理用户、角色、账号、IP、资料库和全局数据权限。",
    nav: [
      "dashboard", "knowledge",
      "personas", "accounts", "phone-assets", "calendar", "crm", "coach", "tasks", "chat", "monitor", "ai-assistant", "analytics", "settings",
    ],
    defaultUser: "管理员",
    team: "hq",
  },
  ai: {
    title: "AI 内容编辑",
    summary: "基于知识库生成内容，保存 prompt、版本和采用记录。",
    nav: ["dashboard", "knowledge", "calendar", "coach", "chat", "ai-assistant"],
    defaultUser: "AI 编辑",
    team: "china",
  },
  admission: {
    title: "招生顾问",
    summary: "跟进分配线索，查看来源内容，记录到访、报名和流失结果。",
    nav: ["dashboard", "crm", "coach", "chat", "ai-assistant"],
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
  { id: "knowledge", label: "知识与AI", icon: "📚", href: "/knowledge" },
  { id: "personas", label: "IP 矩阵", icon: "👤", href: "/personas" },
  { id: "accounts", label: "账号矩阵", icon: "📱", href: "/accounts" },
  { id: "phone-assets", label: "号码资产", icon: "📞", href: "/phone-assets" },
  { id: "calendar", label: "内容日历", icon: "📅", href: "/calendar" },
  { id: "crm", label: "招生 CRM", icon: "🎯", href: "/crm" },
  { id: "coach", label: "内容生产", icon: "💡", href: "/coach" },
  { id: "tasks", label: "任务中心", icon: "✅", href: "/tasks" },
  { id: "chat", label: "团队聊天", icon: "💬", href: "/chat" },
  { id: "monitor", label: "运营监控", icon: "🖥️", href: "/monitor" },
  { id: "ai-assistant", label: "AI升学助手", icon: "🤖", href: "/ai-assistant" },
  { id: "analytics", label: "数据复盘", icon: "📈", href: "/analytics" },
  { id: "settings", label: "系统设置", icon: "⚙️", href: "/settings" },
];


// ── Coach System Constants ──
export const COACH_PLATFORMS = [
  { id: "朋友圈", label: "微信朋友圈", icon: "💬" },
  { id: "小红书", label: "小红书", icon: "📕" },
  { id: "视频脚本", label: "视频号脚本", icon: "🎬" },
  { id: "家长私聊", label: "家长私聊话术", icon: "👨‍👩‍👧" },
  { id: "FAQ", label: "常见问答", icon: "❓" },
] as const;

export const COACH_CONTENT_TYPES = [
  "教育观点", "家长共情", "学生成长", "校园氛围", "升学路径",
  "节日热点", "招生转化", "私聊跟进", "小红书", "视频脚本",
] as const;

export const COACH_TOPICS = [
  "新加坡 O-Level", "WACE 国际高中", "AEIS 失败转轨", "英文弱学生规划",
  "中国初二/初三转轨", "新加坡国际教育", "NTU/NUS 升学路径", "国际学校择校",
  "高考后国际教育规划", "开学季", "毕业季", "儿童节", "母亲节",
  "考试季", "家长焦虑", "青春期孩子规划",
] as const;

export const COACH_AUDIENCE_TAGS = [
  "中国初二学生家长", "中国初三学生家长", "英文基础弱", "AEIS 失败",
  "想进新加坡政府学校", "想冲 NTU/NUS", "想走国际高中", "预算敏感",
  "高净值家庭", "已在新加坡", "国内准备转轨", "对 O-Level 不了解",
  "对 WACE 不了解", "家长焦虑型", "家长理性规划型",
] as const;

export const COACH_TONES = [
  { id: "专业稳重", label: "专业稳重", description: "适合发教育观点和路径分析" },
  { id: "家长共情", label: "家长共情", description: "适合触达焦虑或犹豫的家长" },
  { id: "高净值", label: "高净值家庭", description: "适合高端家庭，强调品质和资源" },
  { id: "焦虑安抚", label: "焦虑家长安抚", description: "适合面对焦虑家长，温和引导" },
  { id: "轻松自然", label: "轻松自然", description: "适合校园氛围和日常分享" },
  { id: "学术解释", label: "学术解释型", description: "适合解释升学政策和课程体系" },
] as const;
