/* ── Platform Configuration (editable via Settings) ── */
let platformConfig = JSON.parse(localStorage.getItem("bci_platforms") || "null") || [
  { name: "小红书", canBrowserOpen: true, icon: "📕", priority: 5, budgetPercent: 35 },
  { name: "抖音", canBrowserOpen: true, icon: "🎵", priority: 4, budgetPercent: 20 },
  { name: "视频号", canBrowserOpen: false, icon: "📹", priority: 3, budgetPercent: 15 },
  { name: "公众号", canBrowserOpen: true, icon: "📰", priority: 3, budgetPercent: 8 },
  { name: "独立站SEO", canBrowserOpen: true, icon: "🌐", priority: 4, budgetPercent: 12 },
  { name: "知乎", canBrowserOpen: true, icon: "💡", priority: 2, budgetPercent: 5 },
  { name: "Google/YouTube", canBrowserOpen: true, icon: "▶️", priority: 2, budgetPercent: 3 },
  { name: "Facebook/IG", canBrowserOpen: true, icon: "📘", priority: 2, budgetPercent: 2 },
];
function savePlatformConfig() { localStorage.setItem("bci_platforms", JSON.stringify(platformConfig)); }
function platformNames() { return platformConfig.map((p) => p.name); }
function platformOptions() { return platformConfig.map((p) => `<option>${p.name}</option>`).join(""); }

const roleCopy = {
  operator: {
    title: "运营人员",
    summary: "负责账号内容生产、提交审核、发布归档和数据回填。",
    nav: ["dashboard", "publishing", "content", "knowledge", "calendar", "crm"],
    user: "运营 A",
    contentFilter: "all",
    team: "china",
  },
  lead: {
    title: "部门负责人",
    summary: "集中检查待审核内容、账号发布进度、内容效果和线索来源。",
    nav: ["dashboard", "publishing", "content", "knowledge", "ai", "persona", "accounts", "calendar", "crm", "analytics", "settings"],
    user: "Ocean Wang",
    contentFilter: "all",
    team: "hq",
  },
  admin: {
    title: "超级管理员",
    summary: "管理用户、角色、账号、IP、资料库和全局数据权限。",
    nav: ["dashboard", "publishing", "content", "knowledge", "ai", "persona", "accounts", "calendar", "crm", "analytics", "team", "settings"],
    user: "管理员",
    contentFilter: "all",
    team: "hq",
  },
  ai: {
    title: "AI 内容编辑",
    summary: "基于真实资料库生成内容，保存 prompt、版本和采用记录。",
    nav: ["dashboard", "content", "knowledge", "ai", "calendar"],
    user: "AI 编辑",
    contentFilter: "all",
    team: "china",
  },
  admission: {
    title: "招生顾问",
    summary: "跟进分配线索，查看来源内容，记录到访、报名和流失结果。",
    nav: ["dashboard", "crm"],
    user: "招生顾问",
    contentFilter: "none",
    team: "china",
  },
};

/* ── TASK 5.3: RBAC Guards & Audit Log ── */
let auditLog = [];
const TEAM_LABELS = { china: "中国团队", singapore: "新加坡团队", hq: "总部" };

function isDemo() {
  return authMode === "local";
}

function requireAuth(action) {
  if (isDemo()) {
    showToast(`演示模式下无法${action || "执行此操作"}，请登录后操作。`);
    return false;
  }
  return true;
}

function addAuditLog(action, detail) {
  const role = document.querySelector("#role-select")?.value || "unknown";
  const user = authUser?.email || roleCopy[role]?.user || "demo";
  const team = roleCopy[role]?.team || "hq";
  auditLog.unshift({
    time: new Date().toISOString(),
    user,
    role,
    team,
    action,
    detail: typeof detail === "string" ? detail : JSON.stringify(detail),
  });
  // Keep last 200 entries
  if (auditLog.length > 200) auditLog.length = 200;
  // Persist to localStorage
  try {
    const saved = readSavedState();
    saved._auditLog = auditLog.slice(0, 100);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch (e) { /* ignore storage full */ }
}

/* ── TASK 7.2: Dark Mode Toggle ── */
function toggleDarkMode() {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";
  html.setAttribute("data-theme", isDark ? "light" : "dark");
  const btn = document.querySelector("#theme-toggle");
  if (btn) btn.textContent = isDark ? "🌙" : "☀️";
  try { localStorage.setItem("bci-theme", isDark ? "light" : "dark"); } catch(e) {}
}
// Restore theme preference on load
(function() {
  try {
    const savedTheme = localStorage.getItem("bci-theme");
    if (savedTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      setTimeout(() => { const btn = document.querySelector("#theme-toggle"); if (btn) btn.textContent = "☀️"; }, 100);
    }
  } catch(e) {}
})();

function getCurrentTeam() {
  const role = document.querySelector("#role-select")?.value || "admin";
  if (authUser?.user_metadata?.team) return authUser.user_metadata.team;
  return roleCopy[role]?.team || "hq";
}

function getFilteredContents() {
  const role = document.querySelector("#role-select").value;
  const config = roleCopy[role];
  if (config.contentFilter === "all") return contents;
  if (config.contentFilter === "none") return [];
  return contents.filter((c) => c.author === config.user || c.author === "当前用户");
}

function getMyAccounts() {
  const role = document.querySelector("#role-select").value;
  if (role === "lead" || role === "admin") return accounts;
  if (role === "admission") return [];
  // operator / ai: only own assigned accounts
  const myName = roleCopy[role].user;
  return accounts.filter((a) => a.operator === myName);
}

function getMyAccountNames() {
  return getMyAccounts().map((a) => a.accountName);
}

const tasks = [
  ["小红书 01", "WACE 可以申请 NUS 吗？", "待审核", "red"],
  ["视频号", "3 分钟讲清 ATAR 评分", "可发布", "green"],
  ["公众号", "BCI 7-12 年级转轨路径", "草稿", "blue"],
  ["小红书 03", "新加坡陪读签证 DP 规则", "待回填", "amber"],
  ["小红书 02", "WACE 选课组合决定 ATAR", "已发布", "muted"],
  ["视频号", "BCI 毕业生去向", "已发布", "muted"],
  ["公众号", "家长探校日实录", "已复盘", "muted"],
];

const posts = [
  ["2026-05-15", "小红书", "BCI升学顾问号", "升学顾问 IP", "WACE 选课组合决定 ATAR 上限，这样选最稳", "已发布", "当日数据"],
  ["2026-05-14", "视频号", "BCI官方视频号", "校长 IP", "BCI 历届毕业生去向：NUS/NTU/墨大都有谁", "已发布", "3日数据"],
  ["2026-05-13", "公众号", "BCI国际学校", "官方 IP", "家长探校日实录：一天看懂 BCI 的课程和氛围", "已复盘", "7日数据"],
  ["2026-05-11", "小红书", "BCI升学顾问号", "升学顾问 IP", "NTU 接受 WACE ATAR 作为录取参考吗", "待回填", "3日数据"],
  ["2026-05-11", "视频号", "BCI官方视频号", "校长 IP", "为什么 9 年级转轨国际课程要看科目组合", "已发布", "当日数据"],
  ["2026-05-10", "公众号", "BCI国际学校", "官方 IP", "WACE 课程结构：必修、选修和学分", "已复盘", "30日数据"],
  ["2026-05-10", "小红书", "BCI招生老师号", "招生老师 IP", "新加坡国际高中学费区间怎么判断", "已发布", "7日数据"],
];

const dailyTasks = [
  ["09:30", "小红书", "BCI升学顾问号", "升学顾问 IP", "新加坡高中不是越贵越好，真正要看这 3 点", "待发布", "green"],
  ["10:30", "小红书", "BCI升学顾问号", "升学顾问 IP", "NTU 接受 WACE ATAR 作为录取参考吗", "待发布", "green"],
  ["11:00", "视频号", "BCI官方视频号", "校长 IP", "为什么 9 年级转轨国际课程要看科目组合", "待审核", "red"],
  ["14:00", "小红书", "BCI招生老师号", "招生老师 IP", "新加坡国际高中学费区间怎么判断", "草稿修改", "blue"],
  ["15:00", "知乎", "BCI升学", "官方 IP", "WACE 成绩可以申请哪些澳洲大学", "待审核", "red"],
  ["16:30", "公众号", "BCI国际学校", "官方 IP", "WACE 课程结构：必修、选修和学分", "待归档", "amber"],
];

/* ── Runtime data arrays — populated from Supabase or SEED_DATA fallback ── */
let contents = [];
let knowledge = [];
let personas = [];
let accounts = [];
let crmLeads = [];
let teamMembers = [];
let aiPromptLibrary = [];

/* ── SEED DATA — used as fallback when no cloud/localStorage data exists ── */
const SEED_CONTENTS = [
  {
    title: "新加坡高中不是越贵越好，真正要看这 3 点",
    aiSearchReady: false,
    account: "新加坡初高中留学-新闻·小红书",
    audiencePersona: ["P1 陪读妈妈", "P2 国内待留学", "P3 转学家长"],
    author: "Ocean Wang",
    cta: "评论「择校」，我私信你《新加坡高中路径选择表》",
    contentType: "干货",
    emotionalTrigger: "理性避坑",
    funnelStage: "Awareness",
    leadMagnet: "新加坡高中路径选择表",
    notes: "W2 周计划内容。文案 + 6 张配图均已就位。待发布检查：PDF / 发布时间 / 「择校」微信自动回复。",
    primaryKeyword: "新加坡高中择校",
    promptsUsed: "标题改写·反常识公式 5 候选",
    publishDate: "2026-05-08",
    references: "新加坡国际高中学费区间 / BCI 课程资料",
    repurposeStatus: "可二改",
    repurposeSourceTitle: null,
    repurposeChildren: [],
    status: "已发布",
    topicCluster: "国际学校择校",
    waceFocus: false,
    metrics: { reads: 3420, likes: 156, comments: 47, shares: 28, privateMessages: 12, leads: 4 },
    reviewHistory: [
      { reviewer: "部门负责人", action: "revise", comment: "第 2 张配图数据需更新为 2026 年版本。", timestamp: "2026-05-07 10:30" },
      { reviewer: "部门负责人", action: "approve", comment: "已更新，准予发布。", timestamp: "2026-05-07 16:00" },
    ],
  },
  {
    title: "WACE 可以申请 NUS 吗？家长最容易误解这一点",
    aiSearchReady: true,
    account: "BCI升学顾问号",
    audiencePersona: ["P2 国内待留学", "P3 转学家长"],
    author: "AI 编辑",
    cta: "评论「WACE」，领取 WACE 升学路径清单",
    contentType: "升学科普",
    emotionalTrigger: "反常识",
    funnelStage: "Consideration",
    leadMagnet: "WACE 升学路径清单",
    notes: "调用 NTU/NUS WACE 录取要求，发布前需核实不同专业 ATAR 区间。",
    primaryKeyword: "WACE 申请 NUS",
    promptsUsed: "WACE 资料转小红书笔记",
    publishDate: "2026-05-11",
    references: "NTU 录取 WACE ATAR 要求 / WACE 课程结构",
    repurposeStatus: "可转视频号",
    repurposeSourceTitle: null,
    repurposeChildren: ["ATAR 90 不一定上 NUS，关键看这一步"],
    status: "待审核",
    topicCluster: "WACE升学",
    waceFocus: true,
    metrics: { reads: 0, likes: 0, comments: 0, shares: 0, privateMessages: 0, leads: 0 },
    reviewHistory: [
      { reviewer: "部门负责人", action: "revise", comment: "ATAR 数据需要核实最新年份，建议补充 2025-2026 年录取区间。标题可以更吸引眼球。", timestamp: "2026-05-10 14:30" },
    ],
  },
  {
    title: "ATAR 90 不一定上 NUS，关键看这一步",
    aiSearchReady: true,
    account: "BCI官方视频号",
    audiencePersona: ["P3 转学家长"],
    author: "内容组",
    cta: "私信「ATAR」获取科目组合建议",
    contentType: "视频口播",
    emotionalTrigger: "数字震撼",
    funnelStage: "Consideration",
    leadMagnet: "科目组合建议",
    notes: "适合校长 IP，语气稳，不要夸张承诺录取。",
    primaryKeyword: "ATAR 科目组合",
    promptsUsed: "视频号口播 60 秒结构",
    publishDate: "2026-05-11",
    references: "ATAR 评分体系 / NUS 录取要求",
    repurposeStatus: "已转小红书标题",
    repurposeSourceTitle: "WACE 可以申请 NUS 吗？家长最容易误解这一点",
    repurposeChildren: [],
    status: "可发布",
    topicCluster: "WACE升学",
    waceFocus: true,
    metrics: { reads: 8760, likes: 312, comments: 89, shares: 67, privateMessages: 31, leads: 7 },
    reviewHistory: [
      { reviewer: "部门负责人", action: "approve", comment: "数据准确，口播节奏好，可以发布。", timestamp: "2026-05-11 09:15" },
    ],
  },
  {
    title: "新加坡陪读签证 DP，家长最该先确认什么？",
    aiSearchReady: true,
    account: "BCI招生老师号",
    audiencePersona: ["P1 陪读妈妈"],
    author: "招生组",
    cta: "评论「陪读」，获取签证材料清单",
    contentType: "FAQ",
    emotionalTrigger: "痛点反问",
    funnelStage: "Consideration",
    leadMagnet: "签证材料清单",
    notes: "不可承诺签证结果。发布前复核 ICA/MOM 要求。",
    primaryKeyword: "新加坡陪读签证",
    promptsUsed: "招生朋友圈转化文案",
    publishDate: "2026-05-10",
    references: "新加坡陪读签证 DP 规则",
    repurposeStatus: "可二改",
    repurposeSourceTitle: null,
    repurposeChildren: [],
    status: "已发布",
    topicCluster: "陪读签证",
    waceFocus: false,
    metrics: { reads: 2180, likes: 94, comments: 31, shares: 18, privateMessages: 9, leads: 2 },
    reviewHistory: [
      { reviewer: "部门负责人", action: "approve", comment: "内容合规，注意不承诺签证结果。", timestamp: "2026-05-09 11:20" },
    ],
  },
  {
    title: "WACE 选课组合决定 ATAR 上限，这样选最稳",
    aiSearchReady: true,
    account: "BCI升学顾问号",
    audiencePersona: ["P2 国内待留学", "P3 转学家长"],
    author: "Ocean Wang",
    cta: "私信「选课」获取 WACE 科目组合推荐表",
    contentType: "干货",
    emotionalTrigger: "理性避坑",
    funnelStage: "Trust",
    leadMagnet: "WACE 科目组合推荐表",
    notes: "结合 BCI 自有选课数据和 SCSA 官方指南。",
    primaryKeyword: "WACE 选课组合",
    promptsUsed: "标题改写·反常识公式 5 候选",
    publishDate: "2026-05-15",
    references: "WACE 课程结构 / NTU 录取 WACE ATAR 要求",
    repurposeStatus: "可转视频号",
    repurposeSourceTitle: null,
    repurposeChildren: [],
    status: "已发布",
    topicCluster: "WACE升学",
    waceFocus: true,
    metrics: { reads: 1890, likes: 78, comments: 23, shares: 15, privateMessages: 8, leads: 3 },
    reviewHistory: [
      { reviewer: "部门负责人", action: "approve", comment: "选课建议准确，数据可靠。", timestamp: "2026-05-14 16:00" },
    ],
  },
  {
    title: "BCI 历届毕业生去向：NUS/NTU/墨大都有谁",
    aiSearchReady: false,
    account: "BCI官方视频号",
    audiencePersona: ["P2 国内待留学", "P3 转学家长"],
    author: "内容组",
    cta: "评论「录取」领取 BCI 历年录取数据",
    contentType: "案例",
    emotionalTrigger: "案例代入",
    funnelStage: "Trust",
    leadMagnet: "BCI 历年录取数据",
    notes: "需脱敏处理学生个人信息，只展示学校和专业。",
    primaryKeyword: "BCI 毕业生去向",
    promptsUsed: "视频号口播 60 秒结构",
    publishDate: "2026-05-14",
    references: "BCI 历届毕业生录取数据",
    repurposeStatus: "可转小红书标题",
    repurposeSourceTitle: null,
    repurposeChildren: [],
    status: "已发布",
    topicCluster: "BCI案例",
    waceFocus: false,
    metrics: { reads: 4520, likes: 201, comments: 56, shares: 34, privateMessages: 18, leads: 5 },
    reviewHistory: [
      { reviewer: "部门负责人", action: "approve", comment: "案例真实有说服力，已核实脱敏。", timestamp: "2026-05-13 15:30" },
    ],
  },
  {
    title: "家长探校日实录：一天看懂 BCI 的课程和氛围",
    aiSearchReady: false,
    account: "BCI国际学校",
    audiencePersona: ["P1 陪读妈妈", "P2 国内待留学"],
    author: "招生组",
    cta: "私信「探校」预约下一场开放日",
    contentType: "校园",
    emotionalTrigger: "向往",
    funnelStage: "Visit",
    leadMagnet: "开放日预约",
    notes: "配图用真实校园照片，注意学生隐私。",
    primaryKeyword: "BCI 探校",
    promptsUsed: null,
    publishDate: "2026-05-13",
    references: null,
    repurposeStatus: "原稿",
    repurposeSourceTitle: null,
    repurposeChildren: [],
    status: "已复盘",
    topicCluster: "BCI案例",
    waceFocus: false,
    metrics: { reads: 3150, likes: 167, comments: 42, shares: 29, privateMessages: 14, leads: 6 },
    reviewHistory: [
      { reviewer: "部门负责人", action: "approve", comment: "氛围好，已检查学生隐私。", timestamp: "2026-05-12 10:00" },
    ],
  },
];

const SEED_KNOWLEDGE = [
  {
    title: "NTU 录取 WACE ATAR 要求（按专业）",
    detail: "NTU 接受 WACE ATAR 作为录取标准。商学院 / 工学院 / 传媒学院 / 医学院要求不同。商学院、工学院通常需 ATAR 88+，医学院通常需 95+。",
    notes: "每年复查。待补 Engineering、Business、Computer Science、Medicine、Communication & Media Studies 的专业区间。",
    numericData: "Engineering: 待填；Business: 待填；Computer Science: 待填；Medicine: 待填",
    reviewCycle: "每年",
    source: "ntu.edu.sg/admissions/undergraduate",
    sourceType: "官方",
    subject: ["NTU", "WACE"],
    type: "录取分数",
    usedInContents: 4,
    verifiedBy: "Ocean",
    lastVerified: "待核实",
    visibility: "公开",
  },
  {
    title: "WACE 课程结构（必修 + 选修 + 学分）",
    detail: "WACE 由 Western Australia 体系管理，包含英语、学科组合、学分与毕业要求。",
    notes: "适合做转轨路径、课程解释、家长 FAQ。",
    numericData: "学分要求：待填",
    reviewCycle: "每年",
    source: "SCSA 官方资料",
    sourceType: "官方",
    subject: ["WACE", "课程"],
    type: "课程结构",
    usedInContents: 9,
    verifiedBy: "教务",
    lastVerified: "2026-04-18",
    visibility: "内部",
  },
  {
    title: "WACE 全球大学认可清单",
    detail: "WACE ATAR 在全球超过 200 所高校作为录取参考，适合解释国际认可度。",
    notes: "需要按国家整理：新加坡、澳洲、英国、美国、加拿大。",
    numericData: "认可高校数：200+",
    reviewCycle: "半年",
    source: "官方 / 大学招生页",
    sourceType: "混合来源",
    subject: ["WACE", "大学认可"],
    type: "认可清单",
    usedInContents: 7,
    verifiedBy: "升学顾问",
    lastVerified: "2026-03-20",
    visibility: "公开",
  },
  {
    title: "新加坡陪读签证（DP）规则",
    detail: "Dependent's Pass 规则与学生年龄、家长身份、学校类别相关，需要结合 ICA/MOM 官方要求复查。",
    notes: "适合招生咨询和家长 FAQ。不可在内容里承诺签证结果。",
    numericData: "年龄限制：待核实",
    reviewCycle: "每季",
    source: "ica.gov.sg / mom.gov.sg",
    sourceType: "官方",
    subject: ["签证", "新加坡"],
    type: "政策规则",
    usedInContents: 3,
    verifiedBy: "招生",
    lastVerified: "待核实",
    visibility: "内部",
  },
  {
    title: "新加坡国际高中学费区间（含 BCI）",
    detail: "新加坡国际高中学费受学校品牌、课程体系、年级和服务内容影响。BCI 可作为中高性价比路径对比。",
    notes: "避免直接贬低竞品，用区间和维度解释。",
    numericData: "年学费区间：待填",
    reviewCycle: "每年",
    source: "学校官网 / 内部招生资料",
    sourceType: "人工整理",
    subject: ["学费", "BCI", "竞品"],
    type: "价格区间",
    usedInContents: 6,
    verifiedBy: "Ocean",
    lastVerified: "2026-04-01",
    visibility: "内部",
  },
  {
    title: "BCI 历届毕业生录取数据",
    detail: "用于证明 BCI 升学结果，是高价值内容资料。需要脱敏展示学生案例。",
    notes: "发布前必须确认隐私授权。",
    numericData: "录取学校、专业、年份：待整理",
    reviewCycle: "每季",
    source: "内部升学记录",
    sourceType: "内部",
    subject: ["BCI", "毕业生", "录取"],
    type: "案例数据",
    usedInContents: 5,
    verifiedBy: "升学部",
    lastVerified: "2026-05-01",
    visibility: "私密",
  },
];

/* ── IP Category System (MCN 规划书 3.1 节) ── */
const IP_CATEGORIES = {
  school_official: { label: "校品牌官号", icon: "🏫", color: "blue", desc: "BCI 直系，校园实景/师资/升学" },
  real_person: { label: "真人 IP 号", icon: "👤", color: "green", desc: "新加坡本地员工，人格化+本地体感" },
  agency: { label: "纯中介号", icon: "📢", color: "amber", desc: "完全切割 BCI 品牌，工业化堆量" },
  ugc: { label: "UGC 半官方", icon: "🎓", color: "red", desc: "在读家长/学生/校友内容" },
  seo: { label: "独立站 SEO", icon: "🌐", color: "blue", desc: "英文内容，AI 草稿+人工审核" },
};

/* ── Content Type Categories (MCN 规划书 2.3 节) ── */
const CONTENT_TYPE_CATEGORIES = {
  "引流型": { target: 40, desc: "起量/博推荐", subtypes: ["干货", "升学科普", "对比", "政策", "情绪"] },
  "信任型": { target: 30, desc: "专业感/干货深度", subtypes: ["FAQ", "视频口播", "数据解读", "课程介绍"] },
  "案例型": { target: 20, desc: "转化/共鸣", subtypes: ["案例", "校园", "学生故事", "家长分享"] },
  "转化型": { target: 10, desc: "收口/活动", subtypes: ["探校活动", "限时咨询", "直播预告", "资料包"] },
};
const ALL_CONTENT_SUBTYPES = Object.values(CONTENT_TYPE_CATEGORIES).flatMap((c) => c.subtypes);

function getContentCategory(contentType) {
  for (const [cat, info] of Object.entries(CONTENT_TYPE_CATEGORIES)) {
    if (info.subtypes.includes(contentType)) return cat;
  }
  return "引流型"; // default
}

/* ── Brand Firewall (MCN 规划书 3.1 节 C 部分) ── */
const BRAND_FIREWALL_KEYWORDS = [
  "BCI", "博文", "Brentvale", "创始人", "三娃", "校徽",
  "bci.edu.sg", "校长", "Ocean Wang", "Ocean", "博文国际",
  "bci international", "brentvale college",
];

function checkBrandFirewall(text, accountName) {
  const acct = accounts.find((a) => a.accountName === accountName);
  if (!acct || acct.ipCategory !== "agency") return { pass: true, violations: [] };
  const lower = (text || "").toLowerCase();
  const violations = BRAND_FIREWALL_KEYWORDS.filter((kw) => lower.includes(kw.toLowerCase()));
  return { pass: violations.length === 0, violations };
}

const SEED_PERSONAS = [
  ["校长 IP", "权威背书", "视频号 / 公众号", "本月 18 条", "线索 11", "school_official"],
  ["升学顾问 IP", "路径规划", "小红书 / 视频号 / 抖音", "本月 34 条", "线索 27", "real_person"],
  ["招生老师 IP", "咨询转化", "小红书 / 朋友圈", "本月 29 条", "线索 23", "real_person"],
  ["学生案例 IP", "真实故事", "小红书 / 知乎", "本月 12 条", "线索 8", "ugc"],
  ["家长故事 IP", "信任建立", "视频号 / 公众号", "本月 7 条", "线索 5", "ugc"],
  ["BCI 官方 IP", "学校信息", "全平台", "本月 26 条", "线索 14", "school_official"],
  ["新加坡留学规划", "中介矩阵主号", "小红书 / 抖音", "本月 0 条", "线索 0", "agency"],
  ["陪读妈妈日记", "中介子号", "小红书 / 抖音", "本月 0 条", "线索 0", "agency"],
  ["SEO 英文站", "搜索引擎获客", "独立站SEO / Google", "本月 60 条", "线索 6", "seo"],
];

const SEED_ACCOUNTS = [
  {
    platform: "小红书",
    accountName: "BCI升学顾问号",
    ipCategory: "real_person",
    status: "运营中",
    contentCount: 34,
    handle: "https://www.xiaohongshu.com/user/profile/bci-counselor",
    investmentTier: "主力",
    ownerType: "自营",
    persona: "升学顾问 IP",
    talent: "升学顾问",
    entityName: "BCI International",
    entityType: "学校",
    operator: "运营 A",
    stage: "增长号",
    monthlyPosts: 34,
    leads: 27,
    monthlySpend: 3000,
  },
  {
    platform: "小红书",
    accountName: "BCI招生老师号",
    ipCategory: "real_person",
    status: "运营中",
    contentCount: 29,
    handle: "https://www.xiaohongshu.com/user/profile/bci-admission",
    investmentTier: "主力",
    ownerType: "自营",
    persona: "招生老师 IP",
    talent: "招生老师",
    entityName: "BCI International",
    entityType: "学校",
    operator: "运营 B",
    stage: "增长号",
    monthlyPosts: 29,
    leads: 23,
    monthlySpend: 2000,
  },
  {
    platform: "公众号",
    accountName: "BCI国际学校",
    ipCategory: "school_official",
    status: "运营中",
    contentCount: 36,
    handle: "微信公众号",
    investmentTier: "核心",
    ownerType: "自营",
    persona: "BCI 官方 IP",
    talent: "校方品牌",
    entityName: "BCI International",
    entityType: "学校",
    operator: "运营 A",
    stage: "增长",
    monthlyPosts: 8,
    leads: 15,
    monthlySpend: 500,
  },
  {
    platform: "视频号",
    accountName: "BCI官方视频号",
    ipCategory: "school_official",
    status: "运营中",
    contentCount: 18,
    handle: "微信视频号后台",
    investmentTier: "主力",
    ownerType: "自营",
    persona: "校长 IP",
    talent: "校长",
    entityName: "BCI International",
    entityType: "学校",
    operator: "运营 B",
    stage: "转化号",
    monthlyPosts: 18,
    leads: 11,
    monthlySpend: 1500,
  },
  {
    platform: "知乎",
    accountName: "BCI升学",
    ipCategory: "school_official",
    status: "运营中",
    contentCount: 12,
    handle: "https://www.zhihu.com/people/bci-edu",
    investmentTier: "辅助",
    ownerType: "自营",
    persona: "BCI 官方 IP",
    talent: "校方品牌",
    entityName: "BCI International",
    entityType: "学校",
    operator: "Ocean Wang",
    stage: "增长",
    monthlyPosts: 4,
    leads: 9,
    monthlySpend: 800,
  },
  {
    platform: "抖音",
    accountName: "BCI博文国际学院",
    ipCategory: "school_official",
    status: "筹备",
    contentCount: 0,
    handle: "待开通",
    investmentTier: "主力",
    ownerType: "自营",
    persona: "校长 IP",
    talent: "校长",
    entityName: "BCI International",
    entityType: "学校",
    operator: "运营 B",
    stage: "养号",
    monthlyPosts: 0,
    leads: 0,
    monthlySpend: 0,
  },
  {
    platform: "抖音",
    accountName: "新加坡留学规划中心",
    ipCategory: "agency",
    status: "筹备",
    contentCount: 0,
    handle: "待开通",
    investmentTier: "主力",
    ownerType: "自营",
    persona: "新加坡留学规划",
    talent: "运营团队",
    entityName: "独立主体",
    entityType: "中介",
    operator: "运营 A",
    stage: "养号",
    monthlyPosts: 0,
    leads: 0,
    monthlySpend: 0,
  },
  {
    platform: "独立站SEO",
    accountName: "wace.edu.sg",
    ipCategory: "seo",
    status: "运营中",
    contentCount: 45,
    handle: "https://wace.edu.sg",
    investmentTier: "核心",
    ownerType: "自营",
    persona: "SEO 英文站",
    talent: "校方品牌",
    entityName: "BCI International",
    entityType: "学校",
    operator: "Ocean Wang",
    stage: "增长",
    monthlyPosts: 60,
    leads: 6,
    monthlySpend: 2000,
  },
  {
    platform: "Google/YouTube",
    accountName: "BCI International School",
    ipCategory: "school_official",
    status: "筹备",
    contentCount: 0,
    handle: "待开通",
    investmentTier: "辅助",
    ownerType: "自营",
    persona: "BCI 官方 IP",
    talent: "校方品牌",
    entityName: "BCI International",
    entityType: "学校",
    operator: "Ocean Wang",
    stage: "养号",
    monthlyPosts: 0,
    leads: 0,
    monthlySpend: 0,
  },
  {
    platform: "Facebook/IG",
    accountName: "BCI Singapore",
    ipCategory: "school_official",
    status: "筹备",
    contentCount: 0,
    handle: "待开通",
    investmentTier: "辅助",
    ownerType: "自营",
    persona: "BCI 官方 IP",
    talent: "校方品牌",
    entityName: "BCI International",
    entityType: "学校",
    operator: "Ocean Wang",
    stage: "养号",
    monthlyPosts: 0,
    leads: 0,
    monthlySpend: 0,
  },
];

const SEED_CRM_LEADS = [
  { name: "G9 学生家长", source: "来自小红书：WACE 申请 NUS", stage: "私信咨询", assignee: "", date: "2026-05-13", sourceLink: "https://www.xiaohongshu.com/explore/example001", channel: "小红书", leadType: "direct", followUps: [] },
  { name: "G10 转轨家庭", source: "来自视频号：ATAR 评分", stage: "私信咨询", assignee: "", date: "2026-05-12", sourceLink: "", channel: "视频号", leadType: "direct", followUps: [] },
  { name: "G8 学生家长", source: "来源：招生老师 IP", stage: "加企微", assignee: "招生顾问", date: "2026-05-10", sourceLink: "https://www.xiaohongshu.com/explore/example002", channel: "小红书", wechatId: "parent_g8_zhang", wechatAddTime: "2026-05-10T14:30:00Z", leadType: "direct", followUps: [{ date: "2026-05-10", note: "已通过企微好友验证", nextAction: "发课程资料", nextDate: "2026-05-12", author: "招生顾问" }] },
  { name: "G11 插班咨询", source: "来源：公众号学费文章", stage: "加企微", assignee: "招生顾问", date: "2026-05-09", sourceLink: "https://mp.weixin.qq.com/s/example003", channel: "公众号", wechatId: "parent_g11_li", wechatAddTime: "2026-05-09T11:20:00Z", leadType: "direct", followUps: [] },
  { name: "G9 学生家长（张）", source: "周六开放日", stage: "留电/视频", assignee: "招生顾问", date: "2026-05-08", channel: "线下", leadType: "direct", expectedRevenue: 180000, followUps: [{ date: "2026-05-08", note: "开放日现场登记，对 WACE 很感兴趣", nextAction: "约试听课", nextDate: "2026-05-15", author: "招生顾问" }] },
  { name: "G7 家庭", source: "校园参观", stage: "试听/到访", assignee: "招生顾问", date: "2026-05-07", channel: "线下", leadType: "direct", expectedRevenue: 180000, followUps: [] },
  { name: "G10 学生", source: "已签约", stage: "签约", assignee: "招生顾问", date: "2026-04-28", channel: "小红书", leadType: "direct", expectedRevenue: 180000, followUps: [] },
  { name: "G12 家庭", source: "流失：时间不匹配", stage: "流失", assignee: "招生顾问", date: "2026-05-01", channel: "视频号", leadType: "direct", followUps: [] },
  { name: "G9 小红书私信", source: "来自小红书：WACE 选课", stage: "私信咨询", assignee: "", date: "2026-05-15", sourceLink: "", channel: "小红书", leadType: "direct", followUps: [] },
  { name: "G10 家长（李）", source: "来自抖音评论区", stage: "私信咨询", assignee: "", date: "2026-05-14", sourceLink: "", channel: "抖音", leadType: "direct", followUps: [] },
  // 中介分发线索
  { name: "G9 中介-王同学", source: "中介：新学途教育推荐", stage: "留电/视频", assignee: "招生顾问", date: "2026-05-11", channel: "中介", leadType: "agent", agentName: "新学途教育", commissionRate: 10, expectedRevenue: 180000, followUps: [{ date: "2026-05-11", note: "中介推荐，学生在深圳国际学校就读", nextAction: "安排线上面试", nextDate: "2026-05-18", author: "招生顾问" }] },
  { name: "G10 中介-陈同学", source: "中介：环球留学顾问", stage: "加企微", assignee: "招生顾问", date: "2026-05-06", channel: "中介", leadType: "agent", agentName: "环球留学顾问", commissionRate: 8, expectedRevenue: 180000, followUps: [] },
  // 合作学校线索
  { name: "G9 合作校-林同学", source: "合作学校：深圳实验中学", stage: "试听/到访", assignee: "招生顾问", date: "2026-05-05", channel: "合作学校", leadType: "partner_school", partnerSchool: "深圳实验中学", expectedRevenue: 160000, followUps: [{ date: "2026-05-05", note: "合作校推荐优秀学生，已到校参观", nextAction: "发录取通知", nextDate: "2026-05-10", author: "招生顾问" }] },
];
const crmStages = ["私信咨询", "加企微", "留电/视频", "试听/到访", "签约", "流失"];

/* ── CRM Funnel Targets (MCN 规划书 9.2 节) ── */
const CRM_FUNNEL_TARGETS = {
  "私信咨询": { monthlyTarget: 1500, conversionLabel: "曝光→私信", targetRate: 0.05 },
  "加企微": { monthlyTarget: 300, conversionLabel: "私信→加微", targetRate: 20 },
  "留电/视频": { monthlyTarget: 100, conversionLabel: "加微→深聊", targetRate: 33 },
  "试听/到访": { monthlyTarget: 30, conversionLabel: "深聊→试听", targetRate: 30 },
  "签约": { monthlyTarget: 8, conversionLabel: "试听→签约", targetRate: 27 },
};
const CRM_RED_LINES = [
  { check: "私信→加微", threshold: 10, desc: "私信→加微转化率 < 10%" },
  { check: "加微→试听", threshold: 20, desc: "加微→试听转化率 < 20%" },
  { check: "试听→签约", threshold: 25, desc: "试听→签约转化率 < 25%" },
];

const permissions = [
  ["超级管理员", "全系统", "用户、角色、账号、IP、资料、CRM、导出"],
  ["部门负责人", "全内容与复盘", "审核、驳回、锁定、查看所有账号表现"],
  ["运营人员", "被分配账号", "创建内容、提交审核、发布归档、数据回填"],
  ["AI 内容编辑", "资料与 AI 库", "生成内容、保存 prompt、转内容资产"],
  ["招生顾问", "分配线索", "跟进 CRM、记录到访、反馈线索质量"],
];

const SEED_TEAM_MEMBERS = [
  { name: "Ocean Wang", email: "ocean@bci.edu.sg", role: "部门负责人", accounts: "全部账号 + 知乎", status: "在职", joinDate: "2025-08-01" },
  { name: "运营 A", email: "opa@bci.edu.sg", role: "运营人员", accounts: "BCI升学顾问号, BCI国际学校", status: "在职", joinDate: "2026-02-01" },
  { name: "运营 B", email: "opb@bci.edu.sg", role: "运营人员", accounts: "BCI招生老师号, BCI官方视频号", status: "在职", joinDate: "2026-02-01" },
  { name: "AI 编辑", email: "ai@bci.edu.sg", role: "AI 内容编辑", accounts: "—", status: "在职", joinDate: "2026-03-01" },
  { name: "招生顾问", email: "advisor@bci.edu.sg", role: "招生顾问", accounts: "—", status: "在职", joinDate: "2026-01-20" },
];

const SEED_AI_PROMPTS = [
  {
    title: "标题改写·反常识公式 5 候选",
    author: "Ocean",
    lastUsed: "待使用",
    notes: "任何平台都能用。五个候选覆盖 5 种钩子型：反常识数字 / 痛点反问 / 数字震撼 / 情绪反差 / 好奇留白。",
    outputExamples: "5 个候选 + 每个标题对应的钩子类型 + 预计点击率等级评判",
    platform: "通用",
    promptTemplate:
      "帮我把这条标题改写成 5 个候选版本，分别使用 5 种钩子公式。原标题：{{title}}。候选要求：1 反常识+数字；2 痛点直击+反问；3 数字震撼+颠覆；4 情绪共鸣+反差；5 好奇驱动+留白。",
    qualityRating: "5星",
    stage: "标题",
    targetPersona: "通用",
    useCount: 2,
  },
  {
    title: "WACE 资料转小红书笔记",
    author: "AI 编辑",
    lastUsed: "2026-05-10",
    notes: "适合把官方资料改写成家长看得懂的小红书结构，避免太学术。",
    outputExamples: "标题 3 个 + 正文 1 版 + 评论区引导 3 条",
    platform: "小红书",
    promptTemplate:
      "基于以下真实资料 {{knowledge}}，写一篇面向 9-10 年级家长的小红书笔记。要求：开头先说家长误区，中间解释 WACE/ATAR，结尾引导咨询。",
    qualityRating: "4星",
    stage: "正文",
    targetPersona: "升学顾问 IP",
    useCount: 8,
  },
  {
    title: "视频号口播 60 秒结构",
    author: "内容组",
    lastUsed: "2026-05-09",
    notes: "适合校长 IP、升学顾问 IP，语气要稳，不要太营销。",
    outputExamples: "开场 5 秒钩子 + 3 个要点 + 结尾行动",
    platform: "视频号",
    promptTemplate:
      "把资料 {{knowledge}} 改成 60 秒视频号口播。结构：一句家长问题开场，三个事实点，每点不超过 20 秒，结尾给一个清晰建议。",
    qualityRating: "4星",
    stage: "脚本",
    targetPersona: "校长 IP / 升学顾问 IP",
    useCount: 5,
  },
  {
    title: "招生朋友圈转化文案",
    author: "招生组",
    lastUsed: "2026-05-08",
    notes: "适合开放日、咨询邀约，不要写得像广告。",
    outputExamples: "朋友圈正文 + 私信回复话术 + 家长问题引导",
    platform: "朋友圈",
    promptTemplate:
      "基于内容 {{content}}，改写成招生老师朋友圈文案。要求自然、有场景、有家长痛点，最后引导私信咨询。",
    qualityRating: "5星",
    stage: "转化",
    targetPersona: "招生老师 IP",
    useCount: 11,
  },
];

const STORAGE_KEY = "bci-media-crm-prototype-v1";
const CLOUD_STATUS_KEY = "bci-cloud-status";
const CLOUD_COLLECTIONS = ["contents", "knowledge", "personas", "accounts", "posts"];
let currentModalAction = "";
let cloudClient = null;
let cloudReady = false;

function setCloudStatus(message, mode = "local") {
  window.sessionStorage.setItem(CLOUD_STATUS_KEY, JSON.stringify({ message, mode }));
}

function getCloudStatus() {
  try {
    return JSON.parse(window.sessionStorage.getItem(CLOUD_STATUS_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function createId() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function replaceRecords(target, records) {
  if (!records.length) return;
  target.splice(0, target.length, ...records);
}

function seedDefaults() {
  // Populate arrays from SEED_DATA if they're still empty (no cloud/localStorage data)
  if (contents.length === 0) contents.push(...SEED_CONTENTS);
  if (knowledge.length === 0) knowledge.push(...SEED_KNOWLEDGE);
  if (personas.length === 0) personas.push(...SEED_PERSONAS);
  if (accounts.length === 0) accounts.push(...SEED_ACCOUNTS);
  if (crmLeads.length === 0) crmLeads.push(...SEED_CRM_LEADS);
  if (teamMembers.length === 0) teamMembers.push(...SEED_TEAM_MEMBERS);
  if (aiPromptLibrary.length === 0) aiPromptLibrary.push(...SEED_AI_PROMPTS);
}

function loadSavedState() {
  // First seed with defaults so content updates can be applied
  seedDefaults();

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    // Apply content updates (status, reviewHistory, etc.) to seeded items
    (saved._contentUpdates || []).forEach((upd) => {
      const existing = contents.find((c) => c.title === upd.title);
      if (existing) Object.assign(existing, upd);
    });
    // Append any user-created items from localStorage
    (saved.contents || []).filter((item) => item && typeof item === "object" && !Array.isArray(item) && item.title && !contents.find(c => c.title === item.title)).forEach((item) => contents.unshift(item));
    (saved.knowledge || []).filter(item => !knowledge.find(k => k.title === item.title)).forEach((item) => knowledge.unshift(item));
    (saved.personas || []).forEach((item) => { if (!personas.find(p => p[0] === (item[0] || item.name))) personas.unshift(item); });
    (saved.accounts || []).forEach((item) => { if (!accounts.find(a => a.accountName === item.accountName)) accounts.unshift(item); });
    (saved.posts || []).forEach((item) => posts.unshift(item));
    // Apply CRM lead updates
    (saved._crmUpdates || []).forEach((upd) => {
      const existing = crmLeads.find((l) => l.name === upd.name);
      if (existing) Object.assign(existing, upd);
    });
    // Load audit log
    if (saved._auditLog) auditLog = saved._auditLog;
  } catch (error) {
    console.warn("Could not load system data", error);
  }
}

function readSavedState() {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || {};
  } catch (error) {
    return {};
  }
}

function persistRecord(collection, record) {
  const saved = readSavedState();
  saved[collection] = saved[collection] || [];
  saved[collection].unshift(record);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

function persistContentUpdate(item) {
  // Always save to localStorage
  const saved = readSavedState();
  saved._contentUpdates = saved._contentUpdates || [];
  const idx = saved._contentUpdates.findIndex((u) => u.title === item.title);
  const snapshot = {
    title: item.title, status: item.status, reviewHistory: item.reviewHistory,
    metrics: item.metrics, funnelStage: item.funnelStage, emotionalTrigger: item.emotionalTrigger,
    contentType: item.contentType, leadMagnet: item.leadMagnet, primaryKeyword: item.primaryKeyword,
    topicCluster: item.topicCluster, repurposeStatus: item.repurposeStatus, waceFocus: item.waceFocus,
    references: item.references, cta: item.cta, notes: item.notes, comments: item.comments,
  };
  if (idx >= 0) saved._contentUpdates[idx] = snapshot;
  else saved._contentUpdates.push(snapshot);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  // Also sync to Supabase if connected
  if (cloudReady && cloudClient) {
    updateRecordOnline("contents", item).catch(err => console.warn("Cloud update failed:", err));
  }
}

async function updateRecordOnline(collection, record) {
  if (!cloudReady || !cloudClient) return "local";
  const tableMap = { contents: "content_items", knowledge: "knowledge_items", personas: "ip_personas", accounts: "account_matrix", posts: "published_posts", crm: "crm_leads" };
  const table = tableMap[collection];
  if (!table) return "local";

  // Build update payload (only changed fields)
  const payload = toCloudUpdatePayload(collection, record);
  if (!payload || Object.keys(payload).length === 0) return "local";

  // Try to match by title (since records may not have cloud UUID)
  const matchField = collection === "crm" ? "name" : "title";
  const matchValue = collection === "crm" ? record.name : record.title;

  const { error } = await cloudClient.from(table).update(payload).eq(matchField, matchValue);
  if (error) {
    console.warn(`Cloud update failed for ${collection}:`, error);
    return "local";
  }
  updateSyncIndicator("synced");
  return "cloud";
}

function toCloudUpdatePayload(collection, record) {
  if (collection === "contents") {
    const payload = {};
    if (record.status) payload.status = record.status;
    if (record.funnelStage) payload.funnel_stage = record.funnelStage;
    if (record.emotionalTrigger) payload.emotional_trigger = record.emotionalTrigger;
    if (record.contentType) payload.content_type = record.contentType;
    if (record.leadMagnet) payload.lead_magnet = record.leadMagnet;
    if (record.primaryKeyword) payload.primary_keyword = record.primaryKeyword;
    if (record.topicCluster) payload.topic_cluster = record.topicCluster;
    if (record.repurposeStatus) payload.repurpose_status = record.repurposeStatus;
    if (record.waceFocus !== undefined) payload.wace_focus = record.waceFocus;
    if (record.references) payload["references"] = record.references;
    if (record.cta) payload.cta = record.cta;
    if (record.notes) payload.notes = record.notes;
    if (record.metrics) {
      payload.metric_reads = record.metrics.reads || 0;
      payload.metric_likes = record.metrics.likes || 0;
      payload.metric_comments = record.metrics.comments || 0;
      payload.metric_shares = record.metrics.shares || 0;
      payload.metric_private_messages = record.metrics.privateMessages || 0;
      payload.metric_leads = record.metrics.leads || 0;
    }
    return payload;
  }
  if (collection === "crm") {
    return {
      stage: record.stage,
      assignee: record.assignee,
      notes: record.notes,
      wechat_id: record.wechatId,
      wechat_add_time: record.wechatAddTime,
      lead_type: record.leadType || "direct",
      agent_name: record.agentName || "",
      partner_school: record.partnerSchool || "",
      commission_rate: record.commissionRate || 0,
      expected_revenue: record.expectedRevenue || 0,
      follow_ups: record.followUps || [],
      grade: record.grade || "",
      parent_name: record.parentName || "",
      course: record.course || "",
      channel: record.channel || "",
      source: record.source || "",
      source_link: record.sourceLink || "",
    };
  }
  return {};
}

async function deleteRecordOnline(collection, matchField, matchValue) {
  if (!cloudReady || !cloudClient) return "local";
  const tableMap = { contents: "content_items", knowledge: "knowledge_items", personas: "ip_personas", accounts: "account_matrix", posts: "published_posts", crm: "crm_leads" };
  const table = tableMap[collection];
  if (!table) return "local";

  const { error } = await cloudClient.from(table).delete().eq(matchField, matchValue);
  if (error) {
    console.warn(`Cloud delete failed for ${collection}:`, error);
    return "local";
  }
  return "cloud";
}

function updateSyncIndicator(status) {
  const el = document.querySelector("#sync-status");
  if (!el) return;
  const map = {
    synced: { text: "☁️ 已同步", cls: "sync-ok" },
    syncing: { text: "🔄 同步中", cls: "sync-ing" },
    offline: { text: "💾 离线", cls: "sync-off" },
    error: { text: "⚠️ 同步失败", cls: "sync-err" },
  };
  const info = map[status] || map.offline;
  el.textContent = info.text;
  el.className = `sync-indicator ${info.cls}`;
}

function persistLeadUpdate(lead) {
  // Save CRM leads to localStorage
  const saved = readSavedState();
  saved._crmUpdates = saved._crmUpdates || [];
  const idx = saved._crmUpdates.findIndex(u => u.name === lead.name);
  const snapshot = { name: lead.name, stage: lead.stage, assignee: lead.assignee, notes: lead.notes, wechatId: lead.wechatId, wechatAddTime: lead.wechatAddTime, followUps: lead.followUps, leadType: lead.leadType, partnerSchool: lead.partnerSchool, agentName: lead.agentName, commissionRate: lead.commissionRate, expectedRevenue: lead.expectedRevenue, grade: lead.grade, parentName: lead.parentName, course: lead.course, channel: lead.channel, source: lead.source, sourceLink: lead.sourceLink };
  if (idx >= 0) saved._crmUpdates[idx] = snapshot;
  else saved._crmUpdates.push(snapshot);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  // Sync to Supabase
  if (cloudReady && cloudClient) {
    updateRecordOnline("crm", lead).catch(err => console.warn("CRM cloud update failed:", err));
  }
}

/* ── Auth & Role Mapping ── */
const AUTH_ROLE_MAP = {
  "admin": "admin",
  "lead": "lead",
  "operator": "operator",
  "ai": "ai",
  "admission": "admission",
};
let authUser = null;
let authMode = "local"; // "local" | "auth"

function showLogin() {
  document.getElementById("login-screen").classList.remove("hidden");
  document.getElementById("app-shell").style.display = "none";
}
function hideLogin() {
  document.getElementById("login-screen").classList.add("hidden");
  document.getElementById("app-shell").style.display = "";
  // Update demo mode badge
  const demoBadge = document.getElementById("demo-badge");
  if (demoBadge) {
    demoBadge.style.display = isDemo() ? "" : "none";
  }
}

async function handleSignIn(email, password) {
  if (!cloudClient) throw new Error("系统未连接，请刷新页面重试");
  const { data, error } = await cloudClient.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function handleSignOut() {
  if (!cloudClient) return;
  await cloudClient.auth.signOut();
  authUser = null;
  showLogin();
}

function applyAuthRole(user) {
  if (!user) return;
  authUser = user;
  const meta = user.user_metadata || {};
  const role = AUTH_ROLE_MAP[meta.role] || "operator";
  const roleSelect = document.getElementById("role-select");
  if (roleSelect) {
    roleSelect.value = role;
    roleSelect.dispatchEvent(new Event("change"));
    // Non-admin users can't switch roles
    if (role !== "admin" && role !== "lead") {
      roleSelect.disabled = true;
    }
  }
  // Show user name in topbar
  const nameDisplay = meta.display_name || user.email?.split("@")[0] || "用户";
  const roleTitle = document.getElementById("role-title");
  if (roleTitle && meta.display_name) {
    roleTitle.textContent = `${roleCopy[role]?.title || "用户"} · ${nameDisplay}`;
  }
  // Show logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.style.display = "";
    logoutBtn.textContent = `退出 (${nameDisplay})`;
  }
}

async function initCloudDatabase() {
  try {
    const response = await fetch("/api/config", { cache: "no-store" });
    if (!response.ok) throw new Error("config unavailable");
    const config = await response.json();
    if (!config.configured || !config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      setCloudStatus("本地模式：还没有配置 Supabase。", "local");
      authMode = "local";
      // In local mode: skip login, show app directly
      hideLogin();
      return;
    }

    cloudClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);

    // Check existing session
    const { data: { session } } = await cloudClient.auth.getSession();
    if (session?.user) {
      authMode = "auth";
      hideLogin();
      applyAuthRole(session.user);
      await loadCloudState();
      cloudReady = true;
      setCloudStatus("已登录，云端数据库已连接。", "cloud");
      updateSyncIndicator("synced");
    } else {
      authMode = "auth";
      showLogin();
      setCloudStatus("请登录。", "local");
      updateSyncIndicator("offline");
    }

    // Listen for auth state changes
    cloudClient.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        hideLogin();
        applyAuthRole(session.user);
        if (!cloudReady) {
          await loadCloudState();
          cloudReady = true;
          renderApp();
        }
        setCloudStatus("已登录，云端数据库已连接。", "cloud");
        updateSyncIndicator("synced");
      } else if (event === "SIGNED_OUT") {
        authUser = null;
        cloudReady = false;
        showLogin();
        updateSyncIndicator("offline");
      }
    });
  } catch (error) {
    console.warn("Cloud database is not ready, falling back to local storage.", error);
    setCloudStatus("本地模式：云端数据库暂不可用。", "local");
    authMode = "local";
    updateSyncIndicator("offline");
    hideLogin();
  }
}

