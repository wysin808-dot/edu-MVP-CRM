import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// 配额管理：列出所有员工的额度、修改单个员工额度。仅 admin / lead
const ROLE_DEFAULTS: Record<string, { text: number; image: number; video: number }> = {
  admin: { text: -1, image: -1, video: -1 },
  lead: { text: 200, image: 300, video: 30 },
  operator: { text: 80, image: 120, video: 8 },
  ai: { text: 120, image: 200, video: 12 },
  admission: { text: 50, image: 60, video: 5 },
};

async function requireAdmin() {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return { error: "Unauthorized", status: 401 as const };
  const { data: prof } = await serverSupabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (prof?.role !== "admin" && prof?.role !== "lead") {
    return { error: "只有管理员和负责人可以管理配额", status: 403 as const };
  }
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  return { admin };
}

export async function GET() {
  const ctx = await requireAdmin();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { admin } = ctx;

  const [profilesRes, quotaRes] = await Promise.all([
    admin.from("user_profiles").select("id,display_name,role,team"),
    admin.from("quota_config").select("scope,scope_key,daily_text,daily_image,daily_video"),
  ]);

  type Cfg = { scope: string; scope_key: string; daily_text: number; daily_image: number; daily_video: number };
  const roleLimits: Record<string, { text: number; image: number; video: number }> = {};
  const userLimits: Record<string, { text: number; image: number; video: number }> = {};
  for (const c of (quotaRes.data as Cfg[]) || []) {
    const v = { text: c.daily_text, image: c.daily_image, video: c.daily_video };
    if (c.scope === "role") roleLimits[c.scope_key] = v;
    else if (c.scope === "user") userLimits[c.scope_key] = v;
  }

  type Prof = { id: string; display_name: string | null; role: string; team: string | null };
  const users = ((profilesRes.data as Prof[]) || []).map((p) => {
    const isCustom = !!userLimits[p.id];
    const limits = userLimits[p.id] || roleLimits[p.role] || ROLE_DEFAULTS[p.role] || ROLE_DEFAULTS.operator;
    return {
      userId: p.id,
      name: p.display_name || "未命名",
      role: p.role,
      team: p.team || "",
      isCustom,
      limits,
    };
  });

  return NextResponse.json({ users, roleDefaults: { ...ROLE_DEFAULTS, ...roleLimits } });
}

export async function POST(request: NextRequest) {
  const ctx = await requireAdmin();
  if ("error" in ctx) return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  const { admin } = ctx;

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { userId, daily_text, daily_image, daily_video, reset } = body;
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  // reset = 删除个人覆盖，恢复角色默认
  if (reset) {
    await admin.from("quota_config").delete().eq("scope", "user").eq("scope_key", userId);
    return NextResponse.json({ ok: true, reset: true });
  }

  const toInt = (v: unknown, d: number) => {
    const n = parseInt(String(v));
    return Number.isFinite(n) ? n : d;
  };
  const { error } = await admin
    .from("quota_config")
    .upsert(
      {
        scope: "user",
        scope_key: userId,
        daily_text: toInt(daily_text, 80),
        daily_image: toInt(daily_image, 120),
        daily_video: toInt(daily_video, 8),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "scope,scope_key" }
    );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
