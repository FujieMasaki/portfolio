/**
 * TOP ヒーローの「舞台」定義。
 *
 * すべての座標は完成イメージ（public/images/reference/top-final-reference.png,
 * 1672 x 941）上のピクセルで書き、描画時に % へ変換する。
 * 前景植物の PNG がこのキャンバスと同寸・同位置で作られているため、
 * ここを基準にすると完成イメージとレイヤーがずれない。
 */

import { WIND_STRENGTH, type AmbientId } from "@/components/museum/ambient";
import type { AmbientVariables } from "@/components/museum/AmbientRoot";
import type { BuildingLayers } from "@/components/museum/LayeredBuilding";
import { seaSkyVariables } from "@/components/museum/seaSky";

export const CANVAS = { width: 1672, height: 941 } as const;

type Rect = { x: number; y: number; width: number; height: number };

export const toPercentBox = ({ x, y, width, height }: Rect) => {
  return {
    left: `${(x / CANVAS.width) * 100}%`,
    top: `${(y / CANVAS.height) * 100}%`,
    width: `${(width / CANVAS.width) * 100}%`,
    height: `${(height / CANVAS.height) * 100}%`,
  };
};

/**
 * 建物 PNG (1774 x 887) の配置。
 * 外形の左端・上端・右端を完成イメージに合わせた結果、倍率は約 0.723。
 */
export const BUILDING: Rect = { x: 196, y: 200, width: 1283, height: 642 };

/** 建物を構成する5枚（どれも 1774 x 887 で、BUILDING の位置に重ねる） */
export const BUILDING_LAYERS: BuildingLayers = {
  base: "/images/top/building-base-top.png",
  formShadow: "/images/top/building-form-shadow-top.png",
  archDepth: "/images/top/building-arch-depth-top.png",
  plantShadow: "/images/top/building-plant-shadow-top.png",
  lightMask: "/images/top/building-light-mask-top.png",
};

/** 前景植物 PNG はキャンバスと同寸 */
export const FOREGROUND: Rect = { x: 0, y: 0, ...CANVAS };

/**
 * 前景植物は、動かないベースと、風で揺らす枝と葉の7枚に分けてある。
 * ベースからは揺らす部分が抜いてあり、8枚を重ねると元の top-foreground-tropical-plants.png と同じ見た目に戻る。
 * 素材はどれもキャンバスと同寸・同位置で作り、揺らす7枚は、それぞれの box の範囲だけを画素を変えずに切り出して置く
 * （box の外は透明なので失うものはない。素材を差し替えるときも、同じ範囲で切り出し直す）。
 */
export const PLANTS_BASE = "/images/top/top-plants-base.png";

/** 揺れの形（TopHero.module.css の data-shape と @keyframes sway-*）。どれも「ほぼ静止 → 押される → 戻る → 静か → 弱く反対へ」 */
export type SwayShape = "gust" | "lull" | "eddy";

export type PlantSway = {
  id: string;
  src: string;
  /** 葉が揺れても切れないよう、葉の外接矩形に余白を足した範囲。この範囲だけを1枚の層として回す（src はこの範囲を切り出した画像） */
  box: Rect;
  /** 回転の支点（葉の付け根・茎の根元） */
  pivot: { x: number; y: number };
  /** --wind に掛ける係数。傾きは --wind × gain × --sway-reach（TopHero.module.css） */
  gain: number;
  /** 省くと、それ自体は揺れない（まとめた木ごと傾くだけ） */
  shape?: SwayShape;
  /** 周期と開始位置（秒）。そろって揺れないよう、どれも互いに割り切れない値にする */
  duration: number;
  delay: number;
};

/**
 * いくつかの葉をまとめて、株や木ごと傾ける入れ物。中の葉はそれぞれの揺れを保ったまま一緒に傾く。
 * box は中の葉の box をすべて含む範囲。
 */
export type PlantSwayGroup = Omit<PlantSway, "src"> & { members: string[] };

export const PLANT_SWAY_GROUPS: PlantSwayGroup[] = [
  {
    // 左上のアダンの、幹の分かれ目から上（枝・冠・中ほど・垂れた葉先）。支点は幹の分かれ目。
    // 幹はベースに残るので、継ぎ目は支点のすぐそばの1か所になる
    id: "pandanus",
    box: { x: 0, y: 0, width: 430, height: 345 },
    pivot: { x: 20, y: 295 },
    gain: 1,
    shape: "lull",
    duration: 13.3,
    delay: -5.2,
    members: ["pandanus-branches", "pandanus-crown", "pandanus-cluster", "pandanus-bundle"],
  },
];

