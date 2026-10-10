"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import styles from "./TopHero.module.css";

type Flight = {
  id: number;
  /** 入るときの高さ（アーチの高さに対する割合） */
  enterY: number;
  /** 抜けるときの高さ（同上） */
  exitY: number;
  /** 横切りにかかる秒数 */
  duration: number;
  /** 右から左へ飛ぶか */
  reverse: boolean;
  /** 羽ばたき1回の秒数 */
  flap: number;
  /** 軌道のうねりを毎回変えるための乱数 */
  seed: number[];
};

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/** 軌道を分割する点の数。多いほど滑らか */
const STEPS = 24;

/**
 * 1回分の飛行軌道を、Web Animations のキーフレームとして作る。
 * - 横：ほぼ一定に進むが、速さがごくわずかに揺らぐ（後戻りはしない）
 * - 縦：入る高さから抜ける高さへゆるやかに移りつつ、ゆっくりした波と小さな波を重ねる
 * - 向き：軌道の傾きに合わせてわずかに機体を傾ける（小さな波の分だけ時々向きが変わる）
 */
function buildFlightPath(flight: Flight, width: number, height: number, birdWidth: number) {
  const [phaseA, phaseB, phaseSpeed, waves] = flight.seed;
  const startX = -birdWidth * 1.4;
  const endX = width + birdWidth * 0.4;
  const swell = height * 0.022;

  const pointAt = (t: number) => {
    // 速さのごく小さな揺らぎ（±12% 程度。0.015 * 2π * 1.3 < 1 なので後戻りしない）
    const u = t + 0.015 * Math.sin(2 * Math.PI * 1.3 * t + phaseSpeed);
    const progress = flight.reverse ? 1 - u : u;
    const x = startX + (endX - startX) * progress;
    const y =
      height * (flight.enterY + (flight.exitY - flight.enterY) * u) +
      swell * Math.sin(2 * Math.PI * waves * u + phaseA) +
      swell * 0.35 * Math.sin(2 * Math.PI * (waves * 2.7) * u + phaseB);
    return { x, y };
  };

  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i += 1) {
    const t = i / STEPS;
    const { x, y } = pointAt(t);
    const ahead = pointAt(Math.min(1, t + 0.02));
    const behind = pointAt(Math.max(0, t - 0.02));
    const slope = Math.atan2(ahead.y - behind.y, Math.abs(ahead.x - behind.x) || 1);
    const bank = Math.max(-8, Math.min(8, (slope * 180) / Math.PI * 0.6));
    frames.push({
      offset: t,
      transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(flight.reverse ? -bank : bank).toFixed(2)}deg)`,
    });
  }
  return frames;
}

/**
 * Contact のアーチ越しに、遠くの海の上をリュウキュウツバメが横切る。
 * アイコンではなく環境の気配なので、数秒眺めていると「鳥が飛んでいる」と気づく程度に留める。
 * 同じ軌道の繰り返しに見えないよう、飛ぶたびに高さ・うねり・速さ・向きを変えて1羽だけ通す。
 * prefers-reduced-motion では飛ばさない（閲覧の途中で有効にしたときも、飛んでいる燕を止める）。
 */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** 「動きを減らす」の設定を購読する（閲覧の途中で変わっても追従する） */
function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export default function SwallowFlyby() {
  const [flight, setFlight] = useState<Flight | null>(null);
  // サーバーでは燕を描かないので、動きを減らす側（true）として扱う
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  const flightCount = useRef(0);
  const birdRef = useRef<HTMLSpanElement>(null);

  // 次の1羽を出すまでの間を空ける
  useEffect(() => {
    if (flight || reducedMotion) return;

    const delay =
      flightCount.current === 0 ? randomBetween(3000, 6000) : randomBetween(10000, 22000);
    const timer = window.setTimeout(() => {
      flightCount.current += 1;
      setFlight({
        id: flightCount.current,
        enterY: randomBetween(0.14, 0.38),
        exitY: randomBetween(0.12, 0.4),
        duration: randomBetween(4, 6.5),
        reverse: Math.random() < 0.4,
        flap: randomBetween(1, 1.3),
        seed: [
          randomBetween(0, Math.PI * 2),
          randomBetween(0, Math.PI * 2),
          randomBetween(0, Math.PI * 2),
          randomBetween(0.8, 1.4),
        ],
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [flight, reducedMotion]);

  // 1羽分の軌道を作って飛ばし、抜けたら片付ける
  useEffect(() => {
    const bird = birdRef.current;
    const scene = bird?.parentElement;
    if (!flight || reducedMotion || !bird || !scene) return;

    const { width, height } = scene.getBoundingClientRect();
    const animation = bird.animate(
      buildFlightPath(flight, width, height, bird.offsetWidth),
      { duration: flight.duration * 1000, easing: "linear", fill: "both" },
    );
    animation.onfinish = () => setFlight(null);
    return () => animation.cancel();
  }, [flight, reducedMotion]);

  // 動きを減らす設定の間は、飛んでいる途中の燕も描かない（次の燕も予約しない）
  if (!flight || reducedMotion) return null;

  return (
    <span
      key={flight.id}
      ref={birdRef}
      className={styles.swallow}
      style={{ "--flap-duration": `${flight.flap}s` } as CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 20" focusable="false">
        <path
          d="M20 9.2c-2.6-3.4-7.4-6.3-14.6-7.2 4.6 1.6 8.6 4.4 11 7.6-1.6.6-2.8 1.6-3.6 3l2.9-.8-1.6 4.4 3.4-3.6.9 0 3.4 3.6-1.6-4.4 2.9.8c-.8-1.4-2-2.4-3.6-3 2.4-3.2 6.4-6 11-7.6C27.4 2.9 22.6 5.8 20 9.2z"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}
