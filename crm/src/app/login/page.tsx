"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REMEMBER_KEY = "seda_login_email";

function getRememberedEmail() {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(REMEMBER_KEY) ?? "";
  } catch {
    return "";
  }
}

export default function LoginPage() {
  const [email, setEmail] = useState(getRememberedEmail);
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "邮箱或密码错误"
          : authError.message,
      );
      setLoading(false);
      return;
    }

    // 登录成功后，按勾选决定是否记住账号（只记邮箱，不记密码）
    try {
      if (remember) {
        localStorage.setItem(REMEMBER_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_KEY);
      }
    } catch {
      // Local storage can be disabled in private browsers.
    }

    window.location.href = "/dashboard";
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-5 py-8"
      style={{ background: "#f7f3ea", color: "#061a38" }}
    >
      <div className="w-full max-w-[400px]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c8792]">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@bci.edu.sg"
              required
              autoComplete="email"
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-all focus:ring-2 focus:ring-[#061a38]/20"
              style={{
                background: "#fff",
                border: "1px solid #ded6cb",
                color: "#061a38",
              }}
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7c8792]">
              Password
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
              autoComplete="current-password"
              className="w-full rounded-xl px-4 py-3 text-[15px] outline-none transition-all focus:ring-2 focus:ring-[#061a38]/20"
              style={{
                background: "#fff",
                border: "1px solid #ded6cb",
                color: "#061a38",
              }}
            />
          </label>

          <label className="flex cursor-pointer select-none items-center gap-2">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: "#061a38" }}
            />
            <span className="text-xs font-medium text-[#66717d]">记住账号</span>
          </label>

          {error && (
            <p className="rounded-xl border border-[#f0c9c9] bg-[#fff4f4] px-4 py-3 text-xs font-medium text-[#b42323]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl px-4 py-3 text-[15px] font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            style={{ background: "#061a38" }}
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>
      </div>
    </main>
  );
}
