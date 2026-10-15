import type { AmbientId } from "./ambient";

/**
 * 美術館の前に広がる海と空。TOP はそのまま、/contact（館の裏側）は左右反転して同じ画像を使う。
 * 時間帯で画像は替えず、光の色と量だけを変える。表と裏で空の色温度・海の明るさ・空気がずれないよう、値も両方で共有する。
 */
export const SEA_SKY_BACKGROUND = "/images/top/top-bg-sea-sky.png";

export type SeaSkyLight = {
  /** 背景の色調補正。saturate → brightness → contrast（時間帯の間で補間されるよう、順番と数をそろえる） */
  filter: string;
  /** 空と海に重ねる光の色。上空・水平線・海の3点で、夕方は透明 */
  glaze: { sky: string; horizon: string; sea: string };
  /**
   * 景色全体に画面の上下からかかる空気の色（朝の青み・夜の静けさ）。夕方は透明。
   * 朝・昼は空が明るくなるので、上側をわずかに沈め、空の上に置いた明るい文字（館名・Menu）を読ませる
   */
  air: { top: string; bottom: string };
  /**
   * 縦長の画面で、空の上端（館名・Menu を置く帯）を沈める濃さ（0〜1）。夕方・夜は 0。
   * 朝・昼は空が淡く、明るい文字のコントラストが 4.5:1 を下回るため（390px 幅で実測した）
   */
  skyShade: number;
};

const CLEAR = "rgb(0 0 0 / 0)";

export const SEA_SKY_LIGHT: Record<AmbientId, SeaSkyLight> = {
  morning: {
    filter: "saturate(0.28) brightness(0.96) contrast(0.82)",
    glaze: {
      sky: "rgb(168 188 212 / 0.66)",
      horizon: "rgb(232 226 222 / 0.55)",
      sea: "rgb(80 104 132 / 0.26)",
    },
    air: { top: "rgb(66 80 106 / 0.22)", bottom: "rgb(120 140 170 / 0.06)" },
    skyShade: 0.34,
  },
  day: {
    filter: "saturate(0.4) brightness(1.08) contrast(0.94)",
    glaze: {
      sky: "rgb(150 184 214 / 0.6)",
      horizon: "rgb(222 228 230 / 0.42)",
      sea: "rgb(48 92 128 / 0.16)",
    },
    air: { top: "rgb(58 72 96 / 0.18)", bottom: CLEAR },
    skyShade: 0.32,
  },
  evening: {
    filter: "saturate(0.6) brightness(0.98) contrast(0.92)",
    glaze: { sky: CLEAR, horizon: CLEAR, sea: CLEAR },
    air: { top: CLEAR, bottom: CLEAR },
    skyShade: 0,
  },
  night: {
    filter: "saturate(0.35) brightness(0.5) contrast(0.95)",
    glaze: {
      sky: "rgb(22 28 58 / 0.62)",
      horizon: "rgb(52 50 82 / 0.4)",
      sea: "rgb(10 16 34 / 0.5)",
    },
    air: { top: "rgb(24 28 56 / 0.18)", bottom: "rgb(8 10 20 / 0.2)" },
    skyShade: 0,
  },
};

/** 海と空の光を、ambient.module.css の .glaze と各ページの背景画像・空気のレイヤーが読む CSS 変数にする */
export const seaSkyVariables = (ambient: AmbientId) => {
  const { filter, glaze, air, skyShade } = SEA_SKY_LIGHT[ambient];
  return {
    "--ambient-sky-filter": filter,
    "--ambient-glaze-sky": glaze.sky,
    "--ambient-glaze-horizon": glaze.horizon,
    "--ambient-glaze-sea": glaze.sea,
    "--ambient-air-top": air.top,
    "--ambient-air-bottom": air.bottom,
    "--ambient-sky-shade": skyShade,
  } as const;
};
