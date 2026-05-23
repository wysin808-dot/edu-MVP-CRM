const portalData = {
  admin: {
    label: "Admin / CEO Portal",
    title: "System Command Center",
    action: "Review System",
    focus: "Full system access",
    heroTitle: "Full Academic Portal oversight.",
    heroCopy: "Admin has CEO-level access across academic operations, users, timetable, WACE assessment, evidence and audit posture.",
    nav: ["Overview", "Users", "Programmes", "Students", "Teachers", "Timetable", "WACE Teacher Marks", "Evidence", "Audit Logs"],
    heroMetrics: [
      ["All", "Access"],
      ["7", "Roles"],
      ["Live", "System"],
    ],
    metrics: [
      ["Students", "3", "blue"],
      ["Teachers", "4", "blue"],
      ["Evidence", "38", "green"],
      ["Open gaps", "6", "amber"],
    ],
    primaryEyebrow: "System",
    primaryTitle: "Operational Summary",
    primaryAction: "Review System",
    primary: [
      ["Users", "Role coverage", "Admin / school / academic / teacher / parent / student", "Good"],
      ["WACE", "Assessment workflow", "Outlines, task marks, school results", "Review"],
      ["Timetable", "Student schedule matrix", "Conflicts visible to academic director", "Ready"],
      ["Evidence", "EduTrust evidence", "Attendance, assignment, WACE, AI logs", "Watch"],
    ],
    insightTitle: "Admin Boundary",
    insight: ["CEO-level role", "Admin can see and manage the full system. Operational roles should still be used for day-to-day work."],
    bars: [
      ["Academic data", 88],
      ["Evidence coverage", 82],
      ["Timetable health", 92],
      ["WACE readiness", 78],
    ],
    tableTitle: "System Areas",
    tableHead: ["Area", "Owner", "Scope", "Status"],
    table: [
      ["Users", "Admin", "Full role management", "Good"],
      ["Academic", "Academic Director", "Programmes, classes, timetable", "Ready"],
      ["WACE", "Teachers + Director", "Assessment outline and results", "Review"],
      ["QA", "QA / MR", "Evidence and audit", "Watch"],
    ],
  },
  student: {
    label: "Student Portal",
    title: "Learning Dashboard",
    action: "Ask AI Tutor",
    focus: "3 lessons · 2 assignments",
    heroTitle: "Good morning, Amanda.",
    heroCopy: "You have Physics at 10:00, one Maths task due today, and a new AI recommendation based on last week’s quiz.",
    nav: ["Dashboard", "Timetable", "Assignments", "Grades", "Attendance", "AI Tutor", "Files"],
    heroMetrics: [
      ["92%", "Attendance"],
      ["4", "Due tasks"],
      ["78", "Avg score"],
    ],
    metrics: [
      ["Attendance", "92%", "green"],
      ["Assignments done", "18/21", "blue"],
      ["AI study minutes", "146", "green"],
      ["Risk alerts", "1", "amber"],
    ],
    primaryEyebrow: "Today",
    primaryTitle: "Schedule & Tasks",
    primaryAction: "Open timetable",
    primary: [
      ["08:30", "EALD Writing", "Room 204", "Class"],
      ["10:00", "Physics: Forces", "Lab 2", "Class"],
      ["13:30", "Maths practice due", "Quadratic functions", "Due"],
      ["15:20", "AI Tutor session", "Review quiz mistakes", "Recommended"],
    ],
    insightTitle: "Learning Recommendation",
    insight: ["Focus on force diagrams", "Your Physics quiz shows repeated mistakes in resolving vectors. Review worked examples, then complete 8 targeted practice questions."],
    bars: [
      ["Maths", 84],
      ["Physics", 71],
      ["Chemistry", 79],
      ["EALD", 88],
    ],
    tableTitle: "Recent Activity",
    tableHead: ["Date", "Subject", "Activity", "Status"],
    table: [
      ["May 23", "Maths", "Quadratic practice submitted", "Marked"],
      ["May 22", "Physics", "AI Tutor: Newton's Laws", "Logged"],
      ["May 21", "EALD", "Essay draft feedback", "Returned"],
    ],
  },
  parent: {
    label: "Parent Portal",
    title: "Child Overview",
    action: "View AI Report",
    focus: "Weekly report ready",
    heroTitle: "Amanda is on track this week.",
    heroCopy: "Attendance is stable, assignments are mostly complete, and Physics has one academic risk flag requiring attention.",
    nav: ["Overview", "Attendance", "Grades", "Assignments", "AI Weekly Report", "Teacher Feedback", "Warnings"],
    heroMetrics: [
      ["92%", "Attendance"],
      ["86%", "Work complete"],
      ["1", "Warning"],
    ],
    metrics: [
      ["This week attendance", "5/5", "green"],
      ["Late assignments", "1", "amber"],
      ["Teacher feedback", "3", "blue"],
      ["AI report", "Ready", "green"],
    ],
    primaryEyebrow: "Child Progress",
    primaryTitle: "This Week Summary",
    primaryAction: "Download report",
    primary: [
      ["Mon", "Strong EALD participation", "Teacher note added", "Positive"],
      ["Tue", "Physics quiz below target", "Needs vector practice", "Watch"],
      ["Thu", "Maths homework submitted", "Marked 84%", "Done"],
      ["Fri", "AI weekly report generated", "Parent summary ready", "Ready"],
    ],
    insightTitle: "Parent Summary",
    insight: ["One area to support", "Amanda understands the concepts but rushes multi-step Physics problems. Encourage her to show diagrams before calculation."],
    bars: [
      ["Attendance", 92],
      ["Assignment completion", 86],
      ["Learning activity", 74],
      ["Teacher feedback", 88],
    ],
    tableTitle: "Teacher Feedback",
    tableHead: ["Date", "Teacher", "Subject", "Feedback"],
    table: [
      ["May 23", "Ms Tan", "EALD", "Essay structure improved"],
      ["May 22", "Mr Lim", "Physics", "Needs vector diagram practice"],
      ["May 20", "Ms Wong", "Maths", "Good algebra accuracy"],
    ],
  },
  teacher: {
    label: "Teacher Portal",
    title: "Teaching Dashboard",
    action: "Create Assignment",
    focus: "4 classes · 23 submissions",
    heroTitle: "Today’s teaching load is ready.",
    heroCopy: "You have two attendance sessions, one assignment to release, and 23 submissions waiting for review.",
    nav: ["Today Classes", "Attendance", "Assignments", "Grade Entry", "WACE Teacher Marks", "Materials", "AI Quiz Generator", "Class Analytics"],
    heroMetrics: [
      ["4", "Classes"],
      ["23", "To mark"],
      ["2", "Risk students"],
    ],
    metrics: [
      ["Attendance pending", "2", "amber"],
      ["Submissions", "23", "blue"],
      ["Marked today", "11", "green"],
      ["Risk flags", "2", "red"],
    ],
    primaryEyebrow: "Teaching",
    primaryTitle: "Classes & Marking Queue",
    primaryAction: "Open class list",
    primary: [
      ["08:30", "G10 EALD", "Mark attendance", "Pending"],
      ["10:00", "G10 Physics", "Lab session", "Ready"],
      ["12:10", "Release quiz", "Forces and motion", "Draft"],
      ["14:00", "Mark submissions", "23 waiting", "Action"],
    ],
    insightTitle: "AI Teaching Assistant",
    insight: ["Quiz suggestion", "Generate a 12-question formative quiz on force diagrams with three difficulty bands and automatic worked solutions."],
    bars: [
      ["G10 Physics", 72],
      ["G10 EALD", 84],
      ["G11 Physics", 68],
      ["G9 Science", 81],
    ],
    tableTitle: "Risk Students",
    tableHead: ["Student", "Class", "Signal", "Next Action"],
    table: [
      ["Amanda Lee", "G10 Physics", "Quiz drop", "Assign practice set"],
      ["Jason Ng", "G11 Physics", "Low attendance", "Notify parent"],
      ["Priya Shah", "G10 EALD", "Late work", "Check workload"],
    ],
  },
  academic_director: {
    label: "Academic Director",
    title: "Academic Overview",
    action: "Review Risks",
    focus: "12 risk flags · 3 programmes",
    heroTitle: "Academic performance needs attention in Physics.",
    heroCopy: "WACE Grade 10 Physics has the highest risk concentration this week, driven by quiz results and incomplete homework.",
    nav: ["Overview", "Programmes", "Subjects", "Classes", "Student Timetables", "WACE Teacher Marks", "At-risk Students", "Teacher Workload", "Assessment Calendar"],
    heroMetrics: [
      ["3", "Programmes"],
      ["12", "Risk flags"],
      ["87%", "Attendance"],
    ],
    metrics: [
      ["Programme health", "82%", "blue"],
      ["At-risk students", "12", "red"],
      ["Attendance avg", "87%", "amber"],
      ["Assessments due", "6", "blue"],
    ],
    primaryEyebrow: "Academic Management",
    primaryTitle: "Programme Signals",
    primaryAction: "Open analytics",
    primary: [
      ["WACE", "Grade 10 Physics under target", "Avg 71%", "Watch"],
      ["A-Level", "Chemistry stable", "Avg 82%", "Good"],
      ["O-Level", "Attendance below target", "84%", "Action"],
      ["EALD", "Writing improvement", "+6 pts", "Good"],
    ],
    insightTitle: "Director Insight",
    insight: ["Intervention needed", "Create a two-week Physics support block for G10 students scoring below 75 and track AI Tutor activity against quiz recovery."],
    bars: [
      ["WACE", 78],
      ["A-Level", 84],
      ["O-Level", 76],
      ["EALD", 88],
    ],
    tableTitle: "At-risk Students",
    tableHead: ["Student", "Programme", "Risk", "Owner"],
    table: [
      ["Amanda Lee", "WACE G10", "Physics quiz decline", "Mr Lim"],
      ["Jason Ng", "WACE G11", "Attendance 72%", "Ms Tan"],
      ["Chen Wei", "O-Level", "3 late assignments", "Mr Koh"],
    ],
  },
  qa_mr: {
    label: "QA / MR Portal",
    title: "EduTrust Evidence",
    action: "Export Evidence",
    focus: "38 evidence items",
    heroTitle: "Compliance evidence is being collected automatically.",
    heroCopy: "Attendance records, assessment activity, teacher feedback and AI learning logs are ready for review and export.",
    nav: ["Evidence Dashboard", "Attendance Evidence", "Assessment Evidence", "WACE Teacher Marks", "AI Interaction Logs", "Audit Logs", "Compliance Checklist", "Exports"],
    heroMetrics: [
      ["38", "Evidence"],
      ["6", "Open gaps"],
      ["94%", "Logged"],
    ],
    metrics: [
      ["Attendance logs", "94%", "green"],
      ["Assessment evidence", "31", "blue"],
      ["AI interactions", "128", "blue"],
      ["Open gaps", "6", "amber"],
    ],
    primaryEyebrow: "EduTrust",
    primaryTitle: "Evidence Queue",
    primaryAction: "Export pack",
    primary: [
      ["APSO", "Attendance register uploaded", "G10 WACE", "Complete"],
      ["Assessment", "Physics quiz evidence", "Rubric missing", "Gap"],
      ["Feedback", "Parent weekly summary", "Generated", "Complete"],
      ["AI Logs", "Tutor interactions archived", "128 records", "Complete"],
    ],
    insightTitle: "Compliance Insight",
    insight: ["Evidence gap", "Physics assessment records need rubric attachment before monthly export. Notify subject teacher and academic director."],
    bars: [
      ["Attendance", 94],
      ["Assessment", 82],
      ["Feedback", 76],
      ["AI Logs", 91],
    ],
    tableTitle: "Audit Trail",
    tableHead: ["Time", "User", "Action", "Evidence"],
    table: [
      ["09:12", "Mr Lim", "Marked attendance", "G10 Physics"],
      ["10:44", "AI Tutor", "Logged interaction", "Amanda Lee"],
      ["11:20", "Ms Tan", "Uploaded feedback", "EALD writing"],
    ],
  },
};

