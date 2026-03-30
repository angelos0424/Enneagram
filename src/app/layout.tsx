import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

function resolveMetadataBase(): URL {
  return new URL(process.env.APP_ORIGIN ?? "http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "에니어그램 모바일 검사",
  description: "로그인 없이 바로 시작하는 모바일 우선 에니어그램 검사 경험.",
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="ko">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
