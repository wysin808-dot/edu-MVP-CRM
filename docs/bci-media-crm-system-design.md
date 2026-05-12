# BCI 自媒体矩阵获客管理系统设计稿

## 1. 系统定位

BCI 自媒体矩阵获客管理系统用于管理国际学校招生内容从资料沉淀、AI 生成、IP 分发、账号发布、线索进入到招生转化的完整链路。

系统目标不是做一个普通内容表格，而是建立 BCI 自己的招生内容资产库：

- 真实资料可以被团队和 AI 调用
- 每天发布内容必须归档
- 每个账号一年内发过什么可以回看
- 每个 IP 的内容方向和转化效果可以复盘
- 每条招生线索可以追溯到平台、账号、IP 和具体内容

核心链路：

```text
真实资料库
→ AI 内容生成
→ 内容资产库
→ IP 矩阵分发
→ 账号矩阵发布
→ 每日发布归档
→ 招生 CRM
→ 数据复盘看板
```

## 2. 角色权限

### 2.1 超级管理员

适合对象：创始人、系统管理员。

核心权限：

- 管理所有用户、角色、账号、IP、资料、内容和线索
- 分配运营人员负责的账号
- 管理系统字段、标签、状态和权限
- 查看所有数据看板
- 导入、导出和归档数据

### 2.2 部门负责人

适合对象：内容负责人、招生负责人。

核心权限：

- 查看全部内容、账号、IP 和发布归档
- 审核内容，通过或驳回
- 查看团队工作量和发布完成情况
- 查看内容效果和招生转化数据
- 锁定不合格内容
- 不能直接删除核心资料和系统配置

### 2.3 运营人员

适合对象：负责几个自媒体账号的日常运营人员。

核心权限：

- 只管理自己被分配的账号
- 创建内容草稿
- 调用真实资料库、AI 内容库、图片素材
- 提交内容审核
- 审核通过后发布，并回填链接、截图和数据
- 写内容复盘
- 不能审核自己的内容
- 默认不能查看全部 CRM 敏感联系方式

### 2.4 AI 内容编辑

适合对象：AI 文案、内容策划、脚本编辑。

核心权限：

- 查看可调用资料
- 创建 AI 生成任务
- 保存 prompt、AI 初稿和改写版本
- 将采用稿转入内容资产库
- 不能发布内容
- 不能查看完整招生 CRM

### 2.5 招生顾问

适合对象：招生团队成员。

核心权限：

- 查看分配给自己的线索
- 查看线索来源平台、账号、IP 和内容
- 添加跟进记录
- 更新线索阶段、到访、报名、流失结果
- 反馈线索质量
- 不能修改已发布内容、资料库和 AI 内容库

## 3. 内容状态流转

```text
草稿
→ 待审核
→ 驳回修改 / 审核通过
→ 已发布
→ 数据回填
→ 已复盘
```

状态权限：

| 状态 | 可操作角色 | 主要动作 |
| --- | --- | --- |
| 草稿 | 运营人员、AI 内容编辑 | 创建、编辑、调用资料 |
| 待审核 | 部门负责人 | 审核、驳回、写审核意见 |
| 驳回修改 | 运营人员、AI 内容编辑 | 修改后重新提交 |
| 审核通过 | 运营人员 | 发布到外部平台 |
| 已发布 | 运营人员 | 上传链接、截图、素材和数据 |
| 已复盘 | 部门负责人、运营人员 | 总结表现、沉淀经验 |

## 3.1 搜索规则

以下 5 个核心库必须提供独立搜索入口：

- 内容资产库：搜索标题、账号、受众、CTA、关键词、主题簇、状态。
- 真实资料库：搜索事实资料、来源、Subject、Type、Notes、Numeric Data。
- AI 内容库：搜索 prompt、模板、平台、阶段、目标 IP、输出示例。
- IP 矩阵：搜索 IP 名称、定位、渠道、话术、线索表现。
- 账号矩阵：搜索账号、平台、运营人、主体、IP、状态。

后续真实系统建议再增加一个全局搜索：

```text
输入一个关键词
→ 同时搜索真实资料、AI 模板、内容资产、账号、IP、发布归档、CRM 线索
```

## 4. 8 个核心数据库

### 4.1 真实资料数据库 `knowledge_items`

用途：保存 BCI 可长期复用的确定性资料，作为 AI 和内容团队的底层知识库。

典型内容：

- WACE 课程结构
- ATAR 评分体系
- NUS / NTU / 澳洲 / 英国 / 美国大学录取要求
- 新加坡学生准证、陪读签证、学费区间
- BCI 课程、学费、校园、活动资料
- 历届毕业生录取数据
- 家长 FAQ
- 竞品学校信息
- 学生案例和家长案例

