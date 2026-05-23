const ACADEMIC_CONFIG = {
  supabaseUrl: window.ACADEMIC_SUPABASE_URL || "",
  supabaseAnonKey: window.ACADEMIC_SUPABASE_ANON_KEY || "",
};

function getConfigStatus() {
  if (!window.supabase) return { configured: false, reason: "Supabase JS library not loaded" };
  if (!ACADEMIC_CONFIG.supabaseUrl || !ACADEMIC_CONFIG.supabaseAnonKey) return { configured: false, reason: "Missing Supabase URL or anon key" };
  return { configured: true, reason: "Supabase configured" };
}

function hasSupabaseConfig() {
  return getConfigStatus().configured;
}

function createAcademicClient() {
  if (!hasSupabaseConfig()) return null;
  return window.supabase.createClient(ACADEMIC_CONFIG.supabaseUrl, ACADEMIC_CONFIG.supabaseAnonKey);
}

function isUuid(value) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(value || ""));
}

async function loadAcademicStateFromSupabase() {
  const client = createAcademicClient();
  if (!client) return null;

  const [
    students,
    teachers,
    subjects,
    classes,
    timetableEntries,
    assignments,
    assignmentTargets,
    assignmentSubmissions,
    attendanceSessions,
    waceOutlines,
    evidenceItems,
  ] = await Promise.all([
    client.from("students").select("*"),
    client.from("teachers").select("*"),
    client.from("subjects").select("*"),
    client.from("classes").select("*"),
    client.from("timetable_entries").select("*"),
    client.from("assignments").select("*"),
    client.from("assignment_targets").select("*"),
    client.from("assignment_submissions").select("*"),
    client.from("attendance_sessions").select("*"),
    client.from("wace_assessment_outlines").select("*"),
    client.from("evidence_items").select("*"),
  ]);

  const results = { students, teachers, subjects, classes, timetableEntries, assignments, assignmentTargets, assignmentSubmissions, attendanceSessions, waceOutlines, evidenceItems };
  const firstError = Object.values(results).find((result) => result.error)?.error;
  if (firstError) throw firstError;

  return Object.fromEntries(
    Object.entries(results).map(([key, result]) => [key, result.data || []])
  );
}

function mapBackendToPrototypeState(role, roleBackend) {
  if (!roleBackend) return null;
  return {
    cloudRole: role,
    cloudLoadedAt: new Date().toISOString(),
    roleBackend,
  };
}

async function loadRoleBackend(role) {
  const client = createAcademicClient();
  if (!client) return null;

  const viewMap = {
    student: ["student_portal_overview"],
    parent: ["parent_portal_children_overview"],
    teacher: ["teacher_portal_overview", "teacher_portal_subject_permissions"],
    admin: ["school_admin_portal_overview", "academic_director_portal_overview", "qa_mr_portal_overview"],
    academic_director: ["academic_director_portal_overview", "academic_director_student_timetable_matrix"],
    qa_mr: ["qa_mr_portal_overview"],
    school_admin: ["school_admin_portal_overview"],
    super_admin: ["school_admin_portal_overview"],
  };

  const views = viewMap[role] || [];
  const entries = await Promise.all(
    views.map(async (viewName) => {
      const result = await client.from(viewName).select("*");
      if (result.error) throw result.error;
      return [viewName, result.data || []];
    })
  );

  return Object.fromEntries(entries);
}

async function getMyPortalRole() {
  const client = createAcademicClient();
  if (!client) return null;
  const { data, error } = await client.rpc("get_my_portal_role");
  if (error) throw error;
  return Array.isArray(data) ? data[0] : data;
}

async function createTeacherWithSubjects({ profileId, fullName, department, subjectPermissions }) {
  const client = createAcademicClient();
  if (!client) return null;
  const { data, error } = await client.rpc("create_teacher_profile_with_subjects", {
    teacher_profile_id: profileId,
    teacher_full_name: fullName,
    teacher_department: department || "",
    subject_permissions: subjectPermissions || [],
  });
  if (error) throw error;
  return data;
}

async function lookupAcademicIds({ studentName, subjectName }) {
  const client = createAcademicClient();
  if (!client) return null;

  const [studentResult, subjectResult, teacherSubjectResult] = await Promise.all([
    client.from("students").select("id, full_name").eq("full_name", studentName).maybeSingle(),
    client.from("subjects").select("id, name").eq("name", subjectName).maybeSingle(),
    client
      .from("teacher_subjects")
      .select("teacher_id, subjects!inner(id, name), teachers!inner(id, full_name)")
      .eq("subjects.name", subjectName)
      .eq("status", "active")
      .limit(1)
      .maybeSingle(),
  ]);

  const firstError = [studentResult, subjectResult, teacherSubjectResult].find((result) => result.error)?.error;
  if (firstError) throw firstError;

  return {
    studentId: studentResult.data?.id || null,
    subjectId: subjectResult.data?.id || null,
    teacherId: teacherSubjectResult.data?.teacher_id || null,
  };
}

async function createIndividualAssignment({ studentName, subjectName, title, description, dueAt, status }) {
  const client = createAcademicClient();
  if (!client) return null;

  const ids = await lookupAcademicIds({ studentName, subjectName });
  if (!ids?.studentId || !ids?.subjectId || !ids?.teacherId) {
    throw new Error(`Missing database mapping for ${studentName} / ${subjectName}`);
  }

  const { data: assignment, error: assignmentError } = await client
    .from("assignments")
    .insert({
      subject_id: ids.subjectId,
      title,
      description: description || "",
      scope: "individual",
      due_at: dueAt || null,
      assigned_by: ids.teacherId,
      status: status === "Draft" ? "draft" : "published",
    })
    .select()
    .single();
  if (assignmentError) throw assignmentError;

  const { error: targetError } = await client
    .from("assignment_targets")
    .insert({
      assignment_id: assignment.id,
      student_id: ids.studentId,
    });
  if (targetError) throw targetError;

  await client.from("evidence_items").insert({
    evidence_type: "Assignment",
    title: `${subjectName} individual homework created for ${studentName}`,
    related_table: "assignments",
    related_id: assignment.id,
    status: "complete",
  });

  return { assignment, targetStudentId: ids.studentId, assignedByTeacherId: ids.teacherId };
}

async function submitAssignment({ assignmentId, studentId, fileUrl, fileName }) {
  const client = createAcademicClient();
  if (!client) return null;
  if (!isUuid(assignmentId) || !isUuid(studentId)) {
    throw new Error("Cloud submission requires database UUID assignmentId and studentId");
  }
  const payload = {
    assignment_id: assignmentId,
    student_id: studentId,
    submitted_at: new Date().toISOString(),
    status: "submitted",
    file_url: fileUrl || null,
    file_name: fileName || null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await client
    .from("assignment_submissions")
    .upsert(payload, { onConflict: "assignment_id,student_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

window.AcademicDataAdapter = {
  createAcademicClient,
  createIndividualAssignment,
  createTeacherWithSubjects,
  getConfigStatus,
  hasSupabaseConfig,
  getMyPortalRole,
  loadRoleBackend,
  mapBackendToPrototypeState,
  loadAcademicStateFromSupabase,
  submitAssignment,
};
