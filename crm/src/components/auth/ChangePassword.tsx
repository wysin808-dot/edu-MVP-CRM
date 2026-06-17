"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

const inputCls =
  "w-full px-3 py-2 rounded-lg text-sm outline-none bg-[var(--surface-soft)] border border-[var(--border)] text-[var(--ink)] focus:border-blue-500";

function useChangePassword(onDone?: () => void) {
  const { refreshProfile } = useAuth();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function submit() {
    setError(null);
    if (pw.length < 6) { setError("密码至少 6 位"); return; }
    if (pw !== pw2) { setError("两次输入不一致"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/me/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "修改失败"); return; }
      setOk(true);
      await refreshProfile();
      setPw(""); setPw2("");
      onDone?.();
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  }

  return { pw, setPw, pw2, setPw2, loading, error, ok, submit };
}

function Fields({ s }: { s: ReturnType<typeof useChangePassword> }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>新密码（至少 6 位）</label>
        <input type="password" value={s.pw} onChange={(e) => s.setPw(e.target.value)} className={inputCls}
          placeholder="输入新密码" autoComplete="new-password" />
      </div>
      <div>
        <label className="block text-xs font-medium mb-1" style={{ color: "var(--ink)" }}>确认新密码</label>
        <input type="password" value={s.pw2} onChange={(e) => s.setPw2(e.target.value)} className={inputCls}
          placeholder="再输一次" autoComplete="new-password"
          onKeyDown={(e) => { if (e.key === "Enter") s.submit(); }} />
      </div>
      {s.error && <p className="text-xs text-red-600">{s.error}</p>}
    </div>
  );
}

// 自助修改密码（侧边栏点开）
export function ChangePasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const s = useChangePassword();
  return (
    <Modal isOpen={open} onClose={onClose} title="🔑 修改密码"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={s.submit} disabled={s.loading}>
            {s.loading ? "保存中..." : "确认修改"}
          </Button>
        </div>
      }>
      {s.ok ? (
        <p className="text-sm" style={{ color: "var(--green)" }}>✅ 密码已修改，下次登录请用新密码。</p>
      ) : (
        <Fields s={s} />
      )}
    </Modal>
  );
}

// 强制首次改密码（全屏拦截，不能跳过）
export function ForceChangePassword() {
  const { signOut } = useAuth();
  const s = useChangePassword();
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm rounded-2xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <h2 className="text-lg font-bold m-0 mb-1" style={{ color: "var(--ink)" }}>设置你的新密码</h2>
        <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
          首次登录，请先把临时密码改成你自己的密码。
        </p>
        <Fields s={s} />
        <Button variant="primary" onClick={s.submit} disabled={s.loading} className="w-full mt-4">
          {s.loading ? "保存中..." : "设置并进入系统"}
        </Button>
        <button onClick={signOut}
          className="w-full mt-2 text-xs py-2 cursor-pointer border-none bg-transparent" style={{ color: "var(--muted)" }}>
          退出登录
        </button>
      </div>
    </div>
  );
}