const roleSelect = document.querySelector("#role-select");
const navList = document.querySelector("#nav-list");
const viewEyebrow = document.querySelector("#view-eyebrow");
const viewTitle = document.querySelector("#view-title");
const todayFocus = document.querySelector("#today-focus");
const quickAction = document.querySelector("#quick-action");
const heroTitle = document.querySelector("#hero-title");
const heroCopy = document.querySelector("#hero-copy");
const heroMetrics = document.querySelector("#hero-metrics");
const metricGrid = document.querySelector("#metric-grid");
const primaryEyebrow = document.querySelector("#primary-eyebrow");
const primaryTitle = document.querySelector("#primary-title");
const primaryAction = document.querySelector("#primary-action");
const primaryList = document.querySelector("#primary-list");
const insightTitle = document.querySelector("#insight-title");
const insightCard = document.querySelector("#insight-card");
const secondaryEyebrow = document.querySelector("#secondary-eyebrow");
const secondaryTitle = document.querySelector("#secondary-title");
const barList = document.querySelector("#bar-list");
const tableTitle = document.querySelector("#table-title");
const tableHead = document.querySelector("#table-head");
const tableBody = document.querySelector("#table-body");
const aiModal = document.querySelector("#ai-modal");
const aiAnswer = document.querySelector("#ai-answer");
const qrModal = document.querySelector("#qr-modal");
const qrCanvas = document.querySelector("#qr-canvas");
const qrTitle = document.querySelector("#qr-title");
const qrLink = document.querySelector("#qr-link");
const assignmentModal = document.querySelector("#assignment-modal");
const assignmentStudent = document.querySelector("#assignment-student");
const assignmentSubject = document.querySelector("#assignment-subject");
const assignmentTitle = document.querySelector("#assignment-title");
const assignmentDue = document.querySelector("#assignment-due");
const assignmentStatus = document.querySelector("#assignment-status");
const assignmentNote = document.querySelector("#assignment-note");
const STORAGE_KEY = "bci-academic-portal-state-v2";
const STATE_SCHEMA_VERSION = 4;
const CURRENT_STUDENT_NAME = "Amanda Lee";

