import type { CSSProperties } from "react";
import { preload } from "react-dom";
import Image, { getImageProps } from "next/image";
import styles from "./LayeredBuilding.module.css";

/**
 * 同じ建物を5枚の素材に分けたもの。どれも同じキャンバス（寸法・位置）で書き出してある。
 *   base         コンクリートの素地（normal）
 *   formShadow   面の向きによる陰（multiply）
 *   archDepth    アーチの奥行き・厚みの陰（multiply）
 *   plantShadow  植物の影（multiply）
 *   lightMask    光の当たる範囲（白 = 当たる）。画像としては描かず、夕方の暖色の層のマスクにする
 */
export type BuildingLayers = {
  base: string;
  formShadow: string;
  archDepth: string;
  plantShadow: string;
  lightMask: string;
};

type Props = {
  layers: BuildingLayers;
  /** 外枠の位置と、各層の濃さ（--building-*-opacity など）を決めるページ側のクラス */
  className: string;
  style?: CSSProperties;
  /** next/image の sizes。5枚とも同じ大きさで描く */
  sizes: string;
};

/**
 * CSS のマスク（光の範囲・素地の外形）は、元の寸法では読まず、この幅に縮めたものを使う。
 * getImageProps の src は width の 2 倍の候補になるので、600 で 1200px 幅の画像になる
 */
const MASK_WIDTH = 600;

/** CSS の mask-image に使う、最適化済みの（縮めた WebP / AVIF の）画像の URL */
const maskSrc = (src: string) => {
  return getImageProps({ src, alt: "", width: MASK_WIDTH, height: MASK_WIDTH / 2 }).props.src;
};

/**
 * 2.5D の建物。5枚を同じ外枠の中で position: absolute; inset: 0 に完全に重ね、
 * 陰・奥行き・植物の影を multiply で素地に落とし、夕方の光をマスク越しの暖色で足す。
 *
 * Phase 1 の PoC として、光と陰は夕方で描いている。ほかの時間帯は、ページ側が外枠に filter をかけて暗さを寄せる。
 * 外枠は isolation で閉じ、multiply が背後の空や海と混ざらないようにする。
 */
const LayeredBuilding = ({ layers, className, style, sizes }: Props) => {
  const lightMask = maskSrc(layers.lightMask);
  const baseMask = maskSrc(layers.base);
  // マスクは CSS が読むまで取得が始まらないので、<img> と同時に取りにいく
  preload(lightMask, { as: "image", fetchPriority: "high" });
  preload(baseMask, { as: "image", fetchPriority: "high" });

  return (
    <div
      className={`${styles.building} ${className}`}
      style={
        {
          ...style,
          "--building-light-mask": `url("${lightMask}")`,
          "--building-base-mask": `url("${baseMask}")`,
        } as CSSProperties
      }
      // ParallaxStage は、<img> に加えてこのマスクがそろうまで舞台を出さない
      data-await-images={`${lightMask} ${baseMask}`}
      aria-hidden="true"
    >
      <Image
        className={styles.base}
        src={layers.base}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes={sizes}
      />
      <Image
        className={styles.formShadow}
        src={layers.formShadow}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes={sizes}
      />
      <Image
        className={styles.archDepth}
        src={layers.archDepth}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes={sizes}
      />
      <Image
        className={styles.plantShadow}
        src={layers.plantShadow}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes={sizes}
      />
      <div className={styles.light} />
    </div>
  );
};

export default LayeredBuilding;