async function loadCloudState() {
  const [contentRows, knowledgeRows, personaRows, accountRows, postRows, crmRows, promptRows] = await Promise.all([
    selectCloudRows("content_items"),
    selectCloudRows("knowledge_items"),
    selectCloudRows("ip_personas"),
    selectCloudRows("account_matrix"),
    selectCloudRows("published_posts"),
    selectCloudRows("crm_leads"),
    selectCloudRows("ai_prompts"),
  ]);

  replaceRecords(contents, contentRows.map(fromCloudContent));
  replaceRecords(knowledge, knowledgeRows.map(fromCloudKnowledge));
  replaceRecords(personas, personaRows.map(fromCloudPersona));
  replaceRecords(accounts, accountRows.map(fromCloudAccount));
  replaceRecords(posts, postRows.map(fromCloudPost));
  if (crmRows.length) replaceRecords(crmLeads, crmRows.map(fromCloudCrmLead));
  if (promptRows.length) replaceRecords(aiPromptLibrary, promptRows.map(fromCloudPrompt));
}

async function selectCloudRows(table) {
  const { data, error } = await cloudClient.from(table).select("*").order("created_at", { ascending: false }).limit(100);
  if (error) throw error;
  return data || [];
}

function arrayFromText(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(/[,，/]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function fromCloudContent(row) {
  return {
    title: row.title,
    aiSearchReady: row.ai_search_ready,
    account: row.account_name || "待分配账号",
    audiencePersona: row.audience_personas || ["通用"],
    author: row.author_name || "当前用户",
    cta: row.cta || "待补充 CTA",
    contentType: row.content_type || "内容",
    emotionalTrigger: row.emotional_trigger || "待定",
    funnelStage: row.funnel_stage || "Awareness",
    leadMagnet: row.lead_magnet || "待定",
    notes: row.notes || "待补充备注",
    primaryKeyword: row.primary_keyword || "待定",
    promptsUsed: row.prompts_used || "未使用",
    publishDate: row.publish_date || new Date().toISOString().slice(0, 10),
    references: row.references_note || "待补充引用",
    repurposeStatus: row.repurpose_status || "可二改",
    status: row.status_label || "草稿",
    topicCluster: row.topic_cluster || "未分类",
    waceFocus: row.wace_focus,
  };
}

function fromCloudKnowledge(row) {
  return {
    title: row.title,
    detail: row.detail || "待补充资料正文。",
    notes: row.notes || "待补充备注。",
    numericData: row.numeric_data_text || "待填",
    reviewCycle: row.review_cycle || "每年",
    source: row.source_url || "待补充来源",
    sourceType: row.source_type || "人工整理",
    subject: row.subject_tags || ["未分类"],
    type: row.item_type || row.category || "资料",
    usedInContents: row.used_in_contents || 0,
    verifiedBy: row.verified_by_name || "当前用户",
    lastVerified: row.last_verified_text || "待核实",
    visibility: row.visibility || "内部",
  };
}

function fromCloudPersona(row) {
  return [
    row.name || "未命名 IP",
    row.positioning || "待补充人设定位",
    `${row.persona_type || "IP"} · ${row.owner_name || "未分配"}`,
    row.publishing_frequency || "待定频率",
    `线索 ${row.lead_count || 0}`,
  ];
}

function fromCloudAccount(row) {
  return {
    platform: row.platform || "平台",
    accountName: row.account_name || "未命名账号",
    status: row.account_status || "筹备",
    contentCount: row.content_count || 0,
    handle: row.handle_url || "待补充链接",
    investmentTier: row.investment_tier || "辅助",
    ownerType: row.owner_type || "自营",
    persona: row.persona_name || "未绑定 IP",
    talent: row.talent_name || "空白",
    entityName: row.entity_name || "待填主体",
    entityType: row.entity_type || "企业",
    operator: row.operator_name || "未分配",
    stage: row.account_stage || "筹备",
    monthlyPosts: row.monthly_posts || 0,
    leads: row.lead_count || 0,
  };
}

function fromCloudPost(row) {
  return [
    row.publish_date || new Date().toISOString().slice(0, 10),
    row.platform || "平台",
    row.account_name || "发布账号",
    row.persona_name || "绑定 IP",
    row.title || "未命名发布内容",
    row.status_label || "已发布",
    row.metric_label || "待回填",
    {
      postUrl: row.post_url || "",
      publishedCopy: row.published_copy || "",
      mediaNote: row.media_note || "",
      cover: [],
      images: [],
      video: [],
      screenshots: [],
    },
  ];
}

function fromCloudCrmLead(row) {
  return {
    name: row.name,
    source: row.source || "",
    stage: row.stage || "私信咨询",
    assignee: row.assignee || "",
    date: row.date || "",
    sourceLink: row.source_link || "",
    channel: row.channel || "",
    grade: row.grade || "",
    parentName: row.parent_name || "",
    course: row.course || "",
    wechatId: row.wechat_id || "",
    wechatAddTime: row.wechat_add_time || null,
    notes: row.notes || "",
    followUps: row.follow_ups || [],
    leadType: row.lead_type || "direct",
    agentName: row.agent_name || "",
    partnerSchool: row.partner_school || "",
    commissionRate: row.commission_rate || 0,
    expectedRevenue: row.expected_revenue || 0,
  };
}

function fromCloudPrompt(row) {
  return {
    title: row.title,
    author: row.author || "",
    lastUsed: row.last_used || "待使用",
    notes: row.notes || "",
    outputExamples: row.output_examples || "",
    platform: row.platform || "通用",
    promptTemplate: row.prompt_template || "",
    qualityRating: row.quality_rating || "3星",
    stage: row.stage || "",
    targetPersona: row.target_persona || "通用",
    useCount: row.use_count || 0,
  };
}

function toCloudRow(collection, record) {
  if (collection === "knowledge") {
    return {
      id: createId(),
      title: record.title,
      category: record.type,
      detail: record.detail,
      notes: record.notes,
      numeric_data_text: record.numericData,
      review_cycle: record.reviewCycle,
      source_url: record.source,
      source_type: record.sourceType,
      subject_tags: record.subject,
      item_type: record.type,
      used_in_contents: Number(record.usedInContents) || 0,
      verified_by_name: record.verifiedBy,
      last_verified_text: record.lastVerified,
      visibility: record.visibility,
    };
  }

  if (collection === "personas") {
    const [personaType, ownerName] = String(record[2] || "").split("·").map((item) => item.trim());
    return {
      id: createId(),
      name: record[0],
      positioning: record[1],
      persona_type: personaType || "IP",
      owner_name: ownerName || "未分配",
      publishing_frequency: record[3],
      lead_count: Number(String(record[4]).replace(/\D/g, "")) || 0,
    };
  }

  if (collection === "contents") {
    return {
      id: createId(),
      title: record.title,
      ai_search_ready: record.aiSearchReady,
      account_name: record.account,
      audience_personas: record.audiencePersona,
      author_name: record.author,
      cta: record.cta,
      content_type: record.contentType,
      emotional_trigger: record.emotionalTrigger,
      funnel_stage: record.funnelStage,
      lead_magnet: record.leadMagnet,
      notes: record.notes,
      primary_keyword: record.primaryKeyword,
      prompts_used: record.promptsUsed,
      publish_date: record.publishDate,
      references_note: record.references,
      repurpose_status: record.repurposeStatus,
      status_label: record.status,
      topic_cluster: record.topicCluster,
      wace_focus: record.waceFocus,
    };
  }

  if (collection === "accounts") {
    return {
      id: createId(),
      platform: record.platform,
      account_name: record.accountName,
      account_status: record.status,
      content_count: record.contentCount,
      handle_url: record.handle,
      investment_tier: record.investmentTier,
      owner_type: record.ownerType,
      persona_name: record.persona,
      talent_name: record.talent,
      entity_name: record.entityName,
      entity_type: record.entityType,
      operator_name: record.operator,
      account_stage: record.stage,
      monthly_posts: record.monthlyPosts,
      lead_count: record.leads,
    };
  }

  if (collection === "posts") {
    const media = record[7] || {};
    return {
      id: createId(),
      publish_date: record[0],
      platform: record[1],
      account_name: record[2],
      persona_name: record[3],
      title: record[4],
      status_label: record[5],
      metric_label: record[6],
      post_url: media.postUrl,
      published_copy: media.publishedCopy,
      media_note: buildPostMediaNote(media),
    };
  }

  return record;
}

async function persistRecordOnline(collection, record) {
  if (!cloudReady || !cloudClient) {
    persistRecord(collection, record);
    return "local";
  }

  const tableMap = {
    contents: "content_items",
    knowledge: "knowledge_items",
    personas: "ip_personas",
    accounts: "account_matrix",
    posts: "published_posts",
  };

  updateSyncIndicator("syncing");
  const row = toCloudRow(collection, record);
  // Use upsert: insert or update on conflict
  const { error } = await cloudClient.from(tableMap[collection]).upsert(row, { onConflict: "title" });
  if (error) {
    console.warn("Cloud upsert failed, saving locally instead.", error);
    persistRecord(collection, record);
    setCloudStatus("本地模式：云端写入失败，已临时保存在本机。", "local");
    updateSyncIndicator("error");
    return "local";
  }

  setCloudStatus("云端数据库已连接。", "cloud");
  updateSyncIndicator("synced");
  return "cloud";
}

function badge(text, color = "") {
  return `<span class="badge ${color}">${text}</span>`;
}

function includesKeyword(value, keyword) {
  return String(value || "").toLowerCase().includes(keyword.toLowerCase());
}

function recordMatches(record, keyword) {
  if (!keyword) return true;
  return JSON.stringify(record).toLowerCase().includes(keyword.toLowerCase());
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

function uniqueValues(values) {
  return Array.from(new Set(values.map((value) => String(value || "").trim()).filter(Boolean)));
}

function personaNames() {
  return uniqueValues(personas.map((persona) => (Array.isArray(persona) ? persona[0] : persona.name)));
}

function accountNames() {
  return uniqueValues(accounts.map((account) => account.accountName));
}

function optionList(values, fallback = "暂无数据") {
  const options = uniqueValues(values);
  if (!options.length) return `<option>${fallback}</option>`;
  return options.map((value) => `<option>${escapeHtml(value)}</option>`).join("");
}

function accountsForPersona(personaName) {
  const target = normalizeText(personaName);
  return accounts.filter((account) => normalizeText(account.persona) === target);
}

function contentsForPersona(personaName) {
  const linkedAccounts = accountsForPersona(personaName).map((account) => account.accountName);
  return contents.filter((item) => linkedAccounts.includes(item.account) || recordMatches(item, personaName));
}

function postsForPersona(personaName) {
  const target = normalizeText(personaName);
  return posts.filter(([, , , persona]) => normalizeText(persona) === target);
}

function buildIpTimeline(personaName) {
  const relatedAccounts = accountsForPersona(personaName);
  const relatedContents = contentsForPersona(personaName);
  const relatedPosts = postsForPersona(personaName).sort(([dateA], [dateB]) => dateB.localeCompare(dateA));

  const accountRows =
    relatedAccounts
      .map(
        (account) => `
          <tr>
            <td>${account.platform}</td>
            <td><strong>${account.accountName}</strong></td>
            <td>${account.operator}</td>
            <td>${badge(account.status, account.status === "运营中" ? "green" : "amber")}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="4">还没有绑定账号。</td></tr>`;

  const contentRows =
    relatedContents
      .slice(0, 8)
      .map(
        (item) => `
          <tr>
            <td>${item.publishDate}</td>
            <td><strong>${item.title}</strong></td>
            <td>${item.account}</td>
            <td>${badge(item.status, item.status === "Posted" || item.status === "已发布" ? "green" : "amber")}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="4">还没有关联内容资产。</td></tr>`;

  const postRows =
    relatedPosts
      .slice(0, 12)
      .map(
        ([date, platform, account, , title, status, metric]) => `
          <tr>
            <td>${date}</td>
            <td>${platform}</td>
            <td>${account}</td>
            <td><strong>${title}</strong></td>
            <td>${badge(status, status === "待回填" ? "amber" : "green")}</td>
            <td>${metric}</td>
          </tr>
        `,
      )
      .join("") || `<tr><td colspan="6">还没有发布归档。运营发布后，在“今日发布”上传归档就会出现在这里。</td></tr>`;

  return `
    <div class="detail-list">
      <div><strong>IP</strong><span>${personaName}</span></div>
      <div><strong>绑定账号</strong><span>${relatedAccounts.length} 个</span></div>
      <div><strong>内容资产</strong><span>${relatedContents.length} 条</span></div>
      <div><strong>发布归档</strong><span>${relatedPosts.length} 条</span></div>
    </div>
    <div class="modal-section">
      <h3>绑定账号</h3>
      <div class="table-card compact-table">
        <table>
          <thead><tr><th>平台</th><th>账号</th><th>运营人</th><th>状态</th></tr></thead>
          <tbody>${accountRows}</tbody>
        </table>
      </div>
    </div>
    <div class="modal-section">
      <h3>内容资产</h3>
      <div class="table-card compact-table">
        <table>
          <thead><tr><th>日期</th><th>内容</th><th>账号</th><th>状态</th></tr></thead>
          <tbody>${contentRows}</tbody>
        </table>
      </div>
    </div>
    <div class="modal-section">
      <h3>发布归档时间线</h3>
      <div class="table-card compact-table">
        <table>
          <thead><tr><th>日期</th><th>平台</th><th>账号</th><th>内容</th><th>状态</th><th>数据</th></tr></thead>
          <tbody>${postRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

const modalTemplates = {
  "new-content": {
    kicker: "Content Asset",
    title: "新建内容资产",
    body: () => `
      <div class="form-grid">
        <label>标题<input placeholder="输入内容标题" /></label>
        <label>AI Search Ready<select><option>否</option><option>是</option></select></label>
        <label>Account<select><option value="">选择账号</option>${accountNames().map((n) => "<option>" + n + "</option>").join("")}</select></label>
        <label>Audience Persona<input placeholder="如：P1 陪读妈妈, P2 国内待留学" /></label>
        <label>Author<select><option value="">选择作者</option>${teamMembers.map((m) => "<option>" + m.name + "</option>").join("")}<option>内容组</option></select></label>
        <label>Content Type<select><option value="">选择类型</option><optgroup label="引流型（目标40%）"><option>干货</option><option>升学科普</option><option>对比</option><option>政策</option><option>情绪</option></optgroup><optgroup label="信任型（目标30%）"><option>FAQ</option><option>视频口播</option><option>数据解读</option><option>课程介绍</option></optgroup><optgroup label="案例型（目标20%）"><option>案例</option><option>校园</option><option>学生故事</option><option>家长分享</option></optgroup><optgroup label="转化型（目标10%）"><option>探校活动</option><option>限时咨询</option><option>直播预告</option><option>资料包</option></optgroup></select></label>
        <label>Emotional Trigger<select><option value="">选择情绪钩子</option><option>反常识</option><option>焦虑共鸣</option><option>向往</option><option>痛点直击</option><option>好奇驱动</option><option>数字震撼</option><option>案例代入</option><option>理性避坑</option><option>痛点反问</option></select></label>
        <label>Funnel Stage<select><option value="">选择漏斗阶段</option><option>Awareness</option><option>Consideration</option><option>Trust</option><option>Visit</option><option>Enroll</option></select></label>
        <label>Lead Magnet<select><option value="">选择钩子资料</option><option>路径选择表</option><option>评估表</option><option>学费明细</option><option>选课指南</option><option>升学路径清单</option><option>签证材料清单</option><option>科目组合建议</option></select></label>
        <label>Primary Keyword<input placeholder="输入主关键词" /></label>
        <label>Prompts Used<input placeholder="使用的 AI 模板" /></label>
        <label>Publish Date<input type="date" /></label>
        <label>Repurpose Status<select><option value="">选择复用状态</option><option>原稿</option><option>可二改</option><option>可转视频号</option><option>可转小红书</option><option>可转抖音</option><option>可转独立站</option><option>已转小红书标题</option><option>已复用多平台</option><option>归档</option></select></label>
        <label>Status<select><option>草稿</option><option>待审核</option><option>审核通过</option><option>已发布</option></select></label>
        <label>Topic Cluster<select><option value="">选择主题簇</option><option>WACE</option><option>A-Level</option><option>IB</option><option>升学</option><option>择校</option><option>陪读</option><option>校园</option><option>签证</option><option>学费</option><option>NUS / NTU</option><option>毕业生案例</option></select></label>
        <label>WACE Focus<select><option>否</option><option>是</option></select></label>
        <label class="full-field">CTA<input placeholder="如：评论「关键词」，获取XXX" /></label>
        <label class="full-field">References<input placeholder="引用的知识库资料，用 / 分隔" /></label>
        <label class="full-field">Notes<textarea placeholder="备注信息"></textarea></label>
        <label>阅读数<input type="number" placeholder="0" /></label>
        <label>点赞数<input type="number" placeholder="0" /></label>
        <label>评论数<input type="number" placeholder="0" /></label>
        <label>转发数<input type="number" placeholder="0" /></label>
        <label>私信数<input type="number" placeholder="0" /></label>
        <label>线索数<input type="number" placeholder="0" /></label>
      </div>
    `,
  },
  "upload-post": {
    kicker: "Daily Archive",
    title: "上传今日发布",
    body: () => `
      <div class="form-grid">
        <label>发布日期<input type="date" value="${new Date().toISOString().slice(0, 10)}" /></label>
        <label>平台<select>${platformOptions()}</select></label>
        <label>发布账号<select>${optionList(accountNames(), "请先新增账号")}</select></label>
        <label>绑定 IP<select>${optionList(personaNames(), "请先新增 IP")}</select></label>
        <label>关联内容资产<select>${contents.map((c) => `<option>${escapeHtml(c.title)}</option>`).join("")}</select></label>
        <label>媒体类型<select><option>图文</option><option>短视频</option><option>公众号文章</option><option>朋友圈</option><option>抖音短视频</option><option>SEO英文文章</option><option>YouTube视频</option></select></label>
        <label class="full-field">发布链接<input value="https://example.com/post/..." /></label>
        <div class="full-field upload-section">
          <span>封面图</span>
          <label class="upload-box">点击上传封面图<span class="upload-status">未选择文件</span><input type="file" accept="image/*" data-upload-field="cover" /></label>
        </div>
        <div class="full-field upload-section">
          <span>正文图片 / 配图</span>
          <label class="upload-box">上传 1-9 张小红书配图<span class="upload-status">未选择文件</span><input type="file" accept="image/*" multiple data-upload-field="images" /></label>
        </div>
        <div class="full-field upload-section">
          <span>视频文件</span>
          <label class="upload-box">上传视频号 / 知乎视频<span class="upload-status">未选择文件</span><input type="file" accept="video/*" data-upload-field="video" /></label>
        </div>
        <div class="full-field upload-section">
          <span>发布截图</span>
          <label class="upload-box">上传发布成功截图 / 数据截图<span class="upload-status">未选择文件</span><input type="file" accept="image/*" multiple data-upload-field="screenshots" /></label>
        </div>
        <label class="full-field">实际发布正文<textarea>这里保存外部平台实际发出去的正文，方便一年后回看。</textarea></label>
      </div>
    `,
  },
  "new-knowledge": {
    kicker: "Knowledge Base",
    title: "新增真实资料",
    body: `
      <div class="form-grid">
        <label>资料标题<input value="NUS 录取 WACE ATAR 要求" /></label>
        <label>分类<select><option>大学录取</option><option>WACE</option><option>签证</option><option>学费</option><option>BCI 资料</option></select></label>
        <label>核实状态<select><option>已核实</option><option>待核实</option><option>过期</option></select></label>
        <label>复查周期<select><option>每年</option><option>每季</option><option>半年</option><option>一次性</option></select></label>
        <label>Source Type<select><option>官方</option><option>内部</option><option>人工整理</option><option>混合来源</option></select></label>
        <label>Visibility<select><option>公开</option><option>内部</option><option>私密</option></select></label>
        <label>Subject<input value="NTU, WACE" /></label>
        <label>Type<input value="录取分数" /></label>
        <label class="full-field">来源链接或说明<input value="官方招生页面 / 内部整理" /></label>
        <label class="full-field">Numeric Data<textarea>Engineering: 待填；Business: 待填；Computer Science: 待填；Medicine: 待填</textarea></label>
        <label class="full-field">Notes<textarea>每年复查。发布内容前要确认具体专业的 ATAR 区间。</textarea></label>
        <label class="full-field">资料正文<textarea>把真实、可核实、可被 AI 调用的内容放在这里。</textarea></label>
      </div>
    `,
  },
  "generate-ai": {
    kicker: "AI Production",
    title: "基于资料生成内容",
    body: `
      <div class="form-grid">
        <label>调用资料<select><option>NUS 接受 WACE ATAR</option><option>WACE 课程结构</option><option>新加坡陪读签证</option></select></label>
        <label>目标平台<select>${platformOptions()}</select></label>
        <label>目标 IP<select><option>升学顾问 IP</option><option>校长 IP</option><option>招生老师 IP</option></select></label>
        <label>目标人群<select><option>9-10 年级家长</option><option>7-8 年级转轨家庭</option><option>11-12 年级升学家庭</option></select></label>
        <label class="full-field">Prompt<textarea>基于选中的真实资料，生成多平台适配版本：一个小红书图文、一个抖音短视频脚本、一个视频号口播、一个招生朋友圈、一个英文SEO文章摘要。</textarea></label>
      </div>
    `,
  },
  "new-persona": {
    kicker: "Persona Matrix",
    title: "新增 IP",
    body: `
      <div class="form-grid">
        <label>IP 名称<input value="WACE 升学顾问 IP" /></label>
        <label>IP 类型<select><option>升学顾问</option><option>校长</option><option>招生老师</option><option>学生案例</option></select></label>
        <label>负责人<input value="运营 A" /></label>
        <label>发布频率<input value="每周 5 条" /></label>
        <label>IP 分类<select><option value="school_official">校品牌官号</option><option value="real_person">真人 IP 号</option><option value="agency">纯中介号（品牌隔离）</option><option value="ugc">UGC 半官方</option><option value="seo">独立站 SEO</option></select></label>
        <label class="full-field">人设定位<textarea>面向 7-12 年级家长，讲清 WACE、ATAR、大学申请和新加坡转轨路径。</textarea></label>
      </div>
    `,
  },
  "new-account": {
    kicker: "Account Matrix",
    title: "新增自媒体账号",
    body: () => `
      <div class="form-grid">
        <label>平台<select>${platformOptions()}</select></label>
        <label>账号名称<input value="" placeholder="输入账号名称" /></label>
        <label>Account Status<select><option>筹备</option><option>养号</option><option>运营中</option><option>暂停</option></select></label>
        <label>Investment Tier<select><option>主力</option><option>辅助</option><option>测试</option></select></label>
        <label>Owner Type<select><option>自营</option><option>合作</option><option>外包</option></select></label>
        <label>绑定 IP<select>${optionList(personaNames(), "请先新增 IP")}</select></label>
        <label>IP 分类<select><option value="school_official">校品牌官号</option><option value="real_person">真人 IP 号</option><option value="agency">纯中介号（品牌隔离）</option><option value="ugc">UGC 半官方</option><option value="seo">独立站 SEO</option></select></label>
        <label>Talent / 主理人<input value="空白" /></label>
        <label>主体名称<input value="师云教育上海" /></label>
        <label>主体类型<select><option>企业</option><option>学校</option><option>个人</option></select></label>
        <label>运营人<select><option>运营 A</option><option>运营 B</option><option>Ocean Wang</option></select></label>
        <label>发布频率<input value="每天 1 条" /></label>
        <label class="full-field">Handle / 后台链接<input value="https://mp.weixin.qq.com/cgi-bin/home" /></label>
      </div>
    `,
  },
  "new-lead": {
    kicker: "Admissions CRM",
    title: "新增招生线索",
    body: () => `
      <div class="form-grid">
        <label>线索类型<select id="lead-type" onchange="toggleLeadTypeFields()">
          <option value="direct">直招</option>
          <option value="agent">中介分发</option>
          <option value="partner_school">合作学校</option>
        </select></label>
        <label>学生姓名<input value="学生姓名" /></label>
        <label>当前年级<select><option>G7</option><option>G8</option><option>G9</option><option>G10</option><option>G11</option><option>G12</option></select></label>
        <label>家长姓名<input value="家长姓名" /></label>
        <label>意向课程<select><option>WACE</option><option>国际高中</option><option>插班</option><option>升学规划</option></select></label>
        <label>来源渠道<select id="lead-channel">
          <option>企业微信</option><option>小红书私信</option><option>抖音私信</option>
          <option>视频号</option><option>公众号</option><option>知乎</option>
          <option>独立站SEO</option><option>线下</option><option>老客推荐</option><option>中介</option><option>合作学校</option><option>其他</option>
        </select></label>
        <label>来源 IP<select>${personaNames().map((n) => "<option>" + n + "</option>").join("")}</select></label>
        <label>企微 ID（可选）<input id="lead-wechat-id" placeholder="企业微信 ID 或备注名" /></label>
        <label id="agent-name-field" style="display:none">中介名称<input id="lead-agent-name" placeholder="中介机构名称" /></label>
        <label id="partner-school-field" style="display:none">合作学校<input id="lead-partner-school" placeholder="合作学校名称" /></label>
        <label id="commission-field" style="display:none">佣金比例 (%)<input id="lead-commission" type="number" min="0" max="100" placeholder="如 10" /></label>
        <label>预期学费<input id="lead-revenue" type="number" placeholder="如 180000" /></label>
        <label class="full-field">来源链接<input placeholder="粘贴小红书/知乎/公众号文章链接" /></label>
        <label class="full-field">跟进备注<textarea>记录家长问题、学生情况、下次跟进动作。</textarea></label>
      </div>
    `,
  },
  "invite-member": {
    kicker: "Access Control",
    title: "邀请团队成员",
    body: `
      <div class="form-grid">
        <label>姓名<input id="member-name" placeholder="输入成员姓名" /></label>
        <label>邮箱<input id="member-email" type="email" placeholder="name@bci.edu.sg" /></label>
        <label>角色
          <select id="member-role">
            <option value="运营人员">运营人员</option>
            <option value="部门负责人">部门负责人</option>
            <option value="AI 内容编辑">AI 内容编辑</option>
            <option value="招生顾问">招生顾问</option>
          </select>
        </label>
        <label>负责账号（运营人员需选择）
          <select id="member-accounts" multiple style="min-height:80px">
            ${accounts.map((a) => '<option value="' + a.accountName + '">' + a.accountName + '</option>').join("")}
          </select>
        </label>
      </div>
      <p style="color:var(--muted);font-size:13px;margin-top:8px">部门负责人自动拥有全部账号权限，招生顾问无需分配账号。</p>
    `,
  },
  "export-report": {
    kicker: "Data Export",
    title: "数据导出",
    body: () => `
      <div class="detail-list">
        <div><strong>导出范围</strong><span>当前系统数据的 CSV 导出（UTF-8 编码，Excel 兼容）</span></div>
      </div>
      <div class="export-buttons" style="display:grid;gap:10px;margin-top:16px">
        <button class="primary-button" onclick="exportContents();showToast('内容资产库已导出')">📝 导出内容资产库（${contents.length} 条）</button>
        <button class="primary-button" onclick="exportCrmLeads();showToast('CRM线索已导出')">🎯 导出 CRM 线索（${crmLeads.length} 条）</button>
      </div>
    `,
  },
  "all-tasks": {
    kicker: "Workflow",
    title: "全部待办",
    body: () => {
      const pending = contents.filter((c) => c.status === "待审核").length;
      const ready = contents.filter((c) => c.status === "可发布" || c.status === "审核通过").length;
      const backfill = contents.filter((c) => c.status === "已发布" || c.status === "待回填").length;
      return `<div class="detail-list">
        <div><strong>待审核</strong><span>${pending} 条内容等待部门负责人检查。</span></div>
        <div><strong>审核通过待发布</strong><span>${ready} 条内容可以由运营人员发布。</span></div>
        <div><strong>待回填数据</strong><span>${backfill} 条已发布内容需要补充 3 日 / 7 日 / 30 日数据。</span></div>
      </div>`;
    },
  },
  notifications: {
    kicker: "Notifications",
    title: "通知中心",
    body: () => {
      const pending = contents.filter((c) => c.status === "待审核").length;
      const backfill = contents.filter((c) => c.status === "已发布" || c.status === "待回填").length;
      const newLeads = crmLeads.filter((l) => l.stage === "私信咨询" && !l.assignee).length;
      return `<div class="detail-list">
        <div><strong>${pending} 条内容待审核</strong><span>负责人需要检查待审核内容。</span></div>
        <div><strong>${backfill} 条发布待回填</strong><span>已发布内容需要补充数据。</span></div>
        <div><strong>${newLeads} 条新线索待分配</strong><span>需要分配招生顾问。</span></div>
      </div>`;
    },
  },
};

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getUploadFiles(fieldName) {
  const input = document.querySelector(`#modal-body input[data-upload-field="${fieldName}"]`);
  return Array.from(input?.files || []).map((file) => `${file.name} (${formatFileSize(file.size)})`);
}

function getUploadSummary() {
  return {
    cover: getUploadFiles("cover"),
    images: getUploadFiles("images"),
    video: getUploadFiles("video"),
    screenshots: getUploadFiles("screenshots"),
  };
}

/* ── TASK 6.2: Supabase Storage Upload ── */
const STORAGE_BUCKET = "bci-media";

async function uploadFileToStorage(file, folder) {
  if (!cloudReady || !cloudClient) {
    showToast("离线模式，文件仅在本地预览。");
    return { url: URL.createObjectURL(file), local: true };
  }
  const ext = file.name.split(".").pop() || "bin";
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  updateSyncIndicator("syncing");
  try {
    const { data, error } = await cloudClient.storage.from(STORAGE_BUCKET).upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data: urlData } = cloudClient.storage.from(STORAGE_BUCKET).getPublicUrl(data.path);
    updateSyncIndicator("synced");
    return { url: urlData.publicUrl, path: data.path, local: false };
  } catch (err) {
    console.warn("Storage upload failed:", err);
    updateSyncIndicator("error");
    showToast("文件上传失败：" + (err.message || "请重试"));
    return { url: URL.createObjectURL(file), local: true };
  }
}

async function uploadMultipleFiles(files, folder) {
  const results = [];
  for (const file of files) {
    const result = await uploadFileToStorage(file, folder);
    results.push({ name: file.name, size: file.size, type: file.type, ...result });
  }
  return results;
}

function buildFilePreview(fileResults) {
  if (!fileResults || fileResults.length === 0) return "";
  return fileResults.map(f => {
    const isImage = f.type?.startsWith("image/");
    return `<div class="file-preview-item">
      ${isImage ? `<img src="${f.url}" alt="${escapeHtml(f.name)}" class="file-thumb" />` : `<span class="file-icon">📄</span>`}
      <span class="file-name">${escapeHtml(f.name)}</span>
      <span class="file-size">${formatFileSize(f.size)}</span>
      ${f.local ? `<span class="file-local">本地</span>` : `<span class="file-cloud">☁️</span>`}
    </div>`;
  }).join("");
}

/* ── TASK 6.3: CSV Export ── */
function exportToCsv(headers, rows, filename) {
  const escape = (v) => {
    const s = String(v ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
  };
  const csvContent = [headers.map(escape).join(","), ...rows.map(row => row.map(escape).join(","))].join("\n");
  const BOM = "﻿"; // UTF-8 BOM for Excel Chinese support
  const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(`已导出 ${filename}（${rows.length} 条记录）`);
}

function exportContents() {
  const headers = ["标题", "状态", "作者", "账号", "漏斗阶段", "情绪钩子", "内容类型", "主题", "WACE", "阅读", "点赞", "评论", "分享", "私信", "线索"];
  const rows = contents.map(c => [
    c.title, c.status, c.author || "", c.account || "", c.funnelStage || "", c.emotionalTrigger || "",
    c.contentType || "", c.topicCluster || "", c.waceFocus ? "是" : "否",
    c.metrics?.reads || 0, c.metrics?.likes || 0, c.metrics?.comments || 0,
    c.metrics?.shares || 0, c.metrics?.privateMessages || 0, c.metrics?.leads || 0,
  ]);
  exportToCsv(headers, rows, `BCI内容资产库_${new Date().toISOString().slice(0,10)}.csv`);
}

function exportCrmLeads() {
  const headers = ["姓名", "类型", "阶段", "渠道", "来源", "顾问", "年级", "课程", "企微ID", "中介", "合作校", "佣金率", "预期学费", "日期", "备注"];
  const rows = crmLeads.map(l => [
    l.name, LEAD_TYPE_LABELS[l.leadType] || "直招", l.stage, l.channel || "", l.source || "",
    l.assignee || "未分配", l.grade || "", l.course || "", l.wechatId || "",
    l.agentName || "", l.partnerSchool || "", l.commissionRate || 0, l.expectedRevenue || 0,
    l.date || "", l.notes || "",
  ]);
  exportToCsv(headers, rows, `BCI招生线索_${new Date().toISOString().slice(0,10)}.csv`);
}

function uploadFilesLabel(files) {
  if (!files.length) return "未上传";
  return files.join(" / ");
}

function buildPostMediaNote(media = {}) {
  return [
    `封面：${uploadFilesLabel(media.cover || [])}`,
    `配图：${uploadFilesLabel(media.images || [])}`,
    `视频：${uploadFilesLabel(media.video || [])}`,
    `截图：${uploadFilesLabel(media.screenshots || [])}`,
  ].join("\n");
}

function buildPostDetail(post) {
  const [date, platform, account, persona, title, status, metric, media = {}] = post;
  return `
    <div class="detail-list">
      <div><strong>标题</strong><span>${title}</span></div>
      <div><strong>发布日期</strong><span>${date}</span></div>
      <div><strong>平台 / 账号</strong><span>${platform} · ${account}</span></div>
      <div><strong>绑定 IP</strong><span>${persona}</span></div>
      <div><strong>状态 / 数据</strong><span>${status} · ${metric}</span></div>
      <div><strong>发布链接</strong><span>${media.postUrl || "未填写"}</span></div>
      <div><strong>封面图</strong><span>${uploadFilesLabel(media.cover || [])}</span></div>
      <div><strong>正文图片 / 配图</strong><span>${uploadFilesLabel(media.images || [])}</span></div>
      <div><strong>视频文件</strong><span>${uploadFilesLabel(media.video || [])}</span></div>
      <div><strong>发布截图</strong><span>${uploadFilesLabel(media.screenshots || [])}</span></div>
      ${media.mediaNote ? `<div><strong>附件记录</strong><span>${media.mediaNote}</span></div>` : ""}
      <div><strong>实际发布正文</strong><span>${media.publishedCopy || "未填写"}</span></div>
    </div>
  `;
}

function wireUploadInputs() {
  document.querySelectorAll("#modal-body input[type='file']").forEach((input) => {
    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      const box = input.closest(".upload-box");
      const status = box?.querySelector(".upload-status");
      if (!status) return;
      status.textContent = files.length ? `已选择 ${files.length} 个：${files.map((file) => file.name).join(" / ")}` : "未选择文件";
      box.classList.toggle("has-files", files.length > 0);
    });
  });
}

function openModal(action, fallbackTitle = "操作详情", fallbackBody = "") {
  currentModalAction = action;
  const template =
    modalTemplates[action] || {
      kicker: "Record Detail",
      title: fallbackTitle,
      body:
        fallbackBody ||
        `<div class="detail-list"><div><strong>${fallbackTitle}</strong><span>这里会打开对应记录的完整信息。</span></div></div>`,
    };
  document.querySelector("#modal-kicker").textContent = template.kicker;
  document.querySelector("#modal-title").textContent = template.title;
  document.querySelector("#modal-body").innerHTML = typeof template.body === "function" ? template.body() : template.body;
  wireUploadInputs();

  // Show draft/submit buttons for new-content
  const draftBtn = document.querySelector("#modal-draft");
  const confirmBtn = document.querySelector("#modal-confirm");
  if (action === "new-content") {
    draftBtn.style.display = "";
    confirmBtn.textContent = "提交审核";
  } else if (action === "resubmit-review") {
    draftBtn.style.display = "none";
    confirmBtn.textContent = "重新提交";
  } else if (action === "resubmit-edit") {
    draftBtn.style.display = "none";
    confirmBtn.textContent = "保存修改并重新提交";
  } else if (action === "review-action") {
    draftBtn.style.display = "none";
    confirmBtn.textContent = "提交审核意见";
  } else if (action === "metrics-backfill") {
    draftBtn.style.display = "none";
    confirmBtn.textContent = "保存数据";
  } else {
    draftBtn.style.display = "none";
    confirmBtn.textContent = "保存到系统";
  }
  // Ensure confirm button is visible by default (detail handlers may hide it after)
  confirmBtn.style.display = "";

  const backdrop = document.querySelector("#modal-backdrop");
  backdrop.classList.add("open");
  backdrop.setAttribute("aria-hidden", "false");
}

function closeModal() {
  const backdrop = document.querySelector("#modal-backdrop");
  backdrop.classList.remove("open");
  backdrop.setAttribute("aria-hidden", "true");
}

function getModalValues() {
  return Array.from(document.querySelectorAll("#modal-body input, #modal-body select, #modal-body textarea"))
    .filter((field) => field.type !== "file")
    .map((field) => field.value.trim());
}

function switchToView(view) {
  // Permission guard: only navigate to views the current role can access
  const currentRole = document.querySelector("#role-select").value;
  const allowedViews = roleCopy[currentRole]?.nav || [];
  if (!allowedViews.includes(view)) return;
  const navButton = document.querySelector(`.nav-item[data-view="${view}"]`);
  if (navButton) navButton.click();
}

async function saveModalRecord() {
  const values = getModalValues();

  if (currentModalAction === "new-knowledge") {
    const record = {
      title: values[0] || "未命名真实资料",
      detail: values[11] || "待补充资料正文。",
      notes: values[10] || "待补充备注。",
      numericData: values[9] || "待填",
      reviewCycle: values[3] || "每年",
      source: values[8] || "待补充来源",
      sourceType: values[4] || "人工整理",
      subject: (values[6] || values[1] || "未分类").split(/[,，/]/).map((tag) => tag.trim()).filter(Boolean),
      type: values[7] || values[1] || "资料",
      usedInContents: 0,
      verifiedBy: "当前用户",
      lastVerified: values[2] || "待核实",
      visibility: values[5] || "内部",
    };
    knowledge.unshift(record);
    const mode = await persistRecordOnline("knowledge", record);
    renderKnowledge();
    switchToView("knowledge");
    showToast(mode === "cloud" ? "真实资料已保存到云端数据库。" : "真实资料已临时保存到本机。");
    return true;
  }

  if (currentModalAction === "new-persona") {
    const record = [
      values[0] || "未命名 IP",
      values[4] === undefined ? (values[5] || values[1] || "待补充人设定位") : (values[5] || values[1] || "待补充人设定位"),
      `${values[1] || "IP"} · ${values[2] || "未分配"}`,
      values[3] || "待定频率",
      "线索 0",
      values[4] || "school_official",
    ];
    personas.unshift(record);
    const mode = await persistRecordOnline("personas", record);
    renderPersonas();
    switchToView("persona");
    showToast(mode === "cloud" ? "IP 已保存到云端数据库。" : "IP 已临时保存到本机。");
    return true;
  }

  if (currentModalAction === "new-content" || currentModalAction === "new-content-draft") {
    const isDraft = currentModalAction === "new-content-draft";
    const status = isDraft ? "草稿" : "待审核";
    const record = {
      title: values[0] || "未命名内容",
      aiSearchReady: values[1] === "是",
      account: values[2] || "待分配账号",
      audiencePersona: (values[3] || "通用").split(/[,，/]/).map((tag) => tag.trim()).filter(Boolean),
      author: values[4] || roleCopy[document.querySelector("#role-select").value].user,
      contentType: values[5] || "内容",
      emotionalTrigger: values[6] || "待定",
      funnelStage: values[7] || "Awareness",
      leadMagnet: values[8] || "待定",
      primaryKeyword: values[9] || "待定",
      promptsUsed: values[10] || "未使用",
      publishDate: values[11] || new Date().toISOString().slice(0, 10),
      repurposeStatus: values[12] || "原稿",
      status,
      topicCluster: values[14] || "未分类",
      waceFocus: values[15] === "是",
      cta: values[16] || "待补充 CTA",
      references: values[17] || "待补充引用",
      notes: values[18] || "待补充备注",
      metrics: {
        reads: parseInt(values[19]) || 0,
        likes: parseInt(values[20]) || 0,
        comments: parseInt(values[21]) || 0,
        shares: parseInt(values[22]) || 0,
        privateMessages: parseInt(values[23]) || 0,
        leads: parseInt(values[24]) || 0,
      },
      reviewHistory: isDraft ? [] : [{ reviewer: "运营人员", action: "resubmit", comment: "新建内容，提交审核", timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") }],
      repurposeSourceTitle: null,
      repurposeChildren: [],
    };
    // Brand firewall check for agency accounts
    const firewallResult = checkBrandFirewall(record.title + " " + (record.cta || "") + " " + (record.notes || ""), record.account);
    if (!firewallResult.pass) {
      record.reviewHistory.push({
        reviewer: "系统",
        action: "firewall",
        comment: `⚠️ 品牌防火墙触发：中介号内容包含禁用词「${firewallResult.violations.join("、")}」，请修改后再提交。`,
        timestamp: new Date().toISOString().slice(0, 16).replace("T", " "),
      });
      record.status = "草稿";
    }
    contents.unshift(record);
    const mode = await persistRecordOnline("contents", record);
    renderContent();
    renderApp();
    switchToView("content");
    if (!firewallResult.pass) {
      showToast(`⚠️ 品牌防火墙：中介号内容包含禁用词「${firewallResult.violations.join("、")}」，已自动退回草稿。`);
    } else {
      showToast(isDraft
        ? (mode === "cloud" ? "草稿已保存到云端。" : "草稿已临时保存到本机。")
        : (mode === "cloud" ? "内容已提交审核，等待部门负责人处理。" : "内容已提交审核（本地保存）。"));
    }
    return true;
  }

  if (currentModalAction === "new-account") {
    const record = {
      platform: values[0] || "平台",
      accountName: values[1] || "未命名账号",
      status: values[2] || "筹备",
      contentCount: 0,
      investmentTier: values[3] || "辅助",
      ownerType: values[4] || "自营",
      persona: values[5] || "未绑定 IP",
      ipCategory: values[6] || "school_official",
      talent: values[7] || "空白",
      entityName: values[8] || "待填主体",
      entityType: values[9] || "企业",
      operator: values[10] || "未分配",
      frequency: values[11] || "未设置",
      stage: values[2] || "筹备",
      monthlyPosts: 0,
      leads: 0,
      handle: values[12] || "待补充链接",
    };
    accounts.unshift(record);
    const mode = await persistRecordOnline("accounts", record);
    renderAccounts();
    switchToView("accounts");
    showToast(mode === "cloud" ? "账号已保存到云端数据库。" : "账号已临时保存到本机。");
    return true;
  }

  if (currentModalAction === "invite-member") {
    const name = document.querySelector("#member-name")?.value.trim();
    const email = document.querySelector("#member-email")?.value.trim();
    const role = document.querySelector("#member-role")?.value;
    const accountSelect = document.querySelector("#member-accounts");
    const selectedAccounts = accountSelect
      ? Array.from(accountSelect.selectedOptions).map((o) => o.value).join(", ")
      : "";

    if (!name) { showToast("请输入成员姓名。"); return false; }
    if (!email) { showToast("请输入邮箱地址。"); return false; }

    let assignedAccounts = selectedAccounts;
    if (role === "部门负责人" || role === "超级管理员") assignedAccounts = "全部账号";
    if (role === "招生顾问") assignedAccounts = "—";
    if (role === "AI 内容编辑" && !assignedAccounts) assignedAccounts = "—";

    const member = {
      name,
      email,
      role,
      accounts: assignedAccounts || "待分配",
      status: "在职",
      joinDate: new Date().toISOString().slice(0, 10),
    };
    teamMembers.push(member);
    renderPermissions();
    switchToView("team");
    showToast(`已添加成员「${name}」，角色：${role}。`);
    return true;
  }

  if (currentModalAction === "review-action") {
    const actionSelect = document.querySelector("#review-action-select");
    const reviewerSelect = document.querySelector("#review-reviewer-select");
    const commentInput = document.querySelector("#review-comment-input");
    if (!actionSelect || !commentInput) return false;
    const action = actionSelect.value;
    const reviewer = reviewerSelect?.value || "部门负责人";
    let comment = commentInput.value.trim() || "无备注";
    // Collect field-specific suggestions
    const checkedFields = [...document.querySelectorAll(".review-field-cb:checked")].map(cb => cb.dataset.field);
    if (checkedFields.length > 0) {
      comment += `\n【需修改字段】${checkedFields.join("、")}`;
    }
    const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const modalTitle = document.querySelector("#modal-title")?.textContent || "";
    const cleanTitle = modalTitle.replace("审核：", "");
    const item = contents.find((c) => c.title === cleanTitle) || contents.find((c) => cleanTitle.includes(c.title.slice(0, 20))) || window._currentReviewItem;
    if (item) {
      item.reviewHistory = item.reviewHistory || [];
      item.reviewHistory.push({ reviewer, action, comment, timestamp, revisionFields: checkedFields.length > 0 ? checkedFields : undefined });
      if (action === "approve") item.status = "可发布";
      else if (action === "reject") item.status = "已驳回";
      else if (action === "revise") item.status = "已驳回";
      persistContentUpdate(item);
      renderContent();
      renderApp();
    }
    const actionLabel = action === "approve" ? "审核通过" : action === "reject" ? "已驳回" : "修改意见已记录";
    showToast(`${actionLabel}：${comment.slice(0, 30)}`);
    return true;
  }

  if (currentModalAction === "resubmit-review") {
    const modalTitle = document.querySelector("#modal-title")?.textContent || "";
    const cleanTitle = modalTitle.replace("重新提交：", "");
    const item = contents.find((c) => c.title === cleanTitle) || contents.find((c) => cleanTitle.includes(c.title.slice(0, 20)));
    const comment = document.querySelector("#modal-body textarea")?.value.trim() || "已修改重新提交";
    if (item) {
      item.status = "待审核";
      item.reviewHistory = item.reviewHistory || [];
      item.reviewHistory.push({ reviewer: "运营人员", action: "resubmit", comment, timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") });
      persistContentUpdate(item);
      renderContent();
      renderApp();
    }
    showToast("已重新提交审核，等待部门负责人处理。");
    return true;
  }

  if (currentModalAction === "resubmit-edit") {
    const item = window._contentDetailItem;
    if (item) {
      const newTitle = document.querySelector("#edit-title")?.value.trim();
      const newNotes = document.querySelector("#edit-notes")?.value.trim();
      const newCta = document.querySelector("#edit-cta")?.value.trim();
      const newContentType = document.querySelector("#edit-content-type")?.value;
      const newEmotionalTrigger = document.querySelector("#edit-emotional-trigger")?.value;
      const newFunnelStage = document.querySelector("#edit-funnel-stage")?.value;
      const newLeadMagnet = document.querySelector("#edit-lead-magnet")?.value.trim();
      const newPrimaryKeyword = document.querySelector("#edit-primary-keyword")?.value.trim();
      const newTopicCluster = document.querySelector("#edit-topic-cluster")?.value.trim();
      const newRepurposeStatus = document.querySelector("#edit-repurpose-status")?.value;
      const newWaceFocus = document.querySelector("#edit-wace-focus")?.value === "是";
      const newReferences = document.querySelector("#edit-references")?.value.trim();
      const comment = document.querySelector("#edit-comment")?.value.trim() || "已修改内容";

      const changes = [];
      if (newTitle && newTitle !== item.title) { item.title = newTitle; changes.push("标题"); }
      if (newNotes !== undefined && newNotes !== item.notes) { item.notes = newNotes; changes.push("备注"); }
      if (newCta && newCta !== item.cta) { item.cta = newCta; changes.push("CTA"); }
      if (newContentType && newContentType !== item.contentType) { item.contentType = newContentType; changes.push("内容类型"); }
      if (newEmotionalTrigger && newEmotionalTrigger !== item.emotionalTrigger) { item.emotionalTrigger = newEmotionalTrigger; changes.push("情绪钩子"); }
      if (newFunnelStage && newFunnelStage !== item.funnelStage) { item.funnelStage = newFunnelStage; changes.push("漏斗阶段"); }
      if (newLeadMagnet !== undefined && newLeadMagnet !== item.leadMagnet) { item.leadMagnet = newLeadMagnet; changes.push("Lead Magnet"); }
      if (newPrimaryKeyword !== undefined && newPrimaryKeyword !== item.primaryKeyword) { item.primaryKeyword = newPrimaryKeyword; changes.push("关键词"); }
      if (newTopicCluster !== undefined && newTopicCluster !== item.topicCluster) { item.topicCluster = newTopicCluster; changes.push("主题簇"); }
      if (newRepurposeStatus && newRepurposeStatus !== item.repurposeStatus) { item.repurposeStatus = newRepurposeStatus; changes.push("复用状态"); }
      if (newWaceFocus !== item.waceFocus) { item.waceFocus = newWaceFocus; changes.push("WACE Focus"); }
      if (newReferences !== undefined && newReferences !== item.references) { item.references = newReferences; changes.push("引用资料"); }

      // Brand firewall check on edit
      const fwEdit = checkBrandFirewall(item.title + " " + (item.cta || "") + " " + (item.notes || ""), item.account);
      if (!fwEdit.pass) {
        item.status = "草稿";
        item.reviewHistory = item.reviewHistory || [];
        item.reviewHistory.push({ reviewer: "系统", action: "firewall", comment: `品牌防火墙：包含禁用词「${fwEdit.violations.join("、")}」`, timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") });
        persistContentUpdate(item);
        renderContent();
        renderApp();
        showToast(`⚠️ 品牌防火墙触发，已退回草稿。`);
        return true;
      }

      item.status = "待审核";
      item.reviewHistory = item.reviewHistory || [];
      const changeNote = changes.length > 0 ? `修改了${changes.join("、")}。${comment}` : comment;
      item.reviewHistory.push({ reviewer: "运营人员", action: "resubmit", comment: changeNote, timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") });
      persistContentUpdate(item);
      renderContent();
      renderApp();
    }
    showToast("已保存修改并重新提交审核。");
    return true;
  }

  if (currentModalAction === "metrics-backfill") {
    const reads = parseInt(document.querySelector("#bf-reads")?.value) || 0;
    const likes = parseInt(document.querySelector("#bf-likes")?.value) || 0;
    const comments = parseInt(document.querySelector("#bf-comments")?.value) || 0;
    const shares = parseInt(document.querySelector("#bf-shares")?.value) || 0;
    const privateMessages = parseInt(document.querySelector("#bf-messages")?.value) || 0;
    const leads = parseInt(document.querySelector("#bf-leads")?.value) || 0;
    const modalTitle = document.querySelector("#modal-title")?.textContent || "";
    const cleanTitle = modalTitle.replace("数据回填：", "");
    const item = contents.find((c) => c.title === cleanTitle) || contents.find((c) => cleanTitle.includes(c.title.slice(0, 15)));
    if (item) {
      item.metrics = { reads, likes, comments, shares, privateMessages, leads };
      if (reads > 0 || leads > 0) item.status = "已复盘";
      persistContentUpdate(item);
      renderContent();
      renderApp();
      renderTopContent();
    }
    const score = contentScore({ reads, likes, comments, shares, privateMessages, leads });
    showToast(`数据已保存，综合分：${Math.round(score)}`);
    return true;
  }

  if (currentModalAction === "new-lead") {
    if (!requireAuth("新增线索")) return false;
    const leadTypeVal = document.querySelector("#lead-type")?.value || "direct";
    const channelVal = document.querySelector("#lead-channel")?.value || values[5] || "其他";
    const wechatIdVal = document.querySelector("#lead-wechat-id")?.value.trim() || "";
    const agentNameVal = document.querySelector("#lead-agent-name")?.value.trim() || "";
    const partnerSchoolVal = document.querySelector("#lead-partner-school")?.value.trim() || "";
    const commissionVal = parseFloat(document.querySelector("#lead-commission")?.value) || 0;
    const revenueVal = parseFloat(document.querySelector("#lead-revenue")?.value) || 0;
    const lead = {
      name: `${values[2] || "G"} ${values[1] || "学生家长"}`,
      source: leadTypeVal === "agent" ? `中介：${agentNameVal}推荐` : leadTypeVal === "partner_school" ? `合作学校：${partnerSchoolVal}` : `来自${channelVal}：${values[6] || "IP"}`,
      stage: "私信咨询",
      assignee: "",
      date: new Date().toISOString().slice(0, 10),
      grade: values[2] || "",
      parentName: values[3] || "",
      course: values[4] || "",
      sourceLink: values[10] || "",
      channel: channelVal,
      wechatId: wechatIdVal,
      wechatAddTime: wechatIdVal ? new Date().toISOString() : null,
      notes: values[11] || "",
      leadType: leadTypeVal,
      agentName: leadTypeVal === "agent" ? agentNameVal : "",
      partnerSchool: leadTypeVal === "partner_school" ? partnerSchoolVal : "",
      commissionRate: leadTypeVal === "agent" ? commissionVal : 0,
      expectedRevenue: revenueVal || 0,
      followUps: [],
    };
    crmLeads.unshift(lead);
    persistLeadUpdate(lead);
    addAuditLog("新增线索", `${lead.name} (${LEAD_TYPE_LABELS[lead.leadType] || "直招"})`);
    renderCrm();
    renderNotifications();
    switchToView("crm");
    showToast("新线索已添加到「私信咨询」阶段，请分配招生顾问。");
    return true;
  }

  if (currentModalAction === "lead-add-followup") {
    if (!requireAuth("添加跟进记录")) return false;
    const lead = window._editingLead;
    const fuNote = document.querySelector("#fu-note")?.value.trim();
    if (lead && fuNote) {
      if (!lead.followUps) lead.followUps = [];
      lead.followUps.push({
        date: new Date().toISOString().slice(0, 10),
        note: fuNote,
        nextAction: document.querySelector("#fu-next-action")?.value.trim() || "",
        nextDate: document.querySelector("#fu-next-date")?.value || "",
        author: roleCopy[document.querySelector("#role-select").value]?.user || "系统",
      });
      persistLeadUpdate(lead);
      addAuditLog("添加跟进", `${lead.name}: ${fuNote.slice(0, 30)}`);
      renderCrm();
      renderNotifications();
      showToast("跟进记录已添加");
    } else if (!fuNote) {
      showToast("请填写跟进内容");
      return false;
    }
    return true;
  }

  if (currentModalAction === "lead-edit") {
    if (!requireAuth("编辑线索")) return false;
    const lead = window._editingLead;
    if (lead) {
      const oldName = lead.name;
      lead.name = document.querySelector("#edit-lead-name")?.value.trim() || lead.name;
      lead.leadType = document.querySelector("#edit-lead-type")?.value || "direct";
      lead.stage = document.querySelector("#edit-lead-stage")?.value || lead.stage;
      lead.assignee = document.querySelector("#edit-lead-assignee")?.value || "";
      lead.grade = document.querySelector("#edit-lead-grade")?.value || "";
      lead.course = document.querySelector("#edit-lead-course")?.value.trim() || "";
      lead.parentName = document.querySelector("#edit-lead-parent")?.value.trim() || "";
      lead.channel = document.querySelector("#edit-lead-channel")?.value.trim() || "";
      lead.wechatId = document.querySelector("#edit-lead-wechat")?.value.trim() || "";
      lead.agentName = document.querySelector("#edit-lead-agent")?.value.trim() || "";
      lead.partnerSchool = document.querySelector("#edit-lead-partner")?.value.trim() || "";
      lead.commissionRate = parseFloat(document.querySelector("#edit-lead-commission")?.value) || 0;
      lead.expectedRevenue = parseFloat(document.querySelector("#edit-lead-revenue")?.value) || 0;
      lead.sourceLink = document.querySelector("#edit-lead-link")?.value.trim() || "";
      lead.notes = document.querySelector("#edit-lead-notes")?.value.trim() || "";
      persistLeadUpdate(lead);
      addAuditLog("编辑线索", `${lead.name} → 阶段: ${lead.stage}`);
      renderCrm();
      showToast(`线索「${lead.name}」已更新`);
    }
    return true;
  }

  if (currentModalAction === "upload-post") {
    const uploads = getUploadSummary();
    const media = {
      mediaType: values[5] || "图文",
      postUrl: values[6] || "",
      ...uploads,
      publishedCopy: values[11] || "待补充正文",
    };
    const record = [
      values[0] || new Date().toISOString().slice(0, 10),
      values[1] || "平台",
      values[2] || "发布账号",
      values[3] || "绑定 IP",
      values[4] || "未命名发布内容",
      "已发布",
      `${Object.values(uploads).flat().length} 个附件 · 待回填`,
      media,
    ];
    posts.unshift(record);
    const mode = await persistRecordOnline("posts", record);
    renderPublishing();
    queryArchive();
    switchToView("dashboard");
    setTimeout(() => {
      const el = document.querySelector("#publishing-table");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 200);
    showToast(mode === "cloud" ? "发布归档已保存到云端数据库。" : "发布归档已临时保存到本机。");
    return true;
  }

  // Content detail: submit draft for review
  if (currentModalAction === "content-submit-review") {
    const item = window._contentDetailItem;
    if (item) {
      item.status = "待审核";
      item.reviewHistory = item.reviewHistory || [];
      item.reviewHistory.push({ reviewer: "运营人员", action: "resubmit", comment: "草稿提交审核", timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") });
      persistContentUpdate(item);
      renderContent();
      renderApp();
    }
    showToast("已提交审核，等待部门负责人处理。");
    return true;
  }

  // Content detail: resubmit rejected content
  if (currentModalAction === "content-resubmit") {
    const item = window._contentDetailItem;
    if (item) {
      item.status = "待审核";
      item.reviewHistory = item.reviewHistory || [];
      item.reviewHistory.push({ reviewer: "运营人员", action: "resubmit", comment: "已修改重新提交", timestamp: new Date().toISOString().slice(0, 16).replace("T", " ") });
      persistContentUpdate(item);
      renderContent();
      renderApp();
    }
    showToast("已重新提交审核，等待部门负责人处理。");
    return true;
  }

  // Content detail: publish (open upload-post form)
  if (currentModalAction === "content-publish") {
    openModal("upload-post");
    return true;
  }

  return false;
}

function statusColor(s) {
  const map = { "待审核": "red", "已驳回": "red", "草稿": "blue", "草稿修改": "amber", "待回填": "amber", "待发布": "amber", "待归档": "amber", "可发布": "green", "审核通过": "green", "Posted": "green", "已发布": "green", "已复盘": "green" };
  return map[s] || "blue";
}

function buildResubmitEditForm(item) {
  const lastReject = (item.reviewHistory || []).filter((r) => r.action === "reject" || r.action === "revise").pop();
  return `
    ${lastReject ? `
    <div class="modal-section" style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin-bottom:16px">
      <h3 style="color:#dc2626;margin:0 0 6px">驳回原因</h3>
      <p style="margin:0;color:#dc2626">${escapeHtml((lastReject.comment || "未填写原因").split("\n")[0])}</p>
      ${lastReject.revisionFields?.length ? `<div class="revision-field-tags" style="margin-top:8px">${lastReject.revisionFields.map(f => `<span class="revision-field-tag">⚠ ${f}</span>`).join("")}</div>` : ""}
      <small style="color:var(--muted)">${lastReject.reviewer} · ${lastReject.timestamp}</small>
    </div>` : ""}
    <div class="modal-section">
      <h3>修改内容</h3>
      <label>标题<input type="text" id="edit-title" value="${escapeHtml(item.title)}" /></label>
      <label>备注 / 正文要点<textarea id="edit-notes" rows="3">${escapeHtml(item.notes || "")}</textarea></label>
      <label>CTA 引导语<input type="text" id="edit-cta" value="${escapeHtml(item.cta || "")}" /></label>
      <label>内容类型
        <select id="edit-content-type">
          ${Object.entries(CONTENT_TYPE_CATEGORIES).map(([cat, info]) =>
            `<optgroup label="${cat}（目标${info.target}%）">${info.subtypes.map(
              (t) => `<option${t === item.contentType ? " selected" : ""}>${t}</option>`
            ).join("")}</optgroup>`
          ).join("")}
        </select>
      </label>
      <label>情绪钩子
        <select id="edit-emotional-trigger">
          ${["反常识", "焦虑共鸣", "向往", "痛点直击", "好奇驱动", "数字震撼", "案例代入", "理性避坑", "痛点反问"].map(
            (t) => `<option${t === item.emotionalTrigger ? " selected" : ""}>${t}</option>`
          ).join("")}
        </select>
      </label>
      <label>漏斗阶段
        <select id="edit-funnel-stage">
          ${["Awareness", "Consideration", "Trust", "Visit", "Enroll"].map(
            (t) => `<option${t === item.funnelStage ? " selected" : ""}>${t}</option>`
          ).join("")}
        </select>
      </label>
      <label>Lead Magnet<input type="text" id="edit-lead-magnet" value="${escapeHtml(item.leadMagnet || "")}" /></label>
      <label>主关键词<input type="text" id="edit-primary-keyword" value="${escapeHtml(item.primaryKeyword || "")}" /></label>
      <label>主题簇<input type="text" id="edit-topic-cluster" value="${escapeHtml(item.topicCluster || "")}" /></label>
      <label>复用状态
        <select id="edit-repurpose-status">
          ${["原稿", "可二改", "可转视频号", "可转小红书", "可转抖音", "可转独立站", "已转小红书标题", "已复用多平台", "归档"].map(
            (t) => `<option${t === item.repurposeStatus ? " selected" : ""}>${t}</option>`
          ).join("")}
        </select>
      </label>
      <label>WACE Focus<select id="edit-wace-focus"><option value="否"${!item.waceFocus ? " selected" : ""}>否</option><option value="是"${item.waceFocus ? " selected" : ""}>是</option></select></label>
      <label>引用资料<input type="text" id="edit-references" value="${escapeHtml(item.references || "")}" /></label>
      <label>修改说明<textarea id="edit-comment" rows="2" placeholder="说明本次修改了什么…"></textarea></label>
    </div>
    <div class="modal-section">
      <h3>审核记录</h3>
      ${buildReviewTimeline(item.reviewHistory)}
    </div>
  `;
}

function buildContentDetailHtml(item) {
  const chainHtml = buildRepurposeChainHtml(item);
  return `
    <div class="detail-list">
      <div><strong>Account</strong><span>${item.account}</span></div>
      <div><strong>Status</strong><span>${item.status}</span></div>
      <div><strong>Funnel Stage</strong><span>${item.funnelStage}</span></div>
      <div><strong>Emotional Trigger</strong><span>${item.emotionalTrigger}</span></div>
      <div><strong>Content Type</strong><span>${item.contentType}</span></div>
      <div><strong>Lead Magnet</strong><span>${item.leadMagnet}</span></div>
      <div><strong>Audience Persona</strong><span>${(item.audiencePersona || []).join(" / ")}</span></div>
      <div><strong>CTA</strong><span>${item.cta}</span></div>
      <div><strong>Publish Date</strong><span>${item.publishDate}</span></div>
      <div><strong>Primary Keyword</strong><span>${item.primaryKeyword}</span></div>
      <div><strong>Topic Cluster</strong><span>${item.topicCluster}</span></div>
      <div><strong>Repurpose Status</strong><span>${item.repurposeStatus}</span></div>
      <div><strong>引用资料</strong><span>${buildRefLinks(item.references) || item.references || "—"}</span></div>
      <div><strong>Prompt</strong><span>${buildPromptLinks(item.promptsUsed) || item.promptsUsed || "—"}</span></div>
      <div><strong>WACE Focus</strong><span>${item.waceFocus ? "是" : "否"}</span></div>
      <div><strong>Notes</strong><span>${item.notes}</span></div>
    </div>
    <div class="modal-section">
      <h3>内容表现</h3>
      ${renderMetricsDetail(item.metrics)}
    </div>
    ${chainHtml ? `<div class="modal-section"><h3>复用链</h3>${chainHtml}</div>` : ""}
    <div class="modal-section">
      <h3>审核记录</h3>
      ${buildReviewTimeline(item.reviewHistory)}
    </div>
    <div class="modal-section">
      <h3>团队评论 (${(item.comments || []).length})</h3>
      ${(item.comments || []).length > 0 ? `<div class="comment-list">${(item.comments || []).map(c => `
        <div class="comment-entry">
          <div class="comment-author">${escapeHtml(c.author)} <span class="comment-time">${c.time?.slice(0, 16).replace("T", " ") || ""}</span></div>
          <div class="comment-text">${escapeHtml(c.text)}</div>
        </div>
      `).join("")}</div>` : `<p style="color:var(--muted)">暂无评论。</p>`}
      <div class="comment-form" style="margin-top:10px">
        <textarea id="content-comment-input" placeholder="输入评论…" style="width:100%;min-height:60px;padding:8px;border:1px solid var(--line);border-radius:6px;font-size:13px;resize:vertical"></textarea>
        <button class="primary-button" type="button" style="margin-top:6px" onclick="addContentComment('${escapeHtml(item.title)}')">发表评论</button>
      </div>
    </div>
  `;
}

function addContentComment(title) {
  const input = document.querySelector("#content-comment-input");
  const text = input?.value.trim();
  if (!text) { showToast("请输入评论内容"); return; }
  const item = contents.find(c => c.title === title);
  if (!item) return;
  if (!item.comments) item.comments = [];
  const role = document.querySelector("#role-select")?.value || "admin";
  item.comments.push({
    author: roleCopy[role]?.user || "用户",
    text,
    time: new Date().toISOString(),
  });
  persistContentUpdate(item);
  addAuditLog("评论内容", `${title.slice(0, 20)}: ${text.slice(0, 30)}`);
  // Re-render the modal
  const modalBody = document.querySelector("#modal-body");
  if (modalBody) modalBody.innerHTML = buildContentDetailHtml(item);
  showToast("评论已添加");
}

function renderKpiCards() {
  const target = document.querySelector("#kpi-cards");
  if (!target) return;

  const currentRole = document.querySelector("#role-select").value;
  const isReviewer = currentRole === "lead" || currentRole === "admin";
  const filtered = getFilteredContents();

  // 1. 今日待发布 — count from dailyTasks with same filter logic as renderDailyTasks
  const visibleDailyTasks = isReviewer
    ? dailyTasks
    : dailyTasks.filter(([, , account]) => {
        const myNames = getMyAccountNames();
        return myNames.length === 0 ? true : myNames.includes(account);
      });
  const todayPublishCount = visibleDailyTasks.length;

  // 2. 待审核 — items needing review (different meaning per role)
  const pendingReviewCount = filtered.filter((c) => c.status === "待审核").length;

  // 3. 待回填数据 — published but no metrics backfill yet
  const backfillCount = filtered.filter(
    (c) => c.status === "待回填" || (c.status === "已发布" && c.metrics && c.metrics.reads === 0 && c.metrics.leads === 0)
  ).length;

  // 4. 本周新线索 — count from CRM "私信咨询" column
  const newLeadsCount = crmLeads.filter((l) => l.stage === "私信咨询").length;

  // Role-specific card sets
  const cards = [];

  if (currentRole === "admission") {
    // Admission: CRM-focused KPIs — no content metrics
    const myName = roleCopy[currentRole].user;
    const myLeads = crmLeads.filter((l) => l.assignee === myName || l.assignee === "");
    const pendingFollow = myLeads.filter((l) => l.stage === "私信咨询" || l.stage === "加企微").length;
    const todayVisits = myLeads.filter((l) => l.stage === "试听/到访").length;
    const enrolled = myLeads.filter((l) => l.stage === "签约").length;

    cards.push({
      label: "待跟进线索",
      value: pendingFollow,
      desc: "条需联系",
      color: pendingFollow > 0 ? "var(--brand)" : "var(--muted)",
    });
    cards.push({
      label: "今日预约到访",
      value: todayVisits,
      desc: "组待接待",
      color: todayVisits > 0 ? "#e67700" : "var(--muted)",
    });
    cards.push({
      label: "本周新线索",
      value: newLeadsCount,
      desc: "条新线索",
      color: newLeadsCount > 0 ? "var(--brand)" : "var(--muted)",
    });
    cards.push({
      label: "已签约",
      value: enrolled,
      desc: "人已报名",
      color: enrolled > 0 ? "#16a34a" : "var(--muted)",
    });
  } else {
    // Content roles: operator, lead, admin, ai
    cards.push({
      label: "今日任务",
      value: todayPublishCount,
      desc: "条待处理",
      color: todayPublishCount > 0 ? "var(--brand)" : "var(--muted)",
    });

    if (isReviewer) {
      cards.push({
        label: "待审核",
        value: pendingReviewCount,
        desc: "条内容",
        color: pendingReviewCount > 0 ? "#e67700" : "var(--muted)",
      });
    } else if (currentRole === "ai") {
      cards.push({
        label: "我的待审核",
        value: pendingReviewCount,
        desc: "条提交中",
        color: pendingReviewCount > 0 ? "#e67700" : "var(--muted)",
      });
    } else {
      cards.push({
        label: "待审核",
        value: pendingReviewCount,
        desc: "条等待中",
        color: pendingReviewCount > 0 ? "#e67700" : "var(--muted)",
      });
    }

    cards.push({
      label: "待回填数据",
      value: backfillCount,
      desc: "条需补数据",
      color: backfillCount > 0 ? "#e67700" : "var(--muted)",
    });

    if (currentRole !== "ai") {
      cards.push({
        label: "本周新线索",
        value: newLeadsCount,
        desc: "条新线索",
        color: newLeadsCount > 0 ? "var(--brand)" : "var(--muted)",
      });
    }
  }

  target.innerHTML = cards
    .map(
      (c) => `
    <article class="metric-card card">
      <span>${c.label}</span>
      <strong style="color:${c.color}">${c.value}</strong>
      <small>${c.desc}</small>
    </article>
  `
    )
    .join("");
}

function renderPublishingProgress() {
  const target = document.querySelector("#publishing-progress");
  if (!target) return;

  const currentRole = document.querySelector("#role-select").value;
  const isReviewer = currentRole === "lead" || currentRole === "admin";

  // Compute visible daily tasks (same logic as renderKpiCards)
  const visibleDailyTasks = isReviewer
    ? dailyTasks
    : dailyTasks.filter(([, , account]) => {
        const myNames = getMyAccountNames();
        return myNames.length === 0 ? true : myNames.includes(account);
      });

  const totalPlanned = visibleDailyTasks.length;
  const postedCount = visibleDailyTasks.filter(([, , , , , status]) => status === "已发布" || status === "已复盘" || status === "待归档").length;
  const pendingCount = visibleDailyTasks.filter(([, , , , , status]) => status === "待审核").length;
  const backfillCount = visibleDailyTasks.filter(([, , , , , status]) => status === "待回填").length;
  const draftCount = visibleDailyTasks.filter(([, , , , , status]) => status === "待发布" || status === "草稿" || status === "草稿修改" || status === "可发布").length;

  target.innerHTML = `
    <div><span>计划发布</span><strong>${totalPlanned} 条</strong></div>
    <div><span>已发布归档</span><strong>${postedCount} 条</strong></div>
    <div><span>待审核</span><strong>${pendingCount} 条</strong></div>
    <div><span>待回填数据</span><strong>${backfillCount} 条</strong></div>
  `;

  // Also update sidebar daily goal — but only for content roles (admission/ai handled by renderDashboardForRole)
  const sidebarRole = document.querySelector("#role-select").value;
  if (sidebarRole !== "admission" && sidebarRole !== "ai") {
    const sidebar = document.querySelector("#sidebar-daily-goal");
    if (sidebar) {
      const goalCount = totalPlanned;
      const doneCount = postedCount;
      sidebar.innerHTML = `
        <span>今日目标</span>
        <strong>${goalCount} 条内容归档</strong>
        <p>已完成 ${doneCount}/${goalCount}，所有已发布内容必须上传正文、图片、链接和截图。</p>
      `;
    }
  }
}

function renderTasks() {
  const target = document.querySelector("#task-summary");
  if (!target) return;
  // Admission role uses task-summary for CRM funnel (set by renderDashboardForRole) — don't overwrite
  const taskRole = document.querySelector("#role-select").value;
  if (taskRole === "admission") return;

  // Use role-filtered contents for status counts
  const filtered = getFilteredContents();
  const allStatuses = [];
  tasks.forEach(([, title, status]) => {
    const match = filtered.find((c) => title.includes(c.title?.slice(0, 8)) || c.title?.includes(title.slice(0, 8)));
    if (match) {
      allStatuses.push(match.status);
    } else {
      // Only include hardcoded task if role sees all content
      const role = document.querySelector("#role-select").value;
      if (roleCopy[role].contentFilter === "all") allStatuses.push(status);
    }
  });
  const matchedTitles = tasks.map(([, t]) => t);
  filtered.forEach((c) => {
    if (!matchedTitles.some((t) => t.includes(c.title?.slice(0, 8)) || c.title?.includes(t.slice(0, 8)))) {
      allStatuses.push(c.status);
    }
  });

  // Count by status group
  const draft = allStatuses.filter((s) => s === "草稿").length;
  const pending = allStatuses.filter((s) => s === "待审核").length;
  const rejected = allStatuses.filter((s) => s === "已驳回").length;
  const ready = allStatuses.filter((s) => s === "可发布" || s === "审核通过").length;
  const backfill = allStatuses.filter((s) => s === "待回填").length;
  const published = allStatuses.filter((s) => s === "已发布" || s === "Posted" || s === "已复盘").length;

  target.innerHTML = `
    <div class="status-summary-row">
      ${draft ? `<div class="status-chip blue" data-filter-status="草稿"><strong>${draft}</strong><span>草稿</span></div>` : ""}
      ${pending ? `<div class="status-chip amber" data-filter-status="待审核"><strong>${pending}</strong><span>待审核</span></div>` : ""}
      ${rejected ? `<div class="status-chip red" data-filter-status="已驳回"><strong>${rejected}</strong><span>已驳回</span></div>` : ""}
      ${ready ? `<div class="status-chip green" data-filter-status="可发布"><strong>${ready}</strong><span>可发布</span></div>` : ""}
      ${backfill ? `<div class="status-chip amber" data-filter-status="待回填"><strong>${backfill}</strong><span>待回填</span></div>` : ""}
      ${published ? `<div class="status-chip muted" data-filter-status="已发布"><strong>${published}</strong><span>已发布</span></div>` : ""}
    </div>
  `;
}

function renderPublishing() {
  const target = document.querySelector("#publishing-table");
  target.innerHTML = posts
    .map(
      ([date, platform, account, persona, title, status, metric]) => `
        <tr class="clickable-row row-action" data-title="${title}" data-kind="发布记录">
          <td>${date}</td>
          <td>${platform}</td>
          <td>${account}</td>
          <td>${persona}</td>
          <td><strong>${title}</strong></td>
          <td>${badge(status, status === "待回填" ? "amber" : "green")}</td>
          <td>${metric}</td>
        </tr>
      `,
    )
    .join("");
}

function renderDailyTasks() {
  const target = document.querySelector("#daily-task-list");
  const currentRole = document.querySelector("#role-select").value;
  const isReviewer = currentRole === "lead" || currentRole === "admin";

  function taskButtons(status, title) {
    const detail = `<button class="ghost-button row-action" type="button" data-title="${title}" data-kind="任务处理">详情</button>`;
    const review = `<button class="ghost-button row-action" type="button" data-title="${title}" data-kind="任务处理">审核</button>`;
    const submit = `<button class="ghost-button row-action" type="button" data-title="${title}" data-kind="任务处理">提交审核</button>`;
    const archive = `<button class="primary-button action-button" type="button" data-action="upload-post">发布归档</button>`;

    if (status === "待发布") {
      // 审核通过，等运营人员去手机发布，发完回来归档
      return isReviewer ? `${detail}${archive}` : `${detail}${archive}`;
    }
    if (status === "待审核") {
      // 运营人员等待审核，负责人可审核
      return isReviewer ? `${detail}${review}` : `${detail}`;
    }
    if (status === "草稿修改" || status === "草稿") {
      // 需要修改/完善，运营人员提交审核，负责人可审核也可提交
      return isReviewer ? `${detail}${review}${submit}` : `${detail}${submit}`;
    }
    if (status === "待归档") {
      // 已发布但还没填归档信息
      return `${detail}${archive}`;
    }
    return `${detail}`;
  }

  const visibleTasks = (currentRole === "lead" || currentRole === "admin")
    ? dailyTasks
    : dailyTasks.filter(([, , account]) => {
        const myNames = getMyAccountNames();
        return myNames.length === 0 ? true : myNames.includes(account);
      });

  if (visibleTasks.length === 0) {
    target.innerHTML = `<p style="color:var(--muted);padding:20px 0">今日暂无分配给你的任务。</p>`;
    return;
  }

  target.innerHTML = visibleTasks
    .map(
      ([time, platform, account, persona, title, status, color]) => `
        <article class="daily-task-card">
          <div>
            <div class="card-meta">
              ${badge(time)}
              ${badge(platform, "blue")}
              ${badge(status, color)}
            </div>
            <h4>${title}</h4>
            <p>${account} · ${persona}</p>
          </div>
          <div class="daily-task-actions">
            ${taskButtons(status, title)}
          </div>
        </article>
      `,
    )
    .join("");
}

function queryArchive() {
  const date = document.querySelector("#archive-date").value;
  const platform = document.querySelector("#archive-platform").value;
  const account = document.querySelector("#archive-account").value;
  const keyword = document.querySelector("#archive-search").value.trim();
  const result = posts.filter(([postDate, postPlatform, postAccount, persona, title]) => {
    const matchedDate = !date || postDate === date;
    const matchedPlatform = platform === "全部平台" || postPlatform === platform;
    const matchedAccount = account === "全部账号" || postAccount === account;
    const matchedKeyword = !keyword || `${persona} ${title}`.includes(keyword);
    return matchedDate && matchedPlatform && matchedAccount && matchedKeyword;
  });

  document.querySelector("#query-result").innerHTML = `
    <strong>${result.length} 条记录</strong>
    <span>${date || "全部日期"} · ${platform} · ${account}</span>
  `;

  document.querySelector("#publishing-table").innerHTML = result
    .map(
      ([postDate, postPlatform, postAccount, persona, title, status, metric]) => `
        <tr class="clickable-row row-action" data-title="${title}" data-kind="发布记录">
          <td>${postDate}</td>
          <td>${postPlatform}</td>
          <td>${postAccount}</td>
          <td>${persona}</td>
          <td><strong>${title}</strong></td>
          <td>${badge(status, status === "待回填" ? "amber" : "green")}</td>
          <td>${metric}</td>
        </tr>
      `,
    )
    .join("");

  showToast(`已查询：${result.length} 条发布记录`);
}

function buildRefLinks(refsText) {
  if (!refsText || refsText === "待补充引用") return "";
  return refsText
    .split(/[/／]/)
    .map((ref) => ref.trim())
    .filter(Boolean)
    .map((ref) => {
      const matched = knowledge.find((k) => k.title.includes(ref) || ref.includes(k.title));
      if (matched) return `<button class="ref-link knowledge-detail" type="button" data-title="${escapeHtml(matched.title)}">${escapeHtml(ref)}</button>`;
      return `<span style="font-size:12px;color:var(--muted)">${escapeHtml(ref)}</span>`;
    })
    .join(" · ");
}

/* ── P2 TASK 3.1: Structured associations — reverse lookups ── */
function getContentsReferencingKb(kbTitle) {
  return contents.filter(c => {
    if (!c.references) return false;
    const refs = c.references.split(/[/／]/).map(r => r.trim());
    return refs.some(r => kbTitle.includes(r) || r.includes(kbTitle));
  });
}

function getContentsUsingPrompt(promptTitle) {
  return contents.filter(c => {
    if (!c.promptsUsed) return false;
    return c.promptsUsed.includes(promptTitle) || promptTitle.includes(c.promptsUsed);
  });
}

function buildReverseContentList(items, label) {
  if (!items.length) return `<p style="color:var(--muted)">暂无${label}。</p>`;
  return `<div class="reverse-content-list">${items.map(c =>
    `<button class="ref-link content-detail" type="button" data-title="${escapeHtml(c.title)}">
      <span class="reverse-title">${escapeHtml(c.title)}</span>
      <span class="badge ${statusColor(c.status)}" style="font-size:10px">${c.status}</span>
      <span style="font-size:11px;color:var(--muted)">${c.account}</span>
    </button>`
  ).join("")}</div>`;
}

function buildPromptLinks(promptsText) {
  if (!promptsText || promptsText === "未使用") return "";
  const matched = aiPromptLibrary.find(p => p.title === promptsText || promptsText.includes(p.title) || p.title.includes(promptsText));
  if (matched) return `<button class="ref-link ai-detail" type="button" data-title="${escapeHtml(matched.title)}">${escapeHtml(promptsText)}</button>`;
  return `<span style="font-size:12px;color:var(--muted)">${escapeHtml(promptsText)}</span>`;
}

/* ── P1: Metrics helpers ── */
function fmtNum(n) {
  if (!n && n !== 0) return "—";
  if (n >= 10000) return (n / 10000).toFixed(1) + "w";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(n);
}

function renderMetricsBadges(m) {
  if (!m) return "";
  const items = [
    ["阅读", m.reads], ["赞", m.likes], ["评论", m.comments],
    ["转发", m.shares], ["私信", m.privateMessages], ["线索", m.leads],
  ];
  return `<div class="content-metrics">${items.map(([l, v]) => `<span class="metric-item"><span class="metric-label">${l}</span> ${fmtNum(v)}</span>`).join("")}</div>`;
}

function renderMetricsDetail(m) {
  if (!m) return '<p style="color:var(--muted)">暂无数据，待回填。</p>';
  const items = [
    ["阅读", m.reads], ["点赞", m.likes], ["评论", m.comments],
    ["转发", m.shares], ["私信", m.privateMessages], ["线索", m.leads],
  ];
  return `<div class="metrics-detail-grid">${items.map(([l, v]) => `<div class="metric-detail-card"><span class="metric-detail-label">${l}</span><strong class="metric-detail-value">${(v || 0).toLocaleString()}</strong></div>`).join("")}</div>`;
}

function contentScore(m) {
  if (!m) return 0;
  return (m.reads || 0) * 0.01 + (m.likes || 0) * 1 + (m.comments || 0) * 2 + (m.shares || 0) * 1.5 + (m.privateMessages || 0) * 5 + (m.leads || 0) * 20;
}

/* ── P1: Repurpose chain helpers ── */
function buildRepurposeChainHtml(item) {
  const chain = [];
  // Walk up to find root
  let root = item;
  const seen = new Set();
  while (root.repurposeSourceTitle) {
    if (seen.has(root.title)) break;
    seen.add(root.title);
    const parent = contents.find((c) => c.title === root.repurposeSourceTitle);
    if (!parent) break;
    root = parent;
  }
  chain.push(root);
  // Collect children recursively
  function addChildren(node) {
    (node.repurposeChildren || []).forEach((childTitle) => {
      const child = contents.find((c) => c.title === childTitle);
      if (child) { chain.push(child); addChildren(child); }
    });
  }
  addChildren(root);
  if (chain.length <= 1) return "";
  const acctShort = (c) => { const p = (c.account || "").split("·"); return p.length > 1 ? p[1] : p[0].slice(0, 6); };
  return `<div class="repurpose-chain">${chain.map((c, i) => {
    const isActive = c.title === item.title;
    const nodeClass = i === 0 ? "chain-node original" : "chain-node adapted";
    return (i > 0 ? '<span class="chain-arrow">→</span>' : "") +
      `<span class="${nodeClass}${isActive ? " active" : ""}" title="${escapeHtml(c.title)}">${escapeHtml(acctShort(c))} · ${escapeHtml(c.title).slice(0, 10)}</span>`;
  }).join("")}</div>`;
}

function buildRepurposeChainMini(item) {
  if (!item.repurposeSourceTitle && (!item.repurposeChildren || item.repurposeChildren.length === 0)) return "";
  const chain = buildRepurposeChainHtml(item);
  return chain ? `<div class="repurpose-chain-mini">${chain}</div>` : "";
}

/* ── P1: Review helpers ── */
function buildReviewTimeline(history) {
  if (!history || history.length === 0) return '<p style="color:var(--muted)">暂无审核记录。</p>';
  const actionMap = { approve: ["审核通过", "green"], reject: ["已驳回", "red"], revise: ["修改意见", "amber"], resubmit: ["重新提交", "blue"] };
  return `<div class="review-timeline">${[...history].reverse().map((entry) => {
    const [label, color] = actionMap[entry.action] || ["操作", "blue"];
    return `<div class="review-entry">
      <div class="review-header">
        <span class="badge ${color}">${label}</span>
        <span class="review-reviewer">${escapeHtml(entry.reviewer)}</span>
        <span class="review-time">${entry.timestamp}</span>
      </div>
      <p class="review-comment">${escapeHtml(entry.comment)}</p>
      ${entry.revisionFields?.length ? `<div class="revision-field-tags">${entry.revisionFields.map(f => `<span class="revision-field-tag">⚠ ${f}</span>`).join("")}</div>` : ""}
    </div>`;
  }).join("")}</div>`;
}

function generateAiReview(item) {
  const issues = [];
  const goods = [];
  let suggestion = "approve";

  // 1. Check references — content should cite KB
  if (!item.references || item.references === "—" || item.references === "") {
    issues.push("未引用真实资料库，建议补充数据来源以增强可信度");
    suggestion = "revise";
  } else {
    goods.push("已引用真实资料 (" + item.references.split("/")[0].trim() + ")");
  }

  // 2. Check funnel stage distribution
  if (!item.funnelStage || item.funnelStage === "—") {
    issues.push("缺少漏斗阶段标记，无法判断内容在转化链中的位置");
    suggestion = "revise";
  } else {
    goods.push("漏斗阶段「" + item.funnelStage + "」已标记");
  }

  // 3. Check emotional trigger
  if (!item.emotionalTrigger || item.emotionalTrigger === "—") {
    issues.push("未设置情绪钩子，标题吸引力可能不足");
  } else {
    goods.push("情绪钩子「" + item.emotionalTrigger + "」合理");
  }

  // 4. Check CTA
  if (!item.cta || item.cta === "—" || item.cta === "") {
    issues.push("缺少 CTA 行动引导，难以转化为线索");
    suggestion = "revise";
  } else {
    goods.push("CTA 已设置");
  }

  // 5. Check lead magnet
  if (!item.leadMagnet || item.leadMagnet === "—" || item.leadMagnet === "") {
    issues.push("没有挂载钩子资料（Lead Magnet），转化路径断裂");
  }

  // 6. Check primary keyword for SEO
  if (!item.primaryKeyword || item.primaryKeyword === "—") {
    issues.push("缺少主关键词，不利于搜索流量获取");
  }

  // 7. WACE content check
  if (item.waceFocus && item.topicCluster && !item.topicCluster.includes("WACE")) {
    issues.push("标记为 WACE Focus 但主题簇不含 WACE，请核实");
  }

  // 8. Check audience persona
  if (!item.audiencePersona || item.audiencePersona.length === 0) {
    issues.push("未指定目标受众画像");
  }

  // 9. Check content type
  if (!item.contentType || item.contentType === "—") {
    issues.push("内容类型未标注（干货/案例/情绪/对比…）");
  }

  // 10. Title length check
  if (item.title.length > 25) {
    issues.push("标题超过 25 字，部分平台可能被截断");
  }

  // 11. Brand firewall check for agency accounts
  const fwCheck = checkBrandFirewall(item.title + " " + (item.cta || "") + " " + (item.notes || ""), item.account);
  if (!fwCheck.pass) {
    issues.push("🔥 品牌防火墙：中介号内容包含禁用词「" + fwCheck.violations.join("、") + "」，必须修改！");
    suggestion = "reject";
  }

  // Build output
  if (issues.length >= 4) suggestion = "reject";
  else if (issues.length >= 2) suggestion = "revise";

  let comment = "【AI 审核报告】\n";
  if (goods.length > 0) comment += "✅ " + goods.join("\n✅ ") + "\n";
  if (issues.length > 0) comment += "⚠️ " + issues.join("\n⚠️ ") + "\n";
  comment += "\n综合建议：" + (suggestion === "approve" ? "可通过发布" : suggestion === "revise" ? "建议修改后再审" : "问题较多，建议驳回重写");

  return { suggestion, comment };
}

async function callDeepSeekReview(item) {
  const res = await fetch("/api/ai-review", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: item.title,
      account: item.account,
      funnelStage: item.funnelStage,
      emotionalTrigger: item.emotionalTrigger,
      contentType: item.contentType,
      cta: item.cta,
      leadMagnet: item.leadMagnet,
      primaryKeyword: item.primaryKeyword,
      references: item.references,
      audiencePersona: item.audiencePersona,
      waceFocus: item.waceFocus,
      topicCluster: item.topicCluster,
      notes: item.notes,
      repurposeStatus: item.repurposeStatus,
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

function applyAiReviewResult(result, btn, source) {
  const actionSelect = document.querySelector("#review-action-select");
  const commentInput = document.querySelector("#review-comment-input");
  if (actionSelect) actionSelect.value = result.suggestion;
  if (commentInput) {
    commentInput.value = result.comment;
    commentInput.style.borderColor = "#8b5cf6";
  }
  btn.textContent = `🤖 ${source} 审核完成 ✓`;
  btn.style.background = "linear-gradient(135deg,#22c55e,#16a34a)";
  const hint = document.querySelector(".ai-review-hint");
  if (hint) {
    const tokenInfo = result.tokens ? ` (${result.tokens} tokens)` : "";
    hint.textContent = `${source}审核完成${tokenInfo}，可直接提交或修改后提交`;
  }
  showToast(`${source} AI 审核完成，建议已自动填入`);
}

function buildReviewForm(item) {
  window._currentReviewItem = item;
  return `
    <div class="detail-list">
      <div><strong>内容标题</strong><span>${escapeHtml(item.title)}</span></div>
      <div><strong>当前状态</strong><span>${item.status}</span></div>
      <div><strong>账号</strong><span>${item.account}</span></div>
      <div><strong>漏斗阶段</strong><span>${item.funnelStage}</span></div>
    </div>
    <div class="modal-section">
      <h3>审核历史</h3>
      ${buildReviewTimeline(item.reviewHistory)}
    </div>
    <div class="modal-section">
      <h3>审核操作</h3>
      <div style="margin-bottom:12px">
        <button type="button" class="primary-button ai-review-btn" data-title="${escapeHtml(item.title)}" style="background:linear-gradient(135deg,#6366f1,#8b5cf6);font-size:13px;padding:6px 16px">
          🤖 AI 智能审核
        </button>
        <span class="ai-review-hint" style="margin-left:8px;color:var(--muted);font-size:12px">AI 将自动检查内容质量并生成审核意见</span>
      </div>
      <div class="form-grid">
        <label>审核结果<select id="review-action-select">
          <option value="approve">审核通过</option>
          <option value="revise">修改意见</option>
          <option value="reject">驳回</option>
        </select></label>
        <label>审核人<select id="review-reviewer-select">
          <option>部门负责人</option>
          <option>超级管理员</option>
        </select></label>
        <label class="full-field">审核意见<textarea id="review-comment-input" rows="3" placeholder="输入审核意见或修改建议..."></textarea></label>
        <label class="full-field">修改建议（可选，针对具体字段）
          <div class="review-field-suggestions">
            <label><input type="checkbox" class="review-field-cb" data-field="标题" /> 标题需修改</label>
            <label><input type="checkbox" class="review-field-cb" data-field="CTA" /> CTA 需优化</label>
            <label><input type="checkbox" class="review-field-cb" data-field="数据/引用" /> 数据需核实</label>
            <label><input type="checkbox" class="review-field-cb" data-field="情绪钩子" /> 情绪钩子不匹配</label>
            <label><input type="checkbox" class="review-field-cb" data-field="合规" /> 合规问题</label>
          </div>
        </label>
      </div>
    </div>
  `;
}

function buildMetricsForm(item) {
  const m = item.metrics || {};
  const score = contentScore(m);
  return `
    <div class="detail-list">
      <div><strong>内容标题</strong><span>${escapeHtml(item.title)}</span></div>
      <div><strong>账号</strong><span>${item.account}</span></div>
      <div><strong>发布日期</strong><span>${item.publishDate || "—"}</span></div>
      <div><strong>当前状态</strong><span>${item.status}</span></div>
    </div>
    ${score > 0 ? `<div class="modal-section"><h3>现有数据</h3>${renderMetricsDetail(m)}<p style="color:var(--muted);margin-top:8px">当前综合分：<strong>${Math.round(score)}</strong></p></div>` : ""}
    <div class="modal-section">
      <h3>数据回填</h3>
      <p style="color:var(--muted);margin-bottom:12px">从各平台后台抄入以下数据，保存后自动计算综合分。</p>
      <div class="metrics-form-grid">
        <label>阅读量<input type="number" id="bf-reads" value="${m.reads || 0}" min="0"></label>
        <label>点赞数<input type="number" id="bf-likes" value="${m.likes || 0}" min="0"></label>
        <label>评论数<input type="number" id="bf-comments" value="${m.comments || 0}" min="0"></label>
        <label>转发数<input type="number" id="bf-shares" value="${m.shares || 0}" min="0"></label>
        <label>私信数<input type="number" id="bf-messages" value="${m.privateMessages || 0}" min="0"></label>
        <label>线索数<input type="number" id="bf-leads" value="${m.leads || 0}" min="0"></label>
      </div>
      <label style="margin-top:12px;display:block">数据采集周期<select id="bf-period">
        <option>当日数据</option>
        <option>3日数据</option>
        <option selected>7日数据</option>
        <option>30日数据</option>
      </select></label>
    </div>
  `;
}

function renderContent(items) {
  if (!items) items = getFilteredContents();
  const target = document.querySelector("#content-cards");
  target.innerHTML = items
    .map(
      (item) => {
        const latestReview = (item.reviewHistory || []).slice(-1)[0];
        const showReview = latestReview && (item.status === "待审核" || item.status === "审核通过" || item.status === "已驳回");
        const revisionFieldTags = latestReview?.revisionFields?.length
          ? `<div class="revision-field-tags">${latestReview.revisionFields.map(f => `<span class="revision-field-tag">⚠ ${f}</span>`).join("")}</div>` : "";
        const commentText = (latestReview?.comment || "").split("\n")[0]; // first line only for card
        const reviewSnippet = showReview
          ? `<div class="review-snippet ${item.status === "已驳回" ? "rejected" : ""}">
               <span class="badge ${latestReview.action === "approve" ? "green" : latestReview.action === "reject" || latestReview.action === "revise" ? "red" : "amber"}">${latestReview.action === "approve" ? "通过" : latestReview.action === "reject" || latestReview.action === "revise" ? "驳回" : "修改意见"}</span>
               <span class="review-snippet-text">${escapeHtml(commentText).slice(0, 40)}${commentText.length > 40 ? "…" : ""}</span>
               ${revisionFieldTags}
             </div>` : "";
        return `
        <article class="content-card content-detail" data-title="${escapeHtml(item.title)}" style="cursor:pointer">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-meta">
            ${badge(item.contentType, "blue")}
            ${badge(getContentCategory(item.contentType), item.contentType ? "" : "amber")}
            ${badge(item.status, item.status === "Posted" || item.status === "已发布" ? "green" : "amber")}
            ${item.waceFocus ? badge("WACE Focus", "green") : ""}
          </div>
          <div class="strategy-row">
            <span class="strat-badge funnel">${item.funnelStage}</span>
            <span class="strat-badge emotion">${item.emotionalTrigger}</span>
            ${item.repurposeStatus ? `<span class="strat-badge repurpose">${item.repurposeStatus}</span>` : ""}
            ${item.leadMagnet && item.leadMagnet !== "待定" ? `<span class="strat-badge magnet">${item.leadMagnet}</span>` : ""}
          </div>
          ${buildRepurposeChainMini(item)}
          ${reviewSnippet}
          ${item.metrics && item.status !== "草稿" ? renderMetricsBadges(item.metrics) : ""}
          <p>${item.account} · ${item.topicCluster}</p>
          <div class="knowledge-meta">
            <span>人群：${(item.audiencePersona || []).join(" / ")}</span>
            <span>发布日期：${item.publishDate}</span>
            <span>CTA：${item.cta}</span>
            ${item.primaryKeyword && item.primaryKeyword !== "待定" ? `<span>关键词：<span class="strat-badge keyword">${escapeHtml(item.primaryKeyword)}</span></span>` : ""}
            <span>引用资料：${buildRefLinks(item.references)}</span>
            ${item.promptsUsed && item.promptsUsed !== "未使用" ? `<span>Prompt：${buildPromptLinks(item.promptsUsed)}</span>` : ""}
          </div>
          <div class="card-footer"><span>${item.author}</span><button class="ghost-button content-detail" type="button" data-title="${escapeHtml(item.title)}">查看详情</button></div>
        </article>
      `;},
    )
    .join("") || `<div class="empty-state">没有找到匹配的内容资产。</div>`;
}

function renderKnowledge(items = knowledge) {
  const target = document.querySelector("#knowledge-grid");
  target.innerHTML = items
    .map(
      (item) => `
        <article class="knowledge-card knowledge-detail" data-title="${escapeHtml(item.title)}" style="cursor:pointer">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-meta">
            ${item.subject.map((tag) => badge(tag, "blue")).join("")}
            ${badge(item.type)}
            ${badge(item.sourceType, item.sourceType === "官方" ? "green" : "amber")}
          </div>
          <p>${item.detail}</p>
          <div class="knowledge-meta">
            <span>复查：${item.reviewCycle}</span>
            <span>引用：${getContentsReferencingKb(item.title).length} 条内容</span>
            <span>可见：${item.visibility}</span>
          </div>
          <div class="card-footer">
            <span>${item.lastVerified}</span>
            <button class="ghost-button knowledge-detail" type="button" data-title="${item.title}">查看资料</button>
          </div>
        </article>
      `,
    )
    .join("") || `<div class="empty-state">没有找到匹配的真实资料。</div>`;
}

function renderPersonas(items = personas) {
  const target = document.querySelector("#persona-grid");
  // Group by IP category
  const groups = {};
  items.forEach((item) => {
    const cat = Array.isArray(item) ? (item[5] || "school_official") : (item.ipCategory || "school_official");
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  const categoryOrder = ["school_official", "real_person", "agency", "ugc", "seo"];
  let html = "";
  categoryOrder.forEach((cat) => {
    const catItems = groups[cat];
    if (!catItems || catItems.length === 0) return;
    const catInfo = IP_CATEGORIES[cat] || { label: cat, icon: "📱", color: "blue" };
    html += `<div class="ip-category-group">
      <h3 class="ip-category-header">${catInfo.icon} ${catInfo.label} <span class="badge ${catInfo.color}">${catItems.length} 个</span></h3>
      <p class="ip-category-desc">${catInfo.desc}</p>
      <div class="ip-category-cards">`;
    catItems.forEach((item) => {
      const [name, positioning, channels, volume, leads] = Array.isArray(item) ? item : [item.name, item.positioning, item.channels, item.volume, item.leads];
      const isAgency = cat === "agency";
      html += `
        <article class="matrix-card persona-timeline${isAgency ? " agency-card" : ""}" data-title="${name}" style="cursor:pointer">
          <h3>${name}${isAgency ? ' <span class="badge red" style="font-size:11px">🔥 品牌隔离</span>' : ""}</h3>
          <p>${positioning}</p>
          <div class="card-meta">${badge(channels)}${badge(volume, "blue")}</div>
          <div class="card-footer"><span>${leads}</span><button class="ghost-button persona-timeline" type="button" data-title="${name}">查看时间线</button></div>
        </article>`;
    });
    html += `</div></div>`;
  });
  target.innerHTML = html || `<div class="empty-state">没有找到匹配的 IP。</div>`;
}

function renderAccounts(items) {
  if (!items) items = getMyAccounts();
  const target = document.querySelector("#accounts-table");
  // Group by IP category for visual hierarchy
  const groups = {};
  items.forEach((a) => {
    const cat = a.ipCategory || "school_official";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(a);
  });
  const catOrder = ["school_official", "real_person", "agency", "ugc", "seo"];
  let html = "";
  catOrder.forEach((cat) => {
    const catAccounts = groups[cat];
    if (!catAccounts || catAccounts.length === 0) return;
    const catInfo = IP_CATEGORIES[cat] || { label: cat, icon: "📱", color: "blue" };
    const totalLeads = catAccounts.reduce((s, a) => s + (a.leads || 0), 0);
    const totalPosts = catAccounts.reduce((s, a) => s + (a.monthlyPosts || 0), 0);
    html += `<tr class="account-group-header"><td colspan="9"><strong>${catInfo.icon} ${catInfo.label}</strong> <span class="badge ${catInfo.color}">${catAccounts.length} 号</span> <small style="color:var(--muted)">月产 ${totalPosts} 条 · 线索 ${totalLeads}</small></td></tr>`;
    catAccounts.forEach((account) => {
      html += `
        <tr class="clickable-row account-detail" data-title="${account.accountName}">
          <td>${account.platform}</td>
          <td><strong>${account.accountName}</strong>${account.ipCategory === "agency" ? ' <span class="badge red" style="font-size:10px">中介</span>' : ""}</td>
          <td>${account.persona}</td>
          <td>${badge((IP_CATEGORIES[account.ipCategory] || {}).label || "未分类", (IP_CATEGORIES[account.ipCategory] || {}).color || "blue")}</td>
          <td>${account.operator}</td>
          <td>${badge(account.stage, "blue")}${badge(account.status, account.status === "运营中" ? "green" : "amber")}</td>
          <td>${account.monthlyPosts}</td>
          <td>${account.leads}</td>
        </tr>`;
    });
  });
  target.innerHTML = html || `<tr><td colspan="9"><div class="empty-state">没有找到匹配的账号。</div></td></tr>`;
}

function getAdmissionCounselors() {
  return teamMembers.filter((m) => m.role === "招生顾问" && m.status === "在职").map((m) => m.name);
}

/* ── Lead type helpers ── */
const LEAD_TYPE_LABELS = { direct: "直招", agent: "中介", partner_school: "合作校" };
const LEAD_TYPE_COLORS = { direct: "#3b82f6", agent: "#f59e0b", partner_school: "#10b981" };
let crmTypeFilter = "all"; // "all" | "direct" | "agent" | "partner_school"

function toggleLeadTypeFields() {
  const t = document.querySelector("#lead-type")?.value || "direct";
  const agentEl = document.querySelector("#agent-name-field");
  const partnerEl = document.querySelector("#partner-school-field");
  const commEl = document.querySelector("#commission-field");
  if (agentEl) agentEl.style.display = t === "agent" ? "" : "none";
  if (partnerEl) partnerEl.style.display = t === "partner_school" ? "" : "none";
  if (commEl) commEl.style.display = t === "agent" ? "" : "none";
}

function buildLeadDetailHtml(lead) {
  const typeBadge = `<span class="lead-type-badge" style="background:${LEAD_TYPE_COLORS[lead.leadType] || "#94a3b8"}">${LEAD_TYPE_LABELS[lead.leadType] || "直招"}</span>`;
  const followUps = lead.followUps || [];
  const counselors = getAdmissionCounselors();
  return `
    <div class="detail-list">
      <div><strong>线索名称</strong><span>${escapeHtml(lead.name)}</span></div>
      <div><strong>线索类型</strong><span>${typeBadge}</span></div>
      <div><strong>当前阶段</strong><span>${escapeHtml(lead.stage)}</span></div>
      <div><strong>来源</strong><span>${escapeHtml(lead.source)}${lead.sourceLink ? ` <a href="${escapeHtml(lead.sourceLink)}" target="_blank" rel="noopener">🔗</a>` : ""}</span></div>
      <div><strong>渠道</strong><span>${escapeHtml(lead.channel || "—")}</span></div>
      <div><strong>年级</strong><span>${escapeHtml(lead.grade || "—")}</span></div>
      <div><strong>意向课程</strong><span>${escapeHtml(lead.course || "—")}</span></div>
      <div><strong>家长姓名</strong><span>${escapeHtml(lead.parentName || "—")}</span></div>
      <div><strong>负责顾问</strong><span>${lead.assignee ? escapeHtml(lead.assignee) : "未分配"}</span></div>
      ${lead.wechatId ? `<div><strong>企微 ID</strong><span>${escapeHtml(lead.wechatId)}</span></div>` : ""}
      ${lead.agentName ? `<div><strong>中介</strong><span>${escapeHtml(lead.agentName)}${lead.commissionRate ? ` (佣金 ${lead.commissionRate}%)` : ""}</span></div>` : ""}
      ${lead.partnerSchool ? `<div><strong>合作学校</strong><span>${escapeHtml(lead.partnerSchool)}</span></div>` : ""}
      ${lead.expectedRevenue ? `<div><strong>预期学费</strong><span>¥${fmtNum(lead.expectedRevenue)}</span></div>` : ""}
      <div><strong>创建日期</strong><span>${lead.date || "—"}</span></div>
      ${lead.notes ? `<div><strong>备注</strong><span>${escapeHtml(lead.notes)}</span></div>` : ""}
    </div>
    <div class="modal-section">
      <h3>跟进记录 (${followUps.length})</h3>
      ${followUps.length > 0 ? `<div class="follow-up-timeline">${followUps.map(f => `
        <div class="follow-up-entry">
          <div class="fu-date">${escapeHtml(f.date)}</div>
          <div class="fu-note">${escapeHtml(f.note)}</div>
          ${f.nextAction ? `<div class="fu-next">下一步：${escapeHtml(f.nextAction)}${f.nextDate ? ` (${f.nextDate})` : ""}</div>` : ""}
          ${f.author ? `<div class="fu-author">— ${escapeHtml(f.author)}</div>` : ""}
        </div>
      `).join("")}</div>` : `<p style="color:var(--muted)">暂无跟进记录。</p>`}
    </div>
    <div class="modal-section">
      <h3>添加跟进</h3>
      <div class="form-grid">
        <label class="full-field">跟进内容<textarea id="fu-note" placeholder="记录本次沟通内容…"></textarea></label>
        <label>下一步动作<input id="fu-next-action" placeholder="如：约试听课" /></label>
        <label>下次跟进日期<input id="fu-next-date" type="date" /></label>
      </div>
    </div>
  `;
}

function buildLeadEditHtml(lead) {
  const counselors = getAdmissionCounselors();
  return `
    <div class="form-grid">
      <label>线索类型<select id="edit-lead-type">
        <option value="direct" ${lead.leadType === "direct" ? "selected" : ""}>直招</option>
        <option value="agent" ${lead.leadType === "agent" ? "selected" : ""}>中介分发</option>
        <option value="partner_school" ${lead.leadType === "partner_school" ? "selected" : ""}>合作学校</option>
      </select></label>
      <label>学生姓名<input id="edit-lead-name" value="${escapeHtml(lead.name)}" /></label>
      <label>当前阶段<select id="edit-lead-stage">
        ${crmStages.map(s => `<option value="${s}" ${lead.stage === s ? "selected" : ""}>${s}</option>`).join("")}
      </select></label>
      <label>负责顾问<select id="edit-lead-assignee">
        <option value="">未分配</option>
        ${counselors.map(c => `<option value="${c}" ${lead.assignee === c ? "selected" : ""}>${c}</option>`).join("")}
      </select></label>
      <label>当前年级<select id="edit-lead-grade">
        <option value="">—</option>
        ${["G7","G8","G9","G10","G11","G12"].map(g => `<option value="${g}" ${lead.grade === g ? "selected" : ""}>${g}</option>`).join("")}
      </select></label>
      <label>意向课程<input id="edit-lead-course" value="${escapeHtml(lead.course || "")}" /></label>
      <label>家长姓名<input id="edit-lead-parent" value="${escapeHtml(lead.parentName || "")}" /></label>
      <label>来源渠道<input id="edit-lead-channel" value="${escapeHtml(lead.channel || "")}" /></label>
      <label>企微 ID<input id="edit-lead-wechat" value="${escapeHtml(lead.wechatId || "")}" /></label>
      <label>中介名称<input id="edit-lead-agent" value="${escapeHtml(lead.agentName || "")}" /></label>
      <label>合作学校<input id="edit-lead-partner" value="${escapeHtml(lead.partnerSchool || "")}" /></label>
      <label>佣金比例 (%)<input id="edit-lead-commission" type="number" value="${lead.commissionRate || 0}" /></label>
      <label>预期学费<input id="edit-lead-revenue" type="number" value="${lead.expectedRevenue || 0}" /></label>
      <label class="full-field">来源链接<input id="edit-lead-link" value="${escapeHtml(lead.sourceLink || "")}" /></label>
      <label class="full-field">备注<textarea id="edit-lead-notes">${escapeHtml(lead.notes || "")}</textarea></label>
    </div>
  `;
}

function renderCrm() {
  const target = document.querySelector("#crm-kanban");
  if (!target) return;
  const role = document.querySelector("#role-select").value;
  const currentUser = roleCopy[role]?.user || "";
  const isAdmission = role === "admission";
  const counselors = getAdmissionCounselors();

  // Admission counselors only see their own leads
  let visibleLeads = isAdmission
    ? crmLeads.filter((l) => l.assignee === currentUser || l.assignee === "")
    : crmLeads;

  // Apply lead type filter
  if (crmTypeFilter !== "all") {
    visibleLeads = visibleLeads.filter(l => (l.leadType || "direct") === crmTypeFilter);
  }

  // Lead type counts for filter bar
  const typeCounts = { all: crmLeads.length, direct: 0, agent: 0, partner_school: 0 };
  crmLeads.forEach(l => { const t = l.leadType || "direct"; typeCounts[t] = (typeCounts[t] || 0) + 1; });

  // Conversion rate calculation between stages
  const stageCounts = {};
  crmStages.forEach((s) => { stageCounts[s] = crmLeads.filter((l) => l.stage === s).length; });

  // Filter bar
  const filterBar = `<div class="crm-filter-bar">
    <button class="crm-type-filter ${crmTypeFilter === "all" ? "active" : ""}" data-type="all">全部 (${typeCounts.all})</button>
    <button class="crm-type-filter ${crmTypeFilter === "direct" ? "active" : ""}" data-type="direct">直招 (${typeCounts.direct})</button>
    <button class="crm-type-filter ${crmTypeFilter === "agent" ? "active" : ""}" data-type="agent">中介 (${typeCounts.agent})</button>
    <button class="crm-type-filter ${crmTypeFilter === "partner_school" ? "active" : ""}" data-type="partner_school">合作校 (${typeCounts.partner_school})</button>
  </div>`;

  // Build kanban columns with drag-and-drop
  const kanbanHtml = crmStages.map((stageName, idx) => {
    const leads = visibleLeads.filter((l) => l.stage === stageName);
    const funnelTarget = CRM_FUNNEL_TARGETS[stageName];
    const prevStage = idx > 0 ? crmStages[idx - 1] : null;
    const prevCount = prevStage ? stageCounts[prevStage] : 0;
    const convRate = prevCount > 0 && stageName !== "流失" ? Math.round((leads.length / prevCount) * 100) : null;
    const targetInfo = funnelTarget ? `<small class="funnel-target">目标 ${funnelTarget.monthlyTarget}/月</small>` : "";
    const convBadge = convRate !== null ? `<span class="conv-rate-badge${convRate < 20 ? " warn" : ""}">${convRate}%</span>` : "";

    return `
      <section class="kanban-column" data-stage="${escapeHtml(stageName)}" ondragover="event.preventDefault(); this.classList.add('drag-over')" ondragleave="this.classList.remove('drag-over')" ondrop="handleLeadDrop(event, '${escapeHtml(stageName)}'); this.classList.remove('drag-over')">
        <h3>${stageName} <span class="crm-count">${leads.length}</span> ${convBadge}</h3>
        ${targetInfo}
        ${leads.map((lead) => {
          const typeLabel = LEAD_TYPE_LABELS[lead.leadType] || "直招";
          const typeColor = LEAD_TYPE_COLORS[lead.leadType] || "#3b82f6";
          const lastFollowUp = (lead.followUps || []).slice(-1)[0];
          return `
          <article class="lead-card" draggable="true" data-lead-name="${escapeHtml(lead.name)}" ondragstart="event.dataTransfer.setData('text/plain', '${escapeHtml(lead.name)}'); this.classList.add('dragging')" ondragend="this.classList.remove('dragging')">
            <div class="lead-card-header">
              <strong class="row-action" data-title="${escapeHtml(lead.name)}" data-kind="线索详情">${escapeHtml(lead.name)}</strong>
              <span class="lead-type-badge" style="background:${typeColor}">${typeLabel}</span>
            </div>
            <span>${escapeHtml(lead.source)}${lead.sourceLink ? ` <a href="${escapeHtml(lead.sourceLink)}" target="_blank" rel="noopener" class="source-link" title="打开来源内容" onclick="event.stopPropagation()">🔗</a>` : ""}</span>
            ${lead.channel ? `<span class="lead-channel">${escapeHtml(lead.channel)}</span>` : ""}
            ${lead.wechatId ? `<span class="lead-wechat-status">💬 企微已加</span>` : ""}
            ${lead.expectedRevenue ? `<span class="lead-revenue">¥${fmtNum(lead.expectedRevenue)}</span>` : ""}
            ${lastFollowUp ? `<span class="lead-follow-up-hint">📋 ${escapeHtml(lastFollowUp.note.slice(0, 20))}${lastFollowUp.nextDate ? ` · 下次: ${lastFollowUp.nextDate}` : ""}</span>` : ""}
            <div class="lead-meta">
              ${lead.assignee
                ? `<span class="lead-assignee">👤 ${escapeHtml(lead.assignee)}</span>`
                : (stageName === "私信咨询" && !isAdmission
                  ? `<select class="lead-assign-select" data-lead-name="${escapeHtml(lead.name)}">
                      <option value="">分配顾问…</option>
                      ${counselors.map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`).join("")}
                    </select>`
                  : `<span class="lead-assignee unassigned">未分配</span>`)
              }
              <span class="lead-date">${lead.date || ""}</span>
              <button class="lead-edit-btn" data-lead-name="${escapeHtml(lead.name)}" title="编辑" onclick="event.stopPropagation()">✏️</button>
            </div>
          </article>`;
        }).join("")}
      </section>
    `;
  }).join("");

  target.innerHTML = filterBar + kanbanHtml;

  // Wire filter buttons
  target.querySelectorAll(".crm-type-filter").forEach(btn => {
    btn.addEventListener("click", (e) => {
      crmTypeFilter = e.target.dataset.type;
      renderCrm();
    });
  });

  // Wire assign dropdowns
  target.querySelectorAll(".lead-assign-select").forEach((sel) => {
    sel.addEventListener("change", (e) => {
      const leadName = e.target.dataset.leadName;
      const assignee = e.target.value;
      if (!assignee) return;
      const lead = crmLeads.find((l) => l.name === leadName && !l.assignee);
      if (lead) {
        lead.assignee = assignee;
        persistLeadUpdate(lead);
        renderCrm();
      }
    });
    sel.addEventListener("click", (e) => e.stopPropagation());
  });

  // Wire edit buttons
  target.querySelectorAll(".lead-edit-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const leadName = e.target.dataset.leadName;
      const lead = crmLeads.find(l => l.name === leadName);
      if (lead) {
        window._editingLead = lead;
        openModal("lead-edit", `编辑线索：${lead.name.slice(0, 15)}`, buildLeadEditHtml(lead));
        currentModalAction = "lead-edit";
      }
    });
  });
}

/* ── Drag & drop handler for CRM kanban ── */
function handleLeadDrop(event, newStage) {
  event.preventDefault();
  if (!requireAuth("移动线索")) return;
  const leadName = event.dataTransfer.getData("text/plain");
  const lead = crmLeads.find(l => l.name === leadName);
  if (lead && lead.stage !== newStage) {
    const oldStage = lead.stage;
    lead.stage = newStage;
    persistLeadUpdate(lead);
    addAuditLog("移动线索阶段", `${leadName}: ${oldStage} → ${newStage}`);
    renderCrm();
    showToast(`线索「${leadName}」已移至「${newStage}」阶段`);
  }
}

function renderBars() {
  const target = document.querySelector("#platform-bars");
  // Dynamically aggregate leads per platform from accounts data
  const platformLeads = {};
  accounts.forEach((a) => {
    platformLeads[a.platform] = (platformLeads[a.platform] || 0) + (a.leads || 0);
  });
  const maxLeads = Math.max(...Object.values(platformLeads), 1);
  const rows = Object.entries(platformLeads)
    .sort(([, a], [, b]) => b - a)
    .map(([name, leads]) => {
      const icon = (platformConfig.find((p) => p.name === name) || {}).icon || "📱";
      return [icon + " " + name, Math.round((leads / maxLeads) * 100), leads];
    });
  target.innerHTML = rows
    .map(
      ([name, width, value]) => `
        <div class="bar-row">
          <strong>${name}</strong>
          <div class="bar-track"><div class="bar-fill" style="width: ${width}%"></div></div>
          <span>${value}</span>
        </div>
      `,
    )
    .join("") || '<div class="empty-state">暂无平台数据</div>';
}

function renderDynamicFunnel() {
  const target = document.querySelector("#dynamic-funnel");
  if (!target) return;
  const stageCounts = {};
  crmStages.filter((s) => s !== "流失").forEach((s) => {
    stageCounts[s] = crmLeads.filter((l) => l.stage === s).length;
  });
  // Also count downstream (cumulative: signed = all who passed through)
  const stageLabels = crmStages.filter((s) => s !== "流失");
  const totalMetricReads = contents.reduce((s, c) => s + (c.metrics?.reads || 0), 0);
  // Prepend exposure as computed stat
  const funnelData = [
    { label: "内容曝光", value: totalMetricReads, target: null },
    ...stageLabels.map((s) => ({
      label: s,
      value: stageCounts[s] || 0,
      target: CRM_FUNNEL_TARGETS[s]?.monthlyTarget || null,
    })),
  ];
  target.innerHTML = funnelData.map((item, i) => {
    const prev = i > 0 ? funnelData[i - 1].value : null;
    const rate = prev && prev > 0 ? ((item.value / prev) * 100).toFixed(1) + "%" : "";
    const targetHint = item.target ? `<small>目标 ${fmtNum(item.target)}</small>` : "";
    return `<div><span>${item.label}</span><strong>${fmtNum(item.value)}</strong>${targetHint}${rate ? `<small class="funnel-rate">${rate}</small>` : ""}</div>`;
  }).join("");
}

function renderNorthStar() {
  const target = document.querySelector("#north-star-metric");
  if (!target) return;
  const signed = crmLeads.filter((l) => l.stage === "签约").length;
  const monthlyTarget = 8;
  const pct = Math.round((signed / monthlyTarget) * 100);
  const status = signed >= monthlyTarget ? "achieved" : signed >= monthlyTarget * 0.5 ? "on-track" : "behind";
  target.innerHTML = `
    <div class="north-star ${status}">
      <div class="ns-value">${signed} <small>/ ${monthlyTarget}</small></div>
      <div class="ns-label">月度签约数</div>
      <div class="ns-progress">
        <div class="ns-bar" style="width:${Math.min(pct, 100)}%"></div>
      </div>
      <div class="ns-hint">${status === "achieved" ? "已达成目标" : `还差 ${monthlyTarget - signed} 人`}</div>
    </div>
  `;
}

/* ── TASK 7.3: AI Content Generation (DeepSeek stub) ── */
async function generateAiContent(prompt, topic, persona) {
  const apiKey = localStorage.getItem("bci-deepseek-key");
  if (!apiKey) {
    showToast("请先在系统设置中配置 DeepSeek API Key");
    return null;
  }
  try {
    updateSyncIndicator("syncing");
    const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: `你是 BCI 国际学校的自媒体内容编辑，负责为 ${persona || "学校"} IP 创作内容。要求：真实、专业、符合教育行业规范。` },
          { role: "user", content: `主题：${topic || "WACE 课程"}\n\n${prompt || "请生成一段小红书文案"}` },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });
    if (!response.ok) throw new Error(`API 错误: ${response.status}`);
    const data = await response.json();
    updateSyncIndicator("synced");
    return data.choices?.[0]?.message?.content || "生成失败";
  } catch (err) {
    console.warn("AI generation failed:", err);
    updateSyncIndicator("error");
    showToast("AI 生成失败：" + (err.message || "请检查 API Key"));
    return null;
  }
}

/* ── TASK 7.4: Automation Workflows ── */
function autoAssignLeads() {
  const counselors = getAdmissionCounselors();
  if (counselors.length === 0) return 0;
  const unassigned = crmLeads.filter(l => l.stage === "私信咨询" && !l.assignee);
  if (unassigned.length === 0) return 0;
  // Round-robin assignment
  let assigned = 0;
  unassigned.forEach((lead, i) => {
    lead.assignee = counselors[i % counselors.length];
    persistLeadUpdate(lead);
    addAuditLog("自动分配线索", `${lead.name} → ${lead.assignee}`);
    assigned++;
  });
  if (assigned > 0) {
    renderCrm();
    renderNotifications();
    showToast(`已自动分配 ${assigned} 条线索给 ${counselors.length} 位顾问`);
  }
  return assigned;
}

function runPeriodicChecks() {
  // Check 1: Content without metrics after 3 days
  const now = new Date();
  const threeDaysAgo = new Date(now - 3 * 86400000).toISOString().slice(0, 10);
  const staleContent = contents.filter(c =>
    (c.status === "已发布" || c.status === "Posted") &&
    c.publishDate && c.publishDate <= threeDaysAgo &&
    (!c.metrics || (c.metrics.reads === 0 && c.metrics.leads === 0))
  );
  if (staleContent.length > 0) {
    console.log(`[自动检查] ${staleContent.length} 条已发布内容超过 3 天未回填数据`);
  }

  // Check 2: Leads idle for more than 5 days
  const fiveDaysAgo = new Date(now - 5 * 86400000).toISOString().slice(0, 10);
  const idleLeads = crmLeads.filter(l =>
    l.stage !== "签约" && l.stage !== "流失" &&
    l.date && l.date <= fiveDaysAgo &&
    (!l.followUps || l.followUps.length === 0)
  );
  if (idleLeads.length > 0) {
    console.log(`[自动检查] ${idleLeads.length} 条线索超过 5 天未跟进`);
  }
}

// Run periodic checks every 10 minutes
setInterval(runPeriodicChecks, 600000);

function renderAiLibrary(items = aiPromptLibrary) {
  const target = document.querySelector("#ai-library");
  if (!target) return;
  target.innerHTML = items
    .map(
      (item) => `
        <article class="knowledge-card ai-detail" data-title="${escapeHtml(item.title)}" style="cursor:pointer">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-meta">
            ${badge(item.platform, "blue")}
            ${badge(item.stage, "red")}
            ${badge(item.qualityRating, "green")}
          </div>
          <p>${item.notes}</p>
          <div class="knowledge-meta">
            <span>目标 IP：${item.targetPersona}</span>
            <span>使用次数：${item.useCount}</span>
            <span>最后使用：${item.lastUsed}</span>
          </div>
          <div class="card-footer">
            <span>${item.author}</span>
            <button class="ghost-button ai-detail" type="button" data-title="${item.title}">查看模板</button>
          </div>
        </article>
      `,
    )
    .join("") || `<div class="empty-state">没有找到匹配的 AI 模板。</div>`;
}

function renderPermissions() {
  const target = document.querySelector("#permission-grid");

  const roleCards = permissions
    .map(
      ([role, scope, detail]) => `
        <article class="permission-card row-action" data-title="${role}" data-kind="角色权限">
          <h3>${role}</h3>
          <div class="card-meta">${badge(scope, "blue")}</div>
          <p>${detail}</p>
        </article>
      `,
    )
    .join("");

  const roleColorMap = { "运营人员": "blue", "部门负责人": "green", "超级管理员": "red", "AI 内容编辑": "amber", "招生顾问": "" };
  const memberRows = teamMembers
    .map(
      (m) => `
        <tr class="clickable-row member-detail" data-member-name="${escapeHtml(m.name)}">
          <td><strong>${escapeHtml(m.name)}</strong></td>
          <td>${escapeHtml(m.email)}</td>
          <td>${badge(m.role, roleColorMap[m.role] || "blue")}</td>
          <td>${escapeHtml(m.accounts)}</td>
          <td>${badge(m.status, m.status === "在职" ? "green" : "red")}</td>
          <td>${m.joinDate}</td>
        </tr>
      `,
    )
    .join("");

  // ── KPI Dashboard (TASK 3.2) ──
  const kpiCards = teamMembers.filter(m => m.status === "在职").map(m => {
    const isOperator = m.role === "运营人员" || m.role === "部门负责人";
    const isAdmission = m.role === "招生顾问";
    const isAi = m.role === "AI 内容编辑";
    const myContents = contents.filter(c => c.author === m.name);
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyContents = myContents.filter(c => (c.publishDate || "").startsWith(thisMonth));
    const totalReads = myContents.reduce((s, c) => s + (c.metrics?.reads || 0), 0);
    const hotPosts = myContents.filter(c => (c.metrics?.reads || 0) >= 5000).length;
    const hotRate = myContents.length ? Math.round(hotPosts / myContents.length * 100) : 0;
    const myLeads = crmLeads.filter(l => l.assignee === m.name);
    const monthlySigned = myLeads.filter(l => l.stage === "签约" && (l.date || "").startsWith(thisMonth)).length;

    let kpiHtml = "";
    if (isOperator || isAi) {
      const monthTarget = 30;
      const hotTarget = 5;
      kpiHtml = `
        <div class="kpi-row">
          <div class="kpi-metric">
            <span class="kpi-label">本月产出</span>
            <span class="kpi-value ${monthlyContents.length >= monthTarget ? "green" : monthlyContents.length >= monthTarget * 0.6 ? "amber" : "red"}">${monthlyContents.length}<small>/${monthTarget}</small></span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-label">爆款率</span>
            <span class="kpi-value ${hotRate >= hotTarget ? "green" : "amber"}">${hotRate}%<small>/${hotTarget}%</small></span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-label">总内容</span>
            <span class="kpi-value">${myContents.length}</span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-label">总阅读</span>
            <span class="kpi-value">${fmtNum(totalReads)}</span>
          </div>
        </div>`;
    }
    if (isAdmission) {
      const monthlyFollowed = myLeads.filter(l => (l.date || "").startsWith(thisMonth)).length;
      const signTarget = 1.5;
      kpiHtml = `
        <div class="kpi-row">
          <div class="kpi-metric">
            <span class="kpi-label">本月跟进</span>
            <span class="kpi-value">${monthlyFollowed}</span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-label">本月签约</span>
            <span class="kpi-value ${monthlySigned >= signTarget ? "green" : "red"}">${monthlySigned}<small>/${signTarget}</small></span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-label">总线索</span>
            <span class="kpi-value">${myLeads.length}</span>
          </div>
          <div class="kpi-metric">
            <span class="kpi-label">签约总数</span>
            <span class="kpi-value">${myLeads.filter(l => l.stage === "签约").length}</span>
          </div>
        </div>`;
    }
    if (!kpiHtml) return "";
    const roleColor = roleColorMap[m.role] || "blue";
    return `
      <div class="kpi-card">
        <div class="kpi-card-header">
          <strong>${escapeHtml(m.name)}</strong>
          ${badge(m.role, roleColor)}
        </div>
        ${kpiHtml}
      </div>`;
  }).filter(Boolean).join("");

  target.innerHTML = `
    ${roleCards}
    ${kpiCards ? `
    <div style="grid-column:1/-1;margin-top:16px">
      <h3 style="margin:0 0 12px">团队 KPI 仪表盘</h3>
      <div class="kpi-dashboard">${kpiCards}</div>
    </div>` : ""}
    <div class="table-card" style="grid-column:1/-1;margin-top:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px 0">
        <h3 style="margin:0">团队成员（${teamMembers.length} 人）</h3>
      </div>
      <table>
        <thead>
          <tr><th>姓名</th><th>邮箱</th><th>角色</th><th>负责账号</th><th>状态</th><th>入职日期</th></tr>
        </thead>
        <tbody>${memberRows}</tbody>
      </table>
    </div>
  `;
}

function renderSettings() {
  const target = document.querySelector("#settings-content");
  if (!target) return;

  target.innerHTML = `
    <div class="table-card" style="margin-bottom:24px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px 0">
        <div>
          <h3 style="margin:0">自媒体平台管理</h3>
          <p style="color:var(--muted);font-size:13px;margin:4px 0 0">添加或删除平台后，所有表单下拉框会自动同步更新。</p>
        </div>
      </div>
      <table>
        <thead><tr><th>图标</th><th>平台名称</th><th>浏览器可打开</th><th>操作</th></tr></thead>
        <tbody>
          ${platformConfig.map((p, i) => `
            <tr>
              <td style="font-size:20px;text-align:center">${p.icon || "📱"}</td>
              <td><strong>${escapeHtml(p.name)}</strong></td>
              <td>${p.canBrowserOpen ? badge("可直接打开", "green") : badge("需微信内打开", "amber")}</td>
              <td><button class="ghost-button settings-delete-platform" data-index="${i}" style="color:var(--red);font-size:12px">删除</button></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      <div style="padding:16px 20px;border-top:1px solid var(--border);display:flex;gap:8px;align-items:flex-end;flex-wrap:wrap">
        <label style="flex:0 0 60px;font-size:13px">图标<input id="new-platform-icon" value="📱" style="width:50px;text-align:center" /></label>
        <label style="flex:1;font-size:13px">平台名称<input id="new-platform-name" placeholder="例如：抖音、B站、微博" /></label>
        <label style="flex:0 0 auto;font-size:13px;display:flex;align-items:center;gap:6px;padding-top:20px">
          <input type="checkbox" id="new-platform-browser" checked /> 浏览器可打开
        </label>
        <button class="primary-button" id="add-platform-btn" type="button" style="flex:0 0 auto">添加平台</button>
      </div>
    </div>

    <div class="table-card">
      <div style="padding:16px 20px 0">
        <h3 style="margin:0">数据说明</h3>
        <p style="color:var(--muted);font-size:13px;margin:4px 0 0">平台配置保存在浏览器本地，更换设备后需重新配置。</p>
      </div>
      <div style="padding:16px 20px">
        <p style="font-size:14px;line-height:1.6;margin:0">
          <strong>浏览器可打开</strong> = 链接在浏览器中直接查看（小红书、知乎、公众号文章、抖音、独立站、Google/YouTube、Facebook/IG）<br/>
          <strong>需微信内打开</strong> = 链接只能在微信里查看（视频号）<br/>
          CRM 线索卡片上，可打开的链接会显示 🔗 图标，点击直接跳转。
        </p>
      </div>
    </div>

    <div class="table-card" style="margin-top:24px">
      <div style="padding:16px 20px 0">
        <h3 style="margin:0">AI 内容生成配置</h3>
        <p style="color:var(--muted);font-size:13px;margin:4px 0 0">配置 DeepSeek API Key 以启用 AI 内容生成功能。</p>
      </div>
      <div style="padding:16px 20px;display:flex;gap:8px;align-items:flex-end">
        <label style="flex:1;font-size:13px">DeepSeek API Key<input id="deepseek-key-input" type="password" placeholder="sk-..." value="${localStorage.getItem("bci-deepseek-key") || ""}" style="width:100%" /></label>
        <button class="primary-button" type="button" onclick="const v=document.querySelector('#deepseek-key-input').value.trim();if(v){localStorage.setItem('bci-deepseek-key',v);showToast('API Key 已保存')}else{localStorage.removeItem('bci-deepseek-key');showToast('API Key 已清除')}">保存</button>
      </div>
    </div>

    <div class="table-card" style="margin-top:24px">
      <div style="padding:16px 20px 0">
        <h3 style="margin:0">操作审计日志</h3>
        <p style="color:var(--muted);font-size:13px;margin:4px 0 0">记录关键操作，最近 ${Math.min(auditLog.length, 20)} / ${auditLog.length} 条</p>
      </div>
      ${auditLog.length > 0 ? `<table>
        <thead><tr><th>时间</th><th>用户</th><th>团队</th><th>操作</th><th>详情</th></tr></thead>
        <tbody>
          ${auditLog.slice(0, 20).map(e => `<tr>
            <td style="font-size:12px;white-space:nowrap">${e.time?.slice(0, 16).replace("T", " ") || "—"}</td>
            <td>${escapeHtml(e.user || "—")}</td>
            <td>${escapeHtml(TEAM_LABELS[e.team] || e.team || "—")}</td>
            <td><strong>${escapeHtml(e.action || "—")}</strong></td>
            <td style="font-size:12px;color:var(--muted)">${escapeHtml((e.detail || "").slice(0, 60))}</td>
          </tr>`).join("")}
        </tbody>
      </table>` : `<div style="padding:20px;color:var(--muted);text-align:center">暂无审计记录</div>`}
    </div>
  `;

  // Wire delete buttons
  target.querySelectorAll(".settings-delete-platform").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      const name = platformConfig[idx]?.name;
      if (confirm(`确定删除平台「${name}」吗？已有的内容和账号数据不会被删除。`)) {
        platformConfig.splice(idx, 1);
        savePlatformConfig();
        renderSettings();
        showToast(`已删除平台：${name}`);
      }
    });
  });

  // Wire add button
  const addBtn = document.querySelector("#add-platform-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const nameInput = document.querySelector("#new-platform-name");
      const iconInput = document.querySelector("#new-platform-icon");
      const browserCheck = document.querySelector("#new-platform-browser");
      const name = (nameInput?.value || "").trim();
      if (!name) { showToast("请输入平台名称"); return; }
      if (platformConfig.some((p) => p.name === name)) { showToast("该平台已存在"); return; }
      platformConfig.push({ name, icon: iconInput?.value || "📱", canBrowserOpen: browserCheck?.checked ?? true });
      savePlatformConfig();
      renderSettings();
      showToast(`已添加平台：${name}`);
    });
  }
}

function wireNavigation() {
  const title = document.querySelector("#view-title");
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => {
      const view = button.dataset.view;
      document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".view").forEach((section) => section.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`#${view}-view`).classList.add("active");
      title.textContent = button.textContent;
    });
  });
}

function applyRoleNav(role) {
  const allowed = roleCopy[role].nav;
  const navItems = document.querySelectorAll(".nav-item");
  const dividers = document.querySelectorAll(".nav-divider");

  // Show/hide nav items
  navItems.forEach((btn) => {
    const view = btn.dataset.view;
    const visible = allowed.includes(view);
    btn.style.display = visible ? "" : "none";
  });

  // Smart divider visibility: hide if no visible items on either side
  dividers.forEach((div) => {
    let prevVisible = false;
    let nextVisible = false;
    let el = div.previousElementSibling;
    while (el) {
      if (el.classList.contains("nav-divider")) break;
      if (el.classList.contains("nav-item") && el.style.display !== "none") { prevVisible = true; break; }
      el = el.previousElementSibling;
    }
    el = div.nextElementSibling;
    while (el) {
      if (el.classList.contains("nav-divider")) break;
      if (el.classList.contains("nav-item") && el.style.display !== "none") { nextVisible = true; break; }
      el = el.nextElementSibling;
    }
    div.style.display = (prevVisible && nextVisible) ? "" : "none";
  });

  // If current active view is hidden, switch to dashboard
  const activeNav = document.querySelector(".nav-item.active");
  if (activeNav && activeNav.style.display === "none") {
    document.querySelectorAll(".nav-item").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".view").forEach((section) => section.classList.remove("active"));
    const dashBtn = document.querySelector('.nav-item[data-view="dashboard"]');
    dashBtn.classList.add("active");
    document.querySelector("#dashboard-view").classList.add("active");
    document.querySelector("#view-title").textContent = "工作台";
  }
}

function renderDashboardForRole() {
  const role = document.querySelector("#role-select").value;
  const isContent = role === "operator" || role === "lead" || role === "admin";
  const isAdmission = role === "admission";
  const isAi = role === "ai";

  // 1. Action buttons — role-specific
  const actionsEl = document.getElementById("role-actions");
  if (actionsEl) {
    if (isAdmission) {
      actionsEl.innerHTML = `<button class="primary-button action-button" type="button" data-action="new-lead">新增线索</button><button class="ghost-button" type="button" onclick="autoAssignLeads()" style="margin-left:8px">⚡ 自动分配</button>`;
    } else if (isAi) {
      actionsEl.innerHTML = `<button class="primary-button action-button" type="button" data-action="new-content">生成内容</button>`;
    } else {
      actionsEl.innerHTML = `
        <button class="ghost-button action-button" type="button" data-action="upload-post">上传发布</button>
        <button class="primary-button action-button" type="button" data-action="new-content">创建计划</button>`;
    }
  }

  // 2. Pipeline section — show CRM funnel for admission, content pipeline for others, hide for AI
  const pipelineEl = document.getElementById("dashboard-pipeline");
  const pipelineTitle = document.getElementById("pipeline-title");
  const pipelineDesc = document.getElementById("pipeline-desc");
  const pipelineShortcut = document.getElementById("pipeline-shortcut");
  if (pipelineEl) {
    if (isAdmission) {
      pipelineTitle.textContent = "招生漏斗";
      pipelineDesc.textContent = "查看各阶段线索分布。";
      pipelineShortcut.textContent = "去招生 CRM →";
      pipelineShortcut.dataset.targetView = "crm";
      // Render CRM funnel summary in task-summary
      const taskSummary = document.getElementById("task-summary");
      if (taskSummary) {
        const myName = roleCopy[role].user;
        const myLeads = crmLeads.filter((l) => l.assignee === myName || l.assignee === "");
        taskSummary.innerHTML = `<div class="status-bar">${crmStages
          .map((s) => {
            const count = myLeads.filter((l) => l.stage === s).length;
            const cls = s === "流失" ? "red" : s === "签约" ? "green" : "";
            return `<button class="status-chip ${cls}" data-filter-status="${s}"><strong>${count}</strong><span>${s}</span></button>`;
          })
          .join("")}</div>`;
      }
    } else if (isAi) {
      pipelineTitle.textContent = "我的内容状态";
      pipelineDesc.textContent = "AI 生成内容的审核进度。";
      pipelineShortcut.textContent = "去内容库 →";
      pipelineShortcut.dataset.targetView = "content";
      renderTasks();
    } else {
      pipelineTitle.textContent = "内容管道";
      pipelineDesc.textContent = "点击查看各状态内容列表。";
      pipelineShortcut.textContent = "去今日发布 →";
      pipelineShortcut.dataset.targetView = "publishing";
      renderTasks();
    }
  }

  // 3. Publish query section — only for content roles (operator/lead/admin)
  const publishQueryEl = document.getElementById("dashboard-publish-query");
  if (publishQueryEl) {
    publishQueryEl.style.display = isContent ? "" : "none";
  }

  // 4. Sidebar daily goal — role-specific
  const sidebar = document.querySelector("#sidebar-daily-goal");
  if (sidebar) {
    if (isAdmission) {
      const myName = roleCopy[role].user;
      const myLeads = crmLeads.filter((l) => l.assignee === myName);
      const pending = myLeads.filter((l) => l.stage === "私信咨询" || l.stage === "加企微").length;
      const visits = myLeads.filter((l) => l.stage === "试听/到访").length;
      sidebar.innerHTML = `
        <span>今日目标</span>
        <strong>${pending} 条线索跟进</strong>
        <p>有 ${visits} 个试听/到访待确认，及时更新线索阶段。</p>`;
    } else if (isAi) {
      const aiDrafts = getFilteredContents().filter((c) => c.status === "草稿" || c.status === "待审核").length;
      sidebar.innerHTML = `
        <span>今日目标</span>
        <strong>${aiDrafts} 条草稿待完善</strong>
        <p>基于真实资料库生成内容，提交审核后交由运营发布。</p>`;
    }
    // For content roles, renderPublishingProgress already updates this
  }
}

function wireRoleSwitch() {
  const select = document.querySelector("#role-select");
  const title = document.querySelector("#role-title");
  const summary = document.querySelector("#role-summary");

  // Apply on load
  applyRoleNav(select.value);
  renderDashboardForRole();

  select.addEventListener("change", () => {
    const role = select.value;
    title.textContent = roleCopy[role].title;
    summary.textContent = roleCopy[role].summary;
    applyRoleNav(role);
    renderDashboardForRole();
    renderKpiCards();
    renderPublishingProgress();
    renderContent();
    renderTasks();
    renderDailyTasks();
    renderAccounts();
    renderCrm();
    renderNotifications();
  });
}

function wireActions() {
  document.addEventListener("click", (event) => {
    const librarySearchButton = event.target.closest(".library-search-button");
    if (librarySearchButton) {
      runLibrarySearch(librarySearchButton.dataset.library);
      return;
    }

    /* Status chip click → show filtered content list */
    const statusChip = event.target.closest(".status-chip[data-filter-status]");
    if (statusChip) {
      const filterStatus = statusChip.dataset.filterStatus;
      const currentRole = document.querySelector("#role-select").value;
      const isReviewer = currentRole === "lead" || currentRole === "admin";
      const filtered = getFilteredContents();
      const statusMap = {
        "草稿": (s) => s === "草稿",
        "待审核": (s) => s === "待审核",
        "已驳回": (s) => s === "已驳回",
        "可发布": (s) => s === "可发布" || s === "审核通过",
        "待回填": (s) => s === "待回填",
        "已发布": (s) => s === "已发布" || s === "Posted" || s === "已复盘",
      };
      const matchFn = statusMap[filterStatus] || (() => false);
      const matched = filtered.filter((c) => matchFn(c.status));
      const myName = roleCopy[currentRole]?.user || "";
      const listHtml = matched.length
        ? matched.map((c) => {
            const isOwn = c.author === myName || c.author === "当前用户";
            const label = isReviewer && !isOwn && (filterStatus === "待审核" || filterStatus === "草稿" || filterStatus === "已驳回") ? "审核" : "查看";
            return `
            <article class="review-list-item content-detail" data-title="${escapeHtml(c.title)}" style="cursor:pointer">
              <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)">
                <div>
                  <strong>${escapeHtml(c.title)}</strong>
                  <div style="font-size:12px;color:var(--muted);margin-top:2px">${c.account} · ${c.author || "—"} · ${c.publishDate || "—"}</div>
                </div>
                <span class="ghost-button" style="white-space:nowrap">${label} →</span>
              </div>
            </article>
          `;}).join("")
        : `<p style="color:var(--muted);padding:20px 0">暂无${filterStatus}内容。</p>`;

      const modalTitle = isReviewer && filterStatus === "待审核"
        ? `待审核内容（${matched.length}）`
        : `${filterStatus}内容（${matched.length}）`;

      openModal("content-detail", modalTitle, `<div>${listHtml}</div>`);
      document.querySelector("#modal-confirm").style.display = "none";
      document.querySelector("#modal-draft").style.display = "none";
      return;
    }

    const contentButton = event.target.closest(".content-detail");
    if (contentButton) {
      const item = contents.find((entry) => entry.title === contentButton.dataset.title);
      if (item) {
        const currentRole = document.querySelector("#role-select").value;
        const isReviewer = currentRole === "lead" || currentRole === "admin";
        const myName = roleCopy[currentRole]?.user || "";
        const isOwnContent = item.author === myName || item.author === "当前用户";

        if (isReviewer && !isOwnContent) {
          // Lead / Admin reviewing others' content
          if (item.status === "待审核" || item.status === "草稿" || item.status === "已驳回" || item.status === "可发布" || item.status === "审核通过") {
            openModal("review-action", `审核：${item.title.slice(0, 20)}`, buildReviewForm(item));
          } else if (item.status === "已发布" || item.status === "Posted" || item.status === "已复盘" || item.status === "待回填") {
            openModal("metrics-backfill", `数据查看：${item.title.slice(0, 15)}`, buildMetricsForm(item));
          } else {
            openModal("content-detail", item.title, buildContentDetailHtml(item));
            document.querySelector("#modal-confirm").style.display = "none";
            document.querySelector("#modal-draft").style.display = "none";
          }
        } else {
          // Operator / AI / others: action buttons based on status
          openModal("content-detail", item.title, buildContentDetailHtml(item));
          const confirmBtn = document.querySelector("#modal-confirm");
          const draftBtn = document.querySelector("#modal-draft");
          draftBtn.style.display = "none";
          if (item.status === "草稿") {
            confirmBtn.style.display = "";
            confirmBtn.textContent = "提交审核";
            currentModalAction = "content-submit-review";
            window._contentDetailItem = item;
          } else if (item.status === "已驳回") {
            openModal("resubmit-edit", `修改并重新提交：${item.title.slice(0, 15)}`, buildResubmitEditForm(item));
            window._contentDetailItem = item;
            return;
          } else if (item.status === "可发布" || item.status === "审核通过") {
            confirmBtn.style.display = "";
            confirmBtn.textContent = "发布归档";
            currentModalAction = "content-publish";
            window._contentDetailItem = item;
          } else if (item.status === "待审核") {
            // Operator waiting for review: read-only
            confirmBtn.style.display = "none";
          } else {
            confirmBtn.style.display = "none";
          }
        }
      }
      return;
    }

    const accountButton = event.target.closest(".account-detail");
    if (accountButton) {
      const account = accounts.find((entry) => entry.accountName === accountButton.dataset.title);
      if (account) {
        openModal(
          "account-detail",
          account.accountName,
          `
            <div class="detail-list">
              <div><strong>Account Status</strong><span>${account.status}</span></div>
              <div><strong>Contents</strong><span>${account.contentCount} 条关联内容</span></div>
              <div><strong>Handle</strong><span>${account.handle}</span></div>
              <div><strong>Investment Tier</strong><span>${account.investmentTier}</span></div>
              <div><strong>Owner Type</strong><span>${account.ownerType}</span></div>
              <div><strong>Platform</strong><span>${account.platform}</span></div>
              <div><strong>Talent / 主理人</strong><span>${account.talent}</span></div>
              <div><strong>主体名称</strong><span>${account.entityName}</span></div>
              <div><strong>主体类型</strong><span>${account.entityType}</span></div>
              <div><strong>运营人</strong><span>${account.operator}</span></div>
              <div><strong>绑定 IP</strong><span>${account.persona}</span></div>
              <div><strong>本月发布 / 线索</strong><span>${account.monthlyPosts} 条 / ${account.leads} 条</span></div>
            </div>
          `,
        );
      }
      return;
    }

    const aiButton = event.target.closest(".ai-detail");
    if (aiButton) {
      const item = aiPromptLibrary.find((entry) => entry.title === aiButton.dataset.title);
      if (item) {
        const usingContents = getContentsUsingPrompt(item.title);
        openModal(
          "ai-detail",
          item.title,
          `
            <div class="detail-list">
              <div><strong>作者</strong><span>${item.author}</span></div>
              <div><strong>最近使用</strong><span>${item.lastUsed}</span></div>
              <div><strong>备注</strong><span>${item.notes}</span></div>
              <div><strong>输出示例</strong><span>${item.outputExamples}</span></div>
              <div><strong>适用平台</strong><span>${item.platform}</span></div>
              <div><strong>Prompt 模板</strong><span style="white-space:pre-wrap;font-size:12px">${escapeHtml(item.promptTemplate)}</span></div>
              <div><strong>质量评级</strong><span>${item.qualityRating}</span></div>
              <div><strong>生产阶段</strong><span>${item.stage}</span></div>
              <div><strong>目标 IP</strong><span>${item.targetPersona}</span></div>
              <div><strong>使用次数</strong><span>${usingContents.length}（动态计算）</span></div>
            </div>
            <div class="modal-section">
              <h3>使用该 Prompt 的内容（${usingContents.length}）</h3>
              ${buildReverseContentList(usingContents, "关联内容")}
            </div>
          `,
        );
      }
      return;
    }

    const knowledgeButton = event.target.closest(".knowledge-detail");
    if (knowledgeButton) {
      const item = knowledge.find((entry) => entry.title === knowledgeButton.dataset.title);
      if (item) {
        const referencingContents = getContentsReferencingKb(item.title);
        openModal(
          "knowledge-detail",
          item.title,
          `
            <div class="detail-list">
              <div><strong>详情</strong><span>${item.detail}</span></div>
              <div><strong>备注</strong><span>${item.notes}</span></div>
              <div><strong>数值数据</strong><span>${item.numericData}</span></div>
              <div><strong>复查周期</strong><span>${item.reviewCycle}</span></div>
              <div><strong>来源</strong><span>${item.source}</span></div>
              <div><strong>来源类型</strong><span>${item.sourceType}</span></div>
              <div><strong>主题</strong><span>${(item.subject || []).join(" / ")}</span></div>
              <div><strong>类型</strong><span>${item.type}</span></div>
              <div><strong>被引用</strong><span>${referencingContents.length} 条内容（动态计算）</span></div>
              <div><strong>核实人</strong><span>${item.verifiedBy}</span></div>
              <div><strong>最后核实</strong><span>${item.lastVerified}</span></div>
              <div><strong>可见性</strong><span>${item.visibility}</span></div>
            </div>
            <div class="modal-section">
              <h3>引用该资料的内容（${referencingContents.length}）</h3>
              ${buildReverseContentList(referencingContents, "引用内容")}
            </div>
          `,
        );
      }
      return;
    }

    const filterButton = event.target.closest(".filter:not(.filter-list .filter)");
    if (filterButton) {
      const group = filterButton.parentElement;
      if (group) group.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
      filterButton.classList.add("active");
      // Trigger actual filtering based on filter text
      const filterText = filterButton.textContent.trim();
      const currentView = document.querySelector(".nav-item.active")?.dataset?.view;
      if (currentView === "content") renderContent();
      else showToast(`已切换筛选：${filterText}`);
      return;
    }

    const personaTimelineButton = event.target.closest(".persona-timeline");
    if (personaTimelineButton) {
      const personaName = personaTimelineButton.dataset.title;
      openModal("persona-timeline", `${personaName} 内容时间线`, buildIpTimeline(personaName));
      return;
    }

    const aiReviewBtn = event.target.closest(".ai-review-btn");
    if (aiReviewBtn) {
      const title = aiReviewBtn.dataset.title;
      const item = contents.find((c) => c.title === title) || window._currentReviewItem;
      if (item) {
        aiReviewBtn.disabled = true;
        aiReviewBtn.textContent = "🤖 DeepSeek 分析中...";
        const hint = document.querySelector(".ai-review-hint");
        if (hint) hint.textContent = "正在调用 DeepSeek 大模型，请稍候…";

        // Try DeepSeek API first, fallback to local rules
        callDeepSeekReview(item)
          .then((result) => applyAiReviewResult(result, aiReviewBtn, "DeepSeek"))
          .catch(() => {
            // Fallback to local rule engine
            aiReviewBtn.textContent = "🤖 本地规则分析中...";
            const localResult = generateAiReview(item);
            applyAiReviewResult(localResult, aiReviewBtn, "本地规则");
          });
      }
      return;
    }

    const navShortcut = event.target.closest(".nav-shortcut");
    if (navShortcut) {
      switchToView(navShortcut.dataset.targetView);
      return;
    }

    const actionButton = event.target.closest(".action-button");
    if (actionButton) {
      if (actionButton.dataset.action === "notifications") return; // handled by wireNotifications
      openModal(actionButton.dataset.action);
      return;
    }

    const rowAction = event.target.closest(".row-action");
    if (rowAction) {
      const title = rowAction.dataset.title || "记录";
      const kind = rowAction.dataset.kind || "详情";
      if (kind === "发布记录") {
        const post = posts.find((entry) => entry[4] === title);
        if (post) {
          openModal("record-detail", "发布记录", buildPostDetail(post));
          return;
        }
      }
      /* CRM lead detail */
      if (kind === "线索详情") {
        const lead = crmLeads.find(l => l.name === title);
        if (lead) {
          window._editingLead = lead;
          openModal("lead-detail", `线索：${lead.name.slice(0, 15)}`, buildLeadDetailHtml(lead));
          currentModalAction = "lead-add-followup";
          const confirmBtn = document.querySelector("#modal-confirm");
          if (confirmBtn) { confirmBtn.textContent = "添加跟进"; }
          const draftBtn = document.querySelector("#modal-draft");
          if (draftBtn) { draftBtn.style.display = "none"; }
          return;
        }
      }
      /* P1: intercept review & backfill tasks */
      if (kind === "任务处理") {
        const contentItem = contents.find((c) => c.title === title || title.includes(c.title?.slice(0, 8)));
        const currentRole = document.querySelector("#role-select").value;
        const isReviewer = currentRole === "lead" || currentRole === "admin";
        if (contentItem && contentItem.status === "已驳回") {
          if (isReviewer) {
            openModal("review-action", `审核：${contentItem.title.slice(0, 20)}`, buildReviewForm(contentItem));
          } else {
            openModal("resubmit-edit", `修改并重新提交：${contentItem.title.slice(0, 15)}`, buildResubmitEditForm(contentItem));
            window._contentDetailItem = contentItem;
          }
          return;
        }
        if (contentItem && (contentItem.status === "可发布" || contentItem.status === "审核通过")) {
          if (isReviewer) {
            openModal("review-action", `审核：${contentItem.title.slice(0, 20)}`, buildReviewForm(contentItem));
          } else {
            openModal("upload-post");
          }
          return;
        }
        if (contentItem && contentItem.status === "草稿") {
          if (isReviewer) {
            openModal("review-action", `审核：${contentItem.title.slice(0, 20)}`, buildReviewForm(contentItem));
          } else {
            // Operator: show content detail with submit button
            openModal("content-detail", contentItem.title, buildContentDetailHtml(contentItem));
            const confirmBtn = document.querySelector("#modal-confirm");
            const draftBtn = document.querySelector("#modal-draft");
            draftBtn.style.display = "none";
            confirmBtn.style.display = "";
            confirmBtn.textContent = "提交审核";
            currentModalAction = "content-submit-review";
            window._contentDetailItem = contentItem;
          }
          return;
        }
        if (contentItem && contentItem.status === "待审核") {
          if (isReviewer) {
            openModal("review-action", `审核：${contentItem.title.slice(0, 20)}`, buildReviewForm(contentItem));
          } else {
            // Operator: read-only, waiting for review
            openModal("content-detail", contentItem.title, buildContentDetailHtml(contentItem));
            document.querySelector("#modal-confirm").style.display = "none";
            document.querySelector("#modal-draft").style.display = "none";
          }
          return;
        }
        if (contentItem && (contentItem.status === "已发布" || contentItem.status === "Posted" || contentItem.status === "已复盘" || contentItem.status === "待回填")) {
          openModal("metrics-backfill", `数据回填：${contentItem.title.slice(0, 15)}`, buildMetricsForm(contentItem));
          return;
        }
        // Fallback: no matching content record — infer status from hardcoded task
        if (!contentItem) {
          const taskEntry = tasks.find(([, t]) => t === title);
          const inferredStatus = taskEntry ? taskEntry[2] : "草稿";
          const inferredAccount = taskEntry ? taskEntry[0] : "—";
          const pseudoItem = { title, account: inferredAccount, status: inferredStatus, funnelStage: "—", reviewHistory: [], metrics: {} };
          if (inferredStatus === "可发布") {
            if (isReviewer) {
              openModal("review-action", `审核：${title.slice(0, 20)}`, buildReviewForm(pseudoItem));
            } else {
              openModal("upload-post");
            }
            return;
          }
          if (inferredStatus === "待回填") {
            openModal("metrics-backfill", `数据回填：${title.slice(0, 15)}`, buildMetricsForm(pseudoItem));
            return;
          }
          // 草稿 / 待审核
          if (isReviewer) {
            openModal("review-action", `审核：${title.slice(0, 20)}`, buildReviewForm(pseudoItem));
          } else {
            const statusBadge = badge(inferredStatus, statusColor(inferredStatus));
            openModal("content-detail", title, `
              <div class="detail-list">
                <div><strong>内容标题</strong><span>${escapeHtml(title)}</span></div>
                <div><strong>账号</strong><span>${inferredAccount}</span></div>
                <div><strong>当前状态</strong><span>${statusBadge}</span></div>
              </div>
              <div class="modal-section">
                <h3>审核记录</h3>
                <p style="color:var(--muted)">暂无审核记录。</p>
              </div>
            `);
            const confirmBtn = document.querySelector("#modal-confirm");
            const draftBtn = document.querySelector("#modal-draft");
            draftBtn.style.display = "none";
            if (inferredStatus === "草稿") {
              confirmBtn.style.display = "";
              confirmBtn.textContent = "提交审核";
              currentModalAction = "content-submit-review";
              window._contentDetailItem = pseudoItem;
            } else {
              confirmBtn.style.display = "none";
            }
          }
          return;
        }
      }
      openModal(
        "record-detail",
        kind,
        `
          <div class="detail-list">
            <div><strong>${title}</strong><span>这里会显示这条记录的完整内容、调用资料、审核记录、发布归档和关联线索。</span></div>
            <div><strong>下一步</strong><span>真实系统里可以继续审核、引用、复制改写或进入数据回填。</span></div>
          </div>
        `,
      );
    }
  });

  document.querySelectorAll(".modal-close").forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.querySelector("#modal-backdrop").addEventListener("click", (event) => {
    if (event.target.id === "modal-backdrop") {
      closeModal();
    }
  });

  document.querySelector("#modal-confirm").addEventListener("click", async () => {
    closeModal();
    if (!(await saveModalRecord())) {
      showToast("已保存到系统，并记录本次操作。");
    }
  });

  document.querySelector("#modal-draft").addEventListener("click", async () => {
    currentModalAction = "new-content-draft";
    closeModal();
    if (!(await saveModalRecord())) {
      showToast("草稿已保存。");
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeModal();
    }
  });

  document.querySelector("#archive-query").addEventListener("click", queryArchive);

  document.querySelectorAll(".library-search input").forEach((input) => {
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const button = input.parentElement.querySelector(".library-search-button");
        runLibrarySearch(button.dataset.library);
      }
    });
  });
}

function runLibrarySearch(library) {
  const configs = {
    content: {
      input: "#content-search",
      source: getFilteredContents(),
      render: renderContent,
      label: "内容资产",
    },
    knowledge: {
      input: "#knowledge-search",
      source: knowledge,
      render: renderKnowledge,
      label: "真实资料",
    },
    ai: {
      input: "#ai-search",
      source: aiPromptLibrary,
      render: renderAiLibrary,
      label: "AI 模板",
    },
    persona: {
      input: "#persona-search",
      source: personas,
      render: renderPersonas,
      label: "IP",
    },
    account: {
      input: "#account-search",
      source: accounts,
      render: renderAccounts,
      label: "账号",
    },
  };
  const config = configs[library];
  if (!config) return;
  const keyword = document.querySelector(config.input).value.trim();
  const results = config.source.filter((item) => recordMatches(item, keyword));
  config.render(results);
  showToast(keyword ? `${config.label}搜索：找到 ${results.length} 条` : `已重置${config.label}列表`);
}

/* ── Strategy filtering ── */
const activeFilters = { funnel: "", emotion: "", repurpose: "", topic: "" };

function applyStrategyFilters() {
  const keyword = (document.querySelector("#content-search")?.value || "").trim();
  const base = getFilteredContents();
  const filtered = base.filter((item) => {
    if (activeFilters.funnel && item.funnelStage !== activeFilters.funnel) return false;
    if (activeFilters.emotion && !includesKeyword(item.emotionalTrigger, activeFilters.emotion)) return false;
    if (activeFilters.repurpose && !includesKeyword(item.repurposeStatus, activeFilters.repurpose)) return false;
    if (activeFilters.topic && activeFilters.topic !== "全部" && !includesKeyword(JSON.stringify(item), activeFilters.topic)) return false;
    if (keyword && !recordMatches(item, keyword)) return false;
    return true;
  });
  renderContent(filtered);
  showToast(`筛选结果：${filtered.length} 条内容`);
}

function wireStrategyFilters() {
  document.querySelectorAll(".strat-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.dataset.filter;
      document.querySelectorAll(`.strat-filter[data-filter="${group}"]`).forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilters[group] = btn.dataset.value;
      applyStrategyFilters();
    });
  });

  document.querySelectorAll(".filter-list .filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-list .filter").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeFilters.topic = btn.textContent.trim();
      applyStrategyFilters();
    });
  });
}

