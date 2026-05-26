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
          <div className="flex items-center gap-1 mb-1">
            <svg width="140" height="36" viewBox="0 0 140 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* S */}
              <path d="M0 28.5C0 28.5 2.5 32 8.5 32C14.5 32 17 28.5 17 25.5C17 19 0 20 0 13.5C0 10.5 3 7 9 7C15 7 17.5 10.5 17.5 10.5" stroke="#C49A3C" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
              {/* E */}
              <path d="M24 31V8H38M24 19.5H36M24 31H38" stroke="#C49A3C" strokeWidth="3.5" strokeLinecap="round"/>
              {/* D */}
              <path d="M45 8H53C60 8 65 13 65 19.5C65 26 60 31 53 31H45V8Z" stroke="#C49A3C" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              {/* A with dark triangle */}
              <path d="M72 31L84 8L96 31" stroke="#C49A3C" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M77 22H91" stroke="#C49A3C" strokeWidth="3.5" strokeLinecap="round"/>
              <polygon points="84,10 79,20 89,20" fill="#1e2a3a"/>
              {/* Separator */}
              <line x1="106" y1="7" x2="106" y2="32" stroke="#d4c5a9" strokeWidth="1.5"/>
              {/* OS */}
              <text x="115" y="24" fontFamily="Arial, sans-serif" fontSize="16" fontWeight="700" fill="#1e2a3a" letterSpacing="2">OS</text>
            </svg>
          </div>
          <div style={{ color: "#8a7d6b", fontSize: "10px", letterSpacing: "2px", marginTop: "4px" }}>
            SINGAPORE EDUCATION PATHWAYS
          </div>
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
              placeholder="name@seda.edu.sg"
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

          {error && (
            <p className="text-xs px-1" style={{ color: "#d94f4f" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-white font-medium text-sm transition-opacity disabled:opacity-60"
            style={{ background: "#C49A3C" }}
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
