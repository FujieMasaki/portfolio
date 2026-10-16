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

export type ArchId = "about" | "work" | "contact";

type ImageInterior = {
  kind: "image";
  src: string;
  /** 画像の寸法（読み込む前の縦横比に使う） */
  width: number;
  height: number;
  /**
   * どの光の中にあるか。indoor は室内灯の灯る展示室（--ambient-interior-filter）、
   * outdoor は外光の入る半屋外（--ambient-outdoor-room-filter）。TopHero.module.css が data-light で切り替える
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
      src: "/images/top/top-arch-about-gallery.png",
      width: 1122,
      height: 1402,
      light: "indoor",
      frame: { left: "-43%", top: "0%", width: "186%" },
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
      src: "/images/top/top-arch-work-single-frame.png",
      width: 1122,
      height: 1402,
      light: "indoor",
      frame: { left: "-61%", top: "-10%", width: "223%" },
    },
  },
  {
    id: "contact",
    href: "/contact",
    title: "Contact",
    opening: { x: 1083, y: 418, width: 149, height: 404 },
    body: { x: 1023, y: 340, width: 307, height: 300 },
    /*
     * 展示を見終えて外とつながる、半屋外の小さな場所（デスク・椅子・植物）。
     * 画像は空と海の部分を透過してあり、そこから TOP 共通の空・海（Sky.tsx。時間帯の光を含む）がそのまま見える。
     * 開口部の高さを下端の植物まで覆う倍率にし、デスクとライトが入るよう少し右寄りを切り取る。
     * 上端は画像自身のアーチの頂点より少し上へずらし、開口部の頂点に隙間（奥の空）が覗かないようにする
     */
    interior: {
      kind: "image",
      src: "/images/top/contact-arch-space.png",
      width: 1116,
      height: 1410,
      light: "outdoor",
      frame: { left: "-64%", top: "-3%", width: "220%" },
    },
  },
];

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
   * Contact の半屋外の場所（画像は夕方の光で描いてある）。sepia → brightness → contrast。
   * 朝〜夕方は建物と同じ外光に寄せ、夜・深夜は天井とデスクの灯りがあるので、About / Work の室内灯（interiorFilter）と同じ明るさにする
   * （建物と同じ深夜の brightness(0.33) や、中間の 0.6 では、灯りの点いた場所に見えず暗く感じた）
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
    outdoorRoomFilter: "sepia(0.02) brightness(0.92) contrast(0.9)",
    vignette: 0.9,
  },
  day: {
    haze: 0.5,
    buildingFilter: "sepia(0) brightness(1.02) contrast(1)",
    sceneFilter: "saturate(0.78) brightness(0.94)",
    interiorFilter: "brightness(0.84) saturate(0.66)",
    outdoorRoomFilter: "sepia(0) brightness(1.02) contrast(1)",
    vignette: 0.85,
  },
  evening: {
    haze: 1,
    buildingFilter: "sepia(0) brightness(1) contrast(1)",
    sceneFilter: "saturate(0.72) brightness(0.8)",
    interiorFilter: "brightness(1) saturate(1)",
    outdoorRoomFilter: "sepia(0) brightness(1) contrast(1)",
    vignette: 1,
  },
  night: {
    haze: 0.3,
    buildingFilter: "sepia(0.05) brightness(0.52) contrast(0.98)",
    sceneFilter: "saturate(0.5) brightness(0.42)",
    interiorFilter: "brightness(1.06) saturate(1)",
    outdoorRoomFilter: "sepia(0) brightness(1.06) contrast(1)",
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
    outdoorRoomFilter: "sepia(0) brightness(1.12) contrast(1)",
    vignette: 1,
  },
};

const topVariables = (ambient: AmbientId) => {
  const { haze, buildingFilter, sceneFilter, interiorFilter, outdoorRoomFilter, vignette } = TOP_AMBIENTS[ambient];
  return {
    ...seaSkyVariables(ambient),
    // 外の植物に沖縄の風を感じる場所なので、共通の風の強さをそのまま使う（今はまだ読むレイヤーはない）
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
