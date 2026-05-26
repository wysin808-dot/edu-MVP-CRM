import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  // 1. Verify caller is authenticated admin
  const serverSupabase = await createServerClient();
  const {
    data: { user },
  } = await serverSupabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check caller is admin
  const { data: callerProfile } = await serverSupabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (callerProfile?.role !== "admin") {
    return NextResponse.json(
      { error: "Only admin can invite members" },
      { status: 403 }
    );
  }

  // 2. Parse request body
  const body = await request.json();
  const { email, password, display_name, role, team } = body;

  if (!email || !password || !display_name || !role) {
    return NextResponse.json(
      { error: "Missing required fields: email, password, display_name, role" },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      { error: "Password must be at least 6 characters" },
      { status: 400 }
    );
  }

  // 3. Create user with service role key (admin API)
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

  // Create auth user
  const { data: newUser, error: authError } =
    await adminSupabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Skip email verification
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

  // 4. Create user_profiles record
  const { error: profileError } = await adminSupabase
    .from("user_profiles")
    .upsert({
      id: newUser.user.id,
      display_name,
      role: role || "operator",
      team: team || "china",
    });

  if (profileError) {
    // Rollback: delete the auth user if profile creation fails
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
      team: team || "china",
    },
  });
}
