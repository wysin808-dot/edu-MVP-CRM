"use client";

import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  useMe,
  useColleagues,
  useConversation,
  useUnread,
  useSendMessage,
  useMarkRead,
  type Colleague,
} from "@/hooks/useMessages";

const ROLE_LABEL: Record<string, string> = {
  admin: "超管", lead: "负责人", operator: "运营", ai: "AI编辑", admission: "招生顾问",
};

export default function ChatPage() {
  const { data: me } = useMe();
  const { data: colleagues } = useColleagues();
  const { data: unread } = useUnread();
  const [activeId, setActiveId] = useState<string | null>(null);
  const qc = useQueryClient();

  const active = colleagues?.find((c) => c.id === activeId) || null;
  const { data: conv } = useConversation(activeId);
  const sendMsg = useSendMessage();
  const markRead = useMarkRead();
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // 实时订阅：收到发给我的新消息 → 刷新对话和未读
  useEffect(() => {
    if (!me) return;
    const supabase = createClient();
    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${me.id}` },
        (payload) => {
          const m = payload.new as { sender_id: string };
          qc.invalidateQueries({ queryKey: ["unread"] });
          qc.invalidateQueries({ queryKey: ["conversation", m.sender_id] });
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [me, qc]);

  // 打开对话时标记已读 + 滚到底
  useEffect(() => {
    if (activeId && (unread?.bySender[activeId] || 0) > 0) {
      markRead.mutate(activeId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, conv?.messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conv?.messages.length]);

  const handleSend = () => {
    if (!draft.trim() || !active || !me) return;
    sendMsg.mutate({ recipientId: active.id, recipientName: active.display_name || "", myName: me.name, body: draft.trim() });
    setDraft("");
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-4">
        <h2 className="text-lg font-bold m-0" style={{ color: "var(--ink)" }}>💬 团队聊天</h2>
        <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>和同事一对一私聊（实时）</p>
      </div>

      <div className="flex rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--border)", height: "calc(100vh - 11rem)" }}>
        {/* 同事列表 */}
        <div className="w-64 flex flex-col" style={{ borderRight: "1px solid var(--border)" }}>
          <div className="px-4 py-3 text-sm font-semibold" style={{ borderBottom: "1px solid var(--border)", color: "var(--ink)" }}>
            同事
          </div>
          <div className="flex-1 overflow-auto">
            {(colleagues || []).map((c: Colleague) => {
              const u = unread?.bySender[c.id] || 0;
              return (
                <button
                  key={c.id}
                  onClick={() => setActiveId(c.id)}
                  className="w-full px-4 py-3 flex items-center gap-2 text-left border-none cursor-pointer"
                  style={{ borderBottom: "1px solid var(--border)", background: activeId === c.id ? "var(--surface-soft)" : "transparent" }}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold" style={{ background: "var(--brand-light,#dbeafe)", color: "var(--brand)" }}>
                    {(c.display_name || "?").slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm truncate" style={{ color: "var(--ink)" }}>{c.display_name || "未命名"}</div>
                    <div className="text-xs" style={{ color: "var(--muted)" }}>{ROLE_LABEL[c.role] || c.role}{c.team ? ` · ${c.team}` : ""}</div>
                  </div>
                  {u > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full text-white" style={{ background: "#dc2626", minWidth: 18, textAlign: "center" }}>{u}</span>
                  )}
                </button>
              );
            })}
            {(!colleagues || colleagues.length === 0) && (
              <div className="p-6 text-center text-sm" style={{ color: "var(--muted)" }}>暂无同事</div>
            )}
          </div>
        </div>

        {/* 对话窗 */}
        <div className="flex-1 flex flex-col min-w-0">
          {active ? (
            <>
              <div className="px-4 py-3 text-sm font-semibold" style={{ borderBottom: "1px solid var(--border)", color: "var(--ink)" }}>
                {active.display_name || "未命名"}
              </div>
              <div className="flex-1 overflow-auto p-4 flex flex-col gap-2" style={{ background: "var(--surface-soft)" }}>
                {(conv?.messages || []).map((m) => {
                  const mine = m.sender_id === conv?.me;
                  return (
                    <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[70%] px-3 py-2 rounded-2xl text-sm whitespace-pre-wrap break-words"
                        style={{
                          background: mine ? "var(--brand)" : "var(--surface)",
                          color: mine ? "#fff" : "var(--ink)",
                          border: mine ? "none" : "1px solid var(--border)",
                        }}
                      >
                        {m.body}
                        <div className="text-[10px] mt-1" style={{ color: mine ? "rgba(255,255,255,0.7)" : "var(--muted)" }}>
                          {formatTime(m.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {conv && conv.messages.length === 0 && (
                  <div className="text-center text-sm mt-8" style={{ color: "var(--muted)" }}>还没有消息，打个招呼吧 👋</div>
                )}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 flex gap-2" style={{ borderTop: "1px solid var(--border)" }}>
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder={`发消息给 ${active.display_name || ""}...`}
                  className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
                  style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || sendMsg.isPending}
                  className="px-5 py-2 rounded-lg text-sm font-semibold border-none cursor-pointer text-white"
                  style={{ background: draft.trim() ? "var(--brand)" : "#ccc", cursor: draft.trim() ? "pointer" : "not-allowed" }}
                >
                  发送
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-sm" style={{ color: "var(--muted)" }}>
              选择左边的同事开始聊天
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("zh-CN", { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
}
