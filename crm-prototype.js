const roleCopy = {
  operator: {
    title: "运营人员",
    summary: "负责账号内容生产、提交审核、发布归档和数据回填。",
    nav: ["dashboard", "publishing", "content", "knowledge", "calendar", "crm"],
    user: "Ocean Wang",
    contentFilter: "all",
  },
  lead: {
    title: "部门负责人",
    summary: "集中检查待审核内容、账号发布进度、内容效果和线索来源。",
    nav: ["dashboard", "publishing", "content", "knowledge", "ai", "persona", "accounts", "calendar", "crm", "analytics"],
    user: "部门负责人",
    contentFilter: "all",
  },
  admin: {
    title: "超级管理员",
    summary: "管理用户、角色、账号、IP、资料库和全局数据权限。",
    nav: ["dashboard", "publishing", "content", "knowledge", "ai", "persona", "accounts", "calendar", "crm", "analytics", "team"],
    user: "管理员",
    contentFilter: "all",
  },
  ai: {
    title: "AI 内容编辑",
    summary: "基于真实资料库生成内容，保存 prompt、版本和采用记录。",
    nav: ["dashboard", "content", "knowledge", "ai", "calendar"],
    user: "AI 编辑",
    contentFilter: "all",
  },
  admission: {
    title: "招生顾问",
    summary: "跟进分配线索，查看来源内容，记录到访、报名和流失结果。",
    nav: ["dashboard", "crm"],
    user: "招生顾问",
    contentFilter: "none",
  },
};

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
];

const posts = [
  ["2026-05-11", "小红书", "BCI升学顾问号", "升学顾问 IP", "NTU 接受 WACE ATAR 作为录取参考吗", "待回填", "3日数据"],
  ["2026-05-11", "视频号", "BCI官方视频号", "校长 IP", "为什么 9 年级转轨国际课程要看科目组合", "已发布", "当日数据"],
  ["2026-05-10", "公众号", "BCI国际学校", "官方 IP", "WACE 课程结构：必修、选修和学分", "已复盘", "30日数据"],
  ["2026-05-10", "小红书", "BCI招生老师号", "招生老师 IP", "新加坡国际高中学费区间怎么判断", "已发布", "7日数据"],
];

const dailyTasks = [
  ["09:30", "小红书", "BCI西澳课程中心", "升学顾问 IP", "新加坡高中不是越贵越好，真正要看这 3 点", "待发布", "green"],
  ["10:30", "小红书", "BCI升学顾问号", "升学顾问 IP", "NTU 接受 WACE ATAR 作为录取参考吗", "待发布", "green"],
  ["11:00", "视频号", "BCI官方视频号", "校长 IP", "为什么 9 年级转轨国际课程要看科目组合", "待审核", "red"],
  ["14:00", "小红书", "BCI招生老师号", "招生老师 IP", "新加坡国际高中学费区间怎么判断", "草稿修改", "blue"],
  ["15:00", "小红书", "BCI西澳课程中心", "王一样讲新加坡", "WACE 成绩可以申请哪些澳洲大学", "待审核", "red"],
  ["16:30", "公众号", "BCI国际学校", "官方 IP", "WACE 课程结构：必修、选修和学分", "待归档", "amber"],
];

const contents = [
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
];

