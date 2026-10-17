"use client";

import { Canvas } from "@react-three/fiber";
import { useRef } from "react";
import { MathUtils } from "three";
import SeaWaterScene from "./SeaWaterScene";
import { WATER, WATER_DPR } from "./waterConfig";

type Props = {
  /** 最初の1枚を描けたとき（ここから手前の静止画の海が薄くなる） */
  onReady: () => void;
  /** shader のエラー・WebGL の context の喪失・反射を描けない環境。静止画だけに戻す */
  onError: () => void;
  /** 画面の外にある間は描かない（最後に描いた1枚がそのまま残る） */
  paused: boolean;
};

/**
 * Water.js の海だけの小さな Canvas（next/dynamic で後から読み込み、three を最初の bundle に入れない）。
 * カメラは固定（操作しない）。画角の半分だけ下を向け、canvas の上端をちょうど水平線にする。
 * 外したときの renderer の破棄は R3F が行う（水面・空の板は SeaWaterScene が破棄する）。
 *
 * - flat：tone mapping を外す（Water.js の色をそのまま出す）
 * - antialias なし・stencil なし。ソフトウェア描画など遅い環境では作らずに静止画へ戻す（failIfMajorPerformanceCaveat）
 * - resize の offsetSize：舞台のフェードイン（scale）中に測っても、拡大前の箱の大きさで描く
 * - paused の間は frameloop を止める。戻ったときの時間の飛びは、SeaWaterScene が WATER_MAX_DELTA で抑える
 */
const SeaWaterCanvas = ({ onReady, onError, paused }: Props) => {
  const failed = useRef(false);
  const fail = () => {
    if (failed.current) return;
    failed.current = true;
    onError();
  };

  return (
    <Canvas
      flat
      frameloop={paused ? "never" : "always"}
      dpr={WATER_DPR}
      resize={{ offsetSize: true }}
      camera={{
        fov: WATER.fov,
        near: 1,
        far: WATER.planeSize,
        position: [0, WATER.cameraHeight, 0],
        rotation: [MathUtils.degToRad(-WATER.fov / 2), 0, 0],
      }}
      gl={{
        antialias: false,
        alpha: false,
        stencil: false,
        powerPreference: "low-power",
        failIfMajorPerformanceCaveat: true,
      }}
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.setClearColor(WATER.clearColor);
        gl.debug.onShaderError = () => {
          if (process.env.NODE_ENV === "development") {
            console.error("[sea] Water.js の shader のコンパイルに失敗したため、静止画の海に戻します");
          }
          fail();
        };
        // 反射の render target は HalfFloat。色として描けない環境では反射が黒くなるので、始めずに静止画へ戻す
        if (!gl.extensions.has("EXT_color_buffer_half_float") && !gl.extensions.has("EXT_color_buffer_float")) {
          fail();
        }
      }}
    >
      <SeaWaterScene
        onContextLost={fail}
        onFirstFrame={() => {
          // shader のエラーは最初の描画の中で同期的に知らされるので、その後に確かめる
          if (!failed.current) onReady();
        }}
      />
    </Canvas>
  );
};

export default SeaWaterCanvas;
