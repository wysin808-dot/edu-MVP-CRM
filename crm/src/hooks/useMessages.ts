"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export interface Colleague {
  id: string;
  display_name: string | null;
  role: string;
  team: string | null;
}
export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string | null;
  recipient_id: string;
  recipient_name: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
}

// 当前用户
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    staleTime: 600000,
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("未登录");
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("display_name,role")
        .eq("id", user.id)
        .maybeSingle();
      return {
        id: user.id,
        name: (prof as { display_name?: string } | null)?.display_name || user.email?.split("@")[0] || "我",
        role: (prof as { role?: string } | null)?.role || "operator",
      };
    },
  });
}

// 同事列表（除自己）
export function useColleagues() {
  return useQuery<Colleague[]>({
    queryKey: ["colleagues"],
    // 覆盖全局 5 分钟缓存：进入聊天/打开窗口即刷新，新增成员立即可见
    staleTime: 0,
    refetchOnMount: "always",
    refetchInterval: 60000,
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data } = await supabase
        .from("user_profiles")
        .select("id,display_name,role,team")
        .neq("id", user?.id || "")
        .order("display_name", { ascending: true });
      return (data as Colleague[]) || [];
    },
  });
}

// 与某同事的对话
export function useConversation(otherId: string | null) {
  return useQuery({
    queryKey: ["conversation", otherId],
    enabled: !!otherId,
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const me = user!.id;
      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${me},recipient_id.eq.${otherId}),and(sender_id.eq.${otherId},recipient_id.eq.${me})`)
        .order("created_at", { ascending: true })
        .limit(500);
      return { me, messages: (data as ChatMessage[]) || [] };
    },
  });
}

// 未读统计（按发送者 + 总数）
export function useUnread() {
  return useQuery({
    queryKey: ["unread"],
    refetchInterval: 15000,
    queryFn: async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { total: 0, bySender: {} as Record<string, number> };
      const { data } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("recipient_id", user.id)
        .is("read_at", null)
        .limit(2000);
      const bySender: Record<string, number> = {};
      let total = 0;
      for (const r of (data as { sender_id: string }[]) || []) {
        bySender[r.sender_id] = (bySender[r.sender_id] || 0) + 1;
        total++;
      }
      return { total, bySender };
    },
  });
}

// 发送消息
export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { recipientId: string; recipientName?: string; myName: string; body: string }) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from("messages").insert({
        sender_id: user!.id,
        sender_name: params.myName,
        recipient_id: params.recipientId,
        recipient_name: params.recipientName || null,
        body: params.body,
      });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      qc.invalidateQueries({ queryKey: ["conversation", v.recipientId] });
    },
  });
}

// 标记某同事的消息已读
export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (otherId: string) => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", user!.id)
        .eq("sender_id", otherId)
        .is("read_at", null);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["unread"] });
    },
  });
}
