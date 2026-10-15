import type { AmbientId } from "@/components/museum/ambient";
import type { AmbientVariables } from "@/components/museum/AmbientRoot";
import { seaSkyVariables } from "@/components/museum/seaSky";

/**
 * /contact の時間帯ごとの光（時間帯は components/museum/ambient.ts が訪問者のローカル時刻で決める）。
 *
 * TOP と同じ美術館の裏側なので、海と空と空気は TOP と同じ値（components/museum/seaSky.ts）を使い、
 * 建物と植物は TOP の明るさの関係（components/top/scene.ts の TOP_AMBIENTS）にそろえる。
 * 素材が TOP と違い、夕方の基準の値が少し違うので、値はこのページで持つ。夕方は今の見た目のまま。
 * 壁の案内の文字は、暗いコンクリートの上でも読めるよう夜に明るくする（ContactMuseum.module.css の [data-ambient="night"]）。
 *
 * filter は時間帯の間で滑らかに移るよう、どの時間帯も同じ関数を同じ順に並べる。
 */
type ContactAmbient = {
  /**
   * 建物（夕方の光と右の葉影が画像に含まれる）。saturate → brightness → contrast。
   * 夕方以外はコントラストを落として、夕日の葉影を弱く見せる（夜はほとんど目立たせない）
   */
  buildingFilter: string;
  /** 植物・琉球石灰岩（揺らす梢の写しも同じ）。saturate → brightness */
  plantsFilter: string;
};

const CONTACT_AMBIENTS: Record<AmbientId, ContactAmbient> = {
  morning: {
    buildingFilter: "saturate(0.36) brightness(0.95) contrast(0.9)",
    plantsFilter: "saturate(0.66) brightness(0.84)",
  },
  day: {
    buildingFilter: "saturate(0.42) brightness(1.05) contrast(0.92)",
    plantsFilter: "saturate(0.78) brightness(0.98)",
  },
  evening: {
    buildingFilter: "saturate(0.62) brightness(0.97) contrast(1)",
    plantsFilter: "saturate(0.72) brightness(0.84)",
  },
  night: {
    buildingFilter: "saturate(0.35) brightness(0.46) contrast(0.82)",
    plantsFilter: "saturate(0.5) brightness(0.46)",
  },
};

const contactVariables = (ambient: AmbientId) => {
  const { buildingFilter, plantsFilter } = CONTACT_AMBIENTS[ambient];
  return {
    ...seaSkyVariables(ambient),
    "--ambient-building-filter": buildingFilter,
    "--ambient-plants-filter": plantsFilter,
  };
};

/** AmbientRoot に渡す、時間帯ごとの CSS 変数（ContactMuseum.module.css が読む） */
export const CONTACT_AMBIENT_VARIABLES: AmbientVariables = {
  morning: contactVariables("morning"),
  day: contactVariables("day"),
  evening: contactVariables("evening"),
  night: contactVariables("night"),
};
