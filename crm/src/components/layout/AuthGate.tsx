"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { ForceChangePassword } from "@/components/auth/ChangePassword";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { loading, user, profile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

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

  // 新成员首次登录：强制改密码后才能进系统
  if (profile?.must_change_password) {
    return <ForceChangePassword />;
  }

  return <>{children}</>;
}
