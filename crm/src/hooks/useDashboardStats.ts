"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { localDateStr, getWeekStart } from "@/lib/utils";

export interface DashboardStats {
  todayPublishing: number;
  pendingReview: number;
  weeklyLeads: number;
  totalContents: number;
}

export function useDashboardStats() {
  const { profile, role } = useAuth();
  const team = role === "admin" ? null : profile?.team || null;

  return useQuery({
    queryKey: ["dashboard-stats", { team }],
    queryFn: async (): Promise<DashboardStats> => {
      const supabase = createClient();
      const today = new Date();
      const todayStr = localDateStr(today);
      const weekStartDate = getWeekStart(today);
      weekStartDate.setHours(0, 0, 0, 0);
      const weekStartISO = weekStartDate.toISOString();

      let todayQuery = supabase
        .from("contents")
        .select("id", { count: "exact", head: true })
        .eq("publish_date", todayStr);
      if (team) todayQuery = todayQuery.eq("team", team);

      let reviewQuery = supabase
        .from("contents")
        .select("id", { count: "exact", head: true })
        .in("status", ["待审核", "审核中"]);
      if (team) reviewQuery = reviewQuery.eq("team", team);

      let leadsQuery = supabase
        .from("crm_leads")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStartISO);
      if (team) leadsQuery = leadsQuery.eq("team", team);

      let totalQuery = supabase
        .from("contents")
        .select("id", { count: "exact", head: true });
      if (team) totalQuery = totalQuery.eq("team", team);

      const [todayRes, reviewRes, leadsRes, totalRes] = await Promise.all([
        todayQuery,
        reviewQuery,
        leadsQuery,
        totalQuery,
      ]);

      return {
        todayPublishing: todayRes.count || 0,
        pendingReview: reviewRes.count || 0,
        weeklyLeads: leadsRes.count || 0,
        totalContents: totalRes.count || 0,
      };
    },
    staleTime: 60_000,
  });
}
