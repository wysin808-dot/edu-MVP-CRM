"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, ROLE_CONFIG, type UserRole } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";

export default function Sidebar() {
  const pathname = usePathname();
  const { role, profile, signOut } = useAuth();
  const config = ROLE_CONFIG[role];

  // Filter nav items by role permission
  const visibleItems = NAV_ITEMS.filter((item) =>
    config.nav.includes(item.id)
  );

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
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs"
          style={{ background: "var(--brand)" }}
        >
          BCI
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate" style={{ color: "var(--ink)" }}>
            获客系统
          </div>
          <div className="text-[10px] truncate" style={{ color: "var(--muted)" }}>
            {config.title}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-1">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href ||
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
            </Link>
          );
        })}
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
    </aside>
  );
}
