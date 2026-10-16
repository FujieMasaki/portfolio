"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import styles from "../seaMotion.module.css";
import { SeaErrorBoundary, supportsWebGL, useReducedMotion, whenIdle } from "./seaWaterSupport";

/** three と R3F は、Water.js の海を始めるときだけ読み込む */
const SeaWaterCanvas = dynamic(() => import("./SeaWaterCanvas"), { ssr: false });

/**
 * three の Water.js で描く穏やかな海（progressive enhancement）。空の箱の水平線より下にだけ canvas を置き、
 * 手前の静止画の海の奥に敷く。最初の1枚を描けたら data-sea-ready を付け、それを合図に静止画の海が
 * 薄くなる（seaMotion.module.css）。写真の質感を残したまま、水面の動きだけを足すため。
 *
 * 次のときは何も描かず、静止画の海のままにする。
 * prefers-reduced-motion・サーバーでの描画・WebGL が使えない・初期化／shader の失敗・context の喪失。
 */
const SeaWater = () => {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<"waiting" | "running" | "failed">("waiting");
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion) return;
    return whenIdle(() =>
      setPhase((current) => (current === "waiting" ? (supportsWebGL() ? "running" : "failed") : current)),
    );
  }, [reducedMotion]);

  if (reducedMotion || phase !== "running") return null;

  return (
    <div ref={layer} className={styles.water} aria-hidden="true">
      <SeaErrorBoundary onError={() => setPhase("failed")}>
        <SeaWaterCanvas
          // 静止画の切り替えは state を介さず属性で始める（描画ループの中から呼ばれるため）
          onReady={() => layer.current?.setAttribute("data-sea-ready", "")}
          onError={() => setPhase("failed")}
        />
      </SeaErrorBoundary>
    </div>
  );
};

export default SeaWater;
