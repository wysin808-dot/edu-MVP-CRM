import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const serverSupabase = await createServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: callerProfile } = await serverSupabase
    .from("user_profiles")
    .select("role, team")
    .eq("id", user.id)
    .single();

  const callerRole = callerProfile?.role;
  const callerTeam = callerProfile?.team;

  if (callerRole !== "admin" && callerRole !== "lead") {
    return NextResponse.json(
      { error: "只有管理员和部门负责人可以邀请成员" },
      { status: 403 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }
  const { email, password, display_name, role, team } = body;

  if (!email || !password || !display_name || !role) {
    return NextResponse.json(
      { error: "Missing required fields: email, password, display_name, role" },
      { status: 400 }
    );
  }

  // 强制团队成员登录邮箱使用 @seda.org.sg 域名
  const REQUIRED_DOMAIN = "@seda.org.sg";
  const normalizedEmail = String(email).trim().toLowerCase();
  if (!normalizedEmail.endsWith(REQUIRED_DOMAIN) || normalizedEmail.indexOf("@") !== normalizedEmail.lastIndexOf("@") || normalizedEmail.length <= REQUIRED_DOMAIN.length) {
    return NextResponse.json(
      { error: "团队成员登录邮箱必须是 用户名@seda.org.sg" },
      { status: 400 }
    );
  }

  const VALID_ROLES = ["admin", "lead", "operator", "ai", "admission"];
  if (!VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
      { status: 400 }
    );
  }

  if (callerRole === "lead") {
    if (role === "admin" || role === "lead") {
      return NextResponse.json(
        { error: "部门负责人不能创建管理员或负责人角色" },
        { status: 403 }
      );
    }
    if (team && team !== callerTeam) {
      return NextResponse.json(
        { error: "部门负责人只能邀请自己团队的成员" },
        { status: 403 }
      );
    }
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return NextResponse.json(
      { error: "SUPABASE_SERVICE_ROLE_KEY not configured" },
      { status: 500 }
    );
  }

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const finalTeam = callerRole === "lead" ? callerTeam : (team || "china");

  const { data: newUser, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { display_name },
    });

  if (authError) {
    return NextResponse.json(
      { error: authError.message },
      { status: 400 }
    );
  }

  if (!newUser.user) {
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }

  const { error: profileError } = await adminSupabase
    .from("user_profiles")
    .upsert({
      id: newUser.user.id,
      display_name,
      role: role || "operator",
      team: finalTeam,
    });

  if (profileError) {
    await adminSupabase.auth.admin.deleteUser(newUser.user.id);
    return NextResponse.json(
      { error: "Failed to create profile: " + profileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    user: {
      id: newUser.user.id,
      email: newUser.user.email,
      display_name,
      role,
      team: finalTeam,
    },
  });
}
