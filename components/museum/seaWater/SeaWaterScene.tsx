"use client";

import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Mesh, MeshBasicMaterial, PlaneGeometry, RepeatWrapping, Vector3, type Texture } from "three";
import { Water } from "three/examples/jsm/objects/Water.js";
import { PhotoTextureLoader } from "./photoTextureLoader";
import { WATER, WATER_FRAME_INTERVAL, WATER_MAX_DELTA } from "./waterConfig";
import { createWaterNormals } from "./waterNormals";

type Props = {
  /** WebGL の context を失ったとき（静止画だけに戻す） */
  onContextLost: () => void;
  /** 最初の1枚を描いた直後に1回だけ呼ぶ */
  onFirstFrame: () => void;
};

/** 水面（Water.js）。頂点は動かさないので、板は分割しない */
const createWater = () => {
  const water = new Water(new PlaneGeometry(WATER.planeSize, WATER.planeSize), {
    textureWidth: WATER.reflectionSize,
    textureHeight: WATER.reflectionSize,
    waterNormals: createWaterNormals(),
    sunDirection: new Vector3(...WATER.sunDirection).normalize(),
    sunColor: WATER.sunColor,
    waterColor: WATER.waterColor,
    distortionScale: WATER.distortionScale,
    fog: false,
  });
  water.rotation.x = -Math.PI / 2;
  water.material.uniforms.size.value = WATER.size;
  return water;
};

/** 水面に映す空。遠くに立てた板に、空のタイルを左右に敷き詰めて貼る（下端を水平線に合わせる） */
const createBackdrop = (sky: Texture) => {
  const { tileWidth, tileHeight, tileHorizon, distance, height, width } = WATER.backdrop;
  sky.wrapS = RepeatWrapping;
  // 板の高さ = タイルの高さ。タイルの横の長さを保つよう、板の横幅に合わせてくり返す
  sky.repeat.set(width / ((height * tileWidth) / tileHeight), 1);
  const backdrop = new Mesh(
    new PlaneGeometry(width, height),
    new MeshBasicMaterial({ map: sky, toneMapped: false, fog: false }),
  );
  // タイルの水平線（上から tileHorizon）を、水面の高さ 0 に置く
  backdrop.position.set(0, height / 2 - (height * (tileHeight - tileHorizon)) / tileHeight, -distance);
  return backdrop;
};

/** Water.js は反射用の render target を破棄する手段を持たないので、texture が持つ参照から破棄する */
const disposeWater = (water: Water) => {
  const uniforms = water.material.uniforms;
  (uniforms.mirrorSampler.value as Texture | null)?.renderTarget?.dispose();
  (uniforms.normalSampler.value as Texture | null)?.dispose();
  water.geometry.dispose();
  water.material.dispose();
};

/** 水面の時刻を進める（描画ループから呼ぶ。uniform の値を書き換えるだけで、オブジェクトは作らない） */
const advanceTime = (water: Water, seconds: number) => {
  water.material.uniforms.time.value += seconds;
};

/**
 * Water.js の水面と、それに映す空の板だけを置く。光源は使わない（Water.js の shader が太陽の向きと色を持つ）。
 * カメラは SeaWaterCanvas が固定で置き、canvas の上端がちょうど水平線になる。
 * 毎フレームの更新は time の書き換えだけで、React の state もオブジェクトの生成も使わない。
 * 外したときは、R3F が破棄しない水面・空の板・テクスチャを、ここで破棄する。
 */
const SeaWaterScene = ({ onContextLost, onFirstFrame }: Props) => {
  // 読み込めないと例外になり、SeaWater の error boundary が静止画だけに戻す
  const sky = useLoader(PhotoTextureLoader, WATER.backdrop.src);
  const [water] = useState(createWater);
  const [backdrop] = useState(() => createBackdrop(sky));

  useEffect(
    () => () => {
      disposeWater(water);
      backdrop.geometry.dispose();
      backdrop.material.dispose();
      sky.dispose();
      useLoader.clear(PhotoTextureLoader, WATER.backdrop.src);
    },
    [water, backdrop, sky],
  );

  // context の喪失を見張る。外したときは R3F が renderer を破棄して context を自分で手放す（forceContextLoss）ので、
  // その前に cleanup で見張りを外す（外さないと、reduced-motion で外しただけで「失敗」と扱い、設定を戻しても水面が戻らない）
  const gl = useThree((state) => state.gl);
  useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener("webglcontextlost", onContextLost);
    return () => canvas.removeEventListener("webglcontextlost", onContextLost);
  }, [gl, onContextLost]);

  const [frameInterval] = useState(() =>
    window.matchMedia("(pointer: coarse)").matches ? WATER_FRAME_INTERVAL.touch : WATER_FRAME_INTERVAL.default,
  );

  // 優先度 1 にすると R3F の自動描画が止まるので、ここで描き、最初の1枚の後に1回だけ知らせる。
  // 反射の描画は Water.js が onBeforeRender の中で行う。
  // 前に描いてから frameInterval たつまでは描かない（描かないフレームは、前の絵がそのまま見える）
  const firstFrameDone = useRef(false);
  const sinceRender = useRef(Infinity);
  useFrame(({ gl, scene, camera }, delta) => {
    sinceRender.current += delta;
    // 60Hz の rAF の揺れで 1/60 秒にわずかに届かず、1フレーム飛ばすことがないよう、少しだけ余裕を持たせる
    if (sinceRender.current < frameInterval * 0.9) return;
    advanceTime(water, Math.min(sinceRender.current, WATER_MAX_DELTA) * WATER.speed);
    sinceRender.current = 0;
    gl.render(scene, camera);
    if (!firstFrameDone.current) {
      firstFrameDone.current = true;
      onFirstFrame();
    }
  }, 1);

  return (
    <>
      <primitive object={water} />
      <primitive object={backdrop} />
    </>
  );
};

export default SeaWaterScene;