核心字段：

| 字段 | 说明 |
| --- | --- |
| id | 资料 ID |
| title | 资料标题 |
| category | 分类 |
| detail | 资料正文 |
| grade_range | 适用年级，例如 7-12 |
| audience | 适用人群 |
| notes | 内部备注，如每年复查、发布注意事项 |
| numeric_data | 数值型资料，如 ATAR 区间、学费区间、录取数量 |
| review_cycle | 复查周期，如每年、每季、半年 |
| source_type | 来源类型：官方、内部、人工整理、第三方 |
| source_url | 来源链接 |
| subject_tags | 主题标签，如 NTU、WACE、签证 |
| item_type | 资料类型，如录取分数、课程结构、政策规则 |
| used_in_content_ids | 被哪些内容资产调用 |
| verified_by | 核实人 |
| last_verified_at | 最后核实日期 |
| visibility | 公开、内部、私密 |
| verification_status | 待核实、已核实、过期、禁用 |
| usable_scope | 可调用范围 |
| tags | 标签 |
| attachments | 图片、PDF、截图、文件 |
| created_by | 创建人 |
| updated_at | 更新时间 |

### 4.2 内容资产库 `content_items`

用途：管理所有内容作品，不管是否已经发布。

核心字段：

| 字段 | 说明 |
| --- | --- |
| id | 内容 ID |
| title | 内容标题 |
| ai_search_ready | 是否已整理到可被 AI 搜索/调用 |
| account_id | 关联账号 |
| audience_personas | 受众人群，如 P1 陪读妈妈、P2 国内待留学、P3 转学家长 |
| author_id | 作者 |
| cta | 行动引导，如评论关键词、私信领取资料 |
| content_type | 图文、短视频、口播、公众号、朋友圈、海报 |
| emotional_trigger | 情绪触发，如反常识、痛点反问、理性避坑 |
| funnel_stage | 漏斗阶段：Awareness、Consideration、Conversion |
| lead_magnet | 诱饵资料，如路径选择表、签证材料清单 |
| notes | 内部备注、发布检查事项 |
| primary_keyword | 主关键词 |
| prompts_used | 使用过的 prompt 模板 |
| publish_date | 计划或实际发布日期 |
| references_note | 引用资料说明 |
| repurpose_status | 复用状态，如可二改、已二改、不可复用 |
| status | 草稿、待审核、审核通过、Posted、已复盘 |
| topic_cluster | 主题簇，如国际学校择校、WACE升学 |
| wace_focus | 是否 WACE 重点内容 |
| topic | 内容主题 |
| target_audience | 目标人群 |
| target_grade | 目标年级 |
| platform_suggestion | 适合平台 |
| persona_id | 对应 IP |
| knowledge_item_ids | 调用资料 |
| ai_generation_ids | 关联 AI 生成记录 |
| final_copy | 最终文案 |
| script | 口播稿或视频脚本 |
| media_asset_ids | 图片视频素材 |
| status | 草稿、待审核、驳回修改、审核通过、已发布、已复盘 |
| owner_id | 负责人 |
| reviewer_id | 审核人 |
| review_note | 审核意见 |
| created_at | 创建时间 |
| updated_at | 更新时间 |

### 4.3 AI 内容库 `ai_generations`

用途：保存 AI 生产过程、prompt、版本和复用记录。

核心字段：

| 字段 | 说明 |
| --- | --- |
| id | AI 生成记录 ID |
| task_title | AI 任务标题 |
| record_type | 模板 template / 生成记录 generation |
| author_id | 作者 |
| last_used_at | 最后使用时间 |
| notes | 使用说明和注意事项 |
| output_examples | 输出示例 |
| prompt | 使用的提示词 |
| prompt_template | 可复用 prompt 模板 |
| knowledge_item_ids | 调用资料 |
| target_platform | 目标平台 |
| target_persona_id | 目标 IP |
| target_persona | 目标人群或适用 IP 描述 |
| stage | 阶段：标题、正文、脚本、转化、复盘 |
| generated_versions | AI 生成版本 |
| edited_version | 人工修改版本 |
| selected_version | 最终采用版本 |
| linked_content_id | 关联内容资产 |
| model_name | 使用模型 |
| quality_rating | 好用、一般、不采用 |
| reuse_count | 复用次数 |
| created_by | 创建人 |
| created_at | 创建时间 |

AI 内容库分两类：