const defaultRecords = {
  assignments: [
    { id: "a1", scope: "Individual", student: "Amanda Lee", className: "", subject: "Maths", title: "Quadratic practice", due: "Today 13:30", status: "Due", score: "", assignedBy: "Ms Wong" },
    { id: "a2", scope: "Individual", student: "Amanda Lee", className: "", subject: "EALD", title: "Essay draft", due: "May 24", status: "Returned", score: "88", assignedBy: "Ms Tan" },
    { id: "a3", scope: "Individual", student: "Jason Ng", className: "", subject: "Physics", title: "Force diagram worksheet", due: "May 23", status: "Late", score: "", assignedBy: "Mr Lim" },
    { id: "a4", scope: "Class", student: "", className: "G10 Physics", subject: "Physics", title: "Lab safety reflection", due: "May 25", status: "Due", score: "", assignedBy: "Mr Lim" },
  ],
  assignmentSubmissions: [
    { id: "as1", assignmentId: "a2", student: "Amanda Lee", submittedAt: "May 23 11:10", status: "Returned", fileName: "essay-draft-amanda.pdf", feedback: "Essay structure improved", score: "88" },
  ],
  attendance: [
    { id: "at1", student: "Amanda Lee", className: "G10 Physics", date: "May 23", status: "Present" },
    { id: "at2", student: "Jason Ng", className: "G11 Physics", date: "May 23", status: "Absent" },
    { id: "at3", student: "Priya Shah", className: "G10 EALD", date: "May 23", status: "Present" },
  ],
  teacherSubjects: [
    { teacher: "Mr Lim", subject: "Physics", permission: "teach", canCreateAssignments: true, canEnterMarks: true },
    { teacher: "Ms Wong", subject: "Mathematics", permission: "teach", canCreateAssignments: true, canEnterMarks: true },
    { teacher: "Ms Wong", subject: "Mathematics Methods", permission: "lead", canCreateAssignments: true, canEnterMarks: true },
    { teacher: "Ms Tan", subject: "EALD", permission: "teach", canCreateAssignments: true, canEnterMarks: true },
    { teacher: "Ms Tan", subject: "English General", permission: "moderate", canCreateAssignments: true, canEnterMarks: false },
    { teacher: "Mr Koh", subject: "Chemistry", permission: "teach", canCreateAssignments: true, canEnterMarks: true },
  ],
  studentTimetables: [
    { id: "tt1", student: "Amanda Lee", year: "Year 10", programme: "WACE", day: "Mon", time: "08:30", subject: "EALD", teacher: "Ms Tan", room: "204", status: "Scheduled" },
    { id: "tt2", student: "Amanda Lee", year: "Year 10", programme: "WACE", day: "Mon", time: "10:00", subject: "Physics", teacher: "Mr Lim", room: "Lab 2", status: "Scheduled" },
    { id: "tt3", student: "Amanda Lee", year: "Year 10", programme: "WACE", day: "Tue", time: "13:30", subject: "Mathematics", teacher: "Ms Wong", room: "301", status: "Scheduled" },
    { id: "tt4", student: "Jason Ng", year: "Year 11", programme: "WACE", day: "Mon", time: "10:00", subject: "Physics", teacher: "Mr Lim", room: "Lab 2", status: "Scheduled" },
    { id: "tt5", student: "Jason Ng", year: "Year 11", programme: "WACE", day: "Mon", time: "10:00", subject: "Mathematics Methods", teacher: "Ms Wong", room: "301", status: "Conflict" },
    { id: "tt6", student: "Jason Ng", year: "Year 11", programme: "WACE", day: "Wed", time: "11:20", subject: "Chemistry", teacher: "Mr Koh", room: "Lab 1", status: "Scheduled" },
    { id: "tt7", student: "Priya Shah", year: "Year 12", programme: "WACE", day: "Tue", time: "09:20", subject: "Chemistry", teacher: "Mr Koh", room: "Lab 1", status: "Scheduled" },
    { id: "tt8", student: "Priya Shah", year: "Year 12", programme: "WACE", day: "Thu", time: "14:10", subject: "English General", teacher: "Ms Tan", room: "205", status: "Scheduled" },
  ],
  grades: [
    { id: "g1", student: "Amanda Lee", subject: "Maths", assessment: "Algebra quiz", score: 84, trend: "Stable" },
    { id: "g2", student: "Amanda Lee", subject: "Physics", assessment: "Forces quiz", score: 71, trend: "Risk" },
    { id: "g3", student: "Amanda Lee", subject: "EALD", assessment: "Essay draft", score: 88, trend: "Improving" },
  ],
  waceOutlines: [
    {
      id: "wo1",
      year: "Year 10",
      semester: "Semester 2",
      course: "Physics",
      units: "Pre-WACE pathway",
      courseType: "School preparation",
      teacher: "Mr Lim",
      status: "Published",
      tasks: [
        { id: "t1", title: "Forces investigation", type: "Investigation", weight: 25, maxMark: 50, due: "Week 4", evidence: "Rubric + student report" },
        { id: "t2", title: "Motion test", type: "Test", weight: 35, maxMark: 80, due: "Week 7", evidence: "Marked test paper" },
        { id: "t3", title: "Practical portfolio", type: "Portfolio", weight: 40, maxMark: 60, due: "Week 10", evidence: "Portfolio sample" },
      ],
    },
    {
      id: "wo2",
      year: "Year 11",
      semester: "Units 1 & 2",
      course: "Mathematics Methods",
      units: "ATAR Units 1 & 2",
      courseType: "ATAR",
      teacher: "Ms Wong",
      status: "Published",
      tasks: [
        { id: "t1", title: "Functions response", type: "Response", weight: 40, maxMark: 80, due: "Week 5", evidence: "Marked script" },
        { id: "t2", title: "Calculus investigation", type: "Investigation", weight: 20, maxMark: 50, due: "Week 8", evidence: "Investigation report" },
        { id: "t3", title: "Semester exam", type: "Examination", weight: 40, maxMark: 100, due: "Exam week", evidence: "Exam script" },
      ],
    },
    {
      id: "wo3",
      year: "Year 12",
      semester: "Semester 1",
      course: "Chemistry",
      units: "ATAR Units 3 & 4",
      courseType: "ATAR",
      teacher: "Mr Koh",
      status: "Director review",
      tasks: [
        { id: "t1", title: "Equilibrium investigation", type: "Investigation", weight: 20, maxMark: 50, due: "Week 3", evidence: "Lab report + rubric" },
        { id: "t2", title: "Organic chemistry test", type: "Test", weight: 30, maxMark: 60, due: "Week 6", evidence: "Marked test paper" },
        { id: "t3", title: "Semester 1 exam", type: "Examination", weight: 50, maxMark: 100, due: "Exam week", evidence: "Exam script" },
      ],
    },
    {
      id: "wo4",
      year: "Year 12",
      semester: "Semester 1",
      course: "English General",
      units: "General Units 3 & 4",
      courseType: "General",
      teacher: "Ms Tan",
      status: "Draft",
      tasks: [
        { id: "t1", title: "Response essay", type: "Response", weight: 35, maxMark: 50, due: "Week 4", evidence: "Annotated essay" },
        { id: "t2", title: "Externally Set Task", type: "EST", weight: 15, maxMark: 50, isEst: true, due: "EST window", evidence: "EST script" },
        { id: "t3", title: "Oral presentation", type: "Oral", weight: 25, maxMark: 40, due: "Week 8", evidence: "Recording + rubric" },
        { id: "t4", title: "Semester production", type: "Production", weight: 25, maxMark: 50, due: "Week 10", evidence: "Student work sample" },
      ],
    },
  ],
  waceResults: [
    { id: "wr1", outlineId: "wo1", student: "Amanda Lee", marks: { t1: 35, t2: 59, t3: 47 }, status: "Teacher entered", released: false },
    { id: "wr2", outlineId: "wo1", student: "Daniel Ho", marks: { t1: 41, t2: 63, t3: 50 }, status: "Teacher entered", released: false },
    { id: "wr3", outlineId: "wo2", student: "Jason Ng", marks: { t1: 54, t2: 36, t3: 65 }, status: "Draft", released: false },
    { id: "wr4", outlineId: "wo2", student: "Mei Chen", marks: { t1: 70, t2: 42, t3: 90 }, status: "Teacher entered", released: false },
    { id: "wr5", outlineId: "wo3", student: "Priya Shah", marks: { t1: 41, t2: 47, t3: 80 }, status: "Director review", released: false },
    { id: "wr6", outlineId: "wo3", student: "Liam Tan", marks: { t1: 38, t2: 43, t3: 74 }, status: "Director review", released: false },
    { id: "wr7", outlineId: "wo4", student: "Amanda Lee", marks: { t1: 39, t2: 37, t3: 33, t4: 40 }, status: "Draft", released: false },
  ],
  aiLogs: [
    { id: "ai1", time: "May 22 10:44", student: "Amanda Lee", subject: "Physics", prompt: "Newton's Laws", outcome: "Logged" },
  ],
  evidence: [
    { id: "e1", type: "Attendance", item: "G10 Physics register", owner: "Mr Lim", status: "Complete" },
    { id: "e2", type: "Assessment", item: "Physics quiz rubric", owner: "Mr Lim", status: "Gap" },
    { id: "e3", type: "AI Logs", item: "Tutor interaction archive", owner: "System", status: "Complete" },
  ],
  qrSessions: [
    { id: "qr1", className: "G10 Physics", session: "10:00 Lesson", createdAt: "May 23 09:45", status: "Active", url: "http://127.0.0.1:4180/academic-portal/?checkin=qr1" },
  ],
  risks: [
    { id: "r1", student: "Amanda Lee", programme: "WACE G10", signal: "Physics quiz decline", owner: "Mr Lim", status: "Open" },
    { id: "r2", student: "Jason Ng", programme: "WACE G11", signal: "Attendance 72%", owner: "Ms Tan", status: "Open" },
  ],
};

let appState = loadState();
let currentRole = normalizeRole(appState.currentRole);
let currentModule = appState.currentModule || 0;
let authLockedRole = false;

function normalizeRole(role) {
  if (role === "director") return "academic_director";
  if (role === "qa") return "qa_mr";
  return role || "student";
}

function mergeStateWithDefaults(saved = {}) {
  const base = structuredClone(defaultRecords);
  const merged = { ...base, ...saved };
  Object.keys(base).forEach((key) => {
    if (Array.isArray(base[key]) && !Array.isArray(merged[key])) {
      merged[key] = base[key];
    }
  });
  if (!Array.isArray(merged.waceOutlines) || merged.waceOutlines.length === 0) merged.waceOutlines = base.waceOutlines;
  if (!Array.isArray(merged.waceResults) || merged.waceResults.length === 0) merged.waceResults = base.waceResults;
  if (!Array.isArray(merged.studentTimetables) || merged.studentTimetables.length === 0) merged.studentTimetables = base.studentTimetables;
  if (!Array.isArray(merged.assignmentSubmissions)) merged.assignmentSubmissions = base.assignmentSubmissions;
  merged.assignments = merged.assignments.map((item) => ({
    scope: item.scope || (item.student ? "Individual" : "Class"),
    className: item.className || "",
    assignedBy: item.assignedBy || "Teacher",
    ...item,
  }));
  merged.qrSessions = merged.qrSessions.map((item) => ({
    expiresAt: item.expiresAt || new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    signature: item.signature || hashText(`${item.id}:${item.className}:${item.session}`).toString(16),
    ...item,
  }));
  merged.currentRole = normalizeRole(merged.currentRole);
  merged.currentModule = Number.isFinite(Number(merged.currentModule)) ? Number(merged.currentModule) : 0;
  merged.schemaVersion = STATE_SCHEMA_VERSION;
  return merged;
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? mergeStateWithDefaults(saved) : mergeStateWithDefaults();
  } catch (error) {
    return mergeStateWithDefaults();
  }
}

function saveState() {
  appState.currentRole = currentRole;
  appState.currentModule = currentModule;
  appState.schemaVersion = STATE_SCHEMA_VERSION;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
}

async function bootstrapCloudRole() {
  const configStatus = window.AcademicDataAdapter?.getConfigStatus?.();
  if (!configStatus?.configured) {
    appState.cloud = { configured: false, reason: configStatus?.reason || "Supabase adapter unavailable" };
    saveState();
    return;
  }
  try {
    const profile = await window.AcademicDataAdapter.getMyPortalRole();
    if (!profile?.role) return;
    const role = normalizeRole(profile.role);
    const roleBackend = await window.AcademicDataAdapter.loadRoleBackend(role);
    appState.cloud = window.AcademicDataAdapter.mapBackendToPrototypeState(role, roleBackend);
    authLockedRole = true;
    currentRole = role;
    currentModule = 0;
    roleSelect.value = role;
    roleSelect.disabled = true;
    saveState();
    renderPortal(currentRole, currentModule);
    showToast(`Logged in as ${profile.full_name || role}`);
  } catch (error) {
    console.warn("Supabase role bootstrap failed:", error);
    showToast("Cloud role unavailable; using demo data");
  }
}

function todayLabel() {
  return new Date().toLocaleDateString("en-SG", { month: "short", day: "numeric" });
}

function dateInputValue(daysFromToday = 1) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  return date.toISOString().slice(0, 10);
}

function displayDateFromInput(value) {
  if (!value) return todayLabel();
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-SG", { month: "short", day: "numeric" });
}

function isoFromDateInput(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 23, 59, 0).toISOString();
}

