# SEDA 全站逐页重做 GitHub 工作清单

目标：不再用通用模板批量生成页面。每个 URL 独立重做 UI、内容结构、图片/图表和 SEO，再直接覆盖现有 `gh-pages` 页面。

当前来源分支：`gh-pages`

当前域名目标：`https://sgeda.org.cn`

## 统一原则

- 每个 URL 单独设计，不套同一版长文模板。
- 保留原 URL，不改路径，避免影响 sitemap 和已提交链接。
- 页面首屏要有清晰主题，不要像 AI 文章开头。
- 每页至少包含：唯一 H1、清晰 meta title/description、canonical、面包屑、正文内链、FAQ 或实用问答。
- 每页根据主题加入图片、图表、路径图、对比表或数据库入口，降低阅读疲劳。
- 旧关键词要自然保留，新制度/新年份要在标题和正文里说明。
- 不出现“GEO 可读答案”等面向机器的露骨表达。
- 覆盖前先本地预览，确认视觉和移动端可读性。

## GitHub Issue 模板

```md
## URL
https://sgeda.org.cn/{path}/

## 页面目标
- 重新设计该页面，不使用通用模板感。
- 保留当前 URL 并覆盖现有页面。
- 提升百度收录友好度和家长阅读体验。

## 内容要求
- 明确目标用户：中国家长 / 新加坡升学规划家庭。
- 首屏说明该页面解决什么问题。
- 保留核心关键词和旧称/新称关系。
- 加入至少 1 个图文模块或图表。
- 加入相关页面内链。

## 验收标准
- H1 唯一。
- title / description / canonical 正确。
- 页面不是纯文字长文。
- 移动端无文字溢出。
- 无模板痕迹，无明显 AI 味。
```

## 第一批：核心转化与考试课程页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign homepage as SEDA education portal | `/` | P0 | 首页要先定全站视觉语言 |
| Redesign SEC / O-Level overview page | `/o-level/` | P0 | 2027 SEC + O-Level 关键词承接 |
| Redesign AEIS overview page | `/aeis/` | P0 | 政府学校入口页 |
| Redesign WACE overview page | `/wace/` | P0 | 国际高中转化重点 |
| Redesign A-Level overview page | `/a-level/` | P1 | JC / A-Level 路线 |
| Redesign IB overview page | `/ib/` | P1 | 国际学校与 IB 路线 |
| Redesign JC overview page | `/jc/` | P1 | O-Level/SEC 后学术路线 |
| Redesign Poly overview page | `/poly/` | P1 | O-Level/SEC 后专业路线 |
| Redesign Singapore education overview | `/singapore-education/` | P1 | 教育体系总览页 |
| Redesign pathway overview | `/pathway/` | P1 | 路径决策枢纽 |

## 第二批：O-Level / SEC 专题页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign SEC Chinese students guide | `/o-level/chinese-students/` | P0 | 中国学生适配页 |
| Redesign SEC preparation guide | `/o-level/preparation/` | P1 | 备考策略 |
| Redesign SEC scoring guide | `/o-level/scoring/` | P1 | 计分与申请规则 |
| Redesign SEC subjects guide | `/o-level/subjects/` | P1 | 科目选择 |
| Redesign SEC to JC page | `/o-level-jc/` | P1 | JC 申请 |
| Redesign SEC to Poly page | `/o-level-poly/` | P1 | Poly 申请 |
| Redesign O-Level schools page | `/o-level-schools/` | P2 | 学校列表/推荐 |

## 第三批：AEIS 专题页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign AEIS age requirements page | `/aeis/age-requirements/` | P1 | 年龄要求图表化 |
| Redesign AEIS English page | `/aeis/english/` | P1 | 英文难点与备考 |
| Redesign AEIS Math page | `/aeis/math/` | P1 | 数学题型 |
| Redesign AEIS preparation page | `/aeis/preparation/` | P1 | 备考计划 |
| Redesign AEIS results page | `/aeis/results/` | P2 | 成绩与分配 |
| Redesign S-AEIS page | `/aeis/s-aeis/` | P2 | 补充入学考试 |
| Redesign AEIS timeline page | `/aeis/timeline/` | P1 | 时间线 |

