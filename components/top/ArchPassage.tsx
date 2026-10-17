"use client";

import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
  type SyntheticEvent,
} from "react";
import { useRouter } from "next/navigation";
import { clearMark, setMark } from "@/components/museum/arrivalMark";
import { ARCHES, type ArchId } from "./scene";
import styles from "./TopHero.module.css";

/** 通り抜けにかける時間。ズームと開口部の広がりは同じ時間で終える。待たされると感じない長さに留める */
const DURATION = 950;
/** 舞台のズーム量。カメラが大きく動いたと感じない、数歩近づく程度 */
const ZOOM = 1.05;
/** サイト共通の easing（--ease-calm と同じ値） */
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
/** 開口部の広がりを刻む数。拡大率を等比で刻み、広がる速さが途中で急に変わって見えないようにする */
const STEPS = 12;

/**
 * 開口部（上端は幅の半分を半径にした半円）を、中心を保ったまま画面全体が収まるまで広げる clip-path の keyframes。
 * opening・view はどちらも画面に対する位置（getBoundingClientRect）
 */
const openingKeyframes = (opening: DOMRect, view: DOMRect) => {
  const halfW = opening.width / 2;
  const halfH = opening.height / 2;
  const cx = opening.left + halfW - view.left;
  const cy = opening.top + halfH - view.top;
  // 中心を保ったまま何倍にすれば、半円より下の四角い部分が画面全体を覆うか
  const cover =
    Math.max(cx / halfW, (view.width - cx) / halfW, cy / Math.max(halfH - halfW, 1), (view.height - cy) / halfH) *
    1.04;
  const archShape = (scale: number) => {
    const w = halfW * scale;
    const h = halfH * scale;
    return `inset(${cy - h}px ${view.width - cx - w}px ${view.height - cy - h}px ${cx - w}px round ${w}px ${w}px 0 0)`;
  };
  return Array.from({ length: STEPS + 1 }, (_, i) => ({
    offset: i / STEPS,
    clipPath: archShape(cover ** (i / STEPS)),
  }));
};

/** 開口部の中心を、舞台の中での位置（transform-origin）にする */
const originIn = (stage: DOMRect, opening: DOMRect) =>
  `${((opening.left + opening.width / 2 - stage.left) / stage.width) * 100}% ${
    ((opening.top + opening.height / 2 - stage.top) / stage.height) * 100
  }%`;

/** 押されたのがアーチ・部屋名のリンクなら、その行き先 */
const archFor = (target: EventTarget) => {
  const link = target instanceof Element ? target.closest("a[href]") : null;
  return ARCHES.find((arch) => arch.href === link?.getAttribute("href"));
};

const isPlainClick = (event: MouseEvent) =>
  event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;

type Props = {
  /** 館名と舞台（TopHero）。アーチ（ArchEntrance）と部屋名（ArchSigns）は、この中の Link のまま */
  children: ReactNode;
};

/**
 * TOP のアーチを「通り抜けて」展示室へ入る遷移（Mask transition + Zoom through）。
 *
 *   1. 選んだアーチ以外と館名を少しだけ落ち着かせる（[data-passage]。TopHero.module.css）
 *   2. 舞台を、選んだアーチの開口部を中心に 1 → 1.05 へごく弱くズームする
 *   3. 同時に、開口部と同じアーチの形をした窓（.passage）を画面全体が収まるまで広げる。
 *      窓の中は、次の部屋の壁ではなく、アーチの奥の暗がり（館内は暖かいチャコール、/contact は館の外の暗がり）にする
 *   4. 広がり終えたら router.push で遷移する。<html data-arrival="passage"> を付けておき、
 *      次の部屋は同じ暗がりの上に、目が慣れるように静かに現れる（AboutMuseum / ContactMuseum の passage-arrive。
 *      暗がりの色は globals.css が、印のある間だけ body に敷く）
 *
 * 館名と舞台を包み（display: contents で、配置には関わらない）、中のアーチのクリックを capture で受けて横取りする。
 * capture で preventDefault すれば、Link は遷移しない。
 * JS が動かない環境・修飾キー付きのクリック・prefers-reduced-motion・Web Animations が無い環境では
 * 何もせず、Link の通常の遷移になる。
 */
