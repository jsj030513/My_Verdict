import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://my-side-court.wkdtjdwn030513.chatgpt.site"),
  title: "내 편 판결소 — 오늘의 억울함을 판결해 드려요",
  description: "말 못 하고 삼킨 오늘의 억울함, 내 편 판결소가 속 시원히 판결해 드립니다.",
  openGraph: {
    title: "내 편 판결소",
    description: "그건 좀 억울했겠다. 오늘의 억울함을 속 시원히 판결해 드려요.",
    images: [{ url: "/og.png", width: 1731, height: 909, alt: "내 편 판결소" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "내 편 판결소",
    description: "그건 좀 억울했겠다. 오늘의 억울함을 속 시원히 판결해 드려요.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
