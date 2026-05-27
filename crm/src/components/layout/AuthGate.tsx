"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, user, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  // Redirect operator/ai to /publishing on initial login (when landing on /dashboard)
  useEffect(() => {
    if (!loading && user && !hasRedirected.current) {
      if ((role === "operator" || role === "ai") && pathname === "/dashboard") {
        hasRedirected.current = true;
        router.replace("/publishing");
      }
    }
  }, [loading, user, role, pathname, router]);

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

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
