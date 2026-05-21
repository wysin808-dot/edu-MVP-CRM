# BCI 自媒体矩阵获客系统 — 改进路线图

> 基于 MCN 规划书 v1.0 与系统现状对比分析  
> 生成日期：2026-05-21

---

## 分析摘要

### 系统现状优势（保留不动）

| 能力 | 说明 |
|------|------|
| 内容数据模型已完整 | `contents[]` 已包含 funnelStage / emotionalTrigger / contentType / leadMagnet / primaryKeyword / repurposeStatus / topicCluster / waceFocus 等全部策略字段 |
| 内容创建表单完整 | `saveModalRecord()` 已接入全部 25 个字段（含策略维度），新建内容时可录入所有策略标签 |
| 策略筛选器已实现 | `applyStrategyFilters()` 支持按 funnel / emotion / repurpose / topic 四维度筛选 |
| 内容日历已实现 | `renderCalendar()` 月视图 + 按天展示 + 漏斗颜色 + WACE Focus 统计 + 平台覆盖统计 |
| 策略健康看板已实现 | `renderStrategyHealth()` 含漏斗分布、情绪钩子分布、复用状态分布、WACE 周度追踪 |
| 关键词追踪已实现 | `renderKeywordTable()` 聚合关键词的内容量/阅读/线索/综合分 |
| A/B 测试面板已实现 | `renderAbTestPanel()` 同主题内容对比 + 情绪钩子效果分析 |
| 通知系统已实现 | `generateNotifications()` 按角色生成审核/WACE/复用/回填/策略预警等 8+ 种通知 |
| 审核流程已实现 | 完整的 submitForReview → approve/revise 流转 + reviewHistory 记录评论 |
| 内容详情展示完整 | 详情弹窗展示全部策略字段 + 审核历史 + 指标 |
| AI 审核已集成 | `/api/ai-review.js` 接入 DeepSeek 进行 10 维度内容评估 |

### 系统 vs MCN 规划书的差距

经深度对比，以下是**确认存在的真实差距**（排除了已实现的功能）：

| 差距 | MCN 规划书要求 | 系统现状 | 影响程度 |
|------|--------------|---------|---------|
| 平台矩阵不完整 | 8 平台（含抖音/独立站SEO/Google/Facebook） | 仅 4 平台（小红书/视频号/公众号/知乎） | P0 |
| IP 类型体系不匹配 | 5 类 IP（校品牌/真人IP/中介号/UGC/SEO） | 6 个 persona 但未按5类分层 | P0 |
| 品牌防火墙未实现 | 中介号绝对不能露出BCI信息 | 无品牌隔离检查 | P0 |
| 内容类型占比不对齐 | 引流40%/信任30%/案例20%/转化10% | contentType 值是自由文本，未按4类映射 | P1 |
| 账号分组缺层级 | 校品牌/真人IP/中介号/UGC 四层 | accounts[] 是扁平列表 | P1 |
| 漏斗指标缺失 | 曝光→私信→加企微→留电→试听→签约 6级 | CRM 仅4列（新线索/已咨询/预约到访/缴费） | P1 |
| 数据模块硬编码 | analytics 的数据应动态计算 | `renderBars()` 使用硬编码数组 | P1 |
| 内容-资料-Prompt 关联是文本非链接 | references/promptsUsed 应是可追踪的关联 | 当前是纯文本字符串 | P2 |
| 团队 KPI 缺失 | 人效指标（月产30+/爆款率5%/月签1.5人） | 团队页只有基本信息 | P2 |
| Supabase 数据库表未建 | 云端持久化 | 仅 localStorage，Supabase 表不存在 | P0 |

---

## Part 1 — P0 必做（系统基础 + 核心业务对齐）

### TASK 1.1 ✅ 系统差距分析与改进路线图

对比 MCN 规划书 v1.0 与当前系统，创建本文档。

### TASK 1.2 ✅ 扩展平台矩阵至 8 平台

**目标**：platformConfig 从 4 扩展到 8，对齐 MCN 规划书 2.1 节。

改动点：
- `platformConfig` 默认数组增加：抖音、独立站SEO、Google/YouTube、Facebook/Instagram
- `platformOptions()` 自动适配
- `accounts[]` 补充新平台的示例账号
- Settings 页的平台管理 UI 已有，无需改动