const knowledge = [
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

const personas = [
  ["校长 IP", "权威背书", "视频号 / 公众号", "本月 18 条", "线索 11"],
  ["升学顾问 IP", "路径规划", "小红书 / 视频号", "本月 34 条", "线索 27"],
  ["招生老师 IP", "咨询转化", "小红书 / 朋友圈", "本月 29 条", "线索 23"],
  ["学生案例 IP", "真实故事", "小红书 / 抖音", "本月 12 条", "线索 8"],
  ["家长故事 IP", "信任建立", "视频号 / 公众号", "本月 7 条", "线索 5"],
  ["BCI 官方 IP", "学校信息", "全平台", "本月 26 条", "线索 14"],
];

const accounts = [
  {
    platform: "公众号",
    accountName: "BCI西澳课程中心",
    status: "筹备",
    contentCount: 0,
    handle: "https://mp.weixin.qq.com/cgi-bin/home",
    investmentTier: "辅助",
    ownerType: "自营",
    persona: "官方 IP",
    talent: "空白",
    entityName: "师云教育上海",
    entityType: "企业",
    operator: "Ocean Wang",
    stage: "养号",
    monthlyPosts: 0,
    leads: 0,
  },
  {
    platform: "小红书",
    accountName: "BCI升学顾问号",
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
  },
  {
    platform: "视频号",
    accountName: "BCI官方视频号",
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
  },
  {
    platform: "小红书",
    accountName: "BCI招生老师号",
    status: "运营中",
    contentCount: 29,
    handle: "https://www.xiaohongshu.com/user/profile/bci-admission",
    investmentTier: "主力",
    ownerType: "自营",
    persona: "招生老师 IP",
    talent: "招生老师",
    entityName: "BCI International",
    entityType: "学校",
    operator: "运营 C",
    stage: "增长号",
    monthlyPosts: 29,
    leads: 23,
  },
  {
    platform: "抖音",
    accountName: "BCI学生故事",
    status: "养号",
    contentCount: 12,
    handle: "抖音创作者中心",
    investmentTier: "辅助",
    ownerType: "自营",
    persona: "学生案例 IP",
    talent: "学生案例",
    entityName: "BCI International",
    entityType: "学校",
    operator: "运营 A",
    stage: "养号",
    monthlyPosts: 12,
    leads: 8,
  },
  {
    accountName: "BCI国际学校",
    status: "增长",
    contentCount: 36,
    handle: "微信公众号",
    investmentTier: "核心",
    ownerType: "自营",
    persona: "官方 IP",
    talent: "校方品牌",
    entityName: "BCI International",
    entityType: "学校",
    operator: "Ocean Wang",
    stage: "增长",
    monthlyPosts: 8,
    leads: 15,
  },
];

const crmColumns = [
  ["新线索", [["G9 学生家长", "来自小红书：WACE 申请 NUS"], ["G10 转轨家庭", "来自视频号：ATAR 评分"]]],
  ["已咨询", [["G8 学生家长", "来源：招生老师 IP"], ["G11 插班咨询", "来源：公众号学费文章"]]],
  ["预约到访", [["G9 学生家长", "周六开放日"], ["G7 家庭", "校园参观"]]],
  ["缴费 / 流失", [["G10 学生", "已缴费"], ["G12 家庭", "流失：时间不匹配"]]],
];

const permissions = [
  ["超级管理员", "全系统", "用户、角色、账号、IP、资料、CRM、导出"],
  ["部门负责人", "全内容与复盘", "审核、驳回、锁定、查看所有账号表现"],
  ["运营人员", "被分配账号", "创建内容、提交审核、发布归档、数据回填"],
  ["AI 内容编辑", "资料与 AI 库", "生成内容、保存 prompt、转内容资产"],
  ["招生顾问", "分配线索", "跟进 CRM、记录到访、反馈线索质量"],
];

const teamMembers = [
  { name: "Ocean Wang", email: "ocean@bci.edu.sg", role: "运营人员", accounts: "BCI西澳课程中心, BCI国际学校", status: "在职", joinDate: "2026-01-15" },
  { name: "运营 A", email: "opa@bci.edu.sg", role: "运营人员", accounts: "BCI升学顾问号, BCI学生故事", status: "在职", joinDate: "2026-02-01" },
  { name: "运营 B", email: "opb@bci.edu.sg", role: "运营人员", accounts: "BCI官方视频号", status: "在职", joinDate: "2026-02-01" },
  { name: "运营 C", email: "opc@bci.edu.sg", role: "运营人员", accounts: "BCI招生老师号", status: "在职", joinDate: "2026-03-10" },
  { name: "部门负责人", email: "lead@bci.edu.sg", role: "部门负责人", accounts: "全部账号", status: "在职", joinDate: "2025-08-01" },
  { name: "AI 编辑", email: "ai@bci.edu.sg", role: "AI 内容编辑", accounts: "—", status: "在职", joinDate: "2026-03-01" },
  { name: "招生顾问", email: "admission@bci.edu.sg", role: "招生顾问", accounts: "—", status: "在职", joinDate: "2026-01-20" },
];

const aiPromptLibrary = [
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
  target.splice(0, 0, ...records);
}

function loadSavedState() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const saved = JSON.parse(raw);
    // Apply content updates (status, reviewHistory, etc.) to hardcoded items
    (saved._contentUpdates || []).forEach((upd) => {
      const existing = contents.find((c) => c.title === upd.title);
      if (existing) Object.assign(existing, upd);
    });
    (saved.contents || []).filter((item) => item && typeof item === "object" && !Array.isArray(item) && item.title).forEach((item) => contents.unshift(item));
    (saved.knowledge || []).forEach((item) => knowledge.unshift(item));
    (saved.personas || []).forEach((item) => personas.unshift(item));
    (saved.accounts || []).forEach((item) => accounts.unshift(item));
    (saved.posts || []).forEach((item) => posts.unshift(item));
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
  const saved = readSavedState();
  saved._contentUpdates = saved._contentUpdates || [];
  // Replace existing update for this title, or add new
  const idx = saved._contentUpdates.findIndex((u) => u.title === item.title);
  const snapshot = { title: item.title, status: item.status, reviewHistory: item.reviewHistory, metrics: item.metrics };
  if (idx >= 0) saved._contentUpdates[idx] = snapshot;
  else saved._contentUpdates.push(snapshot);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
}

