const roleCopy = {
  operator: {
    title: "运营人员工作台",
    summary: "负责账号内容生产、提交审核、发布归档和数据回填。",
  },
  lead: {
    title: "部门负责人工作台",
    summary: "集中检查待审核内容、账号发布进度、内容效果和线索来源。",
  },
  admin: {
    title: "超级管理员工作台",
    summary: "管理用户、角色、账号、IP、资料库和全局数据权限。",
  },
  ai: {
    title: "AI 内容编辑工作台",
    summary: "基于真实资料库生成内容，保存 prompt、版本和采用记录。",
  },
  admission: {
    title: "招生顾问工作台",
    summary: "跟进分配线索，查看来源内容，记录到访、报名和流失结果。",
  },
};

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
  ["09:30", "小红书", "BCI升学顾问号", "升学顾问 IP", "NTU 接受 WACE ATAR 作为录取参考吗", "待发布", "green"],
  ["11:00", "视频号", "BCI官方视频号", "校长 IP", "为什么 9 年级转轨国际课程要看科目组合", "待审核", "red"],
  ["14:00", "小红书", "BCI招生老师号", "招生老师 IP", "新加坡国际高中学费区间怎么判断", "草稿修改", "blue"],
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
    status: "Posted",
    topicCluster: "国际学校择校",
    waceFocus: false,
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
    status: "待审核",
    topicCluster: "WACE升学",
    waceFocus: true,
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
    status: "审核通过",
    topicCluster: "WACE升学",
    waceFocus: true,
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
    status: "已发布",
    topicCluster: "陪读签证",
    waceFocus: false,
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
    (saved.contents || []).forEach((item) => contents.unshift(item));
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
        <label>标题<input value="新加坡高中不是越贵越好，真正要看这 3 点" /></label>
        <label>AI Search Ready<select><option>否</option><option>是</option></select></label>
        <label>Account<select><option>新加坡初高中留学-新闻·小红书</option><option>BCI升学顾问号</option><option>BCI官方视频号</option></select></label>
        <label>Audience Persona<input value="P1 陪读妈妈, P2 国内待留学, P3 转学家长" /></label>
        <label>Author<select><option>Ocean Wang</option><option>AI 编辑</option><option>内容组</option><option>招生组</option></select></label>
        <label>Content Type<select><option>干货</option><option>升学科普</option><option>视频口播</option><option>FAQ</option></select></label>
        <label>Emotional Trigger<input value="理性避坑" /></label>
        <label>Funnel Stage<select><option>Awareness</option><option>Consideration</option><option>Conversion</option><option>Retention</option></select></label>
        <label>Lead Magnet<input value="新加坡高中路径选择表" /></label>
        <label>Primary Keyword<input value="新加坡高中择校" /></label>
        <label>Prompts Used<input value="标题改写·反常识公式 5 候选" /></label>
        <label>Publish Date<input type="date" value="2026-05-08" /></label>
        <label>Repurpose Status<select><option>可二改</option><option>已二改</option><option>不可复用</option></select></label>
        <label>Status<select><option>草稿</option><option>待审核</option><option>审核通过</option><option>Posted</option></select></label>
        <label>Topic Cluster<input value="国际学校择校" /></label>
        <label>WACE Focus<select><option>否</option><option>是</option></select></label>
        <label class="full-field">CTA<input value="评论「择校」，我私信你《新加坡高中路径选择表》" /></label>
        <label class="full-field">References<input value="新加坡国际高中学费区间 / BCI 课程资料" /></label>
        <label class="full-field">Notes<textarea>W2 周计划内容。文案 + 6 张配图均已就位。待发布检查：PDF / 发布时间 / 「择校」微信自动回复。</textarea></label>
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
        <label>关联内容资产<select><option>WACE 可以申请 NUS 吗？</option><option>新加坡高中不是越贵越好，真正要看这 3 点</option><option>ATAR 90 不一定上 NUS，关键看这一步</option></select></label>
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
        <label>姓名<input value="新成员" /></label>
        <label>邮箱<input value="team@bci.edu.sg" /></label>
        <label>角色<select><option>运营人员</option><option>部门负责人</option><option>AI 内容编辑</option><option>招生顾问</option></select></label>
        <label>负责账号<select><option>BCI升学顾问号</option><option>BCI官方视频号</option><option>BCI招生老师号</option></select></label>
      </div>
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

  if (currentModalAction === "new-content") {
    const record = {
      title: values[0] || "未命名内容",
      aiSearchReady: values[1] === "是",
      account: values[2] || "待分配账号",
      audiencePersona: (values[3] || "通用").split(/[,，/]/).map((tag) => tag.trim()).filter(Boolean),
      author: values[4] || "当前用户",
      contentType: values[5] || "内容",
      emotionalTrigger: values[6] || "待定",
      funnelStage: values[7] || "Awareness",
      leadMagnet: values[8] || "待定",
      primaryKeyword: values[9] || "待定",
      promptsUsed: values[10] || "未使用",
      publishDate: values[11] || new Date().toISOString().slice(0, 10),
      repurposeStatus: values[12] || "可二改",
      status: values[13] || "草稿",
      topicCluster: values[14] || "未分类",
      waceFocus: values[15] === "是",
      cta: values[16] || "待补充 CTA",
      references: values[17] || "待补充引用",
      notes: values[18] || "待补充备注",
    };
    contents.unshift(record);
    const mode = await persistRecordOnline("contents", record);
    renderContent();
    switchToView("content");
    showToast(mode === "cloud" ? "内容资产已保存到云端数据库。" : "内容资产已临时保存到本机。");
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
    switchToView("publishing");
    showToast(mode === "cloud" ? "发布归档已保存到云端数据库。" : "发布归档已临时保存到本机。");
    return true;
  }

  return false;
}

