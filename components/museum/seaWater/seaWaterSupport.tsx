"use client";

import { Component, useSyncExternalStore, type ReactNode } from "react";

/**
 * Water.js の海を始める前に使う部品。three を読む前に使うので、ここでは three を import しない
 * （import すると three が最初の bundle に入る。three を使う部品は photoTextureLoader.ts など）
 */

type ErrorBoundaryProps = { onError: () => void; children: ReactNode };

/** WebGL の初期化失敗・three の読み込み失敗・空の画像の読み込み失敗を受け止め、何も描かずに静止画だけに戻す */
export class SeaErrorBoundary extends Component<ErrorBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    if (process.env.NODE_ENV === "development") {
      console.error("[sea] WebGL の海を使えないため、静止画の海に戻します", error);
    }
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * three を読み込む前に、WebGL2 の context を作れるかだけを確かめる（three r163 以降は WebGL1 で動かない）。
 * ソフトウェア描画など遅い環境で作れないことは、本番の Canvas と同じ条件（failIfMajorPerformanceCaveat）で確かめる
 */
export const supportsWebGL = () => {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return gl !== null;
  } catch {
    return false;
  }
};

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/** 閲覧の途中で「視差効果を減らす」を切り替えても追従する。サーバーでは動かさない側（true）にする */
export const useReducedMotion = () =>
  useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );

/** ページの画像の読み込みを待ってから、手の空いたときに始める（LCP の画像と帯域を取り合わない） */
export const whenIdle = (callback: () => void) => {
  let idle = 0;
  let timer = 0;
  const schedule = () => {
    // Safari の一部の版には requestIdleCallback がない
    if (typeof window.requestIdleCallback === "function") {
      idle = window.requestIdleCallback(callback, { timeout: 2000 });
    } else {
      timer = window.setTimeout(callback, 300);
    }
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    if (idle) window.cancelIdleCallback(idle);
    window.clearTimeout(timer);
  };
};
