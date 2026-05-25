"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)",
      }}
    >
      <div
        className="w-full max-w-sm mx-4 p-8 rounded-2xl"
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
        }}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{ background: "var(--brand)" }}
          >
            BCI
          </div>
          <div>
            <div className="font-bold text-base" style={{ color: "var(--ink)" }}>
              自媒体矩阵获客系统
            </div>
            <div className="text-xs" style={{ color: "var(--muted)" }}>
              Content to Enrollment
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              邮箱
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@bci.edu.sg"
              required
              autoComplete="email"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-medium" style={{ color: "var(--muted)" }}>
              密码
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入密码"
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
              style={{
                background: "var(--surface-soft)",
                border: "1px solid var(--border)",
                color: "var(--ink)",
              }}
            />
          </label>

          {error && (
            <p className="text-xs px-1" style={{ color: "var(--red)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-opacity disabled:opacity-60"
            style={{ background: "var(--brand)" }}
          >
            {loading ? "登录中..." : "登 录"}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--muted)" }}>
          BCI WACE 7-12 招生增长系统
          <br />
          如需账号请联系管理员
        </p>
      </div>
    </div>
  );
}
