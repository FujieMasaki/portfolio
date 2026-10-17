"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ARCHES, SLIDE_MEDIA } from "./scene";
import styles from "./TopHero.module.css";

type Props = {
  /** 舞台（ParallaxStage） */
  children: ReactNode;
};

/** 最初に画面の中央へ置くアーチ（About）の、開口部の中心のキャンバスの x */
const START_X = ARCHES[0].opening.x + ARCHES[0].opening.width / 2;

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** 箱の中のアーチの入口のリンク（ARCHES の順に並んでいる） */
const archLinksIn = (node: HTMLElement) => Array.from(node.querySelectorAll<HTMLElement>(`.${styles.arch}`));

/** 箱の中央からの、アーチの中心のずれ（px） */
const offsetFromCenter = (node: HTMLElement, link: HTMLElement) => {
  const view = node.getBoundingClientRect();
  const rect = link.getBoundingClientRect();
  return rect.left + rect.width / 2 - (view.left + view.width / 2);
};

/** いま箱の中央にいちばん近いアーチ（ARCHES の添字） */
const centerIndexIn = (node: HTMLElement) => {
  const distances = archLinksIn(node).map((link) => Math.abs(offsetFromCenter(node, link)));
  return distances.length > 0 ? distances.indexOf(Math.min(...distances)) : 0;
};

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

  // スクロールしたら、画面の中央にいちばん近いアーチを案内に出す（描画のたびではなく、フレームに1回だけ測る）。
  // 横向きにして戻したときや窓の大きさを変えたときは、箱が作り直されて位置が About に戻ることがあり、
  // scroll イベントが来ないので、スライドの条件の切り替わりと resize でも測り直す
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    let frame = 0;
    const measureSoon = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setCurrent(centerIndexIn(node)));
    };
    const slide = window.matchMedia(SLIDE_MEDIA);
    node.addEventListener("scroll", measureSoon, { passive: true });
    slide.addEventListener("change", measureSoon);
    window.addEventListener("resize", measureSoon);
    return () => {
      node.removeEventListener("scroll", measureSoon);
      slide.removeEventListener("change", measureSoon);
      window.removeEventListener("resize", measureSoon);
      cancelAnimationFrame(frame);
    };
  }, []);

  /** 隣のアーチへ動かす。行き先は、案内の表示ではなく、押した時点の位置から決める */
  const go = (step: -1 | 1) => {
    const node = track.current;
    if (!node) return;
    const link = archLinksIn(node)[centerIndexIn(node) + step];
    if (!link) return;
    const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
    node.scrollBy({ left: offsetFromCenter(node, link), behavior: reducedMotion ? "instant" : "smooth" });
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
          aria-label={atStart ? "前の入口へ" : `前の入口へ（${ARCHES[current - 1].title}）`}
          aria-disabled={atStart}
          onClick={() => go(-1)}
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
          aria-label={atEnd ? "次の入口へ" : `次の入口へ（${ARCHES[current + 1].title}）`}
          aria-disabled={atEnd}
          onClick={() => go(1)}
        >
          ›
        </button>
      </div>
    </>
  );
};

export default SlideTrack;
