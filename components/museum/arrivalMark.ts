/**
 * 遷移の後に、次の部屋の着地の動きを選ぶための印（<html data-arrival> / <html data-room-step>）。
 * 印は遷移の直前に付け、次の部屋の着地の動きが終わったら外す（Menu で移ったときや再読み込みでは付かない）。
 * ArchPassage（TOP のアーチ）と RoomStepLink（順路の案内）が使う。
 */

type MarkName = "arrival" | "roomStep";

/**
 * 着地の動きが終わらなかったときに、印を外すまでの時間。
 *
 * TODO: 遷移が極端に遅い（先読みが済んでおらず、次の部屋が描かれるまで約 3 秒以上かかる）と、
 * この時間が次の部屋の着地の途中で切れ、展示が途中の不透明度から一度に表示へ切り替わる。
 * 時間を印を付けた時点（push の直前）から数えているのが原因と見ている。直すなら、次の部屋が mount してから数える
 */
const CLEAR_MS = 4000;

/** 印ごとの片付け。付け直す前に呼び、古いタイマーが新しい印を外さないようにする */
const clears: Partial<Record<MarkName, () => void>> = {};

/** 印を外す（付いていなければ何もしない） */
export const clearMark = (name: MarkName) => clears[name]?.();

/**
 * 印を付け、名前に animationName を含む着地の動きが終わったら外す。
 * ignore には、印を付けてから遷移するまでの間に着地の動きがかかってしまう、今の部屋の要素を渡す（その終わりは数えない）
 */
export const setMark = (name: MarkName, value: string, animationName: string, ignore?: Element) => {
  clearMark(name);
  const root = document.documentElement;
  let timer = 0;
  const clear = () => {
    delete root.dataset[name];
    document.removeEventListener("animationend", onEnd);
    window.clearTimeout(timer);
    if (clears[name] === clear) delete clears[name];
  };
  const onEnd = (end: AnimationEvent) => {
    if (end.target !== ignore && end.animationName.includes(animationName)) clear();
  };
  root.dataset[name] = value;
  document.addEventListener("animationend", onEnd);
  timer = window.setTimeout(clear, CLEAR_MS);
  clears[name] = clear;
};
