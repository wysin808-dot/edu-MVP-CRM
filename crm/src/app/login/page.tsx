"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const REMEMBER_KEY = "seda_login_email";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 读取上次记住的登录账号
  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_KEY);
      if (saved) { setEmail(saved); setRemember(true); }
    } catch { /* ignore */ }
  }, []);

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
      setError(authError.message === "Invalid login credentials"
        ? "邮箱或密码错误"
        : authError.message
      );
      setLoading(false);
      return;
    }

    // 登录成功后，按勾选决定是否记住账号（只记邮箱，不记密码）
    try {
      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
    } catch { /* ignore */ }

    window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center"
      style={{
        background: "linear-gradient(145deg, #faf8f5 0%, #f5f0ea 50%, #faf8f5 100%)",
      }}
    >
      <div
        className="w-full max-w-sm mx-4 p-8 rounded-2xl"
        style={{
          background: "#ffffff",
          border: "1px solid #e8e0d6",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
        }}
      >
        {/* SEDA Logo */}
        <div className="flex flex-col items-center mb-8">
          <img
            src="/seda-logo-blue.png"
            alt="SEDA International Education"
            className="w-72 object-contain"
          />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium" style={{ color: "#8a7d6b" }}>
              邮箱
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@seda.org.sg"
              required
              autoComplete="email"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "#faf8f5",
                border: "1px solid #e8e0d6",
                color: "#2c2c2c",
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium" style={{ color: "#8a7d6b" }}>
              密码
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
              style={{
                background: "#faf8f5",
                border: "1px solid #e8e0d6",
                color: "#2c2c2c",
              }}
            />
          </label>

          <label className="flex items-center gap-2 px-1 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: "#2563eb" }}
            />
            <span className="text-xs" style={{ color: "#8a7d6b" }}>记住登录账号</span>
          </label>

          {error && (
            <p className="text-xs px-1" style={{ color: "#d94f4f" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-opacity disabled:opacity-60"
            style={{ background: "#2563eb" }}
          >
            {loading ? "登录中..." : "登 录"}
          </button>
        </form>

        <p className="text-center mt-6" style={{ color: "#b0a694", fontSize: "10px", lineHeight: "1.6" }}>
          如需账号请联系管理员
        </p>
      </div>

      <p className="mt-6" style={{ color: "#b0a694", fontSize: "10px", letterSpacing: "0.5px" }}>
        &copy; 2026 Marketing Department, Singapore Education Development Association
      </p>
    </div>
  );
}
