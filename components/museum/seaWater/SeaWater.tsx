"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "../seaMotion.module.css";
import useMediaQuery from "../useMediaQuery";
import { SeaErrorBoundary, supportsWebGL, useReducedMotion, whenIdle } from "./seaWaterSupport";

type Props = {
  /** この media query に当たる間だけ描く。省くと常に描く */
  media?: string;
};

/** three と R3F は、Water.js の海を始めるときだけ読み込む */
const SeaWaterCanvas = dynamic(() => import("./SeaWaterCanvas"), { ssr: false });

/** データ節約モードでは three を読み込まない。Save-Data は Chromium 系だけが持つ */
const prefersSavingData = () =>
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/**
 * three の Water.js で描く穏やかな海（progressive enhancement）。空の箱の水平線より下にだけ canvas を置き、
 * 手前の静止画の海の奥に敷く。最初の1枚を描けたら data-sea-ready を付け、それを合図に静止画の海が
 * 薄くなる（seaMotion.module.css）。写真の質感を残したまま、水面の動きだけを足すため。
 *
 * 次のときは何も描かず、静止画の海のままにする。
 * prefers-reduced-motion・データ節約モード・サーバーでの描画・WebGL が使えない・初期化／shader の失敗・context の喪失・
 * media に当たらない（同じ海を画面の条件ごとに別の舞台で描くページで、見えていない側の canvas を作らないため）。
 */
const SeaWater = ({ media = "all" }: Props) => {
  const reducedMotion = useReducedMotion();
  const visible = useMediaQuery(media);
  const [phase, setPhase] = useState<"waiting" | "running" | "failed">("waiting");
  const layer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reducedMotion || !visible || prefersSavingData()) return;
    return whenIdle(() =>
      setPhase((current) => (current === "waiting" ? (supportsWebGL() ? "running" : "failed") : current)),
    );
  }, [reducedMotion, visible]);

  if (reducedMotion || !visible || phase !== "running") return null;

  return (
    <div ref={layer} className={styles.water} aria-hidden="true">
      <SeaErrorBoundary onError={() => setPhase("failed")}>
        {/*
         * 読み込み中（three の chunk・空のタイル）はここで受け止め、何も描かない。
         * R3F の Canvas は中の読み込み待ちを外へ投げるので、ページ全体の境界まで上げない
         */}
        <Suspense fallback={null}>
          <SeaWaterCanvas
            // 静止画の切り替えは state を介さず属性で始める（描画ループの中から呼ばれるため）
            onReady={() => layer.current?.setAttribute("data-sea-ready", "")}
            onError={() => setPhase("failed")}
          />
        </Suspense>
      </SeaErrorBoundary>
    </div>
  );
};

export default SeaWater;