新增平台清单：
```
{ name: "抖音", canBrowserOpen: true, icon: "🎵" }
{ name: "独立站SEO", canBrowserOpen: true, icon: "🌐" }
{ name: "Google/YouTube", canBrowserOpen: true, icon: "▶️" }
{ name: "Facebook/IG", canBrowserOpen: true, icon: "📘" }
```

### TASK 1.3 ✅ IP 矩阵按 5 类分层 + 品牌防火墙

**目标**：personas 从扁平数组升级为分层结构，实现品牌隔离检查。

改动点：
- `personas` 数据结构增加 `ipCategory` 字段：`school_official` / `real_person` / `agency` / `ugc` / `seo`
- `accounts[]` 增加 `ipCategory` 字段，与 persona 对应
- 新增 `BRAND_FIREWALL_RULES` 常量：中介号禁用词列表（BCI / 博文 / 创始人 / 校徽 / 地址等）
- 内容创建 / AI 审核时，如果账号属于 `agency` 类，自动检查标题和内容是否触发防火墙
- IP 矩阵渲染页 `renderPersonas()` 按 5 类分组展示
- 账号矩阵 `renderAccounts()` 增加分类标签

品牌防火墙规则（来自 MCN 规划书 3.1 节 C 部分）：
```javascript
const BRAND_FIREWALL_KEYWORDS = [
  "BCI", "博文", "Brentvale", "创始人", "三娃", "校徽",
  "bci.edu.sg", "校长", "Ocean Wang"
];
```

### TASK 1.4 ✅ CRM 漏斗扩展至 6 级

**目标**：CRM 看板从 4 列扩展为 6 级漏斗，对齐 MCN 规划书 9.2 节。

改动点：
- `crmStages` 扩展为：`["内容曝光", "私信咨询", "加企微", "留电/视频", "试听/到访", "签约", "流失"]`
- 现有 `crmLeads[]` 数据迁移映射：新线索→私信咨询，已咨询→加企微，预约到访→试听/到访，缴费→签约
- `renderCrm()` 适配新列数
- 漏斗转化率自动计算并展示（每级之间的转化率）
- 增加红线指标预警（私信→加微 < 10% 等）

### TASK 1.5 ✅ Supabase 数据库表创建

**目标**：创建 Supabase 表结构，使云端同步可用。

改动点：
- 创建 SQL migration 文件 `docs/supabase-schema.sql`
- 5 张核心表：`content_items` / `knowledge_items` / `accounts` / `crm_leads` / `ai_prompts`
- 辅助表：`personas` / `team_members` / `review_history`
- RLS（Row Level Security）策略：按 user role 控制读写
- 更新 `initCloudDatabase()` 中的 `loadCloudState()` 和 `persistRecordOnline()` 以使用真实表名

---

## Part 2 — P1 重要（运营效率提升）

### TASK 2.1 ✅ 内容类型映射至 MCN 四类占比体系

**目标**：将自由文本 contentType 规范为 MCN 规划书定义的 4 类，并在数据复盘中展示占比 vs 目标。

改动点：
- 新增 `CONTENT_TYPE_CATEGORIES` 映射表：
  - 引流型（40%）：起量/博推荐类 → 对应现有的"干货""升学科普"等
  - 信任型（30%）：专业感/政策解读 → "FAQ""政策"等
  - 案例型（20%）：转化/共鸣 → "案例""校园"等
  - 直接转化型（10%）：活动/收口 → "探校""咨询"等
- 内容创建表单的 contentType 下拉改为这 4 大类 + 子类
- 数据复盘页增加"内容类型占比 vs 目标"图表
- 策略健康看板增加占比偏差预警

### TASK 2.2 ✅ 账号分层与投入等级

**目标**：accounts[] 增加分组层级和投入占比字段，对齐 MCN 规划书 2.1 节。

改动点：
- `accounts[]` 增加 `accountGroup` 字段：`school_official` / `real_person_ip` / `agency` / `ugc`
- 增加 `contentBudgetPercent` 字段（对应 MCN 表中的内容预算占比 35%/20%/15% 等）
- `renderAccounts()` 按组分区渲染 + 组级汇总
- 新增"矩阵全景图"视图（类似 MCN 规划书 3.2 节的树形图）

