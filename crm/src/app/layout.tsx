import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BCI 自媒体矩阵获客系统",
  description: "Content to Enrollment - BCI WACE 7-12 招生增长系统",
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
