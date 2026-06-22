"use client";

import Image from "next/image";
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
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(circle at 12% 18%, rgba(196,147,69,0.14), transparent 28%), linear-gradient(135deg, #f7f3ea 0%, #ffffff 44%, #eef2f6 100%)",
        color: "#061a38",
      }}
    >
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden border-r border-[#ded6cb] px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-16">
          <div>
            <Image
              src="/seda-logo-blue.png"
              alt="SEDA International Education"
              width={292}
              height={59}
              priority
              className="h-11 w-auto object-contain"
            />

            <div className="mt-20 max-w-2xl">
              <div className="mb-7 inline-flex items-center gap-3 rounded-full border border-[#d8c7a7] bg-white/65 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#8a642e]">
                AI + Content + Enrollment
              </div>
              <h1 className="text-[64px] font-semibold leading-[0.98] tracking-normal text-[#061a38] xl:text-[76px]">
                SEDA
                <br />
                Content OS
              </h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#53606d]">
                给内容团队、账号矩阵和招生转化使用的统一工作台。每天发布、AI 生成、真实资料、IP 资产和线索来源都在一个系统里回看。
              </p>
            </div>
          </div>

          <div className="grid max-w-2xl grid-cols-2 gap-3">
            {[
              ["01", "今日任务", "运营人员看到每天该发什么"],
              ["02", "内容归档", "按日期、平台、账号快速回看"],
              ["03", "AI 素材", "Prompt、改写和成稿统一复用"],
              ["04", "招生线索", "内容来源绑定到 CRM 转化"],
            ].map(([index, title, detail]) => (
              <div key={title} className="border-t border-[#d8c7a7] pt-4">
                <p className="text-xs font-semibold text-[#b1823d]">{index}</p>
                <p className="mt-2 text-base font-semibold text-[#061a38]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#66717d]">{detail}</p>
              </div>
            ))}
          </div>

          <div className="absolute bottom-12 right-10 h-48 w-48 rounded-full border border-[#d8c7a7]/70" />
          <div className="absolute bottom-20 right-24 h-24 w-24 rounded-full border border-[#061a38]/15" />
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[440px]">
            <div className="mb-9 flex items-center gap-4 lg:hidden">
              <Image
                src="/seda-logo-blue.png"
                alt="SEDA International Education"
                width={292}
                height={59}
                priority
                className="h-10 w-auto object-contain"
              />
            </div>

            <div className="mb-8 flex items-center gap-4">
              <Image
                src="/seda-os-mark.svg"
                alt="SEDA OS"
                width={56}
                height={56}
                className="h-14 w-14 rounded-[18px] shadow-[0_16px_36px_rgba(6,26,56,0.18)]"
              />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#b1823d]">
                  SEDA OS
                </p>
                <h2 className="mt-1 text-3xl font-semibold tracking-normal text-[#061a38]">
                  登录工作台
                </h2>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#ddd4c8] bg-white/82 p-7 shadow-[0_28px_80px_rgba(6,26,56,0.10)] backdrop-blur sm:p-8">
              <div className="mb-7">
                <p className="text-sm font-medium text-[#5c6874]">
                  AI 内容生产、账号矩阵、每日发布归档和招生 CRM 的统一入口。
                </p>
              </div>

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
                    className="w-full rounded-2xl px-4 py-3.5 text-[15px] outline-none transition-all focus:border-[#061a38] focus:bg-white focus:ring-4 focus:ring-[#061a38]/10"
                    style={{
                      background: "#f7f3ea",
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
                    className="w-full rounded-2xl px-4 py-3.5 text-[15px] outline-none transition-all focus:border-[#061a38] focus:bg-white focus:ring-4 focus:ring-[#061a38]/10"
                    style={{
                      background: "#f7f3ea",
                      border: "1px solid #ded6cb",
                      color: "#061a38",
                    }}
                  />
                </label>

                <div className="flex items-center justify-between gap-4">
                  <label className="flex cursor-pointer select-none items-center gap-2 px-1">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      style={{ accentColor: "#061a38" }}
                    />
                    <span className="text-xs font-medium text-[#66717d]">记住登录账号</span>
                  </label>
                  <span className="text-xs font-medium text-[#9b8b75]">Team access only</span>
                </div>

                {error && (
                  <p className="rounded-2xl border border-[#f0c9c9] bg-[#fff4f4] px-4 py-3 text-xs font-medium text-[#b42323]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-1 w-full rounded-2xl px-4 py-3.5 text-[15px] font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_34px_rgba(6,26,56,0.22)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                  style={{ background: "#061a38" }}
                >
                  {loading ? "登录中..." : "进入 SEDA Content OS"}
                </button>
              </form>

              <p className="mt-6 text-center text-xs leading-6 text-[#9b8b75]">
                如需账号或权限，请联系系统管理员
              </p>
            </div>

            <p className="mt-7 text-center text-[11px] leading-5 text-[#9b8b75]">
              © 2026 Singapore Education Development Association
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
