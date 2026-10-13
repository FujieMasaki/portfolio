/**
 * /work の展示内容。文面や画像・リンク先を差し替えるときはここだけを直す。
 * Writing の記事そのものは、Zenn・note の RSS から読む（feeds.ts）。
 */

export type WritingSource = {
  name: string;
  /** 媒体名のリンク先（書き手のページ。すべての記事） */
  site: string;
  feed: string;
};

export const WRITING: WritingSource[] = [
  { name: "Zenn", site: "https://zenn.dev/fujee", feed: "https://zenn.dev/fujee/feed" },
  { name: "note", site: "https://note.com/fujee", feed: "https://note.com/fujee/rss" },
];

/** 画像の中で展示物が写っている範囲（px）。透明な余白を除いて展示台に載せるために使う */
type Box = { x: number; y: number; width: number; height: number };

export type DeviceImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  box: Box;
};

export type Project = {
  /** 種類の札（Personal Project など） */
  kind: string;
  /** 進み具合の札 */
  status: string;
  title: string;
  /** 壁の解説。改行位置も展示の一部なので行ごとに分ける */
  description: string[];
  /** 公開したページ。無い間は View Project を出さない */
  url?: string;
  /** これから取り組むこと。リンクではなく、壁に書いた予定として並べる */
  next: string[];
  laptop: DeviceImage;
  mobile: DeviceImage;
};

export const PROJECT: Project = {
  kind: "Personal Project",
  status: "In progress",
  title: "Focus on Dot",
  description: ["音声で思考を整理する、", "ジャーナリングサービスを企画・開発しています。", "現在、MVPを開発中です。"],
  next: ["Experience Design", "Prototype (MVP)", "LP"],
  laptop: {
    src: "/images/work/focus-on-dot-laptop.png",
    alt: "Focus on Dot の画面を開いたノートパソコン。青くにじむ点と「00:12」の表示、「いまの自分に、少し深く呼吸をしよう」の一文",
    width: 1774,
    height: 887,
    box: { x: 304, y: 118, width: 1166, height: 669 },
  },
  mobile: {
    src: "/images/work/focus-on-dot-mobile.png",
    alt: "同じ画面を開いたスマートフォン",
    width: 1536,
    height: 1024,
    box: { x: 563, y: 136, width: 410, height: 768 },
  },
};

export type Study = {
  number: string;
  title: string;
  icon: "flask" | "cloud";
  description: string[];
  /** まとめたページ。無い間はリンクを出さず、「準備中」の説明板として見せる */
  link?: { label: string; href: string };
};

export const STUDIES: Study[] = [
  {
    number: "01",
    title: "体験学",
    icon: "flask",
    description: ["実際に体験したホテル、温浴施設、", "飲食店などから、良かった理由を", "考察する場所です。"],
  },
  {
    number: "02",
    title: "空想学",
    icon: "cloud",
    description: ["サウナや日常で浮かんだ", "アイデア・サービス・空想を", "まとめる場所です。"],
  },
];
