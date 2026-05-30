// MCN 内容中台 — 每人每天次数额度 + 用量记账
// 全部容错：若库未建 quota_config / usage_log 表，则放行 + 静默跳过，不阻断生成

import type { SupabaseClient } from "@supabase/supabase-js";

type Kind = "text" | "image" | "video";
type Limits = { text: number; image: number; video: number };

const DEFAULT_LIMITS: Limits = { text: 50, image: 100, video: 5 };

const KIND_LABEL: Record<Kind, string> = {
  text: "文案生成",
  image: "配图生成",
  video: "视频生成",
};

function todayStartISO(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
}

// 取该用户的每日额度（个人覆盖 > 角色默认 > 系统默认）
async function getDailyLimits(supabase: SupabaseClient, userId: string): Promise<Limits> {
  try {
    const { data: prof } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", userId)
      .maybeSingle();
    const role = (prof as { role?: string } | null)?.role || "operator";

    const { data: rows } = await supabase
      .from("quota_config")
      .select("scope,scope_key,daily_text,daily_image,daily_video")
      .or(`and(scope.eq.role,scope_key.eq.${role}),and(scope.eq.user,scope_key.eq.${userId})`);

    type Row = { scope: string; daily_text: number; daily_image: number; daily_video: number };
    const list = (rows as Row[]) || [];
    const roleCfg = list.find((r) => r.scope === "role");
    const userCfg = list.find((r) => r.scope === "user");

    return {
      text: userCfg?.daily_text ?? roleCfg?.daily_text ?? DEFAULT_LIMITS.text,
      image: userCfg?.daily_image ?? roleCfg?.daily_image ?? DEFAULT_LIMITS.image,
      video: userCfg?.daily_video ?? roleCfg?.daily_video ?? DEFAULT_LIMITS.video,
    };
  } catch {
    return DEFAULT_LIMITS;
  }
}

// 取该用户今日已用量
async function getTodayUsage(supabase: SupabaseClient, userId: string): Promise<Limits> {
  const sum: Limits = { text: 0, image: 0, video: 0 };
  try {
    const { data } = await supabase
      .from("usage_log")
      .select("kind,count")
      .eq("user_id", userId)
      .gte("created_at", todayStartISO())
      .limit(5000);
    for (const r of (data as { kind: Kind; count: number | null }[]) || []) {
      if (r.kind in sum) sum[r.kind] += r.count || 1;
    }
  } catch {
    // 表不存在 → 视为 0
  }
  return sum;
}

// 生成前检查额度。返回 ok=false 时附友好提示
export async function checkQuota(
  supabase: SupabaseClient,
  userId: string,
  kind: Kind,
  n = 1
): Promise<{ ok: boolean; message?: string; limit?: number; used?: number }> {
  const [limits, usage] = await Promise.all([
    getDailyLimits(supabase, userId),
    getTodayUsage(supabase, userId),
  ]);
  const limit = limits[kind];
  if (limit < 0) return { ok: true, limit, used: usage[kind] }; // -1 = 不限
  const used = usage[kind];
  if (used + n > limit) {
    return {
      ok: false,
      limit,
      used,
      message: `今日${KIND_LABEL[kind]}额度已用完（${used}/${limit}），请明天再试或联系管理员调整额度`,
    };
  }
  return { ok: true, limit, used };
}

// 记一条用量流水（容错，失败不影响主流程）
export async function logUsage(
  supabase: SupabaseClient,
  params: {
    userId: string;
    userName?: string | null;
    kind: Kind;
    count?: number;
    tokens?: number;
    cost?: number;
    detail?: string;
  }
): Promise<void> {
  try {
    await supabase.from("usage_log").insert({
      user_id: params.userId,
      user_name: params.userName || null,
      kind: params.kind,
      count: params.count ?? 1,
      tokens: params.tokens ?? 0,
      cost: params.cost ?? 0,
      detail: params.detail || null,
    });
  } catch {
    // ignore
  }
}
