/**
 * 遷移の後に、次の部屋の着地の動きを選ぶための印（<html data-arrival> / <html data-room-step>）と、
 * 部屋が入れ替わる間に body に敷く地の色の印（<html data-room-ground>）。
 * 印は遷移の前に付け、次の部屋の着地の動きが終わったら外す（Menu で移ったときや再読み込みでは付かない）。
 * ArchPassage（TOP のアーチ）と RoomStepLink（順路の案内）が使う。
 */

type MarkName = "arrival" | "roomStep" | "roomGround";

/**
 * 着地の動きが始まってから、終わらなかったときに印を外すまでの時間。
 * 印を付けた時点からではなく、次の部屋で着地の動きが始まった時点から数える。印を付けた時点から数えると、
 * 遷移が遅い（先読みが済んでおらず、次の部屋が描かれるまで数秒かかる）ときに、次の部屋が現れる前に印が外れ、
 * 退いて透明になった部屋の下に body の明るい地が見え、次の部屋も着地の動きなしで一度に現れる
 */
const CLEAR_MS = 4000;

/**
 * 着地の動きが一度も始まらなかったとき（入口の TOP のように着地の動きが無い行き先、
 * 遷移の途中で「動きを減らす」に変わったときなど）に、印を外すまでの時間。印を付けた時点から数える。
 * 遷移を待つ間に外れないよう、十分に長くする
 */
const FALLBACK_MS = 20000;

/** 印ごとの片付け。付け直す前に呼び、古いタイマーが新しい印を外さないようにする */
const clears: Partial<Record<MarkName, () => void>> = {};

/** 印を外す（付いていなければ何もしない） */
export const clearMark = (name: MarkName) => clears[name]?.();

/**
 * 印を付け、名前に animationName を含む着地の動きが終わったら外す。
 * ignore には、今の部屋の要素を渡す。印を付けてから遷移するまでの間は、今の部屋にも着地の動きがかかる（見えない）ので、
 * その中の動きの始まりと終わりは数えない
 */
export const setMark = (name: MarkName, value: string, animationName: string, ignore?: Element) => {
  clearMark(name);
  const root = document.documentElement;
  let timer = 0;
  let started = false;
  const clear = () => {
    delete root.dataset[name];
    document.removeEventListener("animationstart", onStart);
    document.removeEventListener("animationend", onEnd);
    window.clearTimeout(timer);
    if (clears[name] === clear) delete clears[name];
  };
  const isLanding = (event: AnimationEvent) => {
    const inIgnored = ignore && event.target instanceof Node && ignore.contains(event.target);
    return !inIgnored && event.animationName.includes(animationName);
  };
  // 次の部屋で着地の動きが始まったら（次の部屋が描かれたら）、そこから時間を数え直す
  const onStart = (start: AnimationEvent) => {
    if (started || !isLanding(start)) return;
    started = true;
    window.clearTimeout(timer);
    timer = window.setTimeout(clear, CLEAR_MS);
  };
  const onEnd = (end: AnimationEvent) => {
    if (isLanding(end)) clear();
  };
  root.dataset[name] = value;
  document.addEventListener("animationstart", onStart);
  document.addEventListener("animationend", onEnd);
  timer = window.setTimeout(clear, FALLBACK_MS);
  clears[name] = clear;
};
