"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { localDateStr, getWeekStart } from "@/lib/utils";

const supabase = createClient();

export interface DashboardStats {
  todayPublishing: number;
  pendingReview: number;
  weeklyLeads: number;
  totalContents: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async (): Promise<DashboardStats> => {
      const today = new Date();
      const todayStr = localDateStr(today);
      const weekStart = localDateStr(getWeekStart(today));

      const [todayRes, reviewRes, leadsRes, totalRes] = await Promise.all([
        // Today's publishing count
        supabase
          .from("contents")
          .select("id", { count: "exact", head: true })
          .eq("publish_date", todayStr),
        // Pending review count
        supabase
          .from("contents")
          .select("id", { count: "exact", head: true })
          .in("status", ["待审核", "审核中"]),
        // This week's leads
        supabase
          .from("crm_leads")
          .select("id", { count: "exact", head: true })
          .gte("created_at", weekStart),
        // Total contents
        supabase
          .from("contents")
          .select("id", { count: "exact", head: true }),
      ]);

      return {
        todayPublishing: todayRes.count || 0,
        pendingReview: reviewRes.count || 0,
        weeklyLeads: leadsRes.count || 0,
        totalContents: totalRes.count || 0,
      };
    },
    staleTime: 60_000, // refresh every minute
  });
}