/* ── Content calendar ── */
let calYear = 2026;
let calMonth = 4; // 0-indexed, May = 4

function renderCalendar() {
  const grid = document.querySelector("#calendar-grid");
  const label = document.querySelector("#cal-month-label");
  const summary = document.querySelector("#calendar-summary");
  if (!grid) return;

  const year = calYear;
  const month = calMonth;
  label.textContent = `${year} 年 ${month + 1} 月`;

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const headers = ["日", "一", "二", "三", "四", "五", "六"];
  let html = headers.map((d) => `<div class="cal-header">${d}</div>`).join("");

  const monthContents = contents.filter((item) => {
    if (!item.publishDate) return false;
    const d = new Date(item.publishDate);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const contentsByDay = {};
  monthContents.forEach((item) => {
    const day = new Date(item.publishDate).getDate();
    (contentsByDay[day] = contentsByDay[day] || []).push(item);
  });

  // padding days before first day
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="cal-cell other-month"><div class="cal-date">${prevMonthDays - i}</div></div>`;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const isToday = dateStr === todayStr;
    const dayItems = contentsByDay[day] || [];
    const itemsHtml = dayItems
      .slice(0, 3)
      .map((item) => {
        const cls = (item.funnelStage || "awareness").toLowerCase();
        const acctParts = (item.account || "").split("·");
        const acctShort = acctParts.length > 1 ? acctParts[1] : (acctParts[0] || "").slice(0, 4);
        return `<button class="cal-item ${cls} content-detail" type="button" data-title="${escapeHtml(item.title)}" title="${escapeHtml(item.title)} · ${item.account}">${escapeHtml(acctShort)} ${escapeHtml(item.title).slice(0, 6)}</button>`;
      })
      .join("");
    const more = dayItems.length > 3 ? `<span style="font-size:10px;color:var(--muted)">+${dayItems.length - 3} 条</span>` : "";
    html += `<div class="cal-cell${isToday ? " today" : ""}"><div class="cal-date">${day}</div>${itemsHtml}${more}</div>`;
  }

  // padding days after last day
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-cell other-month"><div class="cal-date">${i}</div></div>`;
  }

  grid.innerHTML = html;

  // summary stats
  const funnelCounts = {};
  monthContents.forEach((item) => { funnelCounts[item.funnelStage] = (funnelCounts[item.funnelStage] || 0) + 1; });
  const platformCounts = {};
  monthContents.forEach((item) => {
    const acct = accounts.find((a) => a.accountName === item.account);
    const p = acct ? acct.platform : (platformConfig.find((pl) => (item.account || "").includes(pl.name)) || {}).name || "其他";
    platformCounts[p] = (platformCounts[p] || 0) + 1;
  });
  const waceCount = monthContents.filter((item) => item.waceFocus).length;

  summary.innerHTML = `
    <div class="cal-stat"><span>本月内容</span><strong>${monthContents.length}</strong><small>条已排期</small></div>
    <div class="cal-stat"><span>WACE Focus</span><strong>${waceCount}</strong><small>条（目标 ≥ 8）</small></div>
    <div class="cal-stat"><span>漏斗覆盖</span><strong>${Object.keys(funnelCounts).length}/5</strong><small>${Object.entries(funnelCounts).map(([k, v]) => `${k}:${v}`).join(" · ")}</small></div>
    <div class="cal-stat"><span>平台覆盖</span><strong>${Object.keys(platformCounts).length}</strong><small>${Object.entries(platformCounts).map(([k, v]) => `${k}:${v}`).join(" · ")}</small></div>
  `;
}

function wireCalendar() {
  const prev = document.querySelector("#cal-prev");
  const next = document.querySelector("#cal-next");
  if (!prev) return;
  prev.addEventListener("click", () => {
    calMonth--;
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCalendar();
  });
  next.addEventListener("click", () => {
    calMonth++;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    renderCalendar();
  });
}

/* ── Strategy health dashboard ── */
function renderStrategyHealth() {
  renderDistBars("funnel-dist-bars", contents, "funnelStage", "funnel");
  renderDistBars("emotion-dist-bars", contents, "emotionalTrigger", "emotion");
  renderDistBars("repurpose-dist-bars", contents, "repurposeStatus", "repurpose");
  renderContentTypeMix();
  renderWaceTracker();
}

function renderContentTypeMix() {
  const target = document.querySelector("#content-type-mix");
  if (!target) return;
  const total = contents.length || 1;
  const catCounts = {};
  contents.forEach((c) => {
    const cat = getContentCategory(c.contentType);
    catCounts[cat] = (catCounts[cat] || 0) + 1;
  });
  target.innerHTML = Object.entries(CONTENT_TYPE_CATEGORIES).map(([cat, info]) => {
    const count = catCounts[cat] || 0;
    const actual = Math.round((count / total) * 100);
    const diff = actual - info.target;
    const diffLabel = diff > 0 ? `+${diff}%` : `${diff}%`;
    const diffCls = Math.abs(diff) > 10 ? "warn" : "ok";
    return `<div class="type-mix-row">
      <span class="type-mix-label">${cat}</span>
      <div class="type-mix-bar-track">
        <div class="type-mix-bar actual" style="width:${actual}%"></div>
        <div class="type-mix-bar target" style="width:${info.target}%;opacity:0.3"></div>
      </div>
      <span class="type-mix-pct">${actual}%<small class="${diffCls}">（${diffLabel}）</small></span>
      <span class="type-mix-target">目标 ${info.target}%</span>
    </div>`;
  }).join("");
}

function renderDistBars(targetId, items, field, colorClass) {
  const target = document.querySelector(`#${targetId}`);
  if (!target) return;
  const counts = {};
  items.forEach((item) => { const v = item[field] || "未设置"; counts[v] = (counts[v] || 0) + 1; });
  const max = Math.max(...Object.values(counts), 1);
  target.innerHTML = Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .map(([label, count]) => `
      <div class="health-meter">
        <span class="health-meter-label">${label}</span>
        <div class="health-meter-bar"><div class="health-meter-fill ${colorClass}" style="width:${Math.round((count / max) * 100)}%"></div></div>
        <span class="health-meter-count">${count}</span>
      </div>
    `).join("");
}

function renderWaceTracker() {
  const target = document.querySelector("#wace-tracker");
  if (!target) return;
  const now = new Date();
  const weekStart = new Date(now);
  const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMon = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday-based week
  weekStart.setDate(now.getDate() - diffToMon);
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const waceThisWeek = contents.filter((item) => item.waceFocus && item.publishDate >= weekStartStr).length;
  const statusClass = waceThisWeek >= 2 ? "ok" : waceThisWeek >= 1 ? "warn" : "fail";
  target.innerHTML = `
    <div class="wace-status ${statusClass}">
      <div class="big-number">${waceThisWeek}</div>
      <div class="target">本周 WACE Focus / 目标 ≥ 2</div>
    </div>
  `;
}

function renderTopContent() {
  const target = document.querySelector("#top-content-table");
  if (!target) return;
  const ranked = contents
    .filter((c) => c.metrics && (c.metrics.reads > 0 || c.metrics.leads > 0))
    .map((c) => ({ ...c, score: contentScore(c.metrics) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
  if (ranked.length === 0) { target.innerHTML = '<tr><td colspan="9" style="color:var(--muted);text-align:center;padding:24px">暂无数据</td></tr>'; return; }
  const acctShort = (a) => { const p = (a || "").split("·"); return p.length > 1 ? p[1] : p[0].slice(0, 8); };
  target.innerHTML = ranked.map((c, i) => `
    <tr class="clickable-row content-detail" data-title="${escapeHtml(c.title)}">
      <td><strong>${i + 1}</strong></td>
      <td>${escapeHtml(c.title).slice(0, 20)}${c.title.length > 20 ? "…" : ""}</td>
      <td>${acctShort(c.account)}</td>
      <td>${fmtNum(c.metrics.reads)}</td>
      <td>${fmtNum(c.metrics.likes)}</td>
      <td>${fmtNum(c.metrics.comments)}</td>
      <td>${fmtNum(c.metrics.privateMessages)}</td>
      <td>${fmtNum(c.metrics.leads)}</td>
      <td><strong>${Math.round(c.score)}</strong></td>
    </tr>
  `).join("");
}

/* ── P2: Keyword / SEO Tracking ── */
function renderKeywordTable() {
  const target = document.querySelector("#keyword-table");
  if (!target) return;
  const kwMap = {};
  contents.forEach((c) => {
    const kw = c.primaryKeyword;
    if (!kw || kw === "待定") return;
    if (!kwMap[kw]) kwMap[kw] = { count: 0, reads: 0, leads: 0, scores: [], funnels: new Set() };
    const entry = kwMap[kw];
    entry.count++;
    if (c.metrics) {
      entry.reads += c.metrics.reads || 0;
      entry.leads += c.metrics.leads || 0;
      entry.scores.push(contentScore(c.metrics));
    }
    if (c.funnelStage) entry.funnels.add(c.funnelStage);
  });
  const rows = Object.entries(kwMap).sort(([, a], [, b]) => b.reads - a.reads);
  if (rows.length === 0) { target.innerHTML = '<tr><td colspan="6" style="color:var(--muted);text-align:center;padding:24px">暂无关键词数据</td></tr>'; return; }
  target.innerHTML = rows.map(([kw, d]) => {
    const avg = d.scores.length > 0 ? Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length) : 0;
    const funnelBadges = [...d.funnels].map((f) => `<span class="strat-badge funnel" style="font-size:11px">${f}</span>`).join(" ");
    return `<tr>
      <td><span class="strat-badge keyword">${escapeHtml(kw)}</span></td>
      <td>${d.count}</td>
      <td>${fmtNum(d.reads)}</td>
      <td>${d.leads}</td>
      <td><strong>${avg}</strong></td>
      <td>${funnelBadges}</td>
    </tr>`;
  }).join("");
}

/* ── P2: A/B Test Panel ── */
function renderAbTestPanel() {
  const target = document.querySelector("#ab-test-panel");
  if (!target) return;
  // Find content pairs with same topic cluster + similar publish dates as potential A/B tests
  const groups = {};
  contents.forEach((c) => {
    if (!c.topicCluster || !c.metrics) return;
    const key = c.topicCluster;
    if (!groups[key]) groups[key] = [];
    groups[key].push(c);
  });
  const tests = Object.entries(groups)
    .filter(([, items]) => items.length >= 2)
    .map(([cluster, items]) => {
      const sorted = items.sort((a, b) => contentScore(b.metrics) - contentScore(a.metrics));
      return { cluster, items: sorted.slice(0, 2) };
    });
  if (tests.length === 0) {
    target.innerHTML = '<div class="empty-state">同一主题下需要 2 条以上内容才能进行 A/B 对比。</div>';
    return;
  }
  target.innerHTML = tests.map((test) => {
    const [a, b] = test.items;
    const scoreA = Math.round(contentScore(a.metrics));
    const scoreB = Math.round(contentScore(b.metrics));
    const winner = scoreA >= scoreB ? 0 : 1;
    return `
    <div class="ab-test-card">
      <div class="ab-test-header">
        <span class="strat-badge funnel">${test.cluster}</span>
        <span style="color:var(--muted);font-size:13px">同主题对比</span>
      </div>
      <div class="ab-test-row">
        <div class="ab-variant ${winner === 0 ? "winner" : ""}">
          <div class="ab-variant-label">A ${winner === 0 ? "🏆" : ""}</div>
          <h4>${escapeHtml(a.title).slice(0, 25)}${a.title.length > 25 ? "…" : ""}</h4>
          <p class="ab-meta">${a.account} · ${a.emotionalTrigger || ""}</p>
          <div class="ab-metrics">
            <span>阅读 ${fmtNum(a.metrics.reads)}</span>
            <span>线索 ${a.metrics.leads}</span>
            <span>综合分 <strong>${scoreA}</strong></span>
          </div>
        </div>
        <div class="ab-vs">VS</div>
        <div class="ab-variant ${winner === 1 ? "winner" : ""}">
          <div class="ab-variant-label">B ${winner === 1 ? "🏆" : ""}</div>
          <h4>${escapeHtml(b.title).slice(0, 25)}${b.title.length > 25 ? "…" : ""}</h4>
          <p class="ab-meta">${b.account} · ${b.emotionalTrigger || ""}</p>
          <div class="ab-metrics">
            <span>阅读 ${fmtNum(b.metrics.reads)}</span>
            <span>线索 ${b.metrics.leads}</span>
            <span>综合分 <strong>${scoreB}</strong></span>
          </div>
        </div>
      </div>
      <p class="ab-insight">💡 ${winner === 0 ? "A" : "B"} 版综合分高出 <strong>${Math.abs(scoreA - scoreB)}</strong> 分，情绪钩子「${(winner === 0 ? a : b).emotionalTrigger}」在该主题下表现更好。</p>
    </div>`;
  }).join("");
}

/* ── P2: Notification System ── */
function generateNotifications() {
  const notifs = [];
  const now = new Date();
  const role = document.querySelector("#role-select").value;
  const isManager = role === "lead" || role === "admin";
  const isContent = role === "operator" || role === "lead" || role === "admin" || role === "ai";
  const isAdmission = role === "admission";

  // ── Operator-specific: your submitted content status ──
  if (role === "operator") {
    const myName = roleCopy[role]?.user || "";
    const myPending = contents.filter((c) => c.author === myName && c.status === "待审核").length;
    if (myPending > 0) {
      notifs.push({ type: "info", icon: "⏳", title: `你有 ${myPending} 条内容在审核中`, desc: "已提交等待部门负责人审核，请关注审核结果。", time: "实时", targetView: "content", filterStatus: "待审核" });
    }
    const myRejected = contents.filter((c) => c.author === myName && c.status === "已驳回").length;
    if (myRejected > 0) {
      notifs.push({ type: "action", icon: "✏️", title: `${myRejected} 条内容被退回修改`, desc: "审核未通过，请查看修改意见并重新提交。", time: "实时", targetView: "content", filterStatus: "已驳回" });
    }
  }

  // ── Manager-specific: pending review queue ──
  if (isManager) {
    const pendingReview = contents.filter((c) => c.status === "待审核").length;
    if (pendingReview > 0) {
      notifs.push({ type: "action", icon: "📋", title: `${pendingReview} 条内容待审核`, desc: "请及时处理审核队列，避免发布延误。", time: "实时", targetView: "content", filterStatus: "待审核" });
    }
  }

  // ── Content roles: backfill & WACE ──
  if (isContent) {
    // WACE weekly check (Monday-based week)
    const weekStart = new Date(now);
    const dowNotif = now.getDay();
    weekStart.setDate(now.getDate() - (dowNotif === 0 ? 6 : dowNotif - 1));
    const weekStartStr = weekStart.toISOString().slice(0, 10);
    const waceCount = contents.filter((c) => c.waceFocus && c.publishDate >= weekStartStr).length;
    if (waceCount < 2) {
      notifs.push({ type: "warn", icon: "⚠️", title: `WACE 内容本周仅 ${waceCount} 条`, desc: `铁律要求每周 ≥ 2 条，还差 ${2 - waceCount} 条。`, time: "实时", targetView: "content" });
    }

    // Top content congratulation
    const topItem = contents.filter((c) => c.metrics).sort((a, b) => contentScore(b.metrics) - contentScore(a.metrics))[0];
    if (topItem && contentScore(topItem.metrics) > 500) {
      notifs.push({ type: "info", icon: "🎉", title: `爆款预警：${topItem.title.slice(0, 15)}…`, desc: `综合分 ${Math.round(contentScore(topItem.metrics))}，建议复用到更多平台。`, time: "今日", targetView: "content", filterStatus: "已发布" });
    }

    // Repurpose reminder
    const canRepurpose = contents.filter((c) => c.repurposeStatus && c.repurposeStatus.includes("可") && (!c.repurposeChildren || c.repurposeChildren.length === 0)).length;
    if (canRepurpose > 0) {
      notifs.push({ type: "info", icon: "🔄", title: `${canRepurpose} 条内容可跨平台复用`, desc: "已标记可复用但尚未衍生新内容，建议安排改写。", time: "本周", targetView: "content", filterStatus: "可发布" });
    }
  }

  // ── Operator & Manager: metrics backfill ──
  if (role === "operator" || isManager) {
    const needBackfill = contents.filter((c) => c.status === "已发布" && c.metrics && c.metrics.reads === 0).length;
    if (needBackfill > 0) {
      notifs.push({ type: "action", icon: "📊", title: `${needBackfill} 条内容待回填数据`, desc: "已发布但未录入表现数据，影响复盘准确性。", time: "实时", targetView: "content", filterStatus: "已发布" });
    }
  }

  // ── Manager-only: strategy insights ──
  if (isManager) {
    const funnelCounts = {};
    contents.forEach((c) => { if (c.funnelStage) funnelCounts[c.funnelStage] = (funnelCounts[c.funnelStage] || 0) + 1; });
    const trustCount = funnelCounts["Trust"] || 0;
    const visitCount = funnelCounts["Visit"] || 0;
    if (trustCount === 0 && visitCount === 0) {
      notifs.push({ type: "warn", icon: "🔻", title: "漏斗中段缺失", desc: "Trust 和 Visit 阶段内容为 0，容易导致线索转化断层。", time: "策略建议", targetView: "analytics", fallbackView: "content" });
    }
  }

  // ── Admission-specific: lead reminders (filtered to own leads) ──
  if (isAdmission) {
    const myName = roleCopy[role]?.user || "";
    const myLeads = crmLeads.filter((l) => l.assignee === myName);
    const myNew = myLeads.filter((l) => l.stage === "私信咨询" || l.stage === "加企微").length;
    const unassigned = crmLeads.filter((l) => l.stage === "私信咨询" && !l.assignee).length;
    if (myNew > 0) {
      notifs.push({ type: "action", icon: "🎯", title: `你有 ${myNew} 条线索待跟进`, desc: "请及时联系，避免线索冷却流失。", time: "实时", targetView: "crm" });
    }
    if (unassigned > 0) {
      notifs.push({ type: "info", icon: "📩", title: `${unassigned} 条线索待分配`, desc: "有新线索尚未分配顾问，请联系负责人。", time: "实时", targetView: "crm" });
    }
    const myVisits = myLeads.filter((l) => l.stage === "试听/到访").length;
    if (myVisits > 0) {
      notifs.push({ type: "info", icon: "🏫", title: `你有 ${myVisits} 组家庭预约到访`, desc: "请提前准备接待材料和校园参观路线。", time: "今日", targetView: "crm" });
    }
  }

  // ── Manager: unassigned leads alert ──
  if (isManager) {
    const unassigned = crmLeads.filter((l) => l.stage === "新线索" && !l.assignee).length;
    if (unassigned > 0) {
      notifs.push({ type: "action", icon: "📩", title: `${unassigned} 条新线索待分配顾问`, desc: "请在招生 CRM 中将线索分配给具体顾问。", time: "实时", targetView: "crm" });
    }
  }

  // ── TASK 5.2: Follow-up overdue reminders ──
  const todayStr = now.toISOString().slice(0, 10);
  const relevantLeads = isAdmission
    ? crmLeads.filter(l => l.assignee === (roleCopy[role]?.user || ""))
    : (isManager ? crmLeads : []);
  const overdueFollowUps = [];
  const upcomingFollowUps = [];
  relevantLeads.forEach(lead => {
    if (lead.stage === "签约" || lead.stage === "流失") return;
    const fups = lead.followUps || [];
    const lastFu = fups[fups.length - 1];
    if (lastFu && lastFu.nextDate) {
      if (lastFu.nextDate <= todayStr) {
        overdueFollowUps.push({ lead, fu: lastFu });
      } else {
        // upcoming in next 3 days
        const nextD = new Date(lastFu.nextDate);
        const diffDays = Math.ceil((nextD - now) / 86400000);
        if (diffDays <= 3) {
          upcomingFollowUps.push({ lead, fu: lastFu, days: diffDays });
        }
      }
    }
    // Leads with no follow-ups at all and older than 3 days
    if (fups.length === 0 && lead.date) {
      const leadDate = new Date(lead.date);
      const daysSince = Math.floor((now - leadDate) / 86400000);
      if (daysSince >= 3 && lead.stage !== "签约" && lead.stage !== "流失") {
        overdueFollowUps.push({ lead, fu: null });
      }
    }
  });
  if (overdueFollowUps.length > 0) {
    notifs.push({ type: "critical", icon: "🚨", title: `${overdueFollowUps.length} 条线索跟进已逾期`, desc: overdueFollowUps.slice(0, 3).map(o => `${o.lead.name}${o.fu ? `（${o.fu.nextAction || "待跟进"}）` : "（从未跟进）"}`).join("、"), time: "立即处理", targetView: "crm" });
  }
  if (upcomingFollowUps.length > 0) {
    notifs.push({ type: "action", icon: "📅", title: `${upcomingFollowUps.length} 条线索即将到期跟进`, desc: upcomingFollowUps.slice(0, 3).map(o => `${o.lead.name}（${o.days}天后）`).join("、"), time: "近期", targetView: "crm" });
  }

  // ── TASK 3.3: Red line indicator warnings (MCN 9.4) ──
  if (isManager || isAdmission) {
    const stageCounts = {};
    crmLeads.forEach(l => { stageCounts[l.stage] = (stageCounts[l.stage] || 0) + 1; });
    const dmCount = stageCounts["私信咨询"] || 0;
    const wechatCount = stageCounts["加企微"] || 0;
    const visitCount = stageCounts["试听/到访"] || 0;
    const signedCount = stageCounts["签约"] || 0;

    // Red line 1: 私信→加微 < 10%
    if (dmCount > 0) {
      const dmToWechat = Math.round(wechatCount / dmCount * 100);
      if (dmToWechat < 10) {
        notifs.push({ type: "critical", icon: "🚨", title: `红线：私信→加微 仅 ${dmToWechat}%（<10%）`, desc: "话术/响应速度需紧急优化，大量私信未转化为企微好友。", time: "红线预警", targetView: "crm" });
      }
    }
    // Red line 2: 加微→试听 < 20%
    if (wechatCount > 0) {
      const wechatToVisit = Math.round(visitCount / wechatCount * 100);
      if (wechatToVisit < 20) {
        notifs.push({ type: "critical", icon: "🚨", title: `红线：加微→试听 仅 ${wechatToVisit}%（<20%）`, desc: "跟进节奏或内容吸引力不足，好友未转化为到访。", time: "红线预警", targetView: "crm" });
      }
    }
    // Red line 3: 试听→签约 < 25%
    if (visitCount > 0) {
      const visitToSign = Math.round(signedCount / visitCount * 100);
      if (visitToSign < 25) {
        notifs.push({ type: "critical", icon: "🚨", title: `红线：试听→签约 仅 ${visitToSign}%（<25%）`, desc: "到访体验或顾问跟进存在问题，建议复盘接待流程。", time: "红线预警", targetView: "crm" });
      }
    }
    // Red line 4: 顾问 30 天无开单
    if (isManager) {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().slice(0, 10);
      const advisors = teamMembers.filter(m => m.role === "招生顾问" && m.status === "在职");
      advisors.forEach(adv => {
        const recentSign = crmLeads.some(l => l.assignee === adv.name && l.stage === "签约" && l.date >= thirtyDaysAgo);
        if (!recentSign) {
          notifs.push({ type: "critical", icon: "🚨", title: `红线：${adv.name} 30天无签约`, desc: "顾问连续30天未开单，需排查线索分配和跟进质量。", time: "红线预警", targetView: "team" });
        }
      });
    }
  }

  return notifs;
}

function renderNotifications() {
  const list = document.querySelector("#notif-list");
  if (!list) return;
  const notifs = generateNotifications();
  const btn = document.querySelector('[data-action="notifications"]');
  // Show red dot if there are warn/action notifications
  const urgent = notifs.filter((n) => n.type === "warn" || n.type === "action" || n.type === "critical").length;
  if (btn) {
    btn.classList.toggle("has-notif", urgent > 0);
  }
  if (notifs.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:32px">暂无新通知，一切正常。</div>';
    return;
  }
  list.innerHTML = notifs.map((n) => `
    <div class="notif-item notif-${n.type} notif-link" data-target-view="${n.targetView || ""}" data-fallback-view="${n.fallbackView || ""}" data-filter-status="${n.filterStatus || ""}" style="cursor:pointer">
      <span class="notif-icon">${n.icon}</span>
      <div class="notif-body">
        <strong>${n.title}</strong>
        <p>${n.desc}</p>
      </div>
      <span class="notif-link-arrow">→</span>
    </div>
  `).join("");
}

function wireNotifications() {
  const btn = document.querySelector('[data-action="notifications"]');
  const panel = document.querySelector("#notification-panel");
  const overlay = document.querySelector("#notification-overlay");
  const closeBtn = document.querySelector("#notif-close");
  if (!btn || !panel) return;
  function toggle() {
    const open = panel.getAttribute("aria-hidden") !== "false";
    panel.setAttribute("aria-hidden", !open);
    overlay.classList.toggle("active", open);
    if (open) renderNotifications();
  }
  btn.addEventListener("click", toggle);
  if (closeBtn) closeBtn.addEventListener("click", toggle);
  if (overlay) overlay.addEventListener("click", toggle);

  // Click notification item → navigate to relevant view
  panel.addEventListener("click", (event) => {
    const item = event.target.closest(".notif-link");
    if (!item) return;
    let targetView = item.dataset.targetView;
    if (!targetView) return;
    // Check if the target view is accessible for the current role
    const navBtn = document.querySelector(`.nav-item[data-view="${targetView}"]`);
    if (!navBtn || navBtn.offsetParent === null) {
      // Use explicit fallback if provided, otherwise default
      const fallback = item.dataset.fallbackView;
      targetView = fallback || (targetView === "analytics" ? "content" : "dashboard");
    }
    // Close notification panel
    toggle();
    // Navigate to target view
    switchToView(targetView);
    // If there's a filter status, trigger the status chip click
    const filterStatus = item.dataset.filterStatus;
    if (filterStatus) {
      setTimeout(() => {
        const chip = document.querySelector(`.status-chip[data-filter-status="${filterStatus}"]`);
        if (chip) chip.click();
      }, 200);
    }
  });
}

function renderApp() {
  renderKpiCards();
  renderPublishingProgress();
  renderTasks();
  renderPublishing();
  renderDailyTasks();
  renderContent();
  renderKnowledge();
  renderPersonas();
  renderAccounts();
  renderCrm();
  renderBars();
  renderDynamicFunnel();
  renderNorthStar();
  renderAiLibrary();
  renderPermissions();
  renderSettings();
  queryArchive();
  renderCalendar();
  renderStrategyHealth();
  renderTopContent();
  renderKeywordTable();
  renderAbTestPanel();
  renderNotifications();
}

async function bootstrap() {
  // Wire login form (before cloud init, so it's ready when login screen shows)
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("login-email").value.trim();
      const password = document.getElementById("login-password").value;
      const errorEl = document.getElementById("login-error");
      const btn = loginForm.querySelector(".login-btn");
      errorEl.textContent = "";
      btn.disabled = true;
      btn.textContent = "登录中…";
      try {
        await handleSignIn(email, password);
        // Auth state change listener will handle the rest
      } catch (err) {
        errorEl.textContent = err.message === "Invalid login credentials"
          ? "邮箱或密码错误" : (err.message || "登录失败，请重试");
      } finally {
        btn.disabled = false;
        btn.textContent = "登 录";
      }
    });
  }

  // Wire logout button
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => handleSignOut());
  }

  loadSavedState();
  await initCloudDatabase();
  renderApp();
  wireNavigation();
  wireRoleSwitch();
  wireActions();
  wireStrategyFilters();
  wireCalendar();
  wireNotifications();
  // TASK 5.2: Auto-refresh notifications every 5 minutes
  setInterval(() => { renderNotifications(); }, 300000);
  const status = getCloudStatus();
  if (status.message) {
    showToast(status.message);
  }
}

bootstrap();
