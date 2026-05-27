"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { ROLE_CONFIG, PLATFORMS, type UserRole } from "@/lib/constants";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import type { UserProfile } from "@/lib/types";

function useUserProfiles() {
  const { role, profile } = useAuth();
  const team = role === "lead" ? profile?.team : null;

  return useQuery({
    queryKey: ["user_profiles", { team }],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: true });

      if (team) query = query.eq("team", team);

      const { data, error } = await query;
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

function useUpdateUserProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<UserProfile> & { id: string }) => {
      const supabase = createClient();
      const { error } = await supabase
        .from("user_profiles")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
    },
  });
}

const LEAD_ASSIGNABLE_ROLES: UserRole[] = ["operator", "ai", "admission"];

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { role, profile } = useAuth();
  const isAdmin = role === "admin";
  const isLead = role === "lead";
  const { data: users, isLoading } = useUserProfiles();
  const updateRole = useUpdateUserRole();
  const updateProfile = useUpdateUserProfile();

  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({ display_name: "", team: "" });
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "", password: "", display_name: "", role: "operator",
    team: profile?.team || "china",
  });
  const [inviting, setInviting] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ success?: boolean; error?: string; email?: string } | null>(null);

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

  const openEditUser = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      display_name: user.display_name || "",
      team: user.team || "china",
    });
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const updates: Partial<UserProfile> & { id: string } = {
        id: editingUser.id,
        display_name: editForm.display_name || null,
      };
      if (isAdmin) {
        updates.team = editForm.team;
      }
      await updateProfile.mutateAsync(updates);
      setEditingUser(null);
    } catch {
      alert("保存失败，请重试");
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (isLead && (newRole === "admin" || newRole === "lead")) return;
    try {
      await updateRole.mutateAsync({ id: userId, role: newRole });
    } catch {
      alert("角色更改失败，请重试");
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteForm.email || !inviteForm.password || !inviteForm.display_name) return;
    setInviting(true);
    setInviteResult(null);
    try {
      const payload = {
        ...inviteForm,
        team: isLead ? profile?.team : inviteForm.team,
      };
      const res = await fetch("/api/invite-member", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setInviteResult({ success: true, email: inviteForm.email });
        setInviteForm({ email: "", password: "", display_name: "", role: "operator", team: profile?.team || "china" });
        queryClient.invalidateQueries({ queryKey: ["user_profiles"] });
      } else {
        setInviteResult({ error: data.error || "邀请失败" });
      }
    } catch {
      setInviteResult({ error: "网络错误，请重试" });
    } finally {
      setInviting(false);
    }
  };

  if (isLoading) return <PageSkeleton />;

  const roleCounts = users?.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const inviteRoleOptions = isLead
    ? LEAD_ASSIGNABLE_ROLES.map((k) => ({ value: k, label: ROLE_CONFIG[k].title }))
    : Object.entries(ROLE_CONFIG).map(([k, v]) => ({ value: k, label: v.title }));

  const canChangeRole = (targetUser: UserProfile) => {
    if (targetUser.id === profile?.id) return false;
    if (isAdmin) return true;
    if (isLead && targetUser.role !== "admin" && targetUser.role !== "lead") return true;
    return false;
  };

  const roleChangeOptions = (targetUser: UserProfile) => {
    if (isAdmin) {
      return Object.entries(ROLE_CONFIG).map(([k, v]) => ({ value: k, label: v.title }));
    }
    if (isLead) {
      return LEAD_ASSIGNABLE_ROLES.map((k) => ({ value: k, label: ROLE_CONFIG[k].title }));
    }
    return [];
  };

  const canEditUser = (targetUser: UserProfile) => {
    if (targetUser.id === profile?.id) return false;
    if (isAdmin) return true;
    if (isLead && targetUser.role !== "admin" && targetUser.role !== "lead") return true;
    return false;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-lg font-bold mb-1" style={{ color: "var(--ink)" }}>系统设置</h2>
      {isLead && (
        <p className="text-xs mb-6" style={{ color: "var(--muted)" }}>
          当前管理: {profile?.team === "hq" ? "总部 (新加坡)" : "中国区"} 团队
        </p>
      )}
      {isAdmin && <div className="mb-6" />}

      {/* Team Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {Object.entries(ROLE_CONFIG).map(([key, config]) => (
          <div key={key} className="rounded-xl p-3 text-center"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="text-xl font-bold" style={{ color: "var(--brand)" }}>
              {roleCounts[key] || 0}
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>{config.title}</div>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="rounded-xl p-6 mb-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            {isLead ? "我的团队" : "团队成员"}{" "}
            <span className="font-normal text-xs" style={{ color: "var(--muted)" }}>· {users?.length || 0} 人</span>
          </h3>
          {(isAdmin || isLead) && (
            <Button variant="primary" size="sm" onClick={() => { setShowInvite(true); setInviteResult(null); }}>
              + 邀请成员
            </Button>
          )}
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
                  style={{ background: isCurrentUser ? "rgba(232,122,46,0.05)" : "var(--surface-soft)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{ background: "var(--brand)" }}>
                    {(user.display_name || "?").charAt(0)}
                  </div>

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

                  <Badge variant="outline">{user.team === "hq" ? "总部" : "中国区"}</Badge>

                  {canChangeRole(user) ? (
                    <Select label="" value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      options={roleChangeOptions(user)} />
                  ) : (
                    <Badge variant={roleBadge()}>
                      {roleConfig?.title || user.role}
                    </Badge>
                  )}

                  {canEditUser(user) && (
                    <button
                      onClick={() => openEditUser(user)}
                      className="text-xs px-2 py-1 rounded transition-colors"
                      style={{ color: "var(--brand)", background: "transparent" }}
                      onMouseEnter={(e) => e.currentTarget.style.background = "rgba(232,122,46,0.1)"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      编辑
                    </button>
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
                style={{ background: "rgba(232,122,46,0.1)", color: "var(--brand)" }}>
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

      {/* Invite Member Modal */}
      <Modal isOpen={showInvite} onClose={() => setShowInvite(false)} title="邀请新成员"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowInvite(false)}>取消</Button>
            <Button variant="primary" onClick={handleInvite} disabled={inviting}>
              {inviting ? "邀请中..." : "创建并邀请"}
            </Button>
          </div>
        }>
        <form onSubmit={handleInvite} className="flex flex-col gap-4">
          {inviteResult?.success && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "#f0fdf4", border: "1px solid #86efac", color: "#166534" }}>
              成员 {inviteResult.email} 已创建成功！请将登录邮箱和密码告知该成员。
            </div>
          )}
          {inviteResult?.error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b" }}>
              {inviteResult.error}
            </div>
          )}
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>登录邮箱 *</label>
            <input type="email" value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="employee@seda.edu.sg" />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>初始密码 *</label>
            <input type="text" value={inviteForm.password}
              onChange={(e) => setInviteForm({ ...inviteForm, password: e.target.value })} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="至少 6 位" minLength={6} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>显示名称 *</label>
            <input type="text" value={inviteForm.display_name}
              onChange={(e) => setInviteForm({ ...inviteForm, display_name: e.target.value })} required
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="例: 运营小李" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="角色" value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              options={inviteRoleOptions} />
            {isAdmin ? (
              <Select label="团队" value={inviteForm.team}
                onChange={(e) => setInviteForm({ ...inviteForm, team: e.target.value })}
                options={[
                  { value: "china", label: "中国区" },
                  { value: "hq", label: "总部 (新加坡)" },
                ]} />
            ) : (
              <div>
                <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>团队</label>
                <div className="px-3 py-2 rounded-lg text-sm"
                  style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                  {profile?.team === "hq" ? "总部 (新加坡)" : "中国区"}
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal isOpen={!!editingUser} onClose={() => setEditingUser(null)}
        title={`编辑成员: ${editingUser?.display_name || "未命名"}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditingUser(null)}>取消</Button>
            <Button variant="primary" onClick={handleSaveUser} disabled={updateProfile.isPending}>
              {updateProfile.isPending ? "保存中..." : "保存"}
            </Button>
          </div>
        }>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>显示名称</label>
            <input type="text" value={editForm.display_name}
              onChange={(e) => setEditForm({ ...editForm, display_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--ink)" }}
              placeholder="输入显示名称" />
          </div>
          {isAdmin && (
            <Select label="所属团队" value={editForm.team}
              onChange={(e) => setEditForm({ ...editForm, team: e.target.value })}
              options={[
                { value: "china", label: "中国区" },
                { value: "hq", label: "总部 (新加坡)" },
              ]} />
          )}
          {isLead && (
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>所属团队</label>
              <div className="px-3 py-2 rounded-lg text-sm"
                style={{ background: "var(--surface-soft)", border: "1px solid var(--border)", color: "var(--muted)" }}>
                {editForm.team === "hq" ? "总部 (新加坡)" : "中国区"}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto animate-pulse">
      <div className="h-6 w-24 rounded mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 rounded-xl" style={{ background: "var(--surface-soft)" }} />
        ))}
      </div>
      <div className="h-64 rounded-xl mb-6" style={{ background: "var(--surface-soft)" }} />
      <div className="h-48 rounded-xl" style={{ background: "var(--surface-soft)" }} />
    </div>
  );
}
