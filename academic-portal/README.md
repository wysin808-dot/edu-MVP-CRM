# BCI Academic Portal

BCI Academic Portal 是一个独立的 AI 驱动学习系统，不属于招生 CRM，也不继承 CRM 的业务模型。

系统定位为：

> AI-Powered International High School Academic Operating System

它服务于国际高中日常教学、学习、家校沟通、学术管理和 EduTrust 证据沉淀。

## 核心用户

| 角色 | 主要目标 |
|---|---|
| Student | 查看课表、完成作业、跟踪成绩、使用 AI Tutor |
| Parent | 查看孩子出勤、作业、成绩、教师反馈和 AI 周报 |
| Teacher | 点名、布置作业、批改、上传资料、使用 AI 教学助手 |
| Academic Director | 查看班级/科目表现、风险学生和教学质量 |
| QA / MR | 查看 EduTrust 证据、审计日志和合规材料 |
| Super Admin | 管理用户、权限、课程体系和系统配置 |

## MVP 模块

1. Authentication & RBAC
2. Student Dashboard
3. Parent Portal
4. Teacher Portal
5. Attendance
6. Assignments
7. Grades
8. Basic AI Tutor
9. Academic Analytics
10. EduTrust Evidence

## 第一版原型

当前目录中的 `index.html`、`styles.css`、`app.js` 是可直接运行的前端原型。

本地预览：

```bash
python3 -m http.server 4180 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:4180/academic-portal/
```

## 后续技术方向

正式开发建议使用：

| 层 | 技术 |
|---|---|
| Frontend | Next.js + TailwindCSS |
| Backend | NestJS |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + Refresh Token / Supabase Auth |
| Storage | AWS S3 / Cloudflare R2 |
| AI | OpenAI / Claude / DeepSeek |
| Hosting | Vercel + AWS |

## Supabase Backend

已新增第一版数据库设计：

- `docs/supabase-schema.sql`
- `docs/supabase-setup.md`
- `data-adapter.js`

当前前端仍使用 `defaultRecords + localStorage` 作为可交互原型数据源。下一步是按 `supabase-schema.sql` 创建 Supabase 项目，然后把 `app.js` 中的本地 state 逐步替换为 `data-adapter.js` 的 Supabase 读写。

优先接入顺序：

1. `profiles` / 登录角色
2. `students` / `parents` / `teachers`
3. `programmes` / `subjects` / `classes`
4. `timetable_entries`
5. `attendance_sessions` / `attendance_records`
6. `assignments` / `assignment_targets` / `assignment_submissions`
7. `wace_assessment_outlines` / `wace_assessment_tasks` / `wace_task_marks` / `wace_school_results`
8. `ai_interactions`
9. `evidence_items` / `audit_logs`
