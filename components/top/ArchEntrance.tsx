import Image from "next/image";
import Link from "next/link";
import { CANVAS, roomsSizes, toPercentBox, type Arch } from "./scene";
import styles from "./TopHero.module.css";

type Props = {
  arch: Arch;
  /** Contact のアーチ越しに見せる背景（色調は時間帯の CSS 変数で TopHero.module.css が決める） */
  background: string;
  /** スマホ幅の部屋で、ほかの部屋のアーチ。画面の端にかかっても、押せず・Tab でも止まらないようにする */
  inert?: boolean;
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
 * マウスの hover では、舞台全体（TopHero の .lens）がゆっくりわずかに近づく（TopHero.module.css）。
 */
/**
 * アーチ内の画像の sizes。表示幅は「開口部の幅 × 画像の拡大率 × 舞台の幅」で、
 * 舞台の幅はスマホ幅のルール（幅 767px 以下で縦横比 6/7 以下か、幅 700px 以下）で 200vw。
 * 幅 767px 以下のそれ以外では画面の比率により変わり、縦横比 4/3 以下では最大約 207vw になる。
 * 幅 768px 以上では、安全域のルールで最大約 122vw、それより横長では 100〜約122vw。
 */
const interiorSizes = (openingWidth: number, frameWidth: string) => {
  const ratio = (openingWidth / CANVAS.width) * (parseFloat(frameWidth) / 100);
  const portrait = `${Math.ceil(ratio * 200)}vw`;
  // sizes ではカンマが候補の区切りなので、スマホ幅のルールに入る条件ごとに同じ値を並べる
  // 幅 767px 以下で縦横比 4/3 以下の横長でも舞台は約 207vw まで広がるので、スマホ幅と同じ値を使う
  return `${roomsSizes(ratio)}, (max-width: 700px) ${portrait}, (max-width: 767.98px) and (max-aspect-ratio: 4/3) ${portrait}, ${Math.ceil(ratio * 135)}vw`;
};

const ArchEntrance = ({ arch, background, inert }: Props) => {
  const { opening, interior } = arch;
  // 上端を半円にするための縦方向の半径（開口部の高さに対する比率）
  const radiusY = `${(opening.width / 2 / opening.height) * 100}%`;

  return (
    <Link
      href={arch.href}
      className={styles.arch}
      data-arch={arch.id}
      inert={inert}
      style={{
        ...toPercentBox(opening),
        borderRadius: `50% 50% 0 0 / ${radiusY} ${radiusY} 0 0`,
      }}
    >
      <span className={styles.archScene} aria-hidden="true">
        {interior?.kind === "image" && (
          <span className={styles.archImage} data-light={interior.light} style={interior.frame}>
            <Image
              src={interior.src}
              alt=""
              width={interior.width}
              height={interior.height}
              // 最初から見える位置にあるので遅延させない（舞台の表示はこの画像を待たない）
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
            style={{ objectPosition: interior.objectPosition }}
          />
        )}
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
};

export default ArchEntrance;
