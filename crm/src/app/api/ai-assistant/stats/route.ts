import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function getTodayStartIso() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const todayStart = getTodayStartIso();

  const [
    todayPeopleResult,
    totalChatsResult,
    chatsResult,
    wechatClicksResult,
  ] = await Promise.all([
    supabase
      .from("ai_assistant_chats")
      .select("ip_address")
      .gte("created_at", todayStart),
    supabase
      .from("ai_assistant_chats")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("ai_assistant_chats")
      .select("question, created_at")
      .order("created_at", { ascending: false })
      .limit(1000),
    supabase
      .from("ai_assistant_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "wechat_click"),
  ]);

  if (
    todayPeopleResult.error ||
    totalChatsResult.error ||
    chatsResult.error ||
    wechatClicksResult.error
  ) {
    return NextResponse.json(
      { error: "Failed to load AI assistant stats" },
      { status: 500 }
    );
  }

  const todayPeople = new Set(
    (todayPeopleResult.data || []).map((row) => row.ip_address || "unknown")
  ).size;

  const questionCounts = new Map<string, number>();
  for (const row of chatsResult.data || []) {
    const question = row.question.trim();
    questionCounts.set(question, (questionCounts.get(question) || 0) + 1);
  }

  const hotQuestions = Array.from(questionCounts.entries())
    .map(([question, count]) => ({ question, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return NextResponse.json({
    todayPeople,
    totalChats: totalChatsResult.count || 0,
    hotQuestions,
    wechatClicks: wechatClicksResult.count || 0,
  });
}