function showToast(message) {
  let toast = document.querySelector("#toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function scoreAverage(records = appState.grades) {
  if (!records.length) return 0;
  return Math.round(records.reduce((sum, item) => sum + Number(item.score || 0), 0) / records.length);
}

function attendanceRate() {
  if (!appState.attendance.length) return 0;
  const present = appState.attendance.filter((item) => item.status === "Present").length;
  return Math.round((present / appState.attendance.length) * 100);
}

function openAssignmentsCount(role = currentRole) {
  return visibleAssignmentsForRole(role).filter((item) => canSubmitAssignment(item)).length;
}

function openRiskCount() {
  return appState.risks.filter((item) => item.status === "Open").length;
}

function waceAverage() {
  const aggregates = waceAggregates();
  if (!aggregates.length) return 0;
  return Math.round(aggregates.reduce((sum, item) => sum + item.schoolMark, 0) / aggregates.length);
}

function waceStatusCount(status) {
  return appState.waceResults.filter((item) => item.status === status).length;
}

const WACE_ASSESSMENT_TYPES = [
  "Investigation", "Response", "Examination", "Test",
  "EST", "Practical", "Portfolio", "Oral", "Production", "Performance",
];

const WACE_GRADE_THRESHOLDS = [
  { grade: "A", label: "Excellent", min: 75 },
  { grade: "B", label: "High", min: 65 },
  { grade: "C", label: "Satisfactory", min: 50 },
  { grade: "D", label: "Low", min: 35 },
  { grade: "E", label: "Inadequate", min: 0 },
];

function gradeFromMark(mark) {
  const entry = WACE_GRADE_THRESHOLDS.find((t) => mark >= t.min);
  return `${entry?.grade || "E"}*`;
}

function provisionalGradeNote() {
  return "Provisional grade pending grade-description review";
}

function legacyGradeFromMark(mark) {
  const entry = WACE_GRADE_THRESHOLDS.find((t) => mark >= t.min);
  return entry?.grade || "E";
}

function outlineById(id) {
  return appState.waceOutlines.find((outline) => outline.id === id);
}

function outlineWeightTotal(outline) {
  if (!outline) return 0;
  return outline.tasks.reduce((sum, task) => sum + Number(task.weight || 0), 0);
}

function outlineWeightsValid(outline) {
  return outlineWeightTotal(outline) === 100;
}

function outlineHasEst(outline) {
  return outline?.tasks.some((task) => task.isEst || task.type === "EST");
}

function outlineEstRequired(outline) {
  return outline?.courseType === "General" || outline?.courseType === "Foundation";
}

function outlineValidationErrors(outline) {
  const errors = [];
  if (!outlineWeightsValid(outline)) errors.push(`Weights sum to ${outlineWeightTotal(outline)}%, must be 100%`);
  if (outlineEstRequired(outline) && !outlineHasEst(outline)) errors.push("General/Foundation courses require an EST task");
  const types = new Set(outline?.tasks.map((t) => t.type) || []);
  if (types.size === 0) errors.push("No assessment tasks defined");
  return errors;
}

function schoolMarkForResult(result) {
  const outline = outlineById(result.outlineId);
  if (!outline) return 0;
  const totalWeight = outline.tasks.reduce((sum, task) => sum + Number(task.weight || 0), 0) || 100;
  const weighted = outline.tasks.reduce((sum, task) => {
    const rawMark = Number(result.marks?.[task.id] || 0);
    const maxMark = Number(task.maxMark || 100);
    const pct = maxMark > 0 ? (rawMark / maxMark) * 100 : 0;
    return sum + pct * (Number(task.weight || 0) / totalWeight);
  }, 0);
  return Math.round(weighted);
}

function waceAggregates() {
  const rows = appState.waceResults.map((result) => {
    const outline = outlineById(result.outlineId);
    const schoolMark = schoolMarkForResult(result);
    return {
      ...result,
      outline,
      schoolMark,
      grade: gradeFromMark(schoolMark),
      rank: 0,
    };
  });

  appState.waceOutlines.forEach((outline) => {
    rows
      .filter((row) => row.outlineId === outline.id)
      .sort((a, b) => b.schoolMark - a.schoolMark)
      .forEach((row, index) => { row.rank = index + 1; });
  });

  return rows;
}

function waceCoveragePercent() {
  if (!appState.waceOutlines.length) return 0;
  const covered = appState.waceOutlines.filter((outline) => outlineValidationErrors(outline).length === 0).length;
  return Math.round((covered / appState.waceOutlines.length) * 100);
}

function timetableStudents() {
  const map = new Map();
  appState.studentTimetables.forEach((item) => {
    if (!map.has(item.student)) {
      map.set(item.student, {
        student: item.student,
        year: item.year,
        programme: item.programme,
        lessons: 0,
        conflicts: 0,
        subjects: new Set(),
      });
    }
    const row = map.get(item.student);
    row.lessons += 1;
    row.subjects.add(item.subject);
    if (item.status === "Conflict") row.conflicts += 1;
  });
  return Array.from(map.values()).map((item) => ({
    ...item,
    subjects: Array.from(item.subjects),
  }));
}

function teacherCan(subject, capability) {
  const permission = appState.teacherSubjects.find((item) => item.subject === subject);
  if (!permission) return false;
  if (capability === "assign") return permission.canCreateAssignments;
  if (capability === "mark") return permission.canEnterMarks;
  return true;
}

function visibleAssignmentsForRole(role) {
  if (role !== "student") return appState.assignments;
  return appState.assignments.filter((item) => item.scope === "Class" || item.student === CURRENT_STUDENT_NAME);
}

function submissionForAssignment(assignment, student = CURRENT_STUDENT_NAME) {
  return appState.assignmentSubmissions.find((item) => item.assignmentId === assignment?.id && item.student === student);
}

function assignmentDisplayStatus(assignment, student = CURRENT_STUDENT_NAME) {
  const submission = submissionForAssignment(assignment, student);
  return submission?.status || assignment?.status || "Due";
}

function canSubmitAssignment(assignment, student = CURRENT_STUDENT_NAME) {
  const status = assignmentDisplayStatus(assignment, student);
  return ["Due", "Late", "Draft", "Published"].includes(status);
}

function submitAssignmentLocally(assignment, student = CURRENT_STUDENT_NAME) {
  if (!assignment) return false;
  if (!canSubmitAssignment(assignment, student)) return false;

  const submittedAt = new Date().toLocaleString("en-SG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const existing = submissionForAssignment(assignment, student);
  if (existing) {
    existing.status = "Submitted";
    existing.submittedAt = submittedAt;
    existing.fileName = existing.fileName || `${assignment.subject.toLowerCase().replaceAll(" ", "-")}-submission.pdf`;
  } else {
    appState.assignmentSubmissions.push({
      id: `as${Date.now()}`,
      assignmentId: assignment.id,
      student,
      submittedAt,
      status: "Submitted",
      fileName: `${assignment.subject.toLowerCase().replaceAll(" ", "-")}-submission.pdf`,
      feedback: "",
      score: "",
    });
  }

  if (assignment.scope === "Individual" && assignment.student === student) {
    assignment.status = "Submitted";
  }
  appState.evidence.push({
    id: `e${Date.now()}`,
    type: "Assignment Submission",
    item: `${student} submitted ${assignment.subject} · ${assignment.title}`,
    owner: student,
    status: "Complete",
  });
  return true;
}

function cloudConfigured() {
  return Boolean(window.AcademicDataAdapter?.hasSupabaseConfig?.());
}

async function submitAssignmentRecord(assignment, student = CURRENT_STUDENT_NAME) {
  if (!assignment || !canSubmitAssignment(assignment, student)) return false;

  const localSubmitted = submitAssignmentLocally(assignment, student);
  const submission = submissionForAssignment(assignment, student);
  if (!cloudConfigured()) return localSubmitted;

  try {
    await window.AcademicDataAdapter.submitAssignment({
      assignmentId: assignment.cloudAssignmentId || assignment.id,
      studentId: assignment.cloudStudentId || submission?.cloudStudentId,
      fileName: submission?.fileName || `${assignment.subject.toLowerCase().replaceAll(" ", "-")}-submission.pdf`,
    });
    submission.cloudSynced = true;
    showToast("Assignment submitted to database");
  } catch (error) {
    console.warn("Cloud assignment submission failed:", error);
    submission.cloudSynced = false;
    showToast("Saved locally; database submit failed");
  }

  return localSubmitted;
}

function badgeClass(label) {
  const lower = String(label).toLowerCase();
  if (lower.includes("risk") || lower.includes("gap") || lower.includes("action") || lower.includes("warning")) return "red";
  if (lower.includes("pending") || lower.includes("watch") || lower.includes("due") || lower.includes("draft") || lower.includes("review")) return "amber";
  if (lower.includes("good") || lower.includes("ready") || lower.includes("done") || lower.includes("complete") || lower.includes("approved") || lower.includes("entered")) return "green";
  return "blue";
}

function statusButton(label, action, id) {
  return `<button class="mini-action" type="button" data-action="${action}" data-id="${id}">${label}</button>`;
}

function buildDashboard(role) {
  const data = portalData[role];
  const avg = scoreAverage();
  const attendance = attendanceRate();
  const openAssignments = openAssignmentsCount(role);
  const risks = openRiskCount();

  const dynamic = {
    student: {
      heroMetrics: [[`${attendance}%`, "Attendance"], [`${openAssignments}`, "Open tasks"], [`${avg}`, "Avg score"]],
      metrics: [["Attendance", `${attendance}%`, attendance >= 90 ? "green" : "amber"], ["Assignments open", `${openAssignments}`, openAssignments > 2 ? "amber" : "blue"], ["AI sessions", `${appState.aiLogs.length}`, "green"], ["Risk alerts", `${risks}`, risks ? "amber" : "green"]],
      table: appState.aiLogs.slice(-4).reverse().map((log) => [log.time, log.subject, log.prompt, log.outcome]),
    },
    parent: {
      heroMetrics: [[`${attendance}%`, "Attendance"], [`${Math.max(0, 100 - openAssignments * 7)}%`, "Work complete"], [`${risks}`, "Warnings"]],
      metrics: [["This week attendance", `${attendance}%`, attendance >= 90 ? "green" : "amber"], ["Open assignments", `${openAssignments}`, openAssignments ? "amber" : "green"], ["Teacher feedback", "3", "blue"], ["AI logs", `${appState.aiLogs.length}`, "green"]],
      table: appState.risks.map((risk) => [risk.student, risk.programme, risk.signal, risk.status]),
    },
    teacher: {
      heroMetrics: [["4", "Classes"], [`${appState.assignments.length}`, "Assignments"], [`${risks}`, "Risk students"]],
      metrics: [["Authorised subjects", `${appState.teacherSubjects.length}`, "blue"], ["Open submissions", `${openAssignments}`, "amber"], ["Marked grades", `${appState.grades.length}`, "green"], ["Risk flags", `${risks}`, risks ? "red" : "green"]],
      table: appState.risks.map((risk) => [risk.student, risk.programme, risk.signal, risk.status]),
    },
    admin: {
      heroMetrics: [["3", "Students"], ["4", "Teachers"], [`${appState.evidence.length}`, "Evidence"]],
      metrics: [["Students", "3", "blue"], ["Teachers", "4", "blue"], ["WACE results", `${appState.waceResults.length}`, "blue"], ["Evidence gaps", `${appState.evidence.filter((item) => item.status === "Gap").length}`, "amber"]],
      table: appState.evidence.map((item) => [item.type, item.item, item.owner, item.status]),
    },
    academic_director: {
      heroMetrics: [["3", "Programmes"], [`${risks}`, "Risk flags"], [`${attendance}%`, "Attendance"]],
      metrics: [["Programme health", `${Math.round((avg + attendance) / 2)}%`, "blue"], ["At-risk students", `${risks}`, risks ? "red" : "green"], ["Attendance avg", `${attendance}%`, attendance >= 90 ? "green" : "amber"], ["AI interventions", `${appState.aiLogs.length}`, "blue"]],
      table: appState.risks.map((risk) => [risk.student, risk.programme, risk.signal, risk.owner]),
    },
    qa_mr: {
      heroMetrics: [[`${appState.evidence.length}`, "Evidence"], [`${appState.evidence.filter((item) => item.status === "Gap").length}`, "Open gaps"], [`${attendance}%`, "Logged"]],
      metrics: [["Attendance logs", `${attendance}%`, attendance >= 90 ? "green" : "amber"], ["Evidence items", `${appState.evidence.length}`, "blue"], ["AI interactions", `${appState.aiLogs.length}`, "blue"], ["Open gaps", `${appState.evidence.filter((item) => item.status === "Gap").length}`, "amber"]],
      table: appState.evidence.map((item) => [item.type, item.item, item.owner, item.status]),
    },
  }[role];

  return {
    ...data,
    heroMetrics: dynamic.heroMetrics,
    metrics: dynamic.metrics,
    table: dynamic.table,
  };
}

function buildModuleView(role, moduleName) {
  const dashboard = buildDashboard(role);
  if (["Dashboard", "Overview", "Today Classes", "Evidence Dashboard"].includes(moduleName)) return dashboard;

  if (moduleName.includes("WACE Teacher Marks") && !["admin", "teacher", "academic_director", "qa_mr"].includes(role)) {
    return buildModuleView(role, "Grades");
  }

  if (moduleName.includes("Timetable") || moduleName.includes("Today Classes")) {
    return {
      ...dashboard,
      primaryEyebrow: "Class Sessions",
      primaryTitle: "Attendance QR Sessions",
      primaryAction: "Generate attendance QR",
      primary: appState.qrSessions.map((item) => [item.createdAt, item.className, item.session, item.status]),
      insightTitle: "QR Check-in",
      insight: ["Fast classroom attendance", "Teachers can generate a session QR. Students scan it, and the resulting check-in is stored as attendance evidence."],
      tableTitle: "QR Sessions",
      tableHead: ["Created", "Class", "Session", "Status"],
      table: appState.qrSessions.map((item) => [item.createdAt, item.className, item.session, item.status]),
    };
  }

  if (moduleName.includes("Attendance")) {
    return {
      ...dashboard,
      primaryEyebrow: "Attendance",
      primaryTitle: role === "teacher" ? "Mark Attendance" : "Attendance Records",
      primaryAction: role === "teacher" ? "Mark all present" : "Refresh records",
      primary: appState.attendance.map((item) => [item.date, item.student, item.className, item.status]),
      insightTitle: "Attendance Signal",
      insight: ["Attendance is evidence", "Every marked class becomes both a student record and an EduTrust evidence item."],
      tableTitle: "Attendance Log",
      tableHead: ["Date", "Student", "Class", "Status"],
      table: appState.attendance.map((item) => [item.date, item.student, item.className, item.status]),
    };
  }

  if (moduleName.includes("Student Timetables")) {
    const students = timetableStudents();
    const conflictCount = appState.studentTimetables.filter((item) => item.status === "Conflict").length;
    const totalLessons = appState.studentTimetables.length;
    return {
      ...dashboard,
      heroTitle: "Student timetable oversight.",
      heroCopy: "Academic Director can review every student's weekly timetable, identify clashes, check teacher/room allocation and connect schedules to attendance evidence.",
      heroMetrics: [[`${students.length}`, "Students"], [`${totalLessons}`, "Lessons"], [`${conflictCount}`, "Conflicts"]],
      metrics: [["Students scheduled", `${students.length}`, "blue"], ["Weekly lessons", `${totalLessons}`, "blue"], ["Schedule conflicts", `${conflictCount}`, conflictCount ? "red" : "green"], ["Rooms used", `${new Set(appState.studentTimetables.map((item) => item.room)).size}`, "blue"]],
      primaryEyebrow: "Timetable Governance",
      primaryTitle: "Student Schedule Overview",
      primaryAction: "Resolve first conflict",
      primary: students.map((item) => [item.year, item.student, `${item.lessons} lessons · ${item.subjects.join(" / ")}`, item.conflicts ? `${item.conflicts} Conflict` : "Clear"]),
      insightTitle: "Scheduling Control",
      insight: ["Academic Director ownership", "This view is intentionally not exposed to students or parents; they see only their own timetable, while the academic director sees the full scheduling matrix."],
      tableTitle: "All Student Timetable Entries",
      tableHead: ["Student", "Day / Time", "Subject", "Teacher / Room"],
      table: appState.studentTimetables.map((item) => [item.student, `${item.day} ${item.time}`, `${item.subject} · ${item.status}`, `${item.teacher} · ${item.room}`]),
      bars: [
        ["Year 10 load", appState.studentTimetables.filter((item) => item.year === "Year 10").length * 20],
        ["Year 11 load", appState.studentTimetables.filter((item) => item.year === "Year 11").length * 20],
        ["Year 12 load", appState.studentTimetables.filter((item) => item.year === "Year 12").length * 20],
        ["Conflict free", Math.round(((totalLessons - conflictCount) / Math.max(1, totalLessons)) * 100)],
      ],
    };
  }

  if (moduleName.includes("Assignment") || moduleName.includes("Submissions")) {
    const assignments = visibleAssignmentsForRole(currentRole);
    const individualCount = assignments.filter((item) => item.scope === "Individual").length;
    const classCount = assignments.filter((item) => item.scope === "Class").length;
    const openCount = assignments.filter((item) => canSubmitAssignment(item)).length;
    return {
      ...dashboard,
      primaryEyebrow: "Assignments",
      primaryTitle: role === "teacher" ? "Individual & Class Assignments" : "My Assignments",
      primaryAction: role === "teacher" ? "Assign to one student" : role === "student" ? "Submit first due task" : "View assignment report",
      heroMetrics: [[`${assignments.length}`, "Assignments"], [`${individualCount}`, "Individual"], [`${classCount}`, "Class"]],
      metrics: [["Visible assignments", `${assignments.length}`, "blue"], ["Individual tasks", `${individualCount}`, individualCount ? "green" : "amber"], ["Class tasks", `${classCount}`, "blue"], ["Need submit", `${openCount}`, openCount ? "amber" : "green"]],
      primary: assignments.map((item) => [item.due, item.scope === "Individual" ? item.student : item.className, `${item.subject} · ${item.title}`, role === "student" ? assignmentDisplayStatus(item) : item.status]),
      insightTitle: "Assignment Insight",
      insight: role === "student"
        ? ["Submission linked to database", "When a student submits, the system creates an assignment_submissions record linked to the assignment and student."]
        : ["Differentiated work", "Teachers can assign work to a whole class or to one student for intervention, extension or catch-up support."],
      tableTitle: role === "student" ? "My Submission Records" : "Assignment Records",
      tableHead: role === "student" ? ["Due", "Assignment", "Submission", "Action"] : ["Due", "Assigned To", "Subject / Title", "Status"],
      table: role === "student"
        ? assignments.map((item) => {
          const submission = submissionForAssignment(item);
          return [
            item.due,
            `${item.subject} · ${item.title} · ${item.assignedBy || "Teacher"}`,
            submission ? `${submission.status} · ${submission.submittedAt}` : "Not submitted",
            canSubmitAssignment(item) ? "Submit" : assignmentDisplayStatus(item),
          ];
        })
        : assignments.map((item) => [item.due, item.scope === "Individual" ? item.student : item.className, `${item.subject} · ${item.title} · ${item.assignedBy || "Teacher"}`, item.status]),
    };
  }

  if (moduleName.includes("Grade") || moduleName.includes("Subjects") || moduleName.includes("Programmes") || moduleName.includes("Analytics")) {
    if (moduleName.includes("Subjects") && role === "teacher") {
      return {
        ...dashboard,
        primaryEyebrow: "Teacher Permissions",
        primaryTitle: "Authorised Subjects",
        primaryAction: "View subject policy",
        primary: appState.teacherSubjects.map((item) => [item.teacher, item.subject, `${item.permission} · assignments ${item.canCreateAssignments ? "yes" : "no"} · marks ${item.canEnterMarks ? "yes" : "no"}`, item.canEnterMarks ? "Active" : "Restricted"]),
        insightTitle: "Subject Authorisation",
        insight: ["Fixed subject access", "Teachers should only create assignments, enter marks and manage WACE tasks for subjects they are authorised to teach."],
        tableTitle: "Teacher Subject Permissions",
        tableHead: ["Teacher", "Subject", "Permission", "Status"],
        table: appState.teacherSubjects.map((item) => [item.teacher, item.subject, `${item.permission} · create assignments: ${item.canCreateAssignments}`, item.canEnterMarks ? "Can enter marks" : "No mark entry"]),
      };
    }
    return {
      ...dashboard,
      primaryEyebrow: "Academic Results",
      primaryTitle: "Grade Trends",
      primaryAction: role === "teacher" ? "Add grade" : "Review trend",
      primary: appState.grades.map((item) => [item.subject, item.student, item.assessment, `${item.score} · ${item.trend}`]),
      insightTitle: "Grade Signal",
      insight: ["Physics needs support", `Current average score is ${scoreAverage()}. Any score under 75 creates a risk flag for review.`],
      tableTitle: "Gradebook",
      tableHead: ["Subject", "Student", "Assessment", "Score"],
      table: appState.grades.map((item) => [item.subject, item.student, item.assessment, String(item.score)]),
    };
  }

  if (moduleName.includes("WACE Teacher Marks")) {
    const avg = waceAverage();
    const draftCount = waceStatusCount("Draft");
    const reviewCount = waceStatusCount("Director review");
    const aggregates = waceAggregates();
    const releasedCount = aggregates.filter((item) => item.released).length;
    const taskCount = appState.waceOutlines.reduce((sum, outline) => sum + outline.tasks.length, 0);
    return {
      ...dashboard,
      heroTitle: "WACE school-based assessment workflow.",
      heroCopy: "Assessment outlines define task type and weighting; teachers enter task marks; the system calculates school mark, rank and A-E grade before academic director review and release.",
      heroMetrics: [[`${avg}`, "Avg school mark"], [`${waceCoveragePercent()}%`, "Outline coverage"], [`${reviewCount}`, "For review"]],
      metrics: [["Assessment outlines", `${appState.waceOutlines.length}`, "blue"], ["Assessment tasks", `${taskCount}`, "blue"], ["Draft results", `${draftCount}`, draftCount ? "amber" : "green"], ["Released results", `${releasedCount}`, releasedCount ? "green" : "amber"]],
      primaryEyebrow: "WACE Assessment",
      primaryTitle: "Assessment Outline & Task Marks",
      primaryAction: currentRole === "teacher" ? "Enter next task mark" : (currentRole === "admin" || currentRole === "academic_director") ? "Approve reviewed marks" : "Export evidence pack",
      primary: aggregates.map((item) => {
        const outline = item.outline || {};
        const taskSummary = (outline.tasks || []).map((task) => {
          const rawMark = item.marks?.[task.id];
          const markDisplay = rawMark !== undefined ? `${rawMark}/${task.maxMark || 100}` : "—";
          return `${task.type} ${task.weight}% [${markDisplay}]`;
        }).join(" / ");
        return [`${outline.year} · ${outline.semester}`, `${outline.course} · ${outline.courseType} · Rank ${item.rank}`, `${item.student}: ${item.schoolMark} (${item.grade}) · ${taskSummary}`, item.status];
      }),
      insightTitle: "Assessment Rule",
      insight: ["Not a single mark field", `${provisionalGradeNote()}. School mark is calculated from the published assessment outline; final A-E must be confirmed against course grade descriptions.`],
      tableTitle: "Calculated School Marks",
      tableHead: ["Course / Unit", "Student", "School Mark", "Rank / Status"],
      table: aggregates.map((item) => {
        const outline = item.outline || {};
        return [`${outline.year} ${outline.semester} · ${outline.course}`, item.student, `${item.schoolMark} · Grade ${item.grade}`, `Rank ${item.rank} · ${item.status}${item.released ? " · Released" : ""}`];
      }),
      bars: [
        ["Outline coverage", waceCoveragePercent()],
        ["Avg school mark", avg],
        ["Director review", Math.round((reviewCount / Math.max(1, aggregates.length)) * 100)],
        ["Released", Math.round((releasedCount / Math.max(1, aggregates.length)) * 100)],
      ],
    };
  }

  if (moduleName.includes("AI")) {
    return {
      ...dashboard,
      primaryEyebrow: "AI Learning",
      primaryTitle: role === "teacher" ? "AI Quiz Generator" : "AI Tutor Activity",
      primaryAction: "Ask AI Tutor",
      primary: appState.aiLogs.map((item) => [item.time, item.subject, item.prompt, item.outcome]),
      insightTitle: "AI Learning Log",
      insight: ["Every prompt becomes data", "AI interactions are stored as academic activity and can feed weekly reports, risk detection and EduTrust evidence."],
      tableTitle: "AI Interaction Logs",
      tableHead: ["Time", "Subject", "Prompt", "Outcome"],
      table: appState.aiLogs.map((item) => [item.time, item.subject, item.prompt, item.outcome]),
    };
  }

  if (moduleName.includes("Risk") || moduleName.includes("Warnings")) {
    return {
      ...dashboard,
      primaryEyebrow: "Risk Management",
      primaryTitle: "Open Academic Risks",
      primaryAction: "Create intervention",
      primary: appState.risks.map((item) => [item.programme, item.student, item.signal, item.status]),
      insightTitle: "Risk Rule",
      insight: ["Intervention workflow", "Risk flags can be acknowledged, assigned to a teacher, and later closed when grades or attendance recover."],
      tableTitle: "Risk Register",
      tableHead: ["Student", "Programme", "Signal", "Owner"],
      table: appState.risks.map((item) => [item.student, item.programme, item.signal, item.owner]),
    };
  }

  if (moduleName.includes("Evidence") || moduleName.includes("Audit") || moduleName.includes("Compliance") || moduleName.includes("Export")) {
    return {
      ...dashboard,
      primaryEyebrow: "EduTrust",
      primaryTitle: "Evidence Records",
      primaryAction: "Resolve first gap",
      primary: appState.evidence.map((item) => [item.type, item.item, item.owner, item.status]),
      insightTitle: "Compliance Insight",
      insight: ["Evidence pack", "Attendance, assessment, teacher feedback and AI learning records can be exported as an audit-ready pack."],
      tableTitle: "Evidence Register",
      tableHead: ["Type", "Evidence", "Owner", "Status"],
      table: appState.evidence.map((item) => [item.type, item.item, item.owner, item.status]),
    };
  }

  return dashboard;
}

function renderPortal(role, moduleIndex = currentModule) {
  const safeRole = portalData[normalizeRole(role)] ? normalizeRole(role) : "student";
  const nav = portalData[safeRole].nav;
  currentRole = safeRole;
  currentModule = Math.min(moduleIndex, nav.length - 1);
  const moduleName = nav[currentModule];
  const data = buildModuleView(role, moduleName);

  viewEyebrow.textContent = data.label;
  viewTitle.textContent = currentModule === 0 ? data.title : moduleName;
  todayFocus.textContent = data.focus;
  quickAction.textContent = data.action;
  heroTitle.textContent = data.heroTitle;
  heroCopy.textContent = data.heroCopy;
  primaryEyebrow.textContent = data.primaryEyebrow;
  primaryTitle.textContent = data.primaryTitle;
  primaryAction.textContent = data.primaryAction;
  insightTitle.textContent = data.insightTitle;
  secondaryEyebrow.textContent = role === "qa_mr" ? "Coverage" : "Progress";
  secondaryTitle.textContent = role === "admin" ? "System Health" : role === "academic_director" ? "Programme Health" : role === "qa_mr" ? "Evidence Coverage" : "Performance";
  tableTitle.textContent = data.tableTitle;

  navList.innerHTML = nav.map((item, idx) => `<button class="nav-item ${idx === currentModule ? "active" : ""}" type="button" data-module="${idx}">${item}</button>`).join("");
  heroMetrics.innerHTML = data.heroMetrics.map(([value, label]) => `<div class="hero-metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
  metricGrid.innerHTML = data.metrics.map(([label, value, color]) => `<article class="metric-card"><span>${label}</span><strong class="${color}">${value}</strong></article>`).join("");
  primaryList.innerHTML = data.primary.map(([time, title, detail, status], idx) => `
    <div class="timeline-item" data-row="${idx}">
      <time>${time}</time>
      <div><strong>${title}</strong><small>${detail}</small></div>
      <div class="row-actions">
        <span class="badge ${badgeClass(status)}">${status}</span>
        ${moduleName.includes("Attendance") && role === "teacher" ? statusButton("Toggle", "toggle-attendance", idx) : ""}
        ${moduleName.includes("Assignment") && role === "teacher" ? statusButton("Advance", "advance-assignment", idx) : ""}
        ${moduleName.includes("Assignment") && role === "student" && canSubmitAssignment(visibleAssignmentsForRole(role)[idx]) ? statusButton("Submit", "submit-assignment", idx) : ""}
        ${moduleName.includes("WACE Teacher Marks") && role === "teacher" ? statusButton("Submit", "submit-wace-result", idx) : ""}
        ${moduleName.includes("WACE Teacher Marks") && (role === "admin" || role === "academic_director") ? statusButton("Approve/Release", "approve-wace-result", idx) : ""}
        ${moduleName.includes("Student Timetables") && (role === "admin" || role === "academic_director") && String(status).includes("Conflict") ? statusButton("Resolve", "resolve-timetable-conflict", idx) : ""}
        ${moduleName.includes("Risk") || moduleName.includes("Warnings") ? statusButton("Close", "close-risk", idx) : ""}
        ${moduleName.includes("Evidence") || moduleName.includes("Compliance") ? statusButton("Resolve", "resolve-evidence", idx) : ""}
      </div>
    </div>
  `).join("");
  insightCard.innerHTML = `<strong>${data.insight[0]}</strong><span>${data.insight[1]}</span>`;
  barList.innerHTML = data.bars.map(([label, value]) => `
    <div class="bar-row">
      <header><span>${label}</span><strong>${value}%</strong></header>
      <div class="bar-track"><div class="bar-fill" style="width:${value}%"></div></div>
    </div>
  `).join("");
  tableHead.innerHTML = `<tr>${data.tableHead.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  tableBody.innerHTML = data.table.map((row, rowIndex) => `<tr>${row.map((cell, idx) => {
    const isLastCell = idx === row.length - 1;
    if (moduleName.includes("Assignment") && role === "student" && isLastCell && cell === "Submit") {
      return `<td>${statusButton("Submit", "submit-assignment", rowIndex)}</td>`;
    }
    return isLastCell ? `<td><span class="badge ${badgeClass(cell)}">${cell}</span></td>` : `<td>${cell}</td>`;
  }).join("")}</tr>`).join("");
  if (moduleName.includes("WACE Teacher Marks")) {
    tableBody.innerHTML += `
      <tr><td colspan="${data.tableHead.length}"><div class="subtable-title">Assessment Outline Requirements</div></td></tr>
      ${appState.waceOutlines.map((outline) => {
        const errors = outlineValidationErrors(outline);
        const weightLabel = outlineWeightsValid(outline) ? "100%" : `${outlineWeightTotal(outline)}%`;
        const errorHtml = errors.length ? `<br><span class="badge red">${errors.join("; ")}</span>` : "";
        return `
          <tr>
            <td>${outline.year} ${outline.semester} · ${outline.courseType}</td>
            <td>${outline.course}</td>
            <td>${outline.tasks.map((task) => `${task.type} ${task.weight}%${task.isEst ? " (EST)" : ""}`).join(" / ")} · Total: ${weightLabel}${errorHtml}</td>
            <td><span class="badge ${badgeClass(outline.status)}">${outline.status}</span></td>
          </tr>
        `;
      }).join("")}
      <tr><td colspan="${data.tableHead.length}"><div class="subtable-title">WACE Grade Scale: A ≥ 75 · B ≥ 65 · C ≥ 50 · D ≥ 35 · E &lt; 35</div></td></tr>
    `;
  }
  saveState();
}

async function handlePrimaryAction() {
  const moduleName = portalData[currentRole].nav[currentModule];

  if (moduleName.includes("AI")) {
    aiModal.classList.add("active");
    aiModal.setAttribute("aria-hidden", "false");
    return;
  }

  if (moduleName.includes("WACE Teacher Marks")) {
    if (currentRole === "teacher") {
      const target = appState.waceResults.find((item) => item.status === "Draft") || appState.waceResults[0];
      const outline = outlineById(target.outlineId);
      if (!teacherCan(outline?.course, "mark")) {
        showToast(`No mark-entry permission for ${outline?.course || "this subject"}`);
        return;
      }
      const task = outline?.tasks.find((entry) => target.marks[entry.id] === undefined) || outline?.tasks[0];
      if (target && task) {
        target.marks[task.id] = Math.min(100, Number(target.marks[task.id] || 70) + 3);
        target.status = "Teacher entered";
      }
      appState.evidence.push({
        id: `e${Date.now()}`,
        type: "Assessment",
        item: `${outline?.year || "WACE"} ${outline?.course || "course"} task mark entered`,
        owner: outline?.teacher || "Teacher",
        status: "Complete",
      });
      showToast("Task mark entered from assessment outline");
    } else if (currentRole === "admin" || currentRole === "academic_director") {
      appState.waceResults.filter((item) => item.status === "Director review").forEach((item) => { item.status = "Approved"; });
      showToast("Reviewed WACE marks approved");
    } else if (currentRole === "qa_mr") {
      showToast("Evidence pack ready for export");
    } else {
      showToast("WACE teacher marks refreshed");
    }
    renderPortal(currentRole, currentModule);
    return;
  }

  if (moduleName.includes("Student Timetables")) {
    const conflict = appState.studentTimetables.find((item) => item.status === "Conflict");
    if (conflict) {
      conflict.time = "15:20";
      conflict.status = "Scheduled";
      appState.evidence.push({
        id: `e${Date.now()}`,
        type: "Timetable",
        item: `${conflict.student} schedule conflict resolved`,
        owner: "Academic Director",
        status: "Complete",
      });
      showToast("First timetable conflict resolved");
    } else {
      showToast("No timetable conflicts");
    }
    renderPortal(currentRole, currentModule);
    return;
  }

  if (moduleName.includes("Timetable") || moduleName.includes("Today Classes")) {
    if (currentRole === "admin" || currentRole === "teacher" || currentRole === "academic_director") {
      openQrModal();
    } else {
      showToast("Timetable refreshed");
    }
    return;
  }

  if (moduleName.includes("Assignment") && currentRole === "teacher") {
    openAssignmentModal();
    return;
  } else if (moduleName.includes("Assignment") && currentRole === "student") {
    const item = visibleAssignmentsForRole("student").find((entry) => canSubmitAssignment(entry));
    if (await submitAssignmentRecord(item)) {
      if (!cloudConfigured()) showToast("Assignment submitted and linked to submission record");
    } else {
      showToast("No due assignment to submit");
    }
  } else if (moduleName.includes("Attendance")) {
    if (currentRole === "teacher") {
      appState.attendance.forEach((item) => { item.status = "Present"; });
      showToast("Attendance marked present");
    } else {
      showToast("Attendance refreshed");
    }
  } else if (moduleName.includes("Risk")) {
    appState.risks.unshift({
      id: `r${Date.now()}`,
      student: "Amanda Lee",
      programme: "WACE G10",
      signal: "Physics support block assigned",
      owner: "Mr Lim",
      status: "Open",
    });
    showToast("Intervention created");
  } else if (moduleName.includes("Evidence") || currentRole === "qa_mr") {
    const gap = appState.evidence.find((item) => item.status === "Gap");
    if (gap) gap.status = "Complete";
    showToast(gap ? "Evidence gap resolved" : "No open evidence gaps");
  } else {
    showToast("View refreshed");
  }

  renderPortal(currentRole, currentModule);
}

roleSelect.value = currentRole;

roleSelect.addEventListener("change", () => {
  if (authLockedRole) {
    roleSelect.value = currentRole;
    showToast("Role is controlled by login");
    return;
  }
  currentModule = 0;
  renderPortal(roleSelect.value, 0);
});

navList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-module]");
  if (!button) return;
  renderPortal(currentRole, Number(button.dataset.module));
});

primaryAction.addEventListener("click", handlePrimaryAction);

document.querySelector("#theme-toggle").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});