## 第四批：学校与数据库页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign school database overview | `/school-database/` | P0 | 数据库入口 |
| Redesign primary schools database | `/primary-schools/` | P1 | 小学数据库 |
| Redesign secondary schools database | `/secondary-schools/` | P1 | 中学数据库 |
| Redesign government schools guide | `/government-schools/` | P1 | 政府学校 |
| Redesign international school guide | `/international-school/` | P1 | 国际学校 |
| Redesign private schools guide | `/private-schools/` | P2 | 私立学校 |

## 第五批：留学指南页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign guides overview | `/guides/` | P1 | 指南总览 |
| Redesign accommodation guide | `/guides/accommodation/` | P2 | 住宿 |
| Redesign cost guide | `/guides/cost/` | P0 | 高搜索需求 |
| Redesign dependent pass guide | `/guides/dependent-pass/` | P2 | 陪读 |
| Redesign student pass guide | `/guides/student-pass/` | P1 | 学生准证 |

## 第六批：大学与升学页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign university overview | `/university/` | P1 | 公立大学总览 |
| Redesign university admission guide | `/university/admission/` | P1 | 中国学生申请 |
| Redesign NUS page | `/university/nus/` | P1 | NUS |
| Redesign NTU page | `/university/ntu/` | P1 | NTU |
| Redesign SMU page | `/university/smu/` | P2 | SMU |
| Redesign SUTD page | `/university/sutd/` | P2 | SUTD |
| Redesign SIT page | `/university/sit/` | P2 | SIT |
| Redesign SUSS page | `/university/suss/` | P2 | SUSS |
| Redesign HK university pathway | `/hk-university/` | P2 | 如线上存在需补清单 |
| Redesign Australia university pathway | `/au-university/` | P2 | 如线上存在需补清单 |
| Redesign UK university pathway | `/uk-university/` | P2 | 如线上存在需补清单 |

## 第七批：Poly 学院页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign Poly admission page | `/poly/admission/` | P1 | 入学攻略 |
| Redesign SP page | `/poly/sp/` | P2 | 新加坡理工学院 |
| Redesign NP page | `/poly/np/` | P2 | 义安理工学院 |
| Redesign NYP page | `/poly/nyp/` | P2 | 南洋理工学院 |
| Redesign RP page | `/poly/rp/` | P2 | 共和理工学院 |
| Redesign TP page | `/poly/tp/` | P2 | 淡马锡理工学院 |

## 第八批：私立大学页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign private university overview | `/private-university/` | P1 | 私立大学总览 |
| Redesign Curtin Singapore page | `/private-university/curtin/` | P2 | Curtin |
| Redesign JCU Singapore page | `/private-university/jcu/` | P2 | JCU |
| Redesign Kaplan Singapore page | `/private-university/kaplan/` | P2 | Kaplan |
| Redesign MDIS page | `/private-university/mdis/` | P2 | MDIS |
| Redesign PSB Academy page | `/private-university/psb/` | P2 | PSB |
| Redesign SIM page | `/private-university/sim/` | P2 | SIM |

## 第九批：WACE 与工具页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign WACE ATAR page | `/wace-atar/` | P1 | ATAR 解释 |
| Redesign WACE to NUS/NTU page | `/wace-nus-ntu/` | P1 | 转化重点 |
| Redesign WACE vs A-Level page | `/wace-vs-a-level/` | P1 | 对比页 |
| Redesign university matcher tool page | `/pathway/university-matcher/` | P2 | 工具页 |
| Redesign study planner tool page | `/pathway/study-planner/` | P2 | 工具页 |

## 第十批：品牌与辅助页

| Issue 标题 | URL | 优先级 | 备注 |
|---|---|---:|---|
| Redesign about page | `/about/` | P1 | 信任页 |
| Redesign contact page | `/contact/` | P1 | 转化页 |
| Redesign news page | `/news/` | P2 | 资讯入口 |

## 建议执行顺序

1. 先重做首页，确定全站视觉系统。
2. 再重做 `/o-level/`、`/aeis/`、`/wace/` 三个核心 SEO 页面。
3. 每次只覆盖 3-5 个页面，避免一次性大改导致 QA 困难。
4. 每批覆盖后更新 sitemap，检查 canonical、内链、百度提交清单。

