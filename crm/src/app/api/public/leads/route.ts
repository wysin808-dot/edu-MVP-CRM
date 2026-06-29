import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ALLOWED_ORIGINS = [
  "https://sgoa.ai",
  "https://www.sgoa.ai",
  "http://localhost:3000",
];

function corsHeaders(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

// Preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get("origin");
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  const headers = corsHeaders(origin);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400, headers });
  }

  const name = (body.name as string | undefined)?.trim();
  if (!name) {
    return NextResponse.json({ error: "姓名为必填项" }, { status: 422, headers });
  }

  // 用 anon key 建客户端 — RLS 策略允许 anon 角色 INSERT
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const payload = {
    name,
    phone:            (body.phone as string | undefined)?.trim() || null,
    child_name:       (body.child_name as string | undefined)?.trim() || null,
    child_grade:      (body.child_grade as string | undefined)?.trim() || null,
    source_platform:  (body.source_platform as string | undefined)?.trim() || null,
    interest_program: (body.interest_program as string | undefined)?.trim() || null,
    notes:            (body.notes as string | undefined)?.trim() || null,
    // 来源 URL 记录在 notes 附加信息中
    stage:            "新线索",
  };

  // 如果 notes 里加上来源页面 URL
  if (body.source_url) {
    payload.notes = [payload.notes, `来源页面: ${body.source_url}`].filter(Boolean).join("\n");
  }

  const { data, error } = await supabase
    .from("crm_leads")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    console.error("[public/leads] insert error:", error);
    return NextResponse.json({ error: "提交失败，请稍后重试" }, { status: 500, headers });
  }

  return NextResponse.json({ success: true, id: data.id }, { status: 201, headers });
}
