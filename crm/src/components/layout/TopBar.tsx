"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS, ROLE_CONFIG, type UserRole } from "@/lib/constants";
import { useAuth } from "@/components/providers/AuthProvider";

const ALL_ROLES: UserRole[] = ["admin", "lead", "operator", "ai", "admission"];

export default function TopBar() {
  const pathname = usePathname();
  const { realRole, role, isSimulating, setSimulatedRole } = useAuth();

  // Find current page title
  const currentNav = NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  const pageTitle = currentNav?.label || "SEDA OS";
  const pageIcon = currentNav?.icon || "📊";

  return (
    <header
      className="h-14 flex items-center justify-between px-6 shrink-0"
      style={{
        background: isSimulating ? "#fef3c7" : "var(--surface)",
        borderBottom: `1px solid ${isSimulating ? "#f59e0b" : "var(--border)"}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{pageIcon}</span>
        <h1 className="text-base font-semibold m-0" style={{ color: "var(--ink)" }}>
          {pageTitle}
        </h1>
        {isSimulating && (
          <span
            className="ml-2 px-2 py-0.5 rounded text-xs font-medium"
            style={{ background: "#f59e0b", color: "#fff" }}
          >
            🔀 模拟: {ROLE_CONFIG[role].title}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Role Switcher — admin only */}
        {realRole === "admin" && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "var(--muted)" }}>角色:</span>
            <select
              value={isSimulating ? role : ""}
              onChange={(e) => {
                const val = e.target.value;
                setSimulatedRole(val ? (val as UserRole) : null);
              }}
              className="text-xs rounded px-2 py-1 border cursor-pointer"
              style={{
                borderColor: "var(--border)",
                background: "var(--surface)",
                color: "var(--ink)",
                outline: "none",
              }}
            >
              <option value="">管理员 (真实)</option>
              {ALL_ROLES.filter((r) => r !== "admin").map((r) => (
                <option key={r} value={r}>
                  模拟 {ROLE_CONFIG[r].title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Sync indicator */}
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
