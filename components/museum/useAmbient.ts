import { useSyncExternalStore } from "react";
import {
  FALLBACK_AMBIENT,
  getAmbientFromHour,
  msUntilNextAmbient,
  parseAmbientOverride,
  type AmbientId,
} from "./ambient";

/**
 * 時間帯の購読。時刻を常時見張らず、次の時間帯が始まる時刻に1回だけ確かめ直す。
 * スリープ明けやバックグラウンドのタブではタイマーが遅れるので、タブに戻ったときにも確かめる。
 */
const subscribe = (onChange: () => void) => {
  let timer = 0;
  const schedule = () => {
    window.clearTimeout(timer);
    // 境界ちょうどに起きると、時計の誤差でまだ前の時間帯と判定されることがあるので少し遅らせる
    timer = window.setTimeout(() => {
      onChange();
      schedule();
    }, msUntilNextAmbient(new Date()) + 1000);
  };
  const onVisibilityChange = () => {
    if (document.visibilityState !== "visible") return;
    onChange();
    schedule();
  };

  schedule();
  document.addEventListener("visibilitychange", onVisibilityChange);
  return () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibilityChange);
  };
};

const OVERRIDE_KEY = "museum-ambient";

/**
 * 開発中だけ、?ambient=morning などで時間帯を指定して確かめられる。
 * TOP と /contact を行き来すると URL の指定は落ちるので、タブを閉じるまで sessionStorage に覚えておく。
 * 知らない値（?ambient=auto など）を指定すると、覚えた指定を消してローカル時刻に戻る。
 */
const readDevOverride = (): AmbientId | null => {
  try {
    const fromUrl = parseAmbientOverride(window.location.search);
    if (fromUrl) sessionStorage.setItem(OVERRIDE_KEY, fromUrl);
    if (fromUrl === null) sessionStorage.removeItem(OVERRIDE_KEY);
    if (fromUrl !== undefined) return fromUrl;
    return parseAmbientOverride(`?ambient=${sessionStorage.getItem(OVERRIDE_KEY) ?? ""}`) ?? null;
  } catch {
    // sessionStorage が使えない環境では、URL の指定だけを見る
    return parseAmbientOverride(window.location.search) ?? null;
  }
};

const getSnapshot = (): AmbientId => {
  // 本番のビルドでは、この分岐ごと消える
  if (process.env.NODE_ENV === "development") {
    const override = readDevOverride();
    if (override) return override;
  }
  return getAmbientFromHour(new Date().getHours());
};

const getServerSnapshot = () => FALLBACK_AMBIENT;

/**
 * 訪問者のローカル時刻から決まる、いまの時間帯。
 * サーバーではローカル時刻が分からないので夕方（FALLBACK_AMBIENT）を返し、hydration の直後に実際の時間帯へ移る。
 */
const useAmbient = () => useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

export default useAmbient;
