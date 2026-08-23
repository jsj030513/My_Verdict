import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "내 편 판결소 — 오늘의 억울함을 판결해 드려요",
  description: "말 못 하고 삼킨 오늘의 억울함, 내 편 판결소가 속 시원히 판결해 드립니다.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
