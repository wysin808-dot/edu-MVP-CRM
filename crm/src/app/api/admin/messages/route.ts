import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { createClient } from "@supabase/supabase-js";

// 聊天审计：管理员查看全员私聊记录。仅 admin / lead
export async function GET(request: NextRequest) {
  const serverSupabase = await createServerClient();
  const { data: { user } } = await serverSupabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: prof } = await serverSupabase
    .from("user_profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (prof?.role !== "admin" && prof?.role !== "lead") {
    return NextResponse.json({ error: "只有管理员和负责人可以查看聊天审计" }, { status: 403 });
  }

  const q = (request.nextUrl.searchParams.get("q") || "").trim();
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  let query = admin
    .from("messages")
    .select("id,sender_name,recipient_name,body,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  if (q) {
    query = query.or(`body.ilike.%${q}%,sender_name.ilike.%${q}%,recipient_name.ilike.%${q}%`);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages: data || [] });
}
