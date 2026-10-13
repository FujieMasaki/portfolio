import { CAREER } from "./content";

/** 線の上の光の幅（線の長さに対する割合）。展示1つ分にする */
export const THUMB = 1 / CAREER.length;

/**
 * 各展示の前に立つ（展示の中心が壁の中央に来る）ときの横の位置。届かない展示（先頭の Canada など）は端の位置にする。
 * 展示の幅も間隔もそろっていないので、線の上の光はスクロールした量ではなく、この位置を目盛りにして動かす
 */
export const stopsOf = (track: HTMLElement) => {
  const max = track.scrollWidth - track.clientWidth;
  const center = track.getBoundingClientRect().left + track.clientWidth / 2;
  return Array.from(track.querySelectorAll<HTMLElement>("[data-exhibit]"), (item) => {
    const rect = item.getBoundingClientRect();
    const stop = track.scrollLeft + rect.left + rect.width / 2 - center;
    return Math.min(Math.max(stop, 0), max);
  });
};

/** 横の位置 → いま何番目の展示の前にいるか（0 〜 展示の数 - 1、間は割合） */
export const indexAt = (left: number, stops: number[]) => {
  const last = stops.length - 1;
  // 端は、届かない展示が重なっていても先頭・末尾の展示として扱う
  if (left <= stops[0]) return 0;
  if (left >= stops[last]) return last;
  for (let i = 1; i < stops.length; i++) {
    if (left <= stops[i]) {
      const span = stops[i] - stops[i - 1];
      return span > 0 ? i - 1 + (left - stops[i - 1]) / span : i;
    }
  }
  return last;
};

/** 何番目の展示の前か → 横の位置（indexAt の逆） */
export const leftAt = (index: number, stops: number[]) => {
  const i = Math.min(Math.floor(index), stops.length - 2);
  return stops[i] + (stops[i + 1] - stops[i]) * (index - i);
};