### TASK 2.3 ✅ 数据复盘动态化

**目标**：analytics 页面的数据从硬编码改为基于 contents[] + accounts[] + crmLeads[] 动态计算。

改动点：
- `renderBars()` 改为从 accounts[] 的 leads/monthlyPosts 动态聚合
- 招生漏斗图基于 crmLeads[] 各阶段实际数量计算
- 增加"北极星指标"卡片：月度签约数 vs 目标 8 人
- 增加 CAC 估算（如果有投放数据）
- 增加转化率趋势（周/月维度）

### TASK 2.4 ✅ 内容详情增加编辑策略字段

**目标**：内容详情弹窗中，策略字段（funnelStage / emotionalTrigger / contentType 等）从只读变为可编辑。

改动点：
- 详情弹窗中的策略标签增加"编辑"按钮
- 点击后切换为下拉/输入模式
- 修改后自动 persistContentUpdate + 云端同步
- 编辑历史记入 reviewHistory（可选）

### TASK 2.5 ✅ 审核流程增加修改意见功能

**目标**：审核时除了通过/驳回，还能在具体字段上给出修改建议。

改动点：
- 审核弹窗增加"修改意见"文本区（已有部分支持，在 `reviewHistory` 的 comment 字段）
- 优化 UI：被驳回的内容在列表中高亮显示修改意见
- 运营人员视角增加"查看修改意见 → 一键修改 → 重新提交"流程
- 修改建议可以针对具体字段（标题/正文/CTA 等）

---

## Part 3 — P2 锦上添花

### TASK 3.1 ✅ 内容与资料/Prompt 的结构化关联

**目标**：references 和 promptsUsed 从纯文本变为可追踪的关联。

改动点：
- `contents[]` 的 `references` 改为数组，存 knowledge 条目标题
- `promptsUsed` 改为数组，存 aiPromptLibrary 条目标题
- 内容详情中关联项可点击跳转到对应资料/模板详情
- 资料详情和 Prompt 详情中反向展示"被哪些内容引用"
- `usedInContents` 字段自动计算（不再手动填数字）

### TASK 3.2 — 团队 KPI 仪表盘

**目标**：团队页面增加 MCN 规划书 9.3 节定义的人效指标。

改动点：
- 团队成员卡片增加 KPI 概览：
  - 运营人员：月产内容数 / 爆款率 / 管理账号数
  - 招生顾问：月跟进线索数 / 月签约数 / 人均产值
- 基于 contents[] 和 crmLeads[] 动态计算
- 增加 KPI 达标/未达标状态标识

### TASK 3.3 — 红线指标预警系统

**目标**：实现 MCN 规划书 9.4 节的红线指标，任一触发时在通知中心高亮警告。

改动点：
- `generateNotifications()` 增加红线检查：
  - 私信→加微 < 10%
  - 加微→试听 < 20%
  - 试听→签约 < 25%
  - 单生 CAC > 18,000
  - 顾问 30 天无开单
- 红线通知使用 `type: "critical"` 样式（红色高亮）

### TASK 3.4 — 企业微信集成预留

**目标**：为 MCN 规划书要求的企业微信线索归集预留接口。

改动点：
- CRM 线索新增 `wechatId` / `wechatAddTime` 字段
- 新增"来源渠道"下拉：企业微信/小红书私信/抖音私信/线下/老客推荐
- 预留 webhook 接口文档（`docs/webhook-api.md`）
- 线索卡片展示企微添加状态

---

## 实施原则

1. **每完成一个 TASK，在本文档标题后追加 ✅**
2. **Git commit 格式**：`feat(TASK-X.Y): 简要说明`
3. **不改已有数据结构的字段名**，只做增量（新增字段用可选默认值）
4. **保持单文件架构**（crm-prototype.js + crm-prototype.css + index.html）
5. **向后兼容 localStorage 已有数据**

---

## 排期估算

| Part | TASKs | 预估工时 |
|------|-------|---------|
| Part 1 (P0) | 1.1–1.5 | 核心基建，优先完成 |
| Part 2 (P1) | 2.1–2.5 | 运营效率提升 |
| Part 3 (P2) | 3.1–3.4 | 按需实施 |
