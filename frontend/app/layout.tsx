import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Todo",
  description: "Next.js와 FastAPI로 만든 Todo 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