async function initCloudDatabase() {
  try {
    const response = await fetch("/api/config", { cache: "no-store" });
    if (!response.ok) throw new Error("config unavailable");
    const config = await response.json();
    if (!config.supabaseUrl || !config.supabaseAnonKey || !window.supabase) {
      setCloudStatus("本地模式：还没有配置 Supabase。", "local");
      return;
    }

    cloudClient = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    await loadCloudState();
    cloudReady = true;
    setCloudStatus("云端数据库已连接。", "cloud");
  } catch (error) {
    console.warn("Cloud database is not ready, falling back to local storage.", error);
    setCloudStatus("本地模式：云端数据库暂不可用。", "local");
  }
}

async function loadCloudState() {
  const [contentRows, knowledgeRows, personaRows, accountRows, postRows] = await Promise.all([
    selectCloudRows("content_items"),
    selectCloudRows("knowledge_items"),
    selectCloudRows("ip_personas"),
    selectCloudRows("social_accounts"),
    selectCloudRows("published_posts"),
  ]);

  replaceRecords(contents, contentRows.map(fromCloudContent));
  replaceRecords(knowledge, knowledgeRows.map(fromCloudKnowledge));
  replaceRecords(personas, personaRows.map(fromCloudPersona));
  replaceRecords(accounts, accountRows.map(fromCloudAccount));
  replaceRecords(posts, postRows.map(fromCloudPost));
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
    accounts: "social_accounts",
    posts: "published_posts",
  };

  const { error } = await cloudClient.from(tableMap[collection]).insert(toCloudRow(collection, record));
  if (error) {
    console.warn("Cloud insert failed, saving locally instead.", error);
    persistRecord(collection, record);
    setCloudStatus("本地模式：云端写入失败，已临时保存在本机。", "local");
    return "local";
  }

  setCloudStatus("云端数据库已连接。", "cloud");
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
    body: `
      <div class="form-grid">
        <label>标题<input placeholder="输入内容标题" /></label>
        <label>AI Search Ready<select><option>否</option><option>是</option></select></label>
        <label>Account<select><option value="">选择账号</option><option>新加坡初高中留学-新闻·小红书</option><option>BCI升学顾问号</option><option>BCI官方视频号</option><option>BCI招生老师号</option></select></label>
        <label>Audience Persona<input placeholder="如：P1 陪读妈妈, P2 国内待留学" /></label>
        <label>Author<select><option value="">选择作者</option><option>Ocean Wang</option><option>AI 编辑</option><option>内容组</option><option>招生组</option></select></label>
        <label>Content Type<select><option value="">选择类型</option><option>干货</option><option>升学科普</option><option>视频口播</option><option>FAQ</option><option>情绪</option><option>案例</option><option>校园</option><option>对比</option><option>政策</option></select></label>
        <label>Emotional Trigger<select><option value="">选择情绪钩子</option><option>反常识</option><option>焦虑共鸣</option><option>向往</option><option>痛点直击</option><option>好奇驱动</option><option>数字震撼</option><option>案例代入</option><option>理性避坑</option><option>痛点反问</option></select></label>
        <label>Funnel Stage<select><option value="">选择漏斗阶段</option><option>Awareness</option><option>Consideration</option><option>Trust</option><option>Visit</option><option>Enroll</option></select></label>
        <label>Lead Magnet<select><option value="">选择钩子资料</option><option>路径选择表</option><option>评估表</option><option>学费明细</option><option>选课指南</option><option>升学路径清单</option><option>签证材料清单</option><option>科目组合建议</option></select></label>
        <label>Primary Keyword<input placeholder="输入主关键词" /></label>
        <label>Prompts Used<input placeholder="使用的 AI 模板" /></label>
        <label>Publish Date<input type="date" /></label>
        <label>Repurpose Status<select><option value="">选择复用状态</option><option>原稿</option><option>可二改</option><option>可转视频号</option><option>可转小红书</option><option>已转小红书标题</option><option>已复用多平台</option><option>归档</option></select></label>
        <label>Status<select><option>草稿</option><option>待审核</option><option>审核通过</option><option>Posted</option></select></label>
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
        <label>发布日期<input type="date" value="2026-05-11" /></label>
        <label>平台<select><option>小红书</option><option>视频号</option><option>公众号</option><option>抖音</option></select></label>
        <label>发布账号<select>${optionList(accountNames(), "请先新增账号")}</select></label>
        <label>绑定 IP<select>${optionList(personaNames(), "请先新增 IP")}</select></label>
        <label>关联内容资产<select>${contents.map((c) => `<option>${escapeHtml(c.title)}</option>`).join("")}</select></label>
        <label>媒体类型<select><option>图文</option><option>短视频</option><option>公众号文章</option><option>朋友圈</option></select></label>
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
          <label class="upload-box">上传视频号 / 抖音视频<span class="upload-status">未选择文件</span><input type="file" accept="video/*" data-upload-field="video" /></label>
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
        <label>目标平台<select><option>小红书</option><option>视频号</option><option>公众号</option></select></label>
        <label>目标 IP<select><option>升学顾问 IP</option><option>校长 IP</option><option>招生老师 IP</option></select></label>
        <label>目标人群<select><option>9-10 年级家长</option><option>7-8 年级转轨家庭</option><option>11-12 年级升学家庭</option></select></label>
        <label class="full-field">Prompt<textarea>基于选中的真实资料，生成 3 个适合中文自媒体的版本：一个小红书图文、一个视频口播、一个招生朋友圈。</textarea></label>
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
        <label class="full-field">人设定位<textarea>面向 7-12 年级家长，讲清 WACE、ATAR、大学申请和新加坡转轨路径。</textarea></label>
      </div>
    `,
  },
  "new-account": {
    kicker: "Account Matrix",
    title: "新增自媒体账号",
    body: () => `
      <div class="form-grid">
        <label>平台<select><option>小红书</option><option>视频号</option><option>公众号</option><option>抖音</option></select></label>
        <label>账号名称<input value="BCI西澳课程中心" /></label>
        <label>Account Status<select><option>筹备</option><option>养号</option><option>运营中</option><option>暂停</option></select></label>
        <label>Investment Tier<select><option>主力</option><option>辅助</option><option>测试</option></select></label>
        <label>Owner Type<select><option>自营</option><option>合作</option><option>外包</option></select></label>
        <label>绑定 IP<select>${optionList(personaNames(), "请先新增 IP")}</select></label>
        <label>Talent / 主理人<input value="空白" /></label>
        <label>主体名称<input value="师云教育上海" /></label>
        <label>主体类型<select><option>企业</option><option>学校</option><option>个人</option></select></label>
        <label>运营人<select><option>Ocean Wang</option><option>运营 A</option><option>运营 B</option><option>运营 C</option></select></label>
        <label>发布频率<input value="每天 1 条" /></label>
        <label class="full-field">Handle / 后台链接<input value="https://mp.weixin.qq.com/cgi-bin/home" /></label>
      </div>
    `,
  },
  "new-lead": {
    kicker: "Admissions CRM",
    title: "新增招生线索",
    body: `
      <div class="form-grid">
        <label>学生姓名<input value="学生姓名" /></label>
        <label>当前年级<select><option>G7</option><option>G8</option><option>G9</option><option>G10</option><option>G11</option><option>G12</option></select></label>
        <label>家长姓名<input value="家长姓名" /></label>
        <label>意向课程<select><option>WACE</option><option>国际高中</option><option>插班</option><option>升学规划</option></select></label>
        <label>来源账号<select><option>BCI升学顾问号</option><option>BCI官方视频号</option><option>BCI招生老师号</option></select></label>
        <label>来源 IP<select><option>升学顾问 IP</option><option>招生老师 IP</option><option>校长 IP</option></select></label>
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
    kicker: "Review Dashboard",
    title: "导出月报",
    body: `
      <div class="detail-list">
        <div><strong>导出范围</strong><span>2026 年 5 月：平台表现、账号表现、IP 表现、内容 Top 10、招生漏斗。</span></div>
        <div><strong>系统说明</strong><span>这里会生成 Excel 或 PDF 月报。</span></div>
      </div>
    `,
  },
  "all-tasks": {
    kicker: "Workflow",
    title: "全部待办",
    body: `
      <div class="detail-list">
        <div><strong>待审核</strong><span>18 条内容等待部门负责人检查。</span></div>
        <div><strong>审核通过待发布</strong><span>12 条内容可以由运营人员发布。</span></div>
        <div><strong>待回填数据</strong><span>27 条已发布内容需要补充 3 日 / 7 日 / 30 日数据。</span></div>
      </div>
    `,
  },
  notifications: {
    kicker: "Notifications",
    title: "通知中心",
    body: `
      <div class="detail-list">
        <div><strong>3 条内容待审核</strong><span>负责人需要检查 WACE、学费、签证相关内容。</span></div>
        <div><strong>5 条发布待回填</strong><span>小红书和视频号内容需要补充 3 日数据。</span></div>
        <div><strong>2 条新线索待分配</strong><span>来源账号：BCI升学顾问号。</span></div>
      </div>
    `,
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
  return Array.from(document.querySelectorAll("#modal-body input, #modal-body select, #modal-body textarea")).map((field) => {
    if (field.type === "file") {
      return Array.from(field.files || []).map((file) => file.name).join(" / ");
    }
    return field.value.trim();
  });
}

function switchToView(view) {
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
      values[4] || values[1] || "待补充人设定位",
      `${values[1] || "IP"} · ${values[2] || "未分配"}`,
      values[3] || "待定频率",
      "线索 0",
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
    contents.unshift(record);
    const mode = await persistRecordOnline("contents", record);
    renderContent();
    renderApp();
    switchToView("content");
    showToast(isDraft
      ? (mode === "cloud" ? "草稿已保存到云端。" : "草稿已临时保存到本机。")
      : (mode === "cloud" ? "内容已提交审核，等待部门负责人处理。" : "内容已提交审核（本地保存）。"));
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
      talent: values[6] || "空白",
      entityName: values[7] || "待填主体",
      entityType: values[8] || "企业",
      operator: values[9] || "未分配",
      stage: values[2] || "筹备",
      monthlyPosts: 0,
      leads: 0,
      handle: values[11] || "待补充链接",
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
    const comment = commentInput.value.trim() || "无备注";
    const timestamp = new Date().toISOString().slice(0, 16).replace("T", " ");
    const modalTitle = document.querySelector("#modal-title")?.textContent || "";
    const cleanTitle = modalTitle.replace("审核：", "");
    const item = contents.find((c) => cleanTitle.includes(c.title.slice(0, 20)));
    if (item) {
      item.reviewHistory = item.reviewHistory || [];
      item.reviewHistory.push({ reviewer, action, comment, timestamp });
      if (action === "approve") item.status = "可发布";
      else if (action === "reject") item.status = "已驳回";
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
    const item = contents.find((c) => cleanTitle.includes(c.title.slice(0, 20)));
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
      const comment = document.querySelector("#edit-comment")?.value.trim() || "已修改内容";

      const changes = [];
      if (newTitle && newTitle !== item.title) { item.title = newTitle; changes.push("标题"); }
      if (newNotes !== undefined && newNotes !== item.notes) { item.notes = newNotes; changes.push("备注"); }
      if (newCta && newCta !== item.cta) { item.cta = newCta; changes.push("CTA"); }
      if (newContentType && newContentType !== item.contentType) { item.contentType = newContentType; changes.push("内容类型"); }
      if (newEmotionalTrigger && newEmotionalTrigger !== item.emotionalTrigger) { item.emotionalTrigger = newEmotionalTrigger; changes.push("情绪钩子"); }

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
    const item = contents.find((c) => cleanTitle.includes(c.title.slice(0, 15)));
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
  const map = { "待审核": "red", "已驳回": "red", "草稿": "blue", "待回填": "amber", "可发布": "green", "审核通过": "green", "Posted": "green", "已发布": "green" };
  return map[s] || "blue";
}

function buildResubmitEditForm(item) {
  const lastReject = (item.reviewHistory || []).filter((r) => r.action === "reject").pop();
  return `
    ${lastReject ? `
    <div class="modal-section" style="background:#fef2f2;border-radius:8px;padding:12px 16px;margin-bottom:16px">
      <h3 style="color:#dc2626;margin:0 0 6px">驳回原因</h3>
      <p style="margin:0;color:#dc2626">${escapeHtml(lastReject.comment || "未填写原因")}</p>
      <small style="color:var(--muted)">${lastReject.reviewer} · ${lastReject.timestamp}</small>
    </div>` : ""}
    <div class="modal-section">
      <h3>修改内容</h3>
      <label>标题<input type="text" id="edit-title" value="${escapeHtml(item.title)}" /></label>
      <label>备注 / 正文要点<textarea id="edit-notes" rows="3">${escapeHtml(item.notes || "")}</textarea></label>
      <label>CTA 引导语<input type="text" id="edit-cta" value="${escapeHtml(item.cta || "")}" /></label>
      <label>内容类型
        <select id="edit-content-type">
          ${["干货", "情绪", "案例", "校园", "对比", "政策", "升学科普", "视频口播"].map(
            (t) => `<option${t === item.contentType ? " selected" : ""}>${t}</option>`
          ).join("")}
        </select>
      </label>
      <label>情绪钩子
        <select id="edit-emotional-trigger">
          ${["反常识", "焦虑共鸣", "向往", "痛点直击", "好奇驱动", "数字震撼", "案例代入", "理性避坑"].map(
            (t) => `<option${t === item.emotionalTrigger ? " selected" : ""}>${t}</option>`
          ).join("")}
        </select>
      </label>
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
      <div><strong>References</strong><span>${item.references}</span></div>
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
  `;
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

  // 4. 本周新线索 — count from CRM "新线索" column
  const newLeadsCount = crmColumns.find(([stage]) => stage === "新线索")?.[1]?.length || 0;

  // Role-specific card sets
  const cards = [];

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
  } else if (currentRole !== "admission") {
    cards.push({
      label: "待审核",
      value: pendingReviewCount,
      desc: "条等待中",
      color: pendingReviewCount > 0 ? "#e67700" : "var(--muted)",
    });
  }

  if (currentRole !== "admission") {
    cards.push({
      label: "待回填数据",
      value: backfillCount,
      desc: "条需补数据",
      color: backfillCount > 0 ? "#e67700" : "var(--muted)",
    });
  }

  if (currentRole !== "ai") {
    cards.push({
      label: "本周新线索",
      value: newLeadsCount,
      desc: "条新线索",
      color: newLeadsCount > 0 ? "var(--brand)" : "var(--muted)",
    });
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

  // Also update sidebar daily goal
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

function renderTasks() {
  const target = document.querySelector("#task-summary");
  if (!target) return;

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
  while (root.repurposeSourceTitle) {
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
    </div>`;
  }).join("")}</div>`;
}

function buildReviewForm(item) {
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
        const reviewSnippet = latestReview && (item.status === "待审核" || item.status === "审核通过")
          ? `<div class="review-snippet">
               <span class="badge ${latestReview.action === "approve" ? "green" : latestReview.action === "reject" ? "red" : "amber"}">${latestReview.action === "approve" ? "通过" : latestReview.action === "reject" ? "驳回" : "修改意见"}</span>
               <span class="review-snippet-text">${escapeHtml(latestReview.comment).slice(0, 40)}${latestReview.comment.length > 40 ? "…" : ""}</span>
             </div>` : "";
        return `
        <article class="content-card">
          <h3>${escapeHtml(item.title)}</h3>
          <div class="card-meta">
            ${badge(item.contentType, "blue")}
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
        <article class="knowledge-card">
          <h3>${item.title}</h3>
          <div class="card-meta">
            ${item.subject.map((tag) => badge(tag, "blue")).join("")}
            ${badge(item.type)}
            ${badge(item.sourceType, item.sourceType === "官方" ? "green" : "amber")}
          </div>
          <p>${item.detail}</p>
          <div class="knowledge-meta">
            <span>复查：${item.reviewCycle}</span>
            <span>引用：${item.usedInContents} 条内容</span>
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
  target.innerHTML = items
    .map(
      ([name, positioning, channels, volume, leads]) => `
        <article class="matrix-card">
          <h3>${name}</h3>
          <p>${positioning}</p>
          <div class="card-meta">${badge(channels)}${badge(volume, "blue")}</div>
          <div class="card-footer"><span>${leads}</span><button class="ghost-button persona-timeline" type="button" data-title="${name}">查看时间线</button></div>
        </article>
      `,
    )
    .join("") || `<div class="empty-state">没有找到匹配的 IP。</div>`;
}

