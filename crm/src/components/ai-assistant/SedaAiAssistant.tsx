"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const QUICK_QUESTIONS = [
  "AEIS是什么",
  "O-Level是什么",
  "WACE申请大学",
  "新加坡国际学校",
  "香港大学申请",
];

const WELCOME_TEXT = `您好，我是AI升学助手。

我可以帮助解答：

• AEIS
• O-Level
• WACE
• 新加坡学校
• 新加坡大学
• 香港大学

请直接输入您的问题。`;

const wechatId =
  process.env.NEXT_PUBLIC_ADVISOR_WECHAT_ID ||
  process.env.NEXT_PUBLIC_SEDA_WECHAT_ID ||
  "请配置顾问微信号";
const wechatQrUrl =
  process.env.NEXT_PUBLIC_ADVISOR_WECHAT_QR_URL ||
  process.env.NEXT_PUBLIC_SEDA_WECHAT_QR_URL ||
  "";

export default function SedaAiAssistant({
  mode = "floating",
}: {
  mode?: "floating" | "page";
}) {
  const [open, setOpen] = useState(mode === "page");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: WELCOME_TEXT },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  const canSend = useMemo(() => input.trim().length > 0 && !isLoading, [input, isLoading]);

  async function ask(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    setInput("");
    setMessages((current) => [...current, { role: "user", content: trimmed }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-assistant/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "请求失败");
      }

      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer || "抱歉，暂时没有获得有效回答。" },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            "抱歉，AI助手暂时无法连接。您可以先添加顾问微信，由老师为您解答。",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  async function handleWechatClick() {
    void fetch("/api/ai-assistant/wechat-click", { method: "POST" });

    try {
      await navigator.clipboard.writeText(wechatId);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch {
      setCopyState("idle");
    }
  }

  function openPanel() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  }

  const chatWindow = (
    <section
      className={`flex flex-col overflow-hidden rounded-lg bg-white shadow-2xl ${
        mode === "page"
          ? "h-[min(760px,calc(100vh-4rem))] w-full max-w-3xl"
          : "mb-3 h-[620px] max-h-[calc(100vh-7rem)] w-[380px] max-w-[calc(100vw-2.5rem)]"
      }`}
      style={{ border: "1px solid var(--border)" }}
      aria-label="AI升学助手聊天窗口"
    >
      <header className="flex items-center justify-between px-4 py-3 text-white" style={{ background: "#b91c1c" }}>
        <div className="font-semibold">AI升学助手</div>
        {mode === "floating" && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-8 w-8 rounded-md border border-white/25 bg-white/10 text-lg leading-none text-white transition hover:bg-white/20"
            aria-label="关闭AI升学助手"
          >
            ×
          </button>
        )}
      </header>

          <div className="flex gap-2 overflow-x-auto px-3 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
            {QUICK_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => ask(question)}
                className="shrink-0 rounded-full border px-3 py-1.5 text-xs transition hover:bg-red-50"
                style={{ borderColor: "#fecaca", color: "#991b1b" }}
                disabled={isLoading}
              >
                {question}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ background: "#fafafa" }}>
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[86%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-red-700 text-white"
                      : "bg-white text-slate-800 shadow-sm"
                  }`}
                  style={message.role === "assistant" ? { border: "1px solid #eceff3" } : undefined}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
                  正在思考...
                </div>
              </div>
            )}

            {messages.length > 1 && (
              <div className="rounded-lg bg-white p-3 text-center text-sm shadow-sm" style={{ border: "1px solid #fee2e2" }}>
                <div className="mb-2 text-slate-300">━━━━━━━━━━</div>
                <div className="font-semibold text-slate-900">🎓 免费升学规划</div>
                <div className="mt-1 text-slate-600">添加顾问微信</div>
                {wechatQrUrl ? (
                  <img
                    src={wechatQrUrl}
                    alt="顾问微信二维码"
                    className="mx-auto mt-3 h-28 w-28 rounded-md object-cover"
                  />
                ) : (
                  <div className="mx-auto mt-3 flex h-28 w-28 items-center justify-center rounded-md bg-slate-100 text-xs text-slate-500">
                    微信二维码
                  </div>
                )}
                <div className="mt-2 font-medium text-slate-800">{wechatId}</div>
                <button
                  type="button"
                  onClick={handleWechatClick}
                  className="mt-3 w-full rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-red-800"
                >
                  {copyState === "copied" ? "已复制微信号" : "立即咨询"}
                </button>
                <div className="mt-2 text-slate-300">━━━━━━━━━━</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 p-3" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="请输入您的升学问题"
              maxLength={500}
              className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-700"
            />
            <button
              type="submit"
              disabled={!canSend}
              className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              发送
            </button>
          </form>
        </section>
  );

  if (mode === "page") {
    return chatWindow;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans">
      {open && chatWindow}

      <button
        type="button"
        onClick={openPanel}
        className="rounded-full bg-red-700 px-5 py-3 text-sm font-semibold text-white shadow-xl transition hover:bg-red-800"
        aria-label="打开AI升学助手"
      >
        🤖 AI升学助手
      </button>
    </div>
  );
}
