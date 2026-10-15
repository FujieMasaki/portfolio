"use client";

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
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
 * hydration の直後に夕方（サーバーの値）から実際の時間帯へ移るときは、舞台のフェードインと重なって
 * 色が移り変わる様子が見えないよう、transition を付けずに一度で切り替える。
 * 描画が落ち着いてから data-ambient-settled を付け、それ以降に変わるとき（時間帯の境界・タブに戻ったとき）だけ、
 * CSS の transition で静かに馴染ませる（ambient.module.css）。
 */
const AmbientRoot = ({ as: Tag = "div", className, labelledBy, variables, children }: Props) => {
  const ambient = useAmbient();
  const [settled, setSettled] = useState(false);

  // 実際の時間帯での描画が画面に出てから（2 フレーム後に）、馴染ませる transition を有効にする
  useEffect(() => {
    let frame = requestAnimationFrame(() => {
      frame = requestAnimationFrame(() => setSettled(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <Tag
      className={`${styles.root} ${className}`}
      aria-labelledby={labelledBy}
      data-ambient={ambient}
      data-ambient-settled={settled || undefined}
      style={variables[ambient] as CSSProperties}
    >
      {children}
    </Tag>
  );
};

export default AmbientRoot;