function renderAccounts(items) {
  if (!items) items = getMyAccounts();
  const target = document.querySelector("#accounts-table");
  target.innerHTML = items
    .map(
      (account) => `
        <tr class="clickable-row account-detail" data-title="${account.accountName}">
          <td>${account.platform}</td>
          <td><strong>${account.accountName}</strong></td>
          <td>${account.persona}</td>
          <td>${account.operator}</td>
          <td>${badge(account.stage, "blue")}${badge(account.status, account.status === "运营中" ? "green" : "amber")}</td>
          <td>${account.monthlyPosts}</td>
          <td>${account.leads}</td>
        </tr>
      `,
    )
    .join("") ||
    `<tr><td colspan="7"><div class="empty-state">没有找到匹配的账号。</div></td></tr>`;
}

function renderCrm() {
  const target = document.querySelector("#crm-kanban");
  target.innerHTML = crmColumns
    .map(
      ([stage, leads]) => `
        <section class="kanban-column">
          <h3>${stage}</h3>
          ${leads
            .map(
              ([name, source]) => `
                <article class="lead-card row-action" data-title="${name}" data-kind="线索详情">
                  <strong>${name}</strong>
                  <span>${source}</span>
                </article>
              `,
            )
            .join("")}
        </section>
      `,
    )
    .join("");
}

