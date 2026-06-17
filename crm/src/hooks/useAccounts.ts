"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type { Account, AccountInsert } from "@/lib/types";

function useTeamFilter() {
  const { profile, role } = useAuth();
  return role === "admin" ? null : profile?.team || null;
}

export function useAccountList(filters?: {
  platform?: string;
  stage?: string;
  operatorName?: string;
  operatorId?: string;
  ownerId?: string;
}) {
  const team = useTeamFilter();

  return useQuery({
    queryKey: ["accounts", filters, { team }],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("accounts")
        .select("*, persona:personas(*), phone_ref:phone_numbers(id, phone, real_name)")
        .order("created_at", { ascending: false });

      if (filters?.platform) query = query.eq("platform", filters.platform);
      if (filters?.stage) query = query.eq("stage", filters.stage);
      if (filters?.operatorId) query = query.eq("operator_id", filters.operatorId);
      else if (filters?.operatorName)
        query = query.eq("operator_name", filters.operatorName);
      // owner 指派优先：传了 ownerId 就按负责人过滤（跳过 team），否则沿用 team 过滤
      if (filters?.ownerId) query = query.eq("owner_id", filters.ownerId);
      else if (team) query = query.eq("team", team);

      const { data, error } = await query;
      if (error) throw error;
      return (data as Account[]) || [];
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (account: AccountInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .insert({ ...account, team: profile?.team || "china" })
        .select()
        .single();
      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Account> & { id: string }) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as Account;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
  });
}