quickAction.addEventListener("click", () => {
  aiModal.classList.add("active");
  aiModal.setAttribute("aria-hidden", "false");
});

function openQrModal() {
  qrModal.classList.add("active");
  qrModal.setAttribute("aria-hidden", "false");
}

function openAssignmentModal() {
  assignmentTitle.value = "";
  assignmentDue.value = dateInputValue(1);
  assignmentStatus.value = "Due";
  assignmentNote.value = "";
  assignmentModal.classList.add("active");
  assignmentModal.setAttribute("aria-hidden", "false");
  assignmentTitle.focus();
}

function closeAssignmentModal() {
  assignmentModal.classList.remove("active");
  assignmentModal.setAttribute("aria-hidden", "true");
}

async function createIndividualAssignmentFromModal() {
  const student = assignmentStudent.value;
  const subject = assignmentSubject.value;
  const title = assignmentTitle.value.trim();
  const due = displayDateFromInput(assignmentDue.value);
  const status = assignmentStatus.value;
  const note = assignmentNote.value.trim();
  const permission = appState.teacherSubjects.find((item) => item.subject === subject);

  if (!title) {
    showToast("Please enter a homework title");
    assignmentTitle.focus();
    return;
  }
  if (!assignmentDue.value) {
    showToast("Please choose a due date");
    assignmentDue.focus();
    return;
  }
  if (!teacherCan(subject, "assign")) {
    showToast(`No assignment permission for ${subject}`);
    return;
  }

  const assignment = {
    id: `a${Date.now()}`,
    scope: "Individual",
    student,
    className: "",
    subject,
    title,
    due,
    status,
    score: "",
    assignedBy: permission?.teacher || "Teacher",
    note,
  };

  if (cloudConfigured()) {
    try {
      const cloudResult = await window.AcademicDataAdapter.createIndividualAssignment({
        studentName: student,
        subjectName: subject,
        title,
        description: note,
        dueAt: isoFromDateInput(assignmentDue.value),
        status,
      });
      assignment.id = cloudResult.assignment.id;
      assignment.cloudAssignmentId = cloudResult.assignment.id;
      assignment.cloudStudentId = cloudResult.targetStudentId;
      assignment.cloudSynced = true;
    } catch (error) {
      console.warn("Cloud assignment create failed:", error);
      assignment.cloudSynced = false;
      showToast("Saved locally; database create failed");
    }
  }

  appState.assignments.unshift(assignment);
  appState.evidence.push({
    id: `e${Date.now()}`,
    type: "Assignment",
    item: `${subject} individual homework created for ${student}`,
    owner: permission?.teacher || "Teacher",
    status: "Complete",
  });
  saveState();
  closeAssignmentModal();
  renderPortal(currentRole, currentModule);
  if (assignment.cloudSynced) {
    showToast(`Homework assigned to ${student} and saved to database`);
  } else if (!cloudConfigured()) {
    showToast(`Homework assigned to ${student}`);
  }
}

