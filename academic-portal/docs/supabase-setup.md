# Supabase Setup — BCI Academic Portal

This project should use Supabase PostgreSQL as the first production backend.

## 1. Create Project

Create a new Supabase project for Academic Portal only. Do not reuse the admissions CRM database.

Recommended region:

- Singapore, if available.
- Otherwise the closest stable region for BCI operations.

## 2. Run Schema

Open Supabase SQL Editor and run:

```sql
-- academic-portal/docs/supabase-schema.sql
```

Then run the role backend views:

```sql
-- academic-portal/docs/role-backend-views.sql
```

Optional demo data:

```sql
-- academic-portal/docs/seed.sql
```

Smoke test:

```sql
-- academic-portal/docs/smoke-test.sql
```

## 3. Environment Variables

For local development:

```env
ACADEMIC_SUPABASE_URL=https://your-project.supabase.co
ACADEMIC_SUPABASE_ANON_KEY=your-anon-key
```

For the static prototype, set the same values in:

```js
// academic-portal/config.js
window.ACADEMIC_SUPABASE_URL = "https://your-project.supabase.co";
window.ACADEMIC_SUPABASE_ANON_KEY = "your-anon-key";
```

The anon key is public by design, but do not put service-role keys in the browser.

For Vercel:

```env
ACADEMIC_SUPABASE_URL
ACADEMIC_SUPABASE_ANON_KEY
```

## 4. Auth Roles

Set `profiles.role` to one of:

- `super_admin`
- `admin`
- `school_admin`
- `academic_director`
- `teacher`
- `student`
- `parent`
- `qa_mr`

## 5. MVP Integration Order

1. Profiles and role-based login.
2. Students, parents, teachers.
   - For teachers, use `create_teacher_profile_with_subjects(...)` so every teacher account is fixed to authorised subjects.
3. Programmes, subjects, classes.
4. Timetable entries.
5. Attendance sessions and QR tokens.
6. Assignments, targets, submissions.
7. WACE outlines, tasks, task marks, school results.
8. AI interactions.
9. Evidence and audit logs.

## 6. Engineering Runbook

1. Create Supabase project.
2. Run `docs/supabase-schema.sql`.
3. Run `docs/role-backend-views.sql`.
4. Optional: run `docs/seed.sql`.
5. Run `docs/smoke-test.sql` and confirm non-empty tables/views.
6. Fill `academic-portal/config.js` with Supabase URL and anon key.
7. Open `/academic-portal/?v=5`.
8. Create Auth users, insert matching `profiles`, then test role bootstrap.

## 7. Role Backend Views

Use these views for each role dashboard:

| Role | View |
|---|---|
| Admin / CEO | `school_admin_portal_overview`, `academic_director_portal_overview`, `qa_mr_portal_overview` |
| Student | `student_portal_overview` |
| Parent | `parent_portal_children_overview` |
| Teacher | `teacher_portal_overview` |
| Academic Director | `academic_director_portal_overview`, `academic_director_student_timetable_matrix` |
| QA / MR | `qa_mr_portal_overview` |
| School Admin / Super Admin | `school_admin_portal_overview` |

See `docs/role-backend-map.md` for the role-by-role data map.
