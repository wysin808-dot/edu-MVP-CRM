# Teacher Account Onboarding

When creating a teacher account, the teacher must be fixed to authorised subjects immediately.

## Flow

1. Admin / CEO or School Admin creates the Supabase Auth user.
2. Insert a `profiles` row with `role = 'teacher'`.
3. Call `create_teacher_profile_with_subjects(...)`.
4. The function creates:
   - `teachers`
   - `teacher_subjects`
   - `audit_logs`

## Required Inputs

```json
{
  "teacher_profile_id": "profile uuid from auth.users / profiles",
  "teacher_full_name": "Mr Lim",
  "teacher_department": "Science",
  "subject_permissions": [
    {
      "subject_id": "physics subject uuid",
      "permission_level": "teach",
      "can_create_assignments": true,
      "can_enter_marks": true,
      "can_manage_outline": false
    }
  ]
}
```

## Permission Levels

| Level | Meaning |
|---|---|
| `teach` | Can teach the subject and handle normal classroom tasks |
| `lead` | Subject lead, can usually manage outlines and moderation |
| `moderate` | Can review/moderate, but may not enter marks |

## Recommended Rules

- A teacher can only create assignments for subjects in `teacher_subjects`.
- A teacher can only enter WACE marks when `can_enter_marks = true`.
- A teacher can only manage WACE assessment outlines when `can_manage_outline = true`.
- Academic Director, School Admin and Admin / CEO can manage teacher-subject mappings.

