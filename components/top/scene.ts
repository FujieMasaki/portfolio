import type { SwayBranch } from "@/components/museum/WindSway";

/**
 * TOP ヒーローの「舞台」定義。
 *
 * すべての座標は完成イメージ（public/images/reference/top-final-reference.png,
 * 1672 x 941）上のピクセルで書き、描画時に % へ変換する。
 * 前景植物の PNG がこのキャンバスと同寸・同位置で作られているため、
 * ここを基準にすると完成イメージとレイヤーがずれない。
 */

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

/** 前景植物 PNG（top-plants-base.png と、揺らす部品を切り出した元の1枚絵）はキャンバスと同寸 */
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
  /** アーチの奥を、時折リュウキュウツバメが横切る */
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
 * 風で揺らす枝・葉（描き方は components/museum/WindSway）。
 *
 * 植物 PNG は1枚絵なので、そのまま揺らすと岩や地面まで動いてしまう。揺らす枝・葉だけを切り出した透過 PNG
 * （top-plant-sway-*.png）を、その部分を抜いた静止のベース（top-plants-base.png）に重ね、根元を支点に傾ける。
 * 部品の位置と支点は、元の植物 PNG（キャンバスと同寸）の px で書く。元の1枚絵（top-foreground-tropical-plants.png）は
 * git の履歴にある。
 *
 * 建物の奥の層（back）は建物より奥、手前の層（front）は建物より手前に描く。
 * 手前に描くのは、前景の手前用のマスク（top-foreground-front-mask.svg）の内側にある部分だけにする（奥の葉を建物の上に出さない）。
 */
export const FOLIAGE_SWAY: { back: SwayBranch[]; front: SwayBranch[] } = {
  back: [
    // ガジュマルの枝先から垂れた葉の房。枝の付け根（右）を支点にする
    {
      src: "/images/top/top-plant-sway-02.png",
      rect: { x: 644, y: 129, width: 167, height: 135 },
      pivot: { x: 790, y: 205 },
      angle: 0.4,
      duration: 27.1,
      delay: -9.4,
    },
  ],
  front: [
    // 左上のアダンの、上へ広がる葉。冠を支点にし、葉先は少し遅れてついてくる
    {
      src: "/images/top/top-plant-sway-01.png",
      rect: { x: 0, y: 0, width: 264, height: 124 },
      pivot: { x: 135, y: 118 },
      angle: 0.3,
      duration: 25.9,
      delay: -3.2,
      tip: {
        src: "/images/top/top-plant-sway-01-tip.png",
        rect: { x: 0, y: 0, width: 264, height: 93 },
        pivot: { x: 135, y: 118 },
        angle: 0.35,
        lag: 0.3,
      },
    },
    // 左下のソテツの、右上へ伸びる外側の葉
    {
      src: "/images/top/top-plant-sway-03.png",
      rect: { x: 344, y: 652, width: 175, height: 100 },
      pivot: { x: 350, y: 746 },
      angle: 0.3,
      duration: 24.6,
      delay: -15.8,
      tip: {
        src: "/images/top/top-plant-sway-03-tip.png",
        rect: { x: 413, y: 652, width: 106, height: 99 },
        pivot: { x: 350, y: 746 },
        angle: 0.4,
        lag: 0.25,
      },
    },
  ],
};

/**
 * 時間帯ごとの空気感。
 *
 * 今後「時間帯で背景が切り替わる」演出を足すときはここを拡張する:
 *   1. 時間帯ごとに背景画像・色調フィルタ・光のトーンを追加する
 *   2. TopHero で現在時刻（または明示指定）から AmbientId を決めて渡す
 *   3. 切り替えは背景レイヤー（.sky）と光レイヤー（.atmosphere）のクロスフェードで行い、
 *      建物・植物・アーチ内は共通のまま、filter で色だけ寄せる
 */
export type AmbientId = "evening";

export type Ambient = {
  background: string;
  /** 背景を完成イメージの静かな夕方に寄せるための色調補正 */
  backgroundFilter: string;
  /** 昼光で撮られた建物を夕方の光に寄せる */
  buildingFilter: string;
  /** 植物を同じ光の中に置くための色調補正 */
  sceneFilter: string;
};

export const AMBIENTS: Record<AmbientId, Ambient> = {
  evening: {
    background: "/images/top/top-bg-sea-sky.png",
    backgroundFilter: "saturate(0.6) brightness(0.98) contrast(0.92)",
    buildingFilter: "sepia(0.18) brightness(0.94) contrast(0.96)",
    sceneFilter: "saturate(0.72) brightness(0.8)",
  },
};
