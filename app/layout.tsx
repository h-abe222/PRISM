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
      <body>
        {children}
      </body>
    </html>
  );
}
