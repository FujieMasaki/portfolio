import { useSyncExternalStore } from "react";

/**
 * media query に当たっているか。閲覧の途中で画面の大きさや向きが変わっても追従する。
 * サーバーでは当たっていない側（false）にする（動きを付ける側の判定に使うので、hydration の後に始める）。
 */
const useMediaQuery = (query: string) =>
  useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );

export default useMediaQuery;
