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
 * 隣のアーチへ動かす。行き先は、案内の表示ではなく、その時点の位置から決める。
 * 端で隣がないときと、アーチを通り抜けている間（ArchPassage の [data-passage]）は動かさず、false を返す
 */
const stepIn = (node: HTMLElement, step: -1 | 1) => {
  if (node.closest("[data-passage]")) return false;
  const link = archLinksIn(node)[centerIndexIn(node) + step];
  if (!link) return false;
  const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
  // 箱には scroll-behavior を付けていないので、auto ならすぐに移る（"instant" は古い Safari で例外になる）
  node.scrollBy({ left: offsetFromCenter(node, link), behavior: reducedMotion ? "auto" : "smooth" });
  return true;
};

/** マウスのホイールの1回の操作の終わりとみなす、イベントの途切れ（ms）。トラックパッドの慣性の続きを同じ操作にまとめる */
const WHEEL_GESTURE_GAP = 220;
/** これより小さい縦の量（px）は、手の揺れとして扱って動かさない */
const WHEEL_MIN_DELTA = 4;
/** 行単位（deltaMode = 1）のホイールの量を px に換算するときの、1行の高さ */
const WHEEL_LINE_HEIGHT = 16;

/** ホイールの縦の量を px に換算する（行単位・ページ単位で送る環境でも、手の揺れの判定を px でそろえる） */
const wheelDeltaY = (event: WheelEvent, page: number) => {
  if (event.deltaMode === WheelEvent.DOM_DELTA_LINE) return event.deltaY * WHEEL_LINE_HEIGHT;
  if (event.deltaMode === WheelEvent.DOM_DELTA_PAGE) return event.deltaY * page;
  return event.deltaY;
};

/**
 * スマホ幅のスライド（scene.ts の SLIDE_MEDIA）の、横スクロールの箱と画面下の案内（‹ ABOUT 1/3 ›）。
 *
 * 箱は CSS だけで横にスクロールし、アーチの中心で1つずつ止まる（TopHero.module.css の .track）。
 * ここで JS が受け持つのは、案内の矢印とマウスのホイールで隣のアーチへ動かすことと、いまどのアーチが中央にあるかを案内に出すこと。
 * スライドの条件に当たらない画面では、箱は display: contents で配置に関わらず、案内も出さない。
 * prefers-reduced-motion では、矢印とホイールで動かすときになめらかに動かさず、すぐに移る。
 * 動いている途中に設定が変わったときも、その場でいちばん近いアーチに着地させる。
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
    // 矢印やホイールでなめらかに動いている途中に「動きを減らす」へ変わったら、その場でいちばん近いアーチにすぐ着地させる
    const reducedMotion = window.matchMedia(REDUCED_MOTION);
    const landNow = () => {
      if (!reducedMotion.matches) return;
      const link = archLinksIn(node)[centerIndexIn(node)];
      if (link) node.scrollBy({ left: offsetFromCenter(node, link), behavior: "auto" });
    };
    node.addEventListener("scroll", measureSoon, { passive: true });
    slide.addEventListener("change", measureSoon);
    reducedMotion.addEventListener("change", landNow);
    window.addEventListener("resize", measureSoon);
    // ブラウザが箱の横の位置を復元した場合に備え、表示した時点でも一度測る
    measureSoon();
    return () => {
      node.removeEventListener("scroll", measureSoon);
      slide.removeEventListener("change", measureSoon);
      reducedMotion.removeEventListener("change", landNow);
      window.removeEventListener("resize", measureSoon);
      cancelAnimationFrame(frame);
    };
  }, []);

  /*
   * マウスのホイールを縦に回したら、隣のアーチへ1つだけ動かす（スライドの条件の間だけ。TOP はこのとき1画面で、縦にはスクロールしない）。
   * 1回の操作（イベントが WHEEL_GESTURE_GAP 途切れるまで）で動かすのは1つだけにし、トラックパッドの慣性で次々に飛ばさない。
   * 横の操作（トラックパッドの横・Shift + ホイール）と、ピンチのズーム（ctrlKey）はブラウザに任せる。
   * 端で隣がないときは何もしない（横取りもしない）
   */
  useEffect(() => {
    const node = track.current;
    if (!node) return;
    const slide = window.matchMedia(SLIDE_MEDIA);
    let gestureTimer = 0;
    let moved = false;
    const onWheel = (event: WheelEvent) => {
      if (!slide.matches || event.ctrlKey || event.shiftKey) return;
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      window.clearTimeout(gestureTimer);
      gestureTimer = window.setTimeout(() => {
        moved = false;
      }, WHEEL_GESTURE_GAP);
      if (moved) {
        // 同じ操作の続きは、動かさずに受け止める（ページや箱が縦横に揺れないように）
        event.preventDefault();
        return;
      }
      const deltaY = wheelDeltaY(event, node.clientHeight);
      if (Math.abs(deltaY) < WHEEL_MIN_DELTA) return;
      if (stepIn(node, deltaY > 0 ? 1 : -1)) {
        moved = true;
        event.preventDefault();
      }
    };
    // 館名と画面下の案内は箱の外にあるので、それらを含む TOP の画面全体（.hero）で受ける。
    // ArchPassage の .passageScope は display: contents で描画の箱がなく、そこで preventDefault が効くかは処理系によるので使わない
    const area = node.closest<HTMLElement>(`.${styles.hero}`) ?? node;
    area.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      area.removeEventListener("wheel", onWheel);
      window.clearTimeout(gestureTimer);
    };
  }, []);

  const go = (step: -1 | 1) => {
    if (track.current) stepIn(track.current, step);
  };

  const atStart = current === 0;
  const atEnd = current === ARCHES.length - 1;

  return (
    <>
      <div ref={track} className={styles.track} style={{ "--slide-start": START_X } as CSSProperties}>
        {children}
      </div>

      {/* 押せない端の矢印は disabled にせず aria-disabled にする（押した直後にフォーカスを見失わないため） */}
      <div className={styles.slideNav} role="group" aria-label="入口の切り替え">
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
