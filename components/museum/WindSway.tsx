import type { CSSProperties } from "react";
import Image from "next/image";
import styles from "./WindSway.module.css";

type Box = { x: number; y: number; width: number; height: number };
type Point = { x: number; y: number };

/** 枝・葉の先の部分。枝（SwayBranch）の動きに乗ったまま、少し遅れて、少しだけ余分に傾く */
export type SwayTip = {
  src: string;
  /** 元の植物の画像の中での位置（px） */
  rect: Box;
  /** 傾ける支点（元の画像の px）。枝と同じ根元にすると、境目で動く量が 1px 未満に収まる */
  pivot: Point;
  /** 枝の傾きに足す、片側への最大の傾き（deg） */
  angle: number;
  /** 枝より遅れて動く時間（秒）。0.1〜0.3 程度 */
  lag: number;
};

/**
 * 風で揺らす枝・葉の1か所。元の植物の画像から切り出した透過 PNG で、
 * 静止したベース（同じ部分を抜いた画像）の上に重ねる。
 */
export type SwayBranch = {
  src: string;
  /** 元の植物の画像の中での位置（px） */
  rect: Box;
  /** 傾ける支点（元の画像の px）。枝の付け根・葉の根元に置く */
  pivot: Point;
  /** 片側への最大の傾き（deg）。0.2〜0.5 程度 */
  angle: number;
  /** 一周の秒数。場所ごとに少しずつ変え、すべての枝が同じ向きへ同時に動かないようにする */
  duration: number;
  /** 揺れ始めの遅れ（秒）。負の値にすると、周期の途中から始まる */
  delay: number;
  tip?: SwayTip;
};

type Props = {
  /** 部品を切り出した元の画像の大きさ（px）。この component は、元の画像と同じ大きさの箱の中に置く */
  canvas: { width: number; height: number };
  branches: SwayBranch[];
  /** 元の画像（ベース）と同じ sizes。部品は元の画像より小さいので、これで足りる */
  sizes: string;
  /**
   * ベースを優先して読む画面（TOP・/contact）では "high" にする。ベースには部品の部分に穴があるので、
   * 画像がそろうのを待ってから見せる舞台（ParallaxStage）が、部品も一緒に待つようにする
   */
  fetchPriority?: "high";
};

const percent = (value: number, total: number) => `${(value / total) * 100}%`;

/** frame（px）に対する rect の位置を % にする */
const placeIn = (rect: Box, frame: Box): CSSProperties => ({
  left: percent(rect.x - frame.x, frame.width),
  top: percent(rect.y - frame.y, frame.height),
  width: percent(rect.width, frame.width),
  height: percent(rect.height, frame.height),
});

const originOf = (rect: Box, pivot: Point) =>
  `${percent(pivot.x - rect.x, rect.width)} ${percent(pivot.y - rect.y, rect.height)}`;

/**
 * 植物に風がある、と感じさせるための揺れ。植物全体は動かさず、切り出した枝・葉だけを、
 * 根元を支点にごく小さく傾ける（translate では動かさない）。
 *
 *   枝・葉（branch）  根元を支点に 0.2〜0.5° 傾く
 *   葉先（tip）       枝に乗ったまま、0.1〜0.3 秒遅れて、さらに少しだけ傾く（先端ほど大きく動く）
 *
 * 動きの形と prefers-reduced-motion での停止は WindSway.module.css が決める。
 * 置く側は、元の画像と同じ大きさの箱（パララックスで動かすなら、その箱ごと）に入れる。
 */
const WindSway = ({ canvas, branches, sizes, fetchPriority }: Props) => {
  const frame = { x: 0, y: 0, ...canvas };

  return (
    <>
      {branches.map((branch) => (
        <div
          key={branch.src}
          className={styles.branch}
          style={
            {
              ...placeIn(branch.rect, frame),
              transformOrigin: originOf(branch.rect, branch.pivot),
              "--wind-angle": `${branch.angle}deg`,
              "--wind-duration": `${branch.duration}s`,
              "--wind-delay": `${branch.delay}s`,
            } as CSSProperties
          }
        >
          {/* ベースの穴を埋める部品なので、遅らせずに読む */}
          <Image src={branch.src} alt="" fill loading="eager" fetchPriority={fetchPriority} sizes={sizes} />
          {branch.tip && (
            <div
              className={styles.tip}
              style={
                {
                  ...placeIn(branch.tip.rect, branch.rect),
                  transformOrigin: originOf(branch.tip.rect, branch.tip.pivot),
                  "--wind-angle": `${branch.tip.angle}deg`,
                  "--wind-delay": `${branch.delay + branch.tip.lag}s`,
                } as CSSProperties
              }
            >
              <Image
                src={branch.tip.src}
                alt=""
                fill
                loading="eager"
                fetchPriority={fetchPriority}
                sizes={sizes}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
};

export default WindSway;
