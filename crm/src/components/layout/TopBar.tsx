"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

export default function TopBar() {
  const pathname = usePathname();

  // Find current page title
  const currentNav = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  const pageTitle = currentNav?.label || "BCI 获客系统";
  const pageIcon = currentNav?.icon || "📊";

  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{pageIcon}</span>
        <h1 className="text-base font-semibold m-0" style={{ color: "var(--ink)" }}>
          {pageTitle}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Sync indicator placeholder */}
        <div className="flex items-center gap-1.5 text-xs" style={{ color: "var(--muted)" }}>
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: "var(--green)" }}
          />
          已连接
        </div>
      </div>
    </header>
  );
}