document.querySelector("#modal-close").addEventListener("click", () => {
  aiModal.classList.remove("active");
  aiModal.setAttribute("aria-hidden", "true");
});

document.querySelector("#qr-close").addEventListener("click", () => {
  qrModal.classList.remove("active");
  qrModal.setAttribute("aria-hidden", "true");
});

document.querySelector("#assignment-close").addEventListener("click", closeAssignmentModal);

document.querySelector("#assignment-create").addEventListener("click", createIndividualAssignmentFromModal);

document.querySelector("#ai-generate").addEventListener("click", () => {
  const subject = document.querySelector("#ai-subject").value;
  const question = document.querySelector("#ai-question").value.trim() || "I need help reviewing today’s weak points.";
  const prompt = question.length > 58 ? `${question.slice(0, 58)}...` : question;
  appState.aiLogs.push({
    id: `ai${Date.now()}`,
    time: new Date().toLocaleString("en-SG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    student: "Amanda Lee",
    subject,
    prompt,
    outcome: "Logged",
  });
  appState.evidence.push({
    id: `e${Date.now()}`,
    type: "AI Logs",
    item: `${subject} tutor interaction`,
    owner: "System",
    status: "Complete",
  });
  saveState();
  aiAnswer.classList.add("active");
  aiAnswer.innerHTML = `<strong>${subject} Tutor Guidance</strong><br />Start by identifying the concept being tested, then solve one worked example step by step. Based on your question: “${question}”, I would generate a short explanation, 3 scaffolded practice questions, and one reflection prompt for your learning log.`;
  renderPortal(currentRole, currentModule);
});

primaryList.addEventListener("click", async (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const idx = Number(button.dataset.id);
  const action = button.dataset.action;

  if (action === "toggle-attendance") {
    const item = appState.attendance[idx];
    item.status = item.status === "Present" ? "Absent" : "Present";
    showToast(`Attendance changed to ${item.status}`);
  }
  if (action === "advance-assignment") {
    const moduleName = portalData[currentRole].nav[currentModule];
    const visibleAssignments = moduleName.includes("Assignment") && currentRole === "student"
      ? appState.assignments.filter((entry) => entry.scope === "Class" || entry.student === "Amanda Lee")
      : appState.assignments;
    const visibleItem = visibleAssignments[idx];
    const item = appState.assignments.find((entry) => entry.id === visibleItem?.id);
    if (!item) return;
    const flow = ["Draft", "Due", "Submitted", "Marked"];
    item.status = flow[(flow.indexOf(item.status) + 1) % flow.length] || "Submitted";
    showToast(`Assignment is now ${item.status}`);
  }
  if (action === "submit-assignment") {
    const moduleName = portalData[currentRole].nav[currentModule];
    const visibleAssignments = moduleName.includes("Assignment") && currentRole === "student"
      ? visibleAssignmentsForRole("student")
      : [];
    const visibleItem = visibleAssignments[idx];
    const item = appState.assignments.find((entry) => entry.id === visibleItem?.id);
    if (await submitAssignmentRecord(item)) {
      if (!cloudConfigured()) showToast("Assignment submitted and linked");
    } else {
      showToast("This assignment cannot be submitted");
    }
  }
  if (action === "submit-wace-result" || action === "approve-wace-result") {
    const aggregates = waceAggregates();
    const row = aggregates[idx];
    const item = appState.waceResults.find((result) => result.id === row?.id);
    const outline = outlineById(item?.outlineId);
    if (item) {
      if (action === "submit-wace-result") item.status = "Director review";
      if (action === "approve-wace-result" && item.status === "Approved") item.released = true;
      else if (action === "approve-wace-result") item.status = "Approved";
      appState.evidence.push({
        id: `e${Date.now()}`,
        type: "Assessment",
        item: `${outline?.year || "WACE"} ${outline?.course || "course"} school mark ${item.released ? "released" : item.status}`,
        owner: (currentRole === "admin" || currentRole === "academic_director") ? "Academic Director" : outline?.teacher || "Teacher",
        status: "Complete",
      });
      showToast(item.released ? "WACE school mark released" : `WACE result is now ${item.status}`);
    }
  }
  if (action === "resolve-timetable-conflict") {
    const studentRows = timetableStudents();
    const targetStudent = studentRows[idx]?.student;
    const conflict = appState.studentTimetables.find((item) => item.student === targetStudent && item.status === "Conflict");
    if (conflict) {
      conflict.time = "15:20";
      conflict.status = "Scheduled";
      appState.evidence.push({
        id: `e${Date.now()}`,
        type: "Timetable",
        item: `${targetStudent} timetable conflict resolved`,
        owner: "Academic Director",
        status: "Complete",
      });
      showToast("Timetable conflict resolved");
    }
  }
  if (action === "close-risk") {
    const item = appState.risks[idx];
    if (item) item.status = "Closed";
    showToast("Risk closed");
  }
  if (action === "resolve-evidence") {
    const item = appState.evidence[idx];
    if (item) item.status = "Complete";
    showToast("Evidence resolved");
  }

  renderPortal(currentRole, currentModule);
});

aiModal.addEventListener("click", (event) => {
  if (event.target === aiModal) {
    aiModal.classList.remove("active");
    aiModal.setAttribute("aria-hidden", "true");
  }
});

qrModal.addEventListener("click", (event) => {
  if (event.target === qrModal) {
    qrModal.classList.remove("active");
    qrModal.setAttribute("aria-hidden", "true");
  }
});

assignmentModal.addEventListener("click", (event) => {
  if (event.target === assignmentModal) {
    closeAssignmentModal();
  }
});

function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
}

