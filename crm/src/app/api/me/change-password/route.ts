import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// 当前登录用户修改自己的密码；成功后清除「强制改密码」标记
export async function POST(request: NextRequest) {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 });

  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
  const password = String(body?.password || "");
  if (password.length < 6) {
    return NextResponse.json({ error: "密码至少 6 位" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) return NextResponse.json({ error: "服务未配置" }, { status: 500 });

  const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error: pwErr } = await admin.auth.admin.updateUserById(user.id, { password });
  if (pwErr) return NextResponse.json({ error: pwErr.message }, { status: 400 });

  await admin.from("user_profiles").update({ must_change_password: false }).eq("id", user.id);

  return NextResponse.json({ ok: true });
}
