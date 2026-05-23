# BCI Academic Portal PRD 改进建议

> 基于 `BCI_Academic_Portal_Bilingual_PRD.pdf` 整理  
> 日期：2026-05-23  
> 定位：独立学习系统 / Academic Operating System  

---

## 1. 关键判断

BCI Academic Portal 是一个独立的学习与学术管理系统，和此前的招生获客 CRM 没有产品继承关系，也不应共享业务模型。

两个系统的边界应明确区分：

| 系统 | 核心目标 | 主要用户 | 核心数据 |
|---|---|---|---|
| 招生 CRM | 获客、内容、线索、转化 | 运营、招生、管理者 | 内容、账号、线索、转化数据 |
| Academic Portal | 学习、教学、家校沟通、学术管理 | 学生、家长、教师、学术主任、QA/MR | 学生、课程、班级、作业、成绩、考勤、AI 学习记录 |

因此，Academic Portal 应作为新项目从零设计，当前 PRD 中的技术架构、数据库、权限体系、门户模块都应围绕学校日常学术运营重新展开。

---

## 2. PRD 当前优势

1. 产品定位清晰：不是传统 School ERP，而是 Academic Operating System。
2. 用户角色覆盖完整：Super Admin、School Admin、Academic Director、Teacher、Student、Parent、QA/MR。
3. 核心模块方向完整：学生端、家长端、教师端、AI Tutor、学术分析、EduTrust。
4. 技术栈方向现代：Next.js、TailwindCSS、NestJS、PostgreSQL、Prisma。
5. AI 场景明确：AI Tutor、AI Quiz Generator、AI Reports、Weakness Analysis。
6. 有阶段规划：MVP、Academic Intelligence、Advanced AI、EduTrust Integration。
7. 具备未来 SaaS 化潜力，适合扩展到其他国际学校。

---

## 3. 当前 PRD 主要不足

1. 页面级需求不足：没有明确每个角色登录后看到哪些页面。
2. 用户旅程不足：没有描述学生、家长、教师每天如何使用系统。
3. 数据模型太概括：只列了表名，没有字段、关系和权限边界。
4. MVP 范围仍偏大：Phase 1 同时包含多个门户、AI Tutor、Attendance，容易开发失焦。
5. AI Tutor 定义不够细：没有区分学科知识库、题型、年级、课程体系。
6. EduTrust Integration 太抽象：没有说明哪些数据可以沉淀为合规证据。
7. 权限体系需要细化：不同角色能看哪些学生、班级、成绩、AI 记录，需要明确。
8. 缺少移动端场景：学生和家长高频使用很可能发生在手机端。
9. 缺少通知规则：作业、考勤、成绩、风险预警如何触发没有定义。
10. 缺少学术风险指标：如出勤不足、作业逾期、成绩下滑、AI 学习活跃度低。

---

## 4. P0 必须改进项

### 4.1 明确 MVP 边界

Phase 1 建议只保留以下模块：

1. Authentication & RBAC
2. Student Dashboard
3. Parent Portal
4. Teacher Portal
5. Attendance
6. Assignments
7. Grades / Results
8. Basic AI Tutor

暂缓以下模块：

1. ATAR Prediction
2. University Recommendation
3. AI Study Planner
4. Advanced EduTrust Dashboard
5. SaaS 多学校多租户能力

### 4.2 补充角色首页

每个角色都需要明确 Dashboard 信息架构：

| 角色 | 首页重点 |
|---|---|
| Student | 今日课表、待交作业、成绩趋势、出勤、AI 学习建议 |
| Parent | 孩子出勤、成绩、作业完成、教师反馈、AI 周报、风险提醒 |
| Teacher | 今日课程、点名、作业批改、班级表现、AI 出题助手 |
| Academic Director | 年级/班级表现、风险学生、教师任务、课程质量 |
| School Admin | 学生档案、教师档案、课程设置、系统配置 |
| QA/MR | Audit Evidence、EduTrust 资料、操作日志、合规看板 |
| Super Admin | 全局配置、权限、学校/项目/课程体系管理 |

### 4.3 重建数据库模型

建议核心表从以下结构开始：

1. `users`
2. `students`
3. `parents`
4. `teachers`
5. `programmes`
6. `subjects`
7. `classes`
8. `class_students`
9. `teacher_subjects`
10. `timetable_entries`
11. `assignments`
12. `assignment_submissions`
13. `grades`
14. `attendance_records`
15. `notifications`
16. `files`
17. `ai_tutors`
18. `ai_interactions`
19. `academic_risk_flags`
20. `audit_logs`
21. `edutrust_evidence`

### 4.4 权限矩阵必须前置

需要明确：