- Prompt 模板：例如标题改写公式、视频口播结构、朋友圈转化文案。
- AI 生成记录：某一次实际调用资料生成出来的草稿、版本和采用情况。

运营人员一般不需要直接管理这里，但 AI 编辑和内容负责人需要用它沉淀“什么 prompt 有效”。

### 4.4 IP 矩阵管理 `ip_personas`

用途：管理校长、升学顾问、招生老师、学生案例、家长故事、官方号等 IP。

核心字段：

| 字段 | 说明 |
| --- | --- |
| id | IP ID |
| name | IP 名称 |
| persona_type | 校长、升学顾问、招生老师、学生、家长、官方 |
| positioning | 人设定位 |
| target_audience | 目标人群 |
| core_topics | 主讲主题 |
| tone | 语言风格 |
| forbidden_topics | 禁止话题 |
| talking_points | 常用话术 |
| knowledge_scope | 可调用资料范围 |
| owner_id | IP 负责人 |
| publishing_frequency | 内容频率 |
| status | 启用、暂停 |
| notes | 备注 |

### 4.5 全账号矩阵管理 `social_accounts`

用途：管理所有自媒体账号，以及账号和 IP 的绑定关系。

核心字段：

| 字段 | 说明 |
| --- | --- |
| id | 账号 ID |
| platform | 小红书、抖音、视频号、公众号、B站、Instagram、Facebook |
| account_name | 账号名称 |
| account_status | 筹备、养号、运营中、暂停 |
| account_positioning | 账号定位 |
| persona_ids | 绑定 IP |
| owner_id | 账号负责人 |
| publishing_frequency | 发布频率 |
| handle_url | 后台链接或账号主页链接 |
| investment_tier | 主力、辅助、测试 |
| owner_type | 自营、合作、外包 |
| talent_name | Talent / 主理人 |
| entity_name | 主体名称，如公司、学校、品牌主体 |
| entity_type | 主体类型，如企业、学校、个人 |
| content_ids | 关联内容资产 |
| account_stage | 新号、养号、增长号、转化号 |
| content_direction | 内容方向 |
| follower_count | 粉丝数 |
| status | 启用、暂停 |
| management_note | 管理备注，不保存明文密码 |
| created_at | 创建时间 |

补充关系表：`account_assignments`

| 字段 | 说明 |
| --- | --- |
| user_id | 用户 |
| account_id | 账号 |
| permission | 查看、编辑、提交审核、发布归档 |

### 4.6 每日发布归档 `published_posts`

用途：每天发出去的内容必须上传系统，形成年度可回看的账号时间线。

核心字段：

| 字段 | 说明 |
| --- | --- |
| id | 发布记录 ID |
| publish_date | 发布日期 |
| platform | 平台 |
| account_id | 发布账号 |
| persona_id | 对应 IP |
| content_item_id | 关联内容资产 |
| title | 发布标题 |
| published_copy | 实际发布正文 |
| media_asset_ids | 发布图片或视频 |
| post_url | 发布链接 |
| screenshot_assets | 发布截图 |
| owner_id | 发布负责人 |
| was_planned | 是否按计划发布 |
| review_summary | 复盘结论 |
| lead_generated | 是否产生线索 |
| created_at | 归档时间 |

图片和视频不要直接塞在 `published_posts` 里，而是先进入 `media_assets`：

```text
media_assets
  ├─ 封面图
  ├─ 小红书正文图片 1-9 张
  ├─ 视频号 / 抖音视频
  ├─ 发布成功截图
  └─ 数据截图

published_posts.media_asset_ids
  → 关联这些素材
```

上传小红书图文时，发布归档表单至少要包含：

- 封面图
- 正文图片 / 配图，支持 1-9 张
- 发布成功截图
- 发布链接
- 实际发布正文
- 关联内容资产
- 发布账号、平台、IP

上传视频内容时，至少要包含：

- 视频文件
- 视频封面
- 发布成功截图
- 发布链接
- 口播稿 / 发布文案
- 关联内容资产

补充数据表：`post_metrics`

| 字段 | 说明 |
| --- | --- |
| post_id | 发布记录 |
| metric_date | 数据日期 |
| views | 曝光 / 浏览 |
| likes | 点赞 |
| saves | 收藏 |
| comments | 评论 |
| shares | 转发 |
| messages | 私信 |
| leads | 线索数 |
| visits | 到访数 |
| enrollments | 报名数 |

### 4.7 招生 CRM `leads`

用途：管理内容带来的家长和学生线索，并追踪到报名结果。

核心字段：

