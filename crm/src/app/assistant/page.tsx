import type { Metadata } from "next";
import SedaAiAssistant from "@/components/ai-assistant/SedaAiAssistant";

export const metadata: Metadata = {
  title: "AI升学助手",
  description: "AI升学咨询助手",
};

export default function AssistantPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-5xl flex-col items-center justify-center gap-6">
        <div className="text-center">
          <h1 className="m-0 text-2xl font-bold text-slate-950">AI升学助手</h1>
          <p className="mt-2 text-sm text-slate-600">
            输入升学问题，获取简明参考建议
          </p>
        </div>
        <SedaAiAssistant mode="page" />
      </div>
    </main>
  );
}