function renderBars() {
  const target = document.querySelector("#platform-bars");
  const rows = [
    ["小红书", 72, 57],
    ["视频号", 56, 38],
    ["公众号", 42, 26],
    ["抖音", 31, 14],
  ];
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
    .join("");
}

function renderAiLibrary(items = aiPromptLibrary) {
  const target = document.querySelector("#ai-library");
  if (!target) return;
  target.innerHTML = items
    .map(
      (item) => `
        <article class="knowledge-card">
          <h3>${item.title}</h3>
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

  target.innerHTML = `
    ${roleCards}
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

function wireRoleSwitch() {
  const select = document.querySelector("#role-select");
  const title = document.querySelector("#role-title");
  const summary = document.querySelector("#role-summary");

  // Apply on load
  applyRoleNav(select.value);

  select.addEventListener("change", () => {
    const role = select.value;
    title.textContent = roleCopy[role].title;
    summary.textContent = roleCopy[role].summary;
    applyRoleNav(role);
    renderKpiCards();
    renderPublishingProgress();
    renderContent();
    renderTasks();
    renderDailyTasks();
    renderAccounts();
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
        openModal(
          "ai-detail",
          item.title,
          `
            <div class="detail-list">
              <div><strong>Author</strong><span>${item.author}</span></div>
              <div><strong>Last Used</strong><span>${item.lastUsed}</span></div>
              <div><strong>Notes</strong><span>${item.notes}</span></div>
              <div><strong>Output Examples</strong><span>${item.outputExamples}</span></div>
              <div><strong>Platform</strong><span>${item.platform}</span></div>
              <div><strong>Prompt Template</strong><span>${item.promptTemplate}</span></div>
              <div><strong>Quality Rating</strong><span>${item.qualityRating}</span></div>
              <div><strong>Stage</strong><span>${item.stage}</span></div>
              <div><strong>Target Persona</strong><span>${item.targetPersona}</span></div>
              <div><strong>Use Count</strong><span>${item.useCount}</span></div>
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
        openModal(
          "knowledge-detail",
          item.title,
          `
            <div class="detail-list">
              <div><strong>Detail</strong><span>${item.detail}</span></div>
              <div><strong>Notes</strong><span>${item.notes}</span></div>
              <div><strong>Numeric Data</strong><span>${item.numericData}</span></div>
              <div><strong>Review Cycle</strong><span>${item.reviewCycle}</span></div>
              <div><strong>Source</strong><span>${item.source}</span></div>
              <div><strong>Source Type</strong><span>${item.sourceType}</span></div>
              <div><strong>Subject</strong><span>${item.subject.join(" / ")}</span></div>
              <div><strong>Type</strong><span>${item.type}</span></div>
              <div><strong>Used In Contents</strong><span>${item.usedInContents} 条内容</span></div>
              <div><strong>Verified By</strong><span>${item.verifiedBy}</span></div>
              <div><strong>Last Verified</strong><span>${item.lastVerified}</span></div>
              <div><strong>Visibility</strong><span>${item.visibility}</span></div>
            </div>
          `,
        );
      }
      return;
    }

    const filterButton = event.target.closest(".filter");
    if (filterButton) {
      document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
      filterButton.classList.add("active");
      showToast(`已切换筛选：${filterButton.textContent}`);
      return;
    }

    const personaTimelineButton = event.target.closest(".persona-timeline");
    if (personaTimelineButton) {
      const personaName = personaTimelineButton.dataset.title;
      openModal("persona-timeline", `${personaName} 内容时间线`, buildIpTimeline(personaName));
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
    const p = (item.account || "").includes("小红书") ? "小红书" : (item.account || "").includes("视频号") ? "视频号" : (item.account || "").includes("公众号") ? "公众号" : "其他";
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
  renderWaceTracker();
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
  weekStart.setDate(now.getDate() - now.getDay());
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
  // 1. WACE weekly check
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = weekStart.toISOString().slice(0, 10);
  const waceCount = contents.filter((c) => c.waceFocus && c.publishDate >= weekStartStr).length;
  if (waceCount < 2) {
    notifs.push({ type: "warn", icon: "⚠️", title: `WACE 内容本周仅 ${waceCount} 条`, desc: `铁律要求每周 ≥ 2 条，还差 ${2 - waceCount} 条。`, time: "实时" });
  }
  // 2. Pending review count
  const pendingReview = contents.filter((c) => c.status === "待审核").length;
  if (pendingReview > 0) {
    notifs.push({ type: "action", icon: "📋", title: `${pendingReview} 条内容待审核`, desc: "部门负责人请及时处理审核队列。", time: "实时" });
  }
  // 3. Metrics backfill needed
  const needBackfill = contents.filter((c) => (c.status === "已发布" || c.status === "Posted") && c.metrics && c.metrics.reads === 0).length;
  if (needBackfill > 0) {
    notifs.push({ type: "action", icon: "📊", title: `${needBackfill} 条内容待回填数据`, desc: "已发布但未录入表现数据，影响复盘准确性。", time: "实时" });
  }
  // 4. Funnel imbalance
  const funnelCounts = {};
  contents.forEach((c) => { if (c.funnelStage) funnelCounts[c.funnelStage] = (funnelCounts[c.funnelStage] || 0) + 1; });
  const trustCount = funnelCounts["Trust"] || 0;
  const visitCount = funnelCounts["Visit"] || 0;
  if (trustCount === 0 && visitCount === 0) {
    notifs.push({ type: "warn", icon: "🔻", title: "漏斗中段缺失", desc: "Trust 和 Visit 阶段内容为 0，容易导致线索转化断层。", time: "策略建议" });
  }
  // 5. Top content congratulation
  const topItem = contents.filter((c) => c.metrics).sort((a, b) => contentScore(b.metrics) - contentScore(a.metrics))[0];
  if (topItem && contentScore(topItem.metrics) > 500) {
    notifs.push({ type: "info", icon: "🎉", title: `爆款预警：${topItem.title.slice(0, 15)}…`, desc: `综合分 ${Math.round(contentScore(topItem.metrics))}，建议复用到更多平台。`, time: "今日" });
  }
  // 6. Repurpose reminder
  const canRepurpose = contents.filter((c) => c.repurposeStatus && c.repurposeStatus.includes("可") && (!c.repurposeChildren || c.repurposeChildren.length === 0)).length;
  if (canRepurpose > 0) {
    notifs.push({ type: "info", icon: "🔄", title: `${canRepurpose} 条内容可跨平台复用`, desc: "已标记可复用但尚未衍生新内容，建议安排改写。", time: "本周" });
  }
  return notifs;
}

function renderNotifications() {
  const list = document.querySelector("#notif-list");
  if (!list) return;
  const notifs = generateNotifications();
  const btn = document.querySelector('[data-action="notifications"]');
  // Show red dot if there are warn/action notifications
  const urgent = notifs.filter((n) => n.type === "warn" || n.type === "action").length;
  if (btn) {
    btn.classList.toggle("has-notif", urgent > 0);
  }
  if (notifs.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:32px">暂无新通知，一切正常。</div>';
    return;
  }
  list.innerHTML = notifs.map((n) => `
    <div class="notif-item notif-${n.type}">
      <span class="notif-icon">${n.icon}</span>
      <div class="notif-body">
        <strong>${n.title}</strong>
        <p>${n.desc}</p>
      </div>
      <span class="notif-time">${n.time}</span>
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
  renderAiLibrary();
  renderPermissions();
  queryArchive();
  renderCalendar();
  renderStrategyHealth();
  renderTopContent();
  renderKeywordTable();
  renderAbTestPanel();
  renderNotifications();
}

async function bootstrap() {
  loadSavedState();
  await initCloudDatabase();
  renderApp();
  wireNavigation();
  wireRoleSwitch();
  wireActions();
  wireStrategyFilters();
  wireCalendar();
  wireNotifications();
  const status = getCloudStatus();
  if (status.message) {
    showToast(status.message);
  }
}

bootstrap();
