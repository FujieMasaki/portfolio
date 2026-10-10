import Image from "next/image";
import Link from "next/link";
import { CANVAS, toPercentBox, type Arch } from "./scene";
import SwallowFlyby from "./SwallowFlyby";
import styles from "./TopHero.module.css";

type Props = {
  arch: Arch;
  /** Contact のアーチ越しに見せる背景（時間帯で差し替わる） */
  background: string;
  backgroundFilter: string;
};

/**
 * アーチ1つ分の入口。
 *
 * 建物 PNG の開口部の真後ろに置き、建物・前景植物は pointer-events: none にしているため、
 * ヒット領域はアーチ形状そのものになる（植物に隠れた下部も含む）。
 * 部屋名のプレート（ABOUT / WORK / CONTACT）は ArchSigns が建物の手前に描く。
 * ここでは hover / focus のときだけ、開口部の内側に薄い黒のスモークをかけ、
 * アーチの中央付近に「GO TO・カテゴリ名・説明」を浮かび上がらせる。
 * スモークはリンク自体の切り抜き（アーチ形）の内側にあるので、コンクリートや植物にはかからない。
 */
/**
 * アーチ内の画像の sizes。表示幅は「開口部の幅 × 画像の拡大率 × 舞台の幅」で、
 * 舞台の幅は縦長画面で 200vw、横長では画面の比率により 100〜約135vw になる。
 */
function interiorSizes(openingWidth: number, frameWidth: string) {
  const ratio = (openingWidth / CANVAS.width) * (parseFloat(frameWidth) / 100);
  return `(max-aspect-ratio: 6/7) ${Math.ceil(ratio * 200)}vw, ${Math.ceil(ratio * 135)}vw`;
}

export default function ArchEntrance({
  arch,
  background,
  backgroundFilter,
}: Props) {
  const { opening, interior } = arch;
  // 上端を半円にするための縦方向の半径（開口部の高さに対する比率）
  const radiusY = `${(opening.width / 2 / opening.height) * 100}%`;

  return (
    <Link
      href={arch.href}
      className={styles.arch}
      data-arch={arch.id}
      style={{
        ...toPercentBox(opening),
        borderRadius: `50% 50% 0 0 / ${radiusY} ${radiusY} 0 0`,
      }}
    >
      <span className={styles.archScene} aria-hidden="true">
        {interior?.kind === "image" && (
          <span className={styles.archImage} style={interior.frame}>
            <Image
              src={interior.src}
              alt=""
              width={1122}
              height={1402}
              // 最初から見える位置にあるので遅延させず、舞台のフェードインの前にそろえる
              loading="eager"
              sizes={interiorSizes(opening.width, interior.frame.width)}
            />
          </span>
        )}
        {interior?.kind === "view" && (
          <Image
            src={background}
            alt=""
            fill
            sizes={`${Math.round((opening.width / CANVAS.width) * 300)}vw`}
            className={styles.archView}
            style={{
              objectPosition: interior.objectPosition,
              filter: backgroundFilter,
            }}
          />
        )}
        {arch.flyby && <SwallowFlyby />}
      </span>

      <span className={styles.archSmoke} aria-hidden="true" />

      <span className={styles.archLabel}>
        <span className={styles.archGoTo} aria-hidden="true">
          GO TO
        </span>
        <span className={styles.archTitle}>{arch.title}</span>
        {/* 説明は見た目の補足。読み上げではカテゴリ名だけをリンクの名前にする */}
        {arch.caption && (
          <span className={styles.archCaption} aria-hidden="true">
            {arch.caption}
          </span>
        )}
      </span>
    </Link>
  );
}