export const PLANT_SWAYS: PlantSway[] = [
  {
    // 左上のアダンの、幹の分かれ目から上の2本の枝。枝そのものは揺らさず、木ごと傾く（PLANT_SWAY_GROUPS）だけ
    id: "pandanus-branches",
    src: "/images/top/top-sway-pandanus-branches.png",
    box: { x: 0, y: 150, width: 226, height: 158 },
    pivot: { x: 20, y: 295 },
    gain: 0,
    duration: 0,
    delay: 0,
  },
  {
    // 左上のアダン。いちばん上の葉の冠（2本の枝先に載る）
    id: "pandanus-crown",
    src: "/images/top/top-sway-pandanus-crown.png",
    box: { x: 0, y: 0, width: 415, height: 186 },
    pivot: { x: 160, y: 165 },
    gain: 0.42,
    shape: "lull",
    duration: 21.3,
    delay: -13.6,
  },
  {
    // 左上のアダン。中ほどの葉のまとまりと実（枝先から下がる）
    id: "pandanus-cluster",
    src: "/images/top/top-sway-pandanus-cluster.png",
    box: { x: 0, y: 96, width: 406, height: 247 },
    pivot: { x: 155, y: 150 },
    gain: 0.6,
    shape: "eddy",
    duration: 15.7,
    delay: -4.9,
  },
  {
    // 左上のアダン。房の右下に垂れる葉先
    id: "pandanus-bundle",
    src: "/images/top/top-sway-pandanus-bundle.png",
    box: { x: 216, y: 24, width: 188, height: 308 },
    pivot: { x: 245, y: 42 },
    gain: 1,
    shape: "gust",
    duration: 9.4,
    delay: -3.1,
  },
  {
    // 左下のソテツ。上へ弓なりに伸びる葉（支点は株の中心）
    id: "sotetsu",
    src: "/images/top/top-sway-sotetsu.png",
    box: { x: 324, y: 633, width: 196, height: 171 },
    pivot: { x: 340, y: 788 },
    gain: 0.6,
    shape: "lull",
    duration: 16.2,
    delay: -9.7,
  },
  {
    // 右下のクワズイモ。手前の大きな葉
    id: "alocasia-01",
    src: "/images/top/top-sway-alocasia-01.png",
    box: { x: 1561, y: 688, width: 111, height: 253 },
    pivot: { x: 1606, y: 941 },
    gain: 1,
    shape: "eddy",
    duration: 12.6,
    delay: -1.4,
  },
  {
    // 右下のクワズイモ。その左下の小さな葉
    id: "alocasia-02",
    src: "/images/top/top-sway-alocasia-02.png",
    box: { x: 1516, y: 803, width: 119, height: 138 },
    pivot: { x: 1558, y: 941 },
    gain: 0.9,
    shape: "gust",
    duration: 14.1,
    delay: -6.8,
  },
];

export type ArchId = "about" | "work" | "contact";

type ImageInterior = {
  kind: "image";
  src: string;
  /** 画像の寸法（読み込む前の縦横比に使う） */
  width: number;
  height: number;
  /**
   * どの光の中にあるか。indoor は室内灯の灯る展示室（--ambient-interior-filter）、
   * outdoor は外光の入る窓辺（--ambient-outdoor-room-filter）。TopHero.module.css が data-light で切り替える
   */
  light: "indoor" | "outdoor";
  /**
   * 開口部（arch.opening）に対する画像の位置。
   * 奥の壁・額・ベンチが開口の見える範囲に収まるよう、開口より広く置いて左右を建物に隠させる。
   */
  frame: { left: string; top: string; width: string };
};

/** 展示物を置かず、背景の海と空をアーチ越しに見せる */
type ViewInterior = {
  kind: "view";
  /** 背景画像のうちアーチ内に切り取る位置（object-position） */
  objectPosition: string;
};

export type Arch = {
  id: ArchId;
  href: string;
  title: string;
  /** hover / focus でカテゴリ名の下に添える一行。不要なら省く */
  caption?: string;
  /**
   * アーチ本体の外形（外側のアーチの頂点から、手前の植物にかかる手前まで）。
   * 部屋名プレートは、この範囲の上端（＝アーチの頂点）のすぐ上に取り付ける。
   */
  body: Rect;
  /**
   * 建物の素地（building-base-top.png）の透過している開口部（上端は半円）。縁は建物が覆うので左右 2px ほど外側に取る。
   * 素地を差し替えたら、開口部の範囲を測り直して合わせる（ずれると、展示室との間に隙間ができる）
   */
  opening: Rect;
  /** 未指定のアーチは中に何も置かず、奥の背景・植物がそのまま見える */
  interior?: ImageInterior | ViewInterior;
};

