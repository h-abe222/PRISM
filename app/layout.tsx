import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PRISM - 不動産投資プラットフォーム",
  description: "厳選された高収益物件をVIP会員様にご提供",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        {/* プリロードでスタイルを先読み */}
        <link rel="preload" href="/assets/css/common.css" as="style" />
        <link rel="preload" href="/assets/css/auth.css" as="style" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
