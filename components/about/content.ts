/**
 * /about の展示内容。文面や画像を差し替えるときはここだけを直す。
 */

export type CareerExhibit = {
  number: string;
  /** 年（最後の展示は年の代わりに "Next"） */
  period: string;
  /** 展示の題（英語） */
  title: string;
  /**
   * 壁の解説。段落ごとに、その時期に何をしていたか → そこで何を得たか、の順に書く。
   * 改行位置も展示の一部なので、段落の中は行ごとに分ける
   */
  paragraphs: string[][];
  photo?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    /** 額の中での切り取り位置（object-position） */
    position?: string;
  };
};

/** 文面は公開中のプロフィール（masakifujie.com の Career）をもとに、その時期に何をして何を得たかを短く書いたもの */
export const CAREER: CareerExhibit[] = [
  {
    number: "01",
    period: "2015 - 2016",
    title: "Explore / Canada",
    paragraphs: [
      ["ワーキングホリデーで", "カナダ・トロントへ。", "知り合いのいない環境で、", "住む場所や仕事を自分で探しました。"],
      ["この経験から、新しい環境でも", "まず自分から動くようになりました。"],
    ],
    photo: {
      src: "/images/about/about-career-canada-red-maple.jpg",
      alt: "カナダの公園で、赤く色づいたカエデの木",
      width: 1200,
      height: 1600,
    },
  },
  {
    number: "02",
    period: "2018 - 2020",
    title: "Hospitality",
    paragraphs: [
      ["沖縄のホテル・カフェで、", "接客や運営に携わりました。"],
      [
        "お客様がより良い時間を過ごすために",
        "何ができるかを考える中で、",
        "接客の良さと、ITで改善できることの",
        "両方に興味を持つようになりました。",
      ],
    ],
    photo: {
      src: "/images/about/about-career-hotel-exterior-arc.jpg",
      alt: "灯りのともる吹き抜けと植物が見える、ホテルとカフェのガラス張りの入口",
      width: 1448,
      height: 1086,
    },
  },
  {
    number: "03",
    period: "2020 - 2022",
    title: "Community & Place",
    paragraphs: [
      ["コワーキングスペースやシェアハウス、", "プログラミングスクールの", "運営に関わりました。"],
      [
        "イベントを企画したり、",
        "人同士をつないだりする中で",
        "現役エンジニアと出会い、",
        "Webエンジニアに興味を持ちました。",
      ],
    ],
    photo: {
      src: "/images/about/about-career-community-study-event.jpg",
      alt: "2枚のスクリーンの前で、テーブルを囲んでノートパソコンを開く勉強会",
      width: 1448,
      height: 1086,
    },
  },
  {
    number: "04",
    period: "2022 - Present",
    title: "Software & Product",
    paragraphs: [
      ["Webエンジニアとして、", "飲食・小売、旅行、AI SaaS などの", "プロダクト開発を経験。"],
      ["UI改善や仕様検討、分析にも関わり、", "「何をつくるか」", "「どんな体験にするか」を", "考えることが増えました。"],
    ],
    photo: {
      src: "/images/about/about-workspace.webp",
      alt: "モニターとノートパソコンを並べた、自宅の作業机",
      width: 1448,
      height: 1086,
    },
  },
  {
    number: "05",
    period: "Next",
    title: "Experience",
    // Career の締め：これまでの経験 → 大切にするようになったこと → これからつくりたい体験
    paragraphs: [
      ["ホテルやコミュニティ運営、", "Web開発を経験する中で、", "リアルな場所とデジタルの両方に", "関心を持つようになりました。"],
      [
        "これからは、その両方を使いながら、",
        "人が少し自分に戻れたり、",
        "日々の時間が少し豊かになるような",
        "体験をつくっていきたいと考えています。",
      ],
    ],
  },
];

/** 画像の中で展示物が写っている範囲（px）。透明な余白を除いて展示台に載せるために使う */
type Box = { x: number; y: number; width: number; height: number };

export type Interest = {
  number: string;
  title: string;
  /** 展示物に近づいたときに現れる解説。改行位置も展示の一部なので行ごとに分ける */
  note: string[];
  /** 解説の中で、外部のページへつなぐ語（キャプションの文字のまま、控えめなリンクにする） */
  link?: { text: string; href: string };
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
  /** 展示物を天板の中央から横へずらす量（展示物の幅に対する %、負の値で左） */
  objectShift?: number;
};

/** 好きなこと・関心（物そのものではなく、歩く・見る・過ごすといった体験）を、普段の言葉で短く紹介する解説 */
export const INTERESTS: Interest[] = [
  {
    number: "01",
    // ファッションではなく、歩くこと・移動すること・考えを整理する時間の展示
    title: "Walk",
    note: ["考えたいときは、", "まず歩くことが多いです。"],
    image: {
      src: "/images/about/about-interested-shoose.png",
      alt: "グレーのスエードとメッシュのスニーカー（New Balance 991）",
      width: 1448,
      height: 1086,
      box: { x: 61, y: 115, width: 1359, height: 874 },
    },
    plinth: { height: 0.9, width: 1 },
    // 商品写真のように天板の中央に大きく据えず、少し小さく、左に寄せて「普段の一足」を置いたように見せる
    objectWidth: 61,
    objectShift: -12,
  },
  {
    number: "02",
    title: "Basketball",
    note: ["琉球ゴールデンキングスを", "応援しています。", "試合だけでなく、選手の動きや", "戦術を見るのも好きです。"],
    link: { text: "琉球ゴールデンキングス", href: "https://goldenkings.jp/" },
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
    note: ["居心地のいい場所や、", "空間の工夫を見るのが好きです。"],
    image: {
      src: "/images/about/interest-space.png",
      alt: "3つのアーチを持つこの美術館の建物を、小さくした建築模型",
      width: 1536,
      height: 1024,
      box: { x: 19, y: 242, width: 1499, height: 714 },
    },
    plinth: { height: 1.05, width: 1.45 },
    objectWidth: 82,
  },
  {
    number: "04",
    title: "Alone Time",
    note: ["一人で考えを整理する時間や、", "サウナやお風呂で", "ぼーっと過ごす時間が好きです。"],
    image: {
      src: "/images/about/interest-book.png",
      // 読書ではなく、一人で静かに過ごす時間の象徴として置く
      alt: "一冊の本",
      width: 1229,
      height: 1280,
      box: { x: 171, y: 45, width: 886, height: 1177 },
    },
    plinth: { height: 0.8, width: 0.85 },
    objectWidth: 48,
  },
];