/** About / Work は同じ展示室の建築写真と切り抜き位置を共有する。 */
const GALLERY_ROOM = {
  src: "/images/top/top-arch-shared-gallery-base.png",
  width: 1122,
  height: 1402,
  light: "indoor",
  frame: { left: "-61%", top: "-10%", width: "223%" },
} as const;

export const ARCHES: Arch[] = [
  {
    id: "about",
    href: "/about",
    title: "About",
    caption: "About / Career / Interest",
    opening: { x: 454, y: 418, width: 148, height: 404 },
    body: { x: 355, y: 340, width: 310, height: 300 },
    interior: {
      kind: "image",
      ...GALLERY_ROOM,
    },
  },
  {
    id: "work",
    href: "/work",
    title: "Work",
    caption: "Writings / Projects",
    opening: { x: 762, y: 418, width: 153, height: 404 },
    body: { x: 688, y: 340, width: 309, height: 300 },
    interior: {
      kind: "image",
      ...GALLERY_ROOM,
    },
  },
  {
    id: "contact",
    href: "/contact",
    title: "Contact",
    opening: { x: 1083, y: 418, width: 149, height: 404 },
    body: { x: 1023, y: 340, width: 307, height: 300 },
    /*
     * About / Work と同じ建築・表示位置で、奥の壁と石の棚だけを透過させた1枚。
     * 透過した出口から、TOP 共通の空・海（Sky.tsx。時間帯の光を含む）がそのまま見える。
     */
    interior: {
      kind: "image",
      ...GALLERY_ROOM,
      src: "/images/top/contact-arch-shared-transparent-v2.png",
    },
  },
];

/**
 * スマホ幅のスライド：幅 767px 以下の縦向きの画面では、舞台を横スクロールの箱に入れ、アーチ1つずつのアップを横にスライドして見る
 * （横長の建物に沿って、隣の入口へ歩く）。キャンバスの幅 SLIDE_VIEW_WIDTH を画面幅に合わせ、舞台の高さ（941）が画面の高さを
 * 超えないところで拡大率を止める。最初は About の開口部の中心が画面の中央に来る。
 *
 * SLIDE_MEDIA は TopHero.module.css の「スマホ幅のスライド」の @media と同じ条件にする（CSS の @media には変数を使えないので、変えるときは両方）。
 * 正方形に近い窓（折りたたみのスマホを開いた画面・幅を絞ったデスクトップの窓など）では、隣のアーチも大きく映るが、
 * どのアーチも押せて、払えば次のアーチの中心で止まるので、スマホと同じスライドにする。
 * 横向きは、高さに合わせると画面に建物の全体が入ってスライドの意味がなくなるので、今までの舞台のままにする。
 */
export const SLIDE_MEDIA = "(max-width: 767.98px) and (orientation: portrait)";

/** スライドの1画面に収めるキャンバスの幅の上限（TopHero.module.css の .track の計算と同じ値） */
export const SLIDE_VIEW_WIDTH = 400;

/** スライドのときの舞台の幅の上限（画面幅に対する vw。画面の高さで抑えるときは、これより狭くなる） */
export const SLIDE_STAGE_VW = (CANVAS.width / SLIDE_VIEW_WIDTH) * 100;

/**
 * 舞台に置く画像の sizes の先頭に足す、スライドのときの候補（ratio は舞台の幅に対する画像の幅）。
 * 先頭に置くのは、sizes が最初に当たった条件の値を使うため
 */
export const slideSizes = (ratio: number) => `${SLIDE_MEDIA} ${Math.ceil(ratio * SLIDE_STAGE_VW)}vw`;

/**
 * TOP の時間帯ごとの光と空気（時間帯は components/museum/ambient.ts が訪問者のローカル時刻で決める）。
 *
 * 同じ美術館に時間が流れて見えるよう、建物の形・植物・アーチ・展示は共通のまま、
 * 光の量・色温度・霞・室内灯だけを変える。夕方が基準のビジュアルで、
 * 海と空の光と、景色にかかる空気の色は /contact と共有する（components/museum/seaSky.ts。夕方は足す色を透明にする）。
 * 部屋名プレートの文字だけは、暗いコンクリートの上でも読めるよう夜・深夜に明るくする
 * （hover などの状態ごとに色が分かれるので、TopHero.module.css の [data-ambient="night"]・[data-ambient="midnight"] に置く）。
 *
 * filter は時間帯の間で滑らかに移るよう、どの時間帯も同じ関数を同じ順に並べる
 * （順番や数が違うと、CSS の transition が補間せずに一度に切り替わる）。
 */
