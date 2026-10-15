/**
 * TOP ヒーローの「舞台」定義。
 *
 * すべての座標は完成イメージ（public/images/reference/top-final-reference.png,
 * 1672 x 941）上のピクセルで書き、描画時に % へ変換する。
 * 前景植物の PNG がこのキャンバスと同寸・同位置で作られているため、
 * ここを基準にすると完成イメージとレイヤーがずれない。
 */

import type { AmbientId } from "@/components/museum/ambient";
import type { AmbientVariables } from "@/components/museum/AmbientRoot";
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

/** 前景植物 PNG はキャンバスと同寸 */
export const FOREGROUND: Rect = { x: 0, y: 0, ...CANVAS };

export type ArchId = "about" | "work" | "contact";

type ImageInterior = {
  kind: "image";
  src: string;
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
  /** 建物 PNG の透過している開口部（上端は半円）。縁は建物が覆うので数 px 外側に取る */
  opening: Rect;
  /** 未指定のアーチは中に何も置かず、奥の背景・植物がそのまま見える */
  interior?: ImageInterior | ViewInterior;
  /** アーチの奥を、時折リュウキュウツバメ（夜はコウモリ）が横切る（ArchFlyby） */
  flyby?: boolean;
};

export const ARCHES: Arch[] = [
  {
    id: "about",
    href: "/about",
    title: "About",
    caption: "About / Career / Interest",
    opening: { x: 464, y: 422, width: 142, height: 394 },
    body: { x: 355, y: 340, width: 310, height: 300 },
    interior: {
      kind: "image",
      src: "/images/top/top-arch-about-gallery.png",
      frame: { left: "-43%", top: "0%", width: "186%" },
    },
  },
  {
    id: "work",
    href: "/work",
    title: "Work",
    caption: "Writings / Projects",
    opening: { x: 767, y: 422, width: 150, height: 394 },
    body: { x: 688, y: 340, width: 309, height: 300 },
    interior: {
      kind: "image",
      src: "/images/top/top-arch-work-single-frame.png",
      frame: { left: "-61%", top: "-10%", width: "223%" },
    },
  },
  {
    id: "contact",
    href: "/contact",
    title: "Contact",
    opening: { x: 1077, y: 422, width: 144, height: 394 },
    body: { x: 1023, y: 340, width: 307, height: 300 },
    // 海の切り取りは一旦外している。戻すときは次を指定する:
    // interior: { kind: "view", objectPosition: "60% 30%" },
    flyby: true,
  },
];

/**
 * 前景の植物・枝を風でごく弱く揺らすためのレイヤー（初期実装では空）。
 *
 * 植物 PNG は1枚絵なので、そのまま揺らすと岩や地面まで動いてしまう。
 * 揺らしたい枝・葉だけを切り出した透過 PNG（キャンバスと同寸で書き出すと位置合わせが楽）を用意し、
 * ここに足すと TopHero が前景植物の上に重ね、根元（origin）を支点に揺らす。
 * 切り出した部分は、元の植物 PNG 側から消しておくと二重に見えない。
 */
export type SwayLayer = {
  src: string;
  rect: Rect;
  /** 揺れの支点（transform-origin）。枝の付け根を指定する */
  origin: string;
  /** 片側への最大傾き（deg）。0.3〜0.8 程度で十分 */
  angle: number;
  /** 1往復の秒数。8〜14 秒程度のゆっくりした周期 */
  duration: number;
};

export const FOLIAGE_SWAY: SwayLayer[] = [];

/**
 * TOP の時間帯ごとの光と空気（時間帯は components/museum/ambient.ts が訪問者のローカル時刻で決める）。
 *
 * 同じ美術館に時間が流れて見えるよう、建物の形・植物・アーチ・展示は共通のまま、
 * 光の量・色温度・霞・室内灯だけを変える。夕方が基準のビジュアルで、
 * 海と空の光と、景色にかかる空気の色は /contact と共有する（components/museum/seaSky.ts。夕方は足す色を透明にする）。
 * 部屋名プレートの文字だけは、暗いコンクリートの上でも読めるよう夜に明るくする
 * （hover などの状態ごとに色が分かれるので、TopHero.module.css の [data-ambient="night"] に置く）。
 *
 * filter は時間帯の間で滑らかに移るよう、どの時間帯も同じ関数を同じ順に並べる
 * （順番や数が違うと、CSS の transition が補間せずに一度に切り替わる）。
 */
export type TopAmbient = {
  /** 水平線の霞の濃さ（夕方 = 1） */
  haze: number;
  /** 昼光で撮られた建物を、その時間の光に寄せる。sepia → brightness → contrast */
  buildingFilter: string;
  /** 植物を同じ光の中に置く。saturate → brightness */
  sceneFilter: string;
  /** About / Work の室内灯。brightness → saturate */
  interiorFilter: string;
  /** 周辺減光の強さ（夕方 = 1） */
  vignette: number;
};

export const TOP_AMBIENTS: Record<AmbientId, TopAmbient> = {
  morning: {
    haze: 1.8,
    buildingFilter: "sepia(0.02) brightness(0.92) contrast(0.9)",
    sceneFilter: "saturate(0.66) brightness(0.8)",
    interiorFilter: "brightness(0.92) saturate(0.8)",
    vignette: 0.75,
  },
  day: {
    haze: 0.5,
    buildingFilter: "sepia(0) brightness(1.02) contrast(1)",
    sceneFilter: "saturate(0.78) brightness(0.94)",
    interiorFilter: "brightness(0.84) saturate(0.66)",
    vignette: 0.5,
  },
  evening: {
    haze: 1,
    buildingFilter: "sepia(0.18) brightness(0.94) contrast(0.96)",
    sceneFilter: "saturate(0.72) brightness(0.8)",
    interiorFilter: "brightness(1) saturate(1)",
    vignette: 1,
  },
  night: {
    haze: 0.3,
    buildingFilter: "sepia(0.05) brightness(0.52) contrast(0.98)",
    sceneFilter: "saturate(0.5) brightness(0.42)",
    interiorFilter: "brightness(1.06) saturate(1)",
    vignette: 1,
  },
};

const topVariables = (ambient: AmbientId) => {
  const { haze, buildingFilter, sceneFilter, interiorFilter, vignette } = TOP_AMBIENTS[ambient];
  return {
    ...seaSkyVariables(ambient),
    "--ambient-haze": haze,
    "--ambient-building-filter": buildingFilter,
    "--ambient-scene-filter": sceneFilter,
    "--ambient-interior-filter": interiorFilter,
    "--ambient-vignette": vignette,
  };
};

/** AmbientRoot に渡す、時間帯ごとの CSS 変数（TopHero.module.css が読む） */
export const TOP_AMBIENT_VARIABLES: AmbientVariables = {
  morning: topVariables("morning"),
  day: topVariables("day"),
  evening: topVariables("evening"),
  night: topVariables("night"),
};