const ArchPassage = ({ children }: Props) => {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  /** 窓の中の暗がりの色を決める行き先。入口を選びそうな気配で先に決め、押したら固定する */
  const [to, setTo] = useState<ArchId>();
  /** 通り抜けている行き先（選んだ以外の入口を落ち着かせる） */
  const [passage, setPassage] = useState<ArchId>();
  /** 通り抜けの動き。押し直しの判定は描画を待たずに行うので、state ではなく ref に持つ */
  const animations = useRef<Animation[]>([]);

  // TOP を離れたら（戻る操作などを含む）、動きを取り消す。finished が reject され、後から遷移しない。
  // Web Animations は React の外の動きなので、この後片付けだけを effect に置く
  useEffect(() => () => animations.current.forEach((animation) => animation.cancel()), []);

  // 入口を選びそうな気配（hover・focus・指が触れた）で行き先を決めておき、遷移先を先に読み始める
  const onIntent = (event: SyntheticEvent) => {
    const arch = archFor(event.target);
    if (!arch || passage || to === arch.id) return;
    setTo(arch.id);
    router.prefetch(arch.href);
  };

  const onClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    const arch = archFor(event.target);
    if (!arch) return;
    // 通り抜けている途中のクリックは、もう一度遷移させない
    if (animations.current.length > 0) {
      event.preventDefault();
      return;
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const overlay = overlayRef.current;
    const stage = event.currentTarget.querySelector<HTMLElement>(`.${styles.stage}`);
    const opening = stage?.querySelector<HTMLElement>(`.${styles.arch}[data-arch="${arch.id}"]`);
    if (!isPlainClick(event) || reducedMotion.matches || !overlay?.animate || !stage || !opening) return;

    event.preventDefault();
    setTo(arch.id);
    setPassage(arch.id);
    router.prefetch(arch.href);

    // スマホ幅のスライドで、矢印やホイールの横の動きが続いていたら、その場で止めてから位置を測る
    // （止めないと、測った開口部の位置に広がる窓と、横へ動き続ける舞台がずれる）
    const track = stage.closest<HTMLElement>(`.${styles.track}`);
    track?.scrollTo({ left: track.scrollLeft, behavior: "auto" });

    const openingRect = opening.getBoundingClientRect();
    stage.style.transformOrigin = originIn(stage.getBoundingClientRect(), openingRect);
    const timing = { duration: DURATION, easing: EASE, fill: "forwards" } as const;
    animations.current = [
      stage.animate({ scale: [1, ZOOM] }, timing),
      overlay.animate(openingKeyframes(openingRect, overlay.getBoundingClientRect()), timing),
      // 開口部の奥の暗がりが、前半で静かに濃くなる
      overlay.animate({ opacity: [0, 1] }, { ...timing, duration: DURATION * 0.45 }),
    ];

    // 通り抜けている途中で「動きを減らす」に変わったら、動きをその場で終わらせ、遷移はそのまま続ける
    // （cancel すると finished が reject され、遷移まで止まるので finish する）。見張るのは通り抜けている間だけ
    const finishNow = () => {
      if (reducedMotion.matches) animations.current.forEach((animation) => animation.finish());
    };
    reducedMotion.addEventListener("change", finishNow);

    Promise.all(animations.current.map((animation) => animation.finished))
      .then(() => {
        // 順路の案内の印が残っていれば外し、着地の動きを1つにする（念のため。TOP へ戻る順路の案内は印を付けない）
        clearMark("roomStep");
        setMark("arrival", "passage", "passage-arrive");
        router.push(arch.href);
      })
      // 途中で取り消された（ページを離れた）ときは何もしない
      .catch(() => undefined)
      .finally(() => reducedMotion.removeEventListener("change", finishNow));
  };

  return (
    <div
      className={styles.passageScope}
      data-passage={passage}
      onPointerOver={onIntent}
      onFocus={onIntent}
      onPointerDown={onIntent}
      onClickCapture={onClickCapture}
    >
      {children}
      <div ref={overlayRef} className={styles.passage} data-to={to} aria-hidden="true" />
    </div>
  );
};

export default ArchPassage;
