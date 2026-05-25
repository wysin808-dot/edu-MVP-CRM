"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { ROLE_CONFIG, PLATFORMS, type UserRole } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { UserProfile } from "@/lib/types";

function useUserProfiles() {
  return useQuery({
    queryKey: ["user_profiles"],
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data as UserProfile[]) || [];
    },
  });
}

function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_profiles")
        .update({ role })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
    },
  });
}

export default function SettingsPage() {
  const { role, profile } = useAuth();
  const { data: users, isLoading } = useUserProfiles();
  const updateRole = useUpdateUserRole();

  if (role !== "admin" && role !== "lead") {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="rounded-xl p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <div className="text-4xl mb-3">🔒</div>
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            你没有权限访问此页面。请联系管理员。
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <PageSkeleton />;

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-lg font-bold mb-6" style={{ color: "var(--ink)" }}>系统设置</h2>

      {/* Team Members */}
      <div className="rounded-xl p-6 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            团队成员 <span className="font-normal text-xs" style={{ color: "var(--muted)" }}>· {users?.length || 0} 人</span>
          </h3>
        </div>

        {users && users.length > 0 ? (
          <div className="flex flex-col gap-2">
            {users.map((user) => {
              const roleConfig = ROLE_CONFIG[user.role as UserRole];
              const isCurrentUser = user.id === profile?.id;
              const roleBadge = (): "success" | "warning" | "info" | "danger" | "default" => {
                switch (user.role) {
                  case "admin": return "danger";
                  case "lead": return "warning";
                  case "operator": return "info";
                  case "ai": return "success";
                  case "admission": return "default";
                  default: return "default";
                }
              };

              return (
                <div key={user.id} className="flex items-center gap-4 p-3 rounded-lg"
                  style={{ background: isCurrentUser ? "var(--brand-light)" : "var(--surface-soft)" }}>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "var(--brand)" }}>
                    {(user.display_name || "?").charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: "var(--ink)" }}>
                        {user.display_name || "未命名用户"}
                      </span>
                      {isCurrentUser && (
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: "var(--brand)", color: "#fff" }}>当前</span>
                      )}
                    </div>
                    <span className="text-xs" style={{ color: "var(--muted)" }}>
                      {roleConfig?.summary || user.role}
                    </span>
                  </div>

                  {/* Team */}
                  <Badge variant="outline">{user.team === "hq" ? "总部" : "中国区"}</Badge>

                  {/* Role */}
                  {role === "admin" && !isCurrentUser ? (
                    <Select label="" value={user.role}
                      onChange={(e) => updateRole.mutate({ id: user.id, role: e.target.value })}
                      options={Object.entries(ROLE_CONFIG).map(([k, v]) => ({ value: k, label: v.title }))} />
                  ) : (
                    <Badge variant={roleBadge()}>
                      {roleConfig?.title || user.role}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: "var(--muted)" }}>暂无团队成员</p>
        )}
      </div>

      {/* Role Overview */}
      <div className="rounded-xl p-6 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>角色权限说明</h3>
        <div className="grid gap-3">
          {Object.entries(ROLE_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-start gap-3 p-3 rounded-lg" style={{ background: "var(--surface-soft)" }}>
              <span className="text-xs font-mono px-2 py-0.5 rounded shrink-0 mt-0.5"
                style={{ background: "var(--brand-light, rgba(232,122,46,0.1))", color: "var(--brand)" }}>
                {key}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>{config.title}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--muted)" }}>{config.summary}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {config.nav.map((n) => (
                    <span key={n} className="text-xs px-1.5 py-0.5 rounded"
                      style={{ background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)" }}>
                      {n}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Platform Configuration */}
      <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: "var(--ink)" }}>平台配置</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PLATFORMS.map((p) => (
            <div key={p.id} className="flex items-center gap-2 p-3 rounded-lg" style={{ background: "var(--surface-soft)" }}>
              <span className="text-lg">{p.icon}</span>
              <div>
                <div className="text-sm font-medium" style={{ color: "var(--ink)" }}>{p.label}</div>
                <div className="text-xs" style={{ color: "var(--muted)" }}>预算占比 {p.budgetPercent}%</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-6 w-24 rounded mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="h-64 rounded-xl mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
