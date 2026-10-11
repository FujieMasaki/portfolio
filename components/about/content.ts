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
