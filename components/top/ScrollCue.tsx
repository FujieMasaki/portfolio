"use client";

import type { ArchId } from "./scene";
import styles from "./TopHero.module.css";

type Props = {
  /** 押したときにスクロールして見せる部屋（TopHero の data-room） */
  to: ArchId;
  /** 読み上げでの名前（見た目の文字は Scroll のまま） */
  label: string;
};

/**
 * スマホ幅の部屋の「Scroll」の目印。押すと次の部屋の上端までスクロールする。
 * 目印の下には前の部屋のアーチ（入口のリンク）があるので、目印自体をボタンにして、押しても入口へ遷移しないようにする。
 * prefers-reduced-motion では、なめらかに動かさずにその位置へ移る。
 */
const ScrollCue = ({ to, label }: Props) => {
  const onClick = () => {
    const room = document.querySelector(`[data-room="${to}"]`);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    room?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" });
  };

  return (
    <button type="button" className={styles.scrollCue} onClick={onClick} aria-label={label}>
      Scroll
    </button>
  );
};

export default ScrollCue;