| 字段 | 说明 |
| --- | --- |
| id | 线索 ID |
| student_name | 学生姓名 |
| current_grade | 当前年级 |
| target_grade | 目标入学年级 |
| parent_name | 家长姓名 |
| contact_phone | 手机 |
| contact_wechat | 微信 |
| city | 所在城市 |
| interest_program | WACE、国际高中、插班、升学规划 |
| source_platform | 来源平台 |
| source_account_id | 来源账号 |
| source_persona_id | 来源 IP |
| source_post_id | 来源内容 |
| stage | 新线索、已联系、已咨询、预约到访、已到访、测试面试、录取、缴费、流失 |
| counselor_id | 招生负责人 |
| next_follow_up_at | 下次跟进时间 |
| lead_quality | 高、中、低 |
| lost_reason | 流失原因 |
| enrollment_result | 报名结果 |
| created_at | 创建时间 |

补充表：`follow_ups`

| 字段 | 说明 |
| --- | --- |
| lead_id | 线索 |
| follow_up_type | 电话、微信、面谈、开放日、资料发送 |
| note | 跟进记录 |
| next_action | 下一步动作 |
| created_by | 跟进人 |
| created_at | 跟进时间 |

### 4.8 数据复盘看板 `analytics_views`

用途：不是单独录入表，而是基于前面数据库生成的统计视图。

核心看板：

- 平台看板：各平台发布量、互动、线索、到访、报名
- 账号看板：每个账号年度时间线、Top 内容、低效内容
- IP 看板：每个 IP 的发布量、线索质量、转化情况
- 内容看板：主题、类型、年级、人群的效果
- 资料看板：哪些资料被调用最多，哪些资料带来线索
- AI 看板：哪些 prompt、AI 版本、改写方式效果好
- 招生漏斗：曝光、私信、咨询、到访、报名
- 团队看板：运营发布完成率、审核效率、数据回填率

## 5. 关键页面设计

### 5.1 运营人员工作台

目标：让运营每天知道自己要做什么。

模块：

- 我的账号
- 今日待发布
- 待修改内容
- 审核通过可发布
- 待回填数据
- 本周发布完成率

### 5.2 部门负责人审核台

目标：快速检查所有运营提交的内容。

模块：

- 待审核列表
- 按账号、IP、平台筛选
- 内容正文、图片、调用资料、AI 初稿对比
- 审核通过
- 驳回修改
- 审核意见

### 5.3 内容资产库页面

目标：检索、复用、管理所有内容。

核心筛选：

- 年份、月份
- 平台
- 账号
- IP
- 主题
- 目标年级
- 状态
- 是否产生线索

### 5.4 真实资料库页面

目标：建立 BCI 自己的事实资料中心。

核心功能：

- 新增资料
- 上传图片、PDF、截图
- 核实状态管理
- 按分类和标签检索
- 在内容编辑器中调用

### 5.5 AI 内容生成页面

目标：让 AI 基于 BCI 资料生成内容，而不是凭空写。

核心流程：

1. 选择资料
2. 选择 IP
3. 选择平台
4. 输入目标人群和内容方向
5. 生成多个版本
6. 选择一个版本转为内容资产

### 5.6 IP 矩阵页面

目标：管理每个 IP 的定位、话术、账号和表现。

核心视图：

- IP 列表
- IP 绑定账号
- IP 内容时间线
- IP 线索表现
- IP 常用资料和话术

### 5.7 账号矩阵页面

目标：管理所有账号的一年发布档案。

核心视图：

- 账号列表
- 账号负责人
- 账号绑定 IP
- 发布日历
- 年度时间线
- 账号 Top 内容
- 账号线索转化

### 5.8 每日发布归档页面

目标：确保每天发布内容必须上传系统。

核心动作：

- 选择账号
- 选择关联内容
- 上传实际发布文案
- 上传图片 / 视频 / 截图
- 填写链接
- 回填数据
- 写复盘结论

### 5.9 招生 CRM 页面

目标：让招生团队追踪线索，同时保留内容来源。

核心视图：

- 新线索
- 今日待跟进
- 按阶段看线索
- 来源内容详情
- 跟进记录
- 到访和报名结果

### 5.10 数据复盘看板

目标：每周、每月、每季度复盘内容获客效果。

核心问题：

- 哪个平台最有效？
- 哪个账号值得继续做？
- 哪个 IP 带来的线索质量最高？
- 哪类 WACE 内容值得加大产出？
- 哪些资料最适合反复改写？
- 哪些 AI prompt 最好用？

## 6. MVP 第一版范围

第一版优先做以下能力：

