import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import { Inter, Zen_Kaku_Gothic_New } from "next/font/google";
import "./globals.css";

// 英字・数字は Inter、日本語は Zen Kaku Gothic New で描く（並べ方は globals.css の --font-family-base）
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// 英字は Inter が受け持つので、latin を先読みしない。日本語は unicode-range で、使う文字の分だけ読まれる。
// 600 は無い（300 / 400 / 500 / 700 / 900）ので、見出しも 500 までで組む
const zenKakuGothicNew = Zen_Kaku_Gothic_New({
  variable: "--font-zen-kaku-gothic-new",
  weight: ["400", "500"],
  preload: false,
});

export const metadata: Metadata = {
  title: "Masaki Fujie",
  description: "Masaki Fujie / 藤江正樹 — Web Engineer",
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

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="ja"
      // globals.css の smooth scroll を、ページ遷移で先頭へ戻すときだけ Next に外させる
      // （無いと、順路の案内で前のページの末尾から先頭まで流れるようにスクロールしてしまう）
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${zenKakuGothicNew.variable}`}
    >
      {gtmId && <GoogleTagManager gtmId={gtmId} />}
      <body>{children}</body>
    </html>
  );
};

export default RootLayout;