1. 学生只能看自己的学习数据。
2. 家长只能看绑定孩子的数据。
3. 教师只能看自己任教班级和科目的学生数据。
4. Academic Director 可以看负责 programme / grade / department 的数据。
5. QA/MR 可以看合规证据和审计日志，但不一定能修改教学数据。
6. Super Admin 拥有全局权限。

### 4.5 AI Tutor 需要按学科拆分

PRD 中的 AI Tutor 应拆成具体产品能力：

1. AI Maths Tutor
2. AI Physics Tutor
3. AI Chemistry Tutor
4. AI EALD Coach
5. AI Chinese Coach

每个 AI Tutor 都应支持：

1. 学科知识边界。
2. 年级/课程体系适配。
3. 拍照识题。
4. 分步骤讲解。
5. 生成类似练习。
6. 错题归因。
7. 学习记录入库。
8. 教师/家长可见的学习摘要。

---

## 5. P1 重要改进项

### 5.1 学生门户

建议补充以下页面：

1. Dashboard
2. My Timetable
3. Assignments
4. Grades
5. Attendance
6. AI Tutor
7. Learning History
8. Files / Materials
9. Notifications

### 5.2 家长门户

建议补充以下页面：

1. Child Overview
2. Attendance
3. Grades
4. Assignment Completion
5. Weekly AI Report
6. Teacher Feedback
7. Academic Warnings
8. Messages / Notifications

### 5.3 教师门户

建议补充以下页面：

1. Today Classes
2. Attendance Marking
3. Assignment Creation
4. Assignment Review
5. Grade Entry
6. Teaching Materials
7. AI Quiz Generator
8. AI Teaching Assistant
9. Class Analytics

### 5.4 学术主任门户

建议补充以下页面：

1. Academic Overview
2. Programme Performance
3. Subject Performance
4. Class Performance
5. At-risk Students
6. Teacher Workload
7. Attendance Trends
8. Assessment Calendar

### 5.5 QA / MR EduTrust 门户

建议补充以下页面：

1. Evidence Dashboard
2. Attendance Evidence
3. Assessment Evidence
4. Teacher Feedback Evidence
5. AI Interaction Evidence
6. Audit Logs
7. Compliance Checklist
8. Export Evidence Pack

---

## 6. P2 体验与智能化改进

1. AI 周报应自动生成中英文版本，方便不同家长阅读。
2. 学生端应支持移动端优先体验，尤其是课表、作业、AI Tutor。
3. 家长端通知应支持 Email / WhatsApp / App Push 的未来扩展。
4. 教师端批改作业应支持 rubric 和 quick comments。
5. 成绩分析应支持按 programme、subject、class、teacher、student 多维筛选。
6. 风险预警应支持规则引擎，例如连续缺勤、作业逾期、成绩下降。
7. AI Tutor 应有安全边界，避免直接给答案而不讲思路。
8. AI interaction logging 应记录问题、回答、学科、年级、耗时、结果反馈。
9. EduTrust evidence 应可按日期、学生、教师、模块导出。
10. 系统应预留多学校 SaaS 架构，但不建议 Phase 1 实现。

---

## 7. 建议开发阶段

### Phase 0 — 需求细化

产出：

1. 完整页面清单。
2. 用户旅程。
3. 权限矩阵。
4. 数据库 ERD。
5. API 清单。
6. MVP 验收标准。

### Phase 1 — MVP

目标：让学生能学、老师能教、家长能看、学校能管。

模块：

1. 登录与权限。
2. 学生 Dashboard。
3. 家长 Dashboard。
4. 教师 Dashboard。
5. 考勤。
6. 作业。
7. 成绩。
8. 基础 AI Tutor。

### Phase 2 — Academic Intelligence

模块：

1. AI Reports。
2. Academic Analytics。
3. 学术风险预警。
4. WACE / A-Level / O-Level 分析。

### Phase 3 — Advanced AI

模块：

1. ATAR Prediction。
2. A-Level Grade Prediction。
3. University Recommendation。
4. AI Study Planner。

### Phase 4 — EduTrust Integration

模块：

1. Audit Evidence。
2. APSO Analytics。
3. Compliance Dashboard。
4. Evidence Export。

---

## 8. 最终建议

BCI Academic Portal 应作为独立新系统建设，不沿用招生 CRM 的产品结构或数据库。

建议先将 PRD 从概念文档升级为可开发规格，优先补齐：

1. 页面清单。
2. 角色权限。
3. 数据模型。
4. MVP 范围。
5. AI Tutor 细则。
6. EduTrust 证据逻辑。

这样开发团队才能避免把系统做成泛后台，而是做成真正服务国际高中教学、学习、家校沟通和合规沉淀的 Academic Operating System。
