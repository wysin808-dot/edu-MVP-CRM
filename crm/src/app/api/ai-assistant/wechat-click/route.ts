import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

function getIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";

  return (
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function createPublicSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  const supabase = createPublicSupabaseClient();

  if (supabase) {
    await supabase.from("ai_assistant_events").insert({
      event_type: "wechat_click",
      ip_address: getIp(request),
    });
  }

  return NextResponse.json({ ok: true });
}
