"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import type {
  PhoneNumber,
  PhoneNumberInsert,
  PhoneRecharge,
  PhoneRechargeInsert,
} from "@/lib/types";

function useTeamFilter() {
  const { profile, role } = useAuth();
  return role === "admin" ? null : profile?.team || null;
}

// 号码列表（带充值汇总）
export function usePhoneNumberList(filters?: { status?: string; q?: string }) {
  const team = useTeamFilter();

  return useQuery({
    queryKey: ["phone_numbers", filters, { team }],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("phone_numbers")
        .select("*, recharges:phone_recharges(*), linked_accounts:accounts(id, account_name, platform, operator_name)")
        .order("created_at", { ascending: false });

      if (filters?.status) query = query.eq("status", filters.status);
      if (team) query = query.eq("team", team);

      const { data, error } = await query;
      if (error) throw error;

      let rows = (data as PhoneNumber[]) || [];
      // 充值总额
      rows = rows.map((r) => ({
        ...r,
        total_recharged: (r.recharges || []).reduce((s, x) => s + Number(x.amount || 0), 0),
      }));
      // 关键字过滤（号码/实名/归属地/账号）
      if (filters?.q) {
        const q = filters.q.toLowerCase();
        rows = rows.filter(
          (r) =>
            (r.phone || "").toLowerCase().includes(q) ||
            (r.real_name || "").toLowerCase().includes(q) ||
            (r.region || "").toLowerCase().includes(q) ||
            (r.registered_accounts || "").toLowerCase().includes(q)
        );
      }
      return rows;
    },
  });
}

export function useCreatePhoneNumber() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (input: PhoneNumberInsert) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("phone_numbers")
        .insert({ ...input, team: profile?.team || "china" })
        .select()
        .single();
      if (error) throw error;
      return data as PhoneNumber;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["phone_numbers"] }),
  });
}

export function useUpdatePhoneNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<PhoneNumber> & { id: string }) => {
      const supabase = createClient();
      const { recharges, total_recharged, ...clean } = updates;
      void recharges;
      void total_recharged;
      const { data, error } = await supabase
        .from("phone_numbers")
        .update(clean)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as PhoneNumber;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["phone_numbers"] }),
  });
}

export function useDeletePhoneNumber() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("phone_numbers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["phone_numbers"] }),
  });
}

// ── 充值记录 ──
export function useAddRecharge() {
  const queryClient = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: async (
      input: Omit<PhoneRechargeInsert, "created_by" | "recharged_at"> & { recharged_at?: string }
    ) => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("phone_recharges")
        .insert({ ...input, created_by: profile?.display_name || null })
        .select()
        .single();
      if (error) throw error;
      return data as PhoneRecharge;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["phone_numbers"] }),
  });
}

export function useDeleteRecharge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const supabase = createClient();
      const { error } = await supabase.from("phone_recharges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["phone_numbers"] }),
  });
}
