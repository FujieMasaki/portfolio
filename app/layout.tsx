import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Shippori_Mincho, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const shipporiMincho = Shippori_Mincho({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500"],
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Masaki Fujie",
  description: "Masaki Fujie / 藤江正樹 — Product Engineer",
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
      {
        url: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
    shortcut: "/favicon.png",
  },
};

const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${shipporiMincho.variable} ${notoSansJP.variable}`}
    >
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body>{children}</body>
    </html>
  );
}