1. 用户登录和角色权限
2. 账号矩阵管理
3. IP 矩阵管理
4. 真实资料库
5. 内容资产库
6. 内容审核流程
7. 每日发布归档
8. 招生线索基础 CRM
9. 简单复盘看板

第一版可以暂缓：

- 自动抓取平台数据
- 自动发布到平台
- 复杂 AI 工作流
- 多语言版本管理
- 高级权限审批

## 7. 数据关系

```text
users
  ├─ account_assignments
  ├─ content_items.owner_id
  ├─ published_posts.owner_id
  └─ leads.counselor_id

knowledge_items
  ├─ ai_generations.knowledge_item_ids
  └─ content_items.knowledge_item_ids

ai_generations
  └─ content_items.ai_generation_ids

ip_personas
  ├─ social_accounts.persona_ids
  ├─ content_items.persona_id
  ├─ published_posts.persona_id
  └─ leads.source_persona_id

social_accounts
  ├─ account_assignments.account_id
  ├─ content_items.account_id
  ├─ published_posts.account_id
  └─ leads.source_account_id

content_items
  └─ published_posts.content_item_id

published_posts
  ├─ post_metrics.post_id
  └─ leads.source_post_id

leads
  └─ follow_ups.lead_id
```

## 8. 发布归档查询入口

用户常见问题：

> 某月某日，某个平台，某一个账号发了什么内容？

推荐入口放在两个地方：

1. 发布归档查询：按日期、平台、账号直接查发布记录。
2. 账号矩阵详情：进入某个账号后，看该账号的年度、月度、日历时间线。

但对运营人员来说，「今日发布」页面不能只做查询。它必须先显示我的今日任务：

- 今天要发哪些账号
- 每条内容对应哪个平台和 IP
- 当前状态是草稿、待审核、待发布、待归档还是待回填
- 审核通过后运营人员可以发布
- 发布后必须上传正文、链接、截图、图片 / 视频，并形成 `published_posts` 记录

因此页面结构应为：

```text
今日发布
  ├─ 我的今日任务
  ├─ 今日完成度
  └─ 发布归档查询
```

核心查询条件：

| 条件 | 对应数据库字段 |
| --- | --- |
| 某一天 | `published_posts.publish_date` |
| 某个平台 | `published_posts.platform` |
| 某个账号 | `published_posts.account_id` |
| 某个 IP | `published_posts.persona_id` |
| 内容标题 / 正文 | `published_posts.title` / `published_posts.published_copy` |

查询结果不是只显示标题，而是打开一条完整发布记录：

- 发布日期
- 平台
- 账号
- IP
- 实际发布标题
- 实际发布正文
- 图片 / 视频 / 截图
- 发布链接
- 关联内容资产
- 调用过的真实资料
- AI 生成记录
- 当日、3 日、7 日、30 日数据
- 关联招生线索

底层关联链路：

```text
social_accounts
  → published_posts.account_id

ip_personas
  → published_posts.persona_id

content_items
  → published_posts.content_item_id

knowledge_items
  → content_items.knowledge_item_ids

ai_generations
  → content_items.ai_generation_ids

published_posts
  → post_metrics.post_id
  → leads.source_post_id
```

也就是说，一条小红书发布记录不是孤立的，它同时知道：

- 哪个账号发的
- 哪个 IP 说的
- 原始内容资产是哪条
- 用了哪些真实资料
- 是否由 AI 生成或改写
- 后续数据表现如何
- 有没有带来招生线索

示例 SQL：

```sql
select
  p.publish_date,
  p.platform,
  a.account_name,
  i.name as persona_name,
  p.title,
  p.published_copy,
  p.post_url,
  p.review_summary
from published_posts p
join social_accounts a on a.id = p.account_id
left join ip_personas i on i.id = p.persona_id
where p.publish_date = '2026-05-11'
  and p.platform = '小红书'
  and a.account_name = 'BCI升学顾问号'
order by p.created_at desc;
```

## 9. 推荐开发顺序

### 阶段 1：系统骨架

- 登录
- 用户和角色
- 左侧菜单
- 基础权限

### 阶段 2：核心资产

- 真实资料库
- IP 矩阵
- 账号矩阵
- 内容资产库

### 阶段 3：日常工作流

- 内容提交审核
- 负责人审核
- 每日发布归档
- 数据回填

### 阶段 4：招生闭环

- 招生 CRM
- 线索来源追踪
- 跟进记录
- 报名结果

### 阶段 5：复盘和 AI

- 数据复盘看板
- AI prompt 库
- 基于资料库生成内容
- 爆款内容复用
