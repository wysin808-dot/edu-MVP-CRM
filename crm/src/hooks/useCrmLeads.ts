"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { CrmLead, CrmLeadInsert } from "@/lib/types";

function useTeamFilter() {
  const { profile, role } = useAuth();
  return role === "admin" ? null : profile?.team || null;
}

export function useCrmLeadList(filters?: { stage?: string; accountIds?: string[] }) {
  const team = useTeamFilter();

  return useQuery({
    queryKey: ["crm_leads", filters, { team }],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("crm_leads")
        .select("*, source_content:contents(id, title, platform)")
        .order("created_at", { ascending: false });

      if (filters?.stage) query = query.eq("stage", filters.stage);
      // 按账号归属收口（"本部门"）：传了 accountIds 就按来源账号过滤，并跳过 team 过滤
      if (filters?.accountIds) query = query.in("source_account_id", filters.accountIds);
      else if (team) query = query.eq("team", team);

      const { data, error } = await query;
      if (error) throw error;
      return (data as CrmLead[]) || [];
    },
  });
}

export function useCrmLead(id: string) {
  return useQuery({
    queryKey: ["crm_leads", id],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("crm_leads")
        .select("*, source_content:contents(id, title, platform)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as CrmLead;
    },
    enabled: !!id,
  });
}

export function useCreateCrmLead() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (lead: CrmLeadInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("crm_leads")
        .insert({ ...lead, team: profile?.team || "china" })
        .select()
        .single();
      if (error) throw error;
      return data as CrmLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
    },
  });
}

export function useUpdateCrmLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CrmLead> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("crm_leads")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as CrmLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
    },
  });
}

export function useMoveCrmLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      newStage,
    }: {
      id: string;
      newStage: string;
    }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("crm_leads")
        .update({ stage: newStage })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as CrmLead;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["crm_leads"] });
    },
  });
}
