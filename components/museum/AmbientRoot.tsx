"use client";

import type { CSSProperties, ReactNode } from "react";
import type { AmbientId } from "./ambient";
import styles from "./ambient.module.css";
import useAmbient from "./useAmbient";

/** 時間帯ごとの CSS 変数（`--ambient-*`）。サーバーから渡せるよう、文字列と数値だけにする */
export type AmbientVariables = Record<AmbientId, Record<`--${string}`, string | number>>;

type Props = {
  as?: "div" | "section";
  className: string;
  /** as="section" のとき、見出しの id */
  labelledBy?: string;
  variables: AmbientVariables;
  children: ReactNode;
};

/**
 * ページの外枠。いまの時間帯（useAmbient）を data-ambient に出し、その時間帯の光と空気の値を
 * CSS 変数として流す。各レイヤーの filter や色はページの CSS がこの変数から決める。
 *
 * 舞台は画像がそろうまで透明なので（ParallaxStage）、hydration の直後の切り替えは通常は見える前に終わる。
 * 見えている間に変わるとき（時間帯の境界・タブに戻ったときなど）は、CSS の transition で静かに馴染ませる。
 */
const AmbientRoot = ({ as: Tag = "div", className, labelledBy, variables, children }: Props) => {
  const ambient = useAmbient();

  return (
    <Tag
      className={`${styles.root} ${className}`}
      aria-labelledby={labelledBy}
      data-ambient={ambient}
      style={variables[ambient] as CSSProperties}
    >
      {children}
    </Tag>
  );
};

export default AmbientRoot;