function createSecureToken(prefix = "qr") {
  const bytes = new Uint8Array(16);
  if (window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  } else {
    bytes.forEach((_, index) => { bytes[index] = Math.floor(Math.random() * 256); });
  }
  return `${prefix}_${Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("")}`;
}

function drawFinder(ctx, x, y, cell) {
  ctx.fillStyle = "#111";
  ctx.fillRect(x * cell, y * cell, cell * 7, cell * 7);
  ctx.fillStyle = "#fff";
  ctx.fillRect((x + 1) * cell, (y + 1) * cell, cell * 5, cell * 5);
  ctx.fillStyle = "#111";
  ctx.fillRect((x + 2) * cell, (y + 2) * cell, cell * 3, cell * 3);
}

function drawPrototypeQr(text) {
  if (window.QRCode && typeof window.QRCode.toCanvas === "function") {
    window.QRCode.toCanvas(qrCanvas, text, { width: 220, margin: 2 }, (error) => {
      if (error) console.warn("Standard QR rendering failed, using fallback pattern.", error);
    });
    return;
  }
  const ctx = qrCanvas.getContext("2d");
  const size = 29;
  const cell = Math.floor(qrCanvas.width / size);
  const offset = Math.floor((qrCanvas.width - cell * size) / 2);
  const seed = hashText(text);

  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, qrCanvas.width, qrCanvas.height);
  ctx.save();
  ctx.translate(offset, offset);
  drawFinder(ctx, 1, 1, cell);
  drawFinder(ctx, 21, 1, cell);
  drawFinder(ctx, 1, 21, cell);
  ctx.fillStyle = "#111";

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const inFinder =
        (x >= 1 && x <= 7 && y >= 1 && y <= 7) ||
        (x >= 21 && x <= 27 && y >= 1 && y <= 7) ||
        (x >= 1 && x <= 7 && y >= 21 && y <= 27);
      if (inFinder) continue;
      const bit = ((seed >> ((x + y * 3) % 24)) ^ (x * 31 + y * 17 + seed)) & 1;
      if (bit && (x + y) % 3 !== 0) ctx.fillRect(x * cell, y * cell, cell, cell);
    }
  }

  ctx.restore();
}

function generateQrSession() {
  const className = document.querySelector("#qr-class").value;
  const session = document.querySelector("#qr-session").value;
  const id = createSecureToken("qr");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  const signature = hashText(`${id}:${className}:${session}:${expiresAt.toISOString()}`).toString(16);
  const url = `${window.location.origin}${window.location.pathname}?checkin=${id}&sig=${signature}`;
  const createdAt = new Date().toLocaleString("en-SG", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const record = { id, className, session, createdAt, expiresAt: expiresAt.toISOString(), signature, status: "Active", url };

  appState.qrSessions.unshift(record);
  appState.evidence.push({
    id: `e${Date.now()}`,
    type: "Attendance",
    item: `${className} ${session} QR generated`,
    owner: "System",
    status: "Complete",
  });
  saveState();
  drawPrototypeQr(url);
  qrTitle.textContent = `${className} · ${session}`;
  qrLink.textContent = `${url} · expires ${expiresAt.toLocaleTimeString("en-SG", { hour: "2-digit", minute: "2-digit" })}`;
  showToast("Attendance QR generated");
  renderPortal(currentRole, currentModule);
}

document.querySelector("#qr-generate").addEventListener("click", generateQrSession);

renderPortal(currentRole, currentModule);
bootstrapCloudRole();
