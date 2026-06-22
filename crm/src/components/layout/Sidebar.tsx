"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { NAV_ITEMS, NAV_GROUPS, ROLE_CONFIG } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";
import { useUnread } from "@/hooks/useMessages";
import { createClient } from "@/lib/supabase/client";
import { ChangePasswordModal } from "@/components/auth/ChangePassword";

export default function Sidebar() {
  const pathname = usePathname();
  const [showPwModal, setShowPwModal] = useState(false);
  const { role, profile, signOut, user } = useAuth();
  const config = ROLE_CONFIG[role];
  const { data: unread } = useUnread();
  const unreadTotal = unread?.total || 0;
  const qc = useQueryClient();

  // 全局实时通知：收到发给我的新消息 → 立即刷新未读，红标即时亮起
  useEffect(() => {
    if (!user) return;
    const supabase = createClient();
    const channel = supabase
      .channel("sidebar-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `recipient_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["unread"] })
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const navItemMap = Object.fromEntries(NAV_ITEMS.map((i) => [i.id, i]));
  const allowedIds = new Set(config.nav);

  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((id) => allowedIds.has(id)).map((id) => navItemMap[id]).filter(Boolean),
  })).filter((g) => g.items.length > 0);

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-30"
      style={{
        width: "var(--sidebar-width)",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Brand */}
      <div className="px-4 py-5 flex items-center gap-2.5">
        <img
          src="/seda-logo.png"
          alt="SEDA International Education"
          className="w-9 h-9 rounded-lg object-contain"
        />
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: "var(--ink)" }}>
            SEDA OS
          </div>
          <div className="text-[10px] truncate" style={{ color: "var(--muted)" }}>
            {config.title}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1 pb-2">
        {visibleGroups.map((group, gi) => (
          <div key={group.label} className={gi > 0 ? "mt-3" : ""}>
            {/* Group header — only show when there are multiple groups */}
            {visibleGroups.length > 1 && (
              <div
                className="px-3 mb-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{ color: "var(--muted)" }}
              >
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg mb-0.5 text-sm no-underline transition-colors"
                  style={{
                    background: isActive ? "var(--brand-light)" : "transparent",
                    color: isActive ? "var(--brand)" : "var(--ink)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.id === "chat" && unreadTotal > 0 && (
                    <span
                      className="ml-auto text-[10px] leading-none min-w-[18px] h-[18px] px-1 rounded-full text-white flex items-center justify-center font-semibold"
                      style={{ background: "#dc2626" }}
                      title={`${unreadTotal} 条未读消息`}
                    >
                      {unreadTotal > 99 ? "99+" : unreadTotal}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
          style={{ background: "var(--brand)" }}
        >
          {(profile?.display_name || config.defaultUser).charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate" style={{ color: "var(--ink)" }}>
            {profile?.display_name || config.defaultUser}
          </div>
          <div className="text-[10px] truncate" style={{ color: "var(--muted)" }}>
            {config.title}
          </div>
        </div>
        <button
          onClick={() => setShowPwModal(true)}
          className="text-xs px-2 py-1 rounded transition-colors cursor-pointer border-none"
          style={{ color: "var(--muted)", background: "transparent" }}
          title="修改密码"
        >
          改密码
        </button>
        <button
          onClick={signOut}
          className="text-xs px-2 py-1 rounded transition-colors cursor-pointer border-none"
          style={{
            color: "var(--muted)",
            background: "transparent",
          }}
          title="退出登录"
        >
          退出
        </button>
      </div>
      <ChangePasswordModal open={showPwModal} onClose={() => setShowPwModal(false)} />
    </aside>
  );
}
