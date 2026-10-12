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
