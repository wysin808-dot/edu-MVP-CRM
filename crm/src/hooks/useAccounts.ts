"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { Account, AccountInsert } from "@/lib/types";

export function useAccountList(filters?: {
  platform?: string;
  stage?: string;
  operatorName?: string;
}) {
  return useQuery({
    queryKey: ["accounts", filters],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("accounts")
        .select("*, persona:personas(*)")
        .order("created_at", { ascending: false });

      if (filters?.platform) query = query.eq("platform", filters.platform);
      if (filters?.stage) query = query.eq("stage", filters.stage);
      if (filters?.operatorName)
        query = query.eq("operator_name", filters.operatorName);

      const { data, error } = await query;
      if (error) throw error;
      return (data as Account[]) || [];
    },
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (account: AccountInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("accounts")
        .insert(account)
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
