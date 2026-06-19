"use client";

export default function AiAssistantPage() {
  return (
    <div className="w-full">
      <iframe
        src="https://sgeda-tools.vercel.app/?source=crm"
        title="升学咨询工具"
        className="w-full rounded-lg"
        style={{ height: "calc(100vh - 6.5rem)", border: "1px solid var(--border)", background: "#fff" }}
        allow="clipboard-write; clipboard-read; microphone; camera"
      />
    </div>
  );
}