function renderTasks() {
  const target = document.querySelector("#task-list");
  target.innerHTML = tasks
    .map(
      ([account, title, status, color]) => `
        <div class="task-row">
          <strong>${account}</strong>
          <span>${title}</span>
          ${badge(status, color)}
          <button class="ghost-button row-action" type="button" data-title="${title}" data-kind="任务处理">处理</button>
        </div>
      `,
    )
    .join("");
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
  target.innerHTML = dailyTasks
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
            <button class="ghost-button row-action" type="button" data-title="${title}" data-kind="任务详情">详情</button>
            <button class="ghost-button row-action" type="button" data-title="${title}" data-kind="提交审核">提交审核</button>
            <button class="primary-button action-button" type="button" data-action="upload-post">发布归档</button>
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

function renderContent(items = contents) {
  const target = document.querySelector("#content-cards");
  target.innerHTML = items
    .map(
      (item) => `
        <article class="content-card">
          <h3>${item.title}</h3>
          <div class="card-meta">
            ${badge(item.contentType, "blue")}
            ${badge(item.status, item.status === "Posted" || item.status === "已发布" ? "green" : "amber")}
            ${item.waceFocus ? badge("WACE Focus", "green") : ""}
          </div>
          <p>${item.account} · ${item.funnelStage} · ${item.topicCluster}</p>
          <div class="knowledge-meta">
            <span>人群：${item.audiencePersona.join(" / ")}</span>
            <span>发布日期：${item.publishDate}</span>
            <span>CTA：${item.cta}</span>
          </div>
          <div class="card-footer"><span>${item.author}</span><button class="ghost-button content-detail" type="button" data-title="${item.title}">查看详情</button></div>
        </article>
      `,
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

function renderAccounts(items = accounts) {
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
  target.innerHTML = permissions
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

function wireRoleSwitch() {
  const select = document.querySelector("#role-select");
  const title = document.querySelector("#role-title");
  const summary = document.querySelector("#role-summary");
  select.addEventListener("change", () => {
    title.textContent = roleCopy[select.value].title;
    summary.textContent = roleCopy[select.value].summary;
  });
}

function wireActions() {
  document.addEventListener("click", (event) => {
    const librarySearchButton = event.target.closest(".library-search-button");
    if (librarySearchButton) {
      runLibrarySearch(librarySearchButton.dataset.library);
      return;
    }

    const contentButton = event.target.closest(".content-detail");
    if (contentButton) {
      const item = contents.find((entry) => entry.title === contentButton.dataset.title);
      if (item) {
        openModal(
          "content-detail",
          item.title,
          `
            <div class="detail-list">
              <div><strong>AI Search Ready</strong><span>${item.aiSearchReady ? "是" : "否"}</span></div>
              <div><strong>Account</strong><span>${item.account}</span></div>
              <div><strong>Audience Persona</strong><span>${item.audiencePersona.join(" / ")}</span></div>
              <div><strong>Author</strong><span>${item.author}</span></div>
              <div><strong>CTA</strong><span>${item.cta}</span></div>
              <div><strong>Content Type</strong><span>${item.contentType}</span></div>
              <div><strong>Emotional Trigger</strong><span>${item.emotionalTrigger}</span></div>
              <div><strong>Funnel Stage</strong><span>${item.funnelStage}</span></div>
              <div><strong>Lead Magnet</strong><span>${item.leadMagnet}</span></div>
              <div><strong>Notes</strong><span>${item.notes}</span></div>
              <div><strong>Primary Keyword</strong><span>${item.primaryKeyword}</span></div>
              <div><strong>Prompts Used</strong><span>${item.promptsUsed}</span></div>
              <div><strong>Publish Date</strong><span>${item.publishDate}</span></div>
              <div><strong>References</strong><span>${item.references}</span></div>
              <div><strong>Repurpose Status</strong><span>${item.repurposeStatus}</span></div>
              <div><strong>Status</strong><span>${item.status}</span></div>
              <div><strong>Topic Cluster</strong><span>${item.topicCluster}</span></div>
              <div><strong>WACE Focus</strong><span>${item.waceFocus ? "是" : "否"}</span></div>
            </div>
          `,
        );
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
      source: contents,
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

function renderApp() {
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
}

async function bootstrap() {
  loadSavedState();
  await initCloudDatabase();
  renderApp();
  wireNavigation();
  wireRoleSwitch();
  wireActions();
  const status = getCloudStatus();
  if (status.message) {
    showToast(status.message);
  }
}

bootstrap();
