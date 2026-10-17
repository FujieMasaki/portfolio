import { useCallback, useSyncExternalStore } from "react";

/**
 * media query に当たっているか。閲覧の途中で画面の大きさや向きが変わっても追従する。
 * サーバーでは当たっていない側（false）にする（動きを付ける側の判定に使うので、hydration の後に始める）。
 */
const useMediaQuery = (query: string) => {
  // 描き直すたびに購読し直さないよう、query ごとに同じ関数を渡す
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
};

export default useMediaQuery;
