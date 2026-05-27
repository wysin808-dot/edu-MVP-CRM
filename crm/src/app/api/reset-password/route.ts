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
      { error: "只有管理员和部门负责人可以重置密码" },
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

  const { userId, newPassword } = body;

  if (!userId || !newPassword) {
    return NextResponse.json(
      { error: "Missing required fields: userId, newPassword" },
      { status: 400 }
    );
  }

  if (newPassword.length < 6) {
    return NextResponse.json(
      { error: "密码至少需要 6 个字符" },
      { status: 400 }
    );
  }

  // Prevent resetting own password through this API
  if (userId === user.id) {
    return NextResponse.json(
      { error: "不能通过此接口重置自己的密码" },
      { status: 400 }
    );
  }

  // Lead can only reset passwords for members in their own team
  if (callerRole === "lead") {
    const { data: targetProfile } = await serverSupabase
      .from("user_profiles")
      .select("role, team")
      .eq("id", userId)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }
    if (targetProfile.team !== callerTeam) {
      return NextResponse.json(
        { error: "只能重置自己团队成员的密码" },
        { status: 403 }
      );
    }
    if (targetProfile.role === "admin" || targetProfile.role === "lead") {
      return NextResponse.json(
        { error: "不能重置管理员或负责人的密码" },
        { status: 403 }
      );
    }
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

  const { error: updateError } =
    await adminSupabase.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

  if (updateError) {
    return NextResponse.json(
      { error: updateError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