export type TopAmbient = {
  /** 水平線の霞の濃さ（夕方 = 1） */
  haze: number;
  /**
   * 建物（components/museum/LayeredBuilding。光と陰は夕方で描いてある）を、その時間の光に寄せる。sepia → brightness → contrast。
   * 夕方は素材のまま（何も変えない値）。ほかの時間帯の値は旧画像のときのもので、新しい素材に合わせた調整は次の段階で行う
   */
  buildingFilter: string;
  /** 植物を同じ光の中に置く。saturate → brightness */
  sceneFilter: string;
  /** About / Work の室内灯。brightness → saturate */
  interiorFilter: string;
  /**
   * Contact の通路（画像は夕方の光で描いてある）。brightness → saturate。
   * About / Work の室内灯（interiorFilter）と同じ色の寄せ方にし、明るさは各時間帯でその約 0.82 倍にする
   * （通路の画像は About / Work の画像より約 2 割明るく描いてあり、同じ値では Contact だけが明るく見えた）
   */
  outdoorRoomFilter: string;
  /**
   * 周辺減光の強さ（夕方 = 1）。左下の館名は植物の上で読ませているので、朝・昼も大きくは弱めない
   * （昼に 0.5 まで弱めると、琉球石灰岩の明るい斑の上でコントラストが 3.5:1 まで下がった）
   */
  vignette: number;
};

export const TOP_AMBIENTS: Record<AmbientId, TopAmbient> = {
  morning: {
    haze: 1.8,
    buildingFilter: "sepia(0.02) brightness(0.92) contrast(0.9)",
    sceneFilter: "saturate(0.66) brightness(0.8)",
    interiorFilter: "brightness(0.92) saturate(0.8)",
    outdoorRoomFilter: "brightness(0.75) saturate(0.8)",
    vignette: 0.9,
  },
  day: {
    haze: 0.5,
    buildingFilter: "sepia(0) brightness(1.02) contrast(1)",
    sceneFilter: "saturate(0.78) brightness(0.94)",
    interiorFilter: "brightness(0.84) saturate(0.66)",
    outdoorRoomFilter: "brightness(0.69) saturate(0.66)",
    vignette: 0.85,
  },
  evening: {
    haze: 1,
    buildingFilter: "sepia(0) brightness(1) contrast(1)",
    sceneFilter: "saturate(0.72) brightness(0.8)",
    interiorFilter: "brightness(1) saturate(1)",
    outdoorRoomFilter: "brightness(0.82) saturate(1)",
    vignette: 1,
  },
  night: {
    haze: 0.3,
    buildingFilter: "sepia(0.05) brightness(0.52) contrast(0.98)",
    sceneFilter: "saturate(0.5) brightness(0.42)",
    interiorFilter: "brightness(1.06) saturate(1)",
    outdoorRoomFilter: "brightness(0.87) saturate(1)",
    vignette: 1,
  },
  /*
   * 深夜：景色（植物・霞）は夜より大きく沈めてシルエットにし、建物は外形と質感が分かる暗さに留める。
   * About / Work の室内灯は夜より数%だけ上げ、外が暗いことで相対的に目立たせる（色は夕方の淡い琥珀のまま）
   */
  midnight: {
    haze: 0.12,
    buildingFilter: "sepia(0.04) brightness(0.33) contrast(0.98)",
    sceneFilter: "saturate(0.3) brightness(0.2)",
    interiorFilter: "brightness(1.12) saturate(1)",
    outdoorRoomFilter: "brightness(0.92) saturate(1)",
    vignette: 1,
  },
};

const topVariables = (ambient: AmbientId) => {
  const { haze, buildingFilter, sceneFilter, interiorFilter, outdoorRoomFilter, vignette } = TOP_AMBIENTS[ambient];
  return {
    ...seaSkyVariables(ambient),
    // 外の植物に沖縄の風を感じる場所なので、共通の風の強さをそのまま使う（前景植物の揺れ、TopHero.module.css の .sway / .swayGroup が読む）
    "--wind": WIND_STRENGTH[ambient],
    "--ambient-haze": haze,
    "--ambient-building-filter": buildingFilter,
    "--ambient-scene-filter": sceneFilter,
    "--ambient-interior-filter": interiorFilter,
    "--ambient-outdoor-room-filter": outdoorRoomFilter,
    "--ambient-vignette": vignette,
  };
};

/** AmbientRoot に渡す、時間帯ごとの CSS 変数（TopHero.module.css が読む） */
export const TOP_AMBIENT_VARIABLES: AmbientVariables = {
  midnight: topVariables("midnight"),
  morning: topVariables("morning"),
  day: topVariables("day"),
  evening: topVariables("evening"),
  night: topVariables("night"),
};
