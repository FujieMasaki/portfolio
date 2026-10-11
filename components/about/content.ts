/**
 * /about の展示内容。文面や画像を差し替えるときはここだけを直す。
 */

export type CareerExhibit = {
  number: string;
  title: string;
  /** 壁の解説。改行位置も展示の一部なので行ごとに分ける */
  lines: string[];
  period: string;
  photo?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** 額の中での切り取り位置（object-position） */
    position?: string;
  };
};

export const CAREER: CareerExhibit[] = [
  {
    number: "01",
    title: "Canada",
    lines: ["自分の世界が", "広がった風景"],
    period: "2016 - 2017",
    photo: {
      src: "/images/about/about-career-canada-red-maple.jpg",
      alt: "カナダの公園で、赤く色づいたカエデの木",
      width: 1200,
      height: 1600,
    },
  },
  {
    number: "02",
    title: "Hotel",
    lines: ["空間が人の体験を", "変えることを知った時間"],
    period: "2018 - 2020",
    photo: {
      src: "/images/about/about-career-hotel-exterior-arc.jpg",
      alt: "植物と自転車が置かれた、ホテルとカフェの入口",
      width: 768,
      height: 513,
      position: "58% 50%",
    },
  },
  {
    number: "03",
    title: "Community",
    lines: ["人が集まり、学び、", "つながる場をつくる"],
    period: "2020 - 2021",
    photo: {
      src: "/images/about/about-career-community-study-event.jpg",
      alt: "スクリーンにコードを映し、テーブルを囲んで学ぶ勉強会",
      width: 1448,
      height: 1086,
    },
  },
  {
    number: "04",
    title: "Web Engineer",
    lines: ["デジタルでものをつくる", "場所を手に入れた時期"],
    period: "2021 - Now",
    photo: {
      src: "/images/about/about-workspace.webp",
      alt: "モニターとノートパソコンを並べた、自宅の作業机",
      width: 1448,
      height: 1086,
    },
  },
  {
    number: "05",
    title: "NOW / NEXT",
    lines: ["Designing Experiences", "これから、つくっていきたいもの。"],
    period: "",
  },
];

/** 画像の中で展示物が写っている範囲（px）。透明な余白を除いて展示台に載せるために使う */
type Box = { x: number; y: number; width: number; height: number };

export type Interest = {
  number: string;
  title: string;
  /** 展示物に近づいたときに現れる解説 */
  note: string[];
  image: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** 展示物の範囲。未指定なら画像全体 */
    box?: Box;
  };
  /** 展示台の高さ（床からの比率の目安。1 が標準）と幅（列の比率） */
  plinth: { height: number; width: number };
  /** 展示物の幅（展示台の幅に対する %） */
  objectWidth: number;
};

export const INTERESTS: Interest[] = [
  {
    number: "01",
    title: "Style",
    note: ["毎日の服に馴染む、", "ちょうどいい一足。"],
    image: {
      src: "/images/about/about-interested-shoose.png",
      alt: "グレーのスニーカー（New Balance 991v2）",
      width: 1149,
      height: 1369,
      box: { x: 32, y: 378, width: 1117, height: 630 },
    },
    plinth: { height: 0.9, width: 1 },
    objectWidth: 74,
  },
  {
    number: "02",
    title: "Basketball",
    note: ["観るのも、", "やるのも好き。"],
    image: {
      src: "/images/about/basket-ball.png",
      alt: "使い込まれたバスケットボール",
      width: 1325,
      height: 1187,
      box: { x: 245, y: 226, width: 835, height: 846 },
    },
    plinth: { height: 1.2, width: 0.9 },
    objectWidth: 56,
  },
  {
    number: "03",
    title: "Space",
    note: ["居心地のいい場所や、", "空間の工夫を見るのが好き。"],
    image: {
      src: "/images/about/interented-space.png",
      alt: "3つのアーチを持つこの美術館の建物を、小さくした建築模型",
      width: 1536,
      height: 1024,
      box: { x: 39, y: 363, width: 1476, height: 661 },
    },
    plinth: { height: 1.05, width: 1.45 },
    objectWidth: 82,
  },
  {
    number: "04",
    title: "Alone Time",
    note: ["一人で考えを整理する", "ための時間。"],
    image: {
      src: "/images/about/interested-book.png",
      alt: "一冊の本",
      width: 1295,
      height: 1214,
      box: { x: 280, y: 98, width: 806, height: 1034 },
    },
    plinth: { height: 0.8, width: 0.85 },
    objectWidth: 48,
  },
];
