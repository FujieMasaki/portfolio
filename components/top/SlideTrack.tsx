"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ARCHES } from "./scene";
import styles from "./TopHero.module.css";

type Props = {
  /** 舞台（ParallaxStage） */
  children: ReactNode;
};

/** 最初に画面の中央へ置くアーチ（About）の、開口部の中心のキャンバスの x */
const START_X = ARCHES[0].opening.x + ARCHES[0].opening.width / 2;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** 箱の中のアーチの入口のリンク（ARCHES の順に並んでいる） */
const archLinksIn = (node: HTMLElement | null) =>
  Array.from(node?.querySelectorAll<HTMLElement>(`.${styles.arch}`) ?? []);

/**
 * スマホ幅のスライド（scene.ts の SLIDE_MEDIA）の、横スクロールの箱と画面下の案内（‹ ABOUT 1/3 ›）。
 *
 * 箱は CSS だけで横にスクロールし、アーチの中心で1つずつ止まる（TopHero.module.css の .track）。
 * ここで JS が受け持つのは、案内の矢印で隣のアーチへ動かすことと、いまどのアーチが中央にあるかを案内に出すことだけ。
 * スライドの条件に当たらない画面では、箱は display: contents で配置に関わらず、案内も出さない。
 * prefers-reduced-motion では、矢印で動かすときになめらかに動かさず、すぐに移る。
 */
const SlideTrack = ({ children }: Props) => {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);

  // スクロールしたら、画面の中央にいちばん近いアーチを案内に出す（描画のたびではなく、フレームに1回だけ測る）
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    let frame = 0;
    const measure = () => {
      const view = node.getBoundingClientRect();
      const center = view.left + view.width / 2;
      const distances = archLinksIn(node).map((link) => {
        const rect = link.getBoundingClientRect();
        return Math.abs(rect.left + rect.width / 2 - center);
      });
      if (distances.length > 0) setCurrent(distances.indexOf(Math.min(...distances)));
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    node.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      node.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const go = (index: number) => {
    const node = track.current;
    const link = archLinksIn(node)[index];
    if (!node || !link) return;
    const view = node.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
    node.scrollBy({
      left: rect.left + rect.width / 2 - (view.left + view.width / 2),
      behavior: reducedMotion ? "instant" : "smooth",
    });
  };

  const atStart = current === 0;
  const atEnd = current === ARCHES.length - 1;

  return (
    <>
      <div ref={track} className={styles.track} style={{ "--slide-start": START_X } as CSSProperties}>
        {children}
      </div>

      {/* 押せない端の矢印は disabled にせず aria-disabled にする（押した直後にフォーカスを見失わないため） */}
      <div className={styles.slideNav}>
        <button
          type="button"
          className={styles.slideButton}
          aria-label="前の入口へ"
          aria-disabled={atStart}
          onClick={() => !atStart && go(current - 1)}
        >
          ‹
        </button>
        <span className={styles.slidePlace} aria-hidden="true">
          <span className={styles.slideName}>{ARCHES[current].title}</span>
          <span className={styles.slideCount}>
            {current + 1} / {ARCHES.length}
          </span>
        </span>
        <button
          type="button"
          className={styles.slideButton}
          aria-label="次の入口へ"
          aria-disabled={atEnd}
          onClick={() => !atEnd && go(current + 1)}
        >
          ›
        </button>
      </div>
    </>
  );
};

export default SlideTrack;
