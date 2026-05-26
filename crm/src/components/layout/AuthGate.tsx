"use client";

import { useAuth } from "@/components/providers/AuthProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 border-3 rounded-full animate-spin"
            style={{ borderColor: "var(--border)", borderTopColor: "var(--brand)", borderWidth: "3px" }}
          />
          <p className="text-sm" style={{ color: "var(--muted)" }}>加载中...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
