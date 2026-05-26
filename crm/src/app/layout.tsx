import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SEDA OS",
  description: "Singapore Education Pathways - Marketing & Enrollment System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
