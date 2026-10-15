"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import useAmbient from "@/components/museum/useAmbient";
import styles from "./TopHero.module.css";

/** 昼のあいだはリュウキュウツバメ、夜はコウモリ */
type Flyer = "swallow" | "bat";

type Flight = {
  id: number;
  flyer: Flyer;
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

/**
 * 飛び方の違い。コウモリは燕より小刻みに羽ばたき、上下にひらひらと揺れながら進む。
 * duration・flap は [最小, 最大] 秒、swell は上下の揺れの大きさ（アーチの高さに対する割合）
 */
const FLIGHT_STYLE: Record<Flyer, { duration: [number, number]; flap: [number, number]; swell: number }> = {
  swallow: { duration: [4, 6.5], flap: [1, 1.3], swell: 0.022 },
  bat: { duration: [5, 7.5], flap: [0.28, 0.38], swell: 0.045 },
};

/** viewBox 40 x 20。どちらも横から見上げたシルエットで、羽ばたきは CSS（swallow-flap / bat-flap）が担う */
const SILHOUETTE: Record<Flyer, string> = {
  swallow:
    "M20 9.2c-2.6-3.4-7.4-6.3-14.6-7.2 4.6 1.6 8.6 4.4 11 7.6-1.6.6-2.8 1.6-3.6 3l2.9-.8-1.6 4.4 3.4-3.6.9 0 3.4 3.6-1.6-4.4 2.9.8c-.8-1.4-2-2.4-3.6-3 2.4-3.2 6.4-6 11-7.6C27.4 2.9 22.6 5.8 20 9.2z",
  bat: "M20 5L20.9 3.4L21.3 5.3L22.3 6.9Q26.5 3.9 31.5 3.2Q36.5 3.6 39.6 6.4Q37.6 6.2 35.6 9Q33.4 7.9 31.2 9.8Q29 8.9 26.8 10.9Q24.6 9.9 22.4 11.8Q21.2 11.2 20 13.6Q18.8 11.2 17.6 11.8Q15.4 9.9 13.2 10.9Q11 8.9 8.8 9.8Q6.6 7.9 4.4 9Q2.4 6.2 0.4 6.4Q3.5 3.6 8.5 3.2Q13.5 3.9 17.7 6.9L18.7 5.3L19.1 3.4Z",
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
const buildFlightPath = (flight: Flight, width: number, height: number, birdWidth: number) => {
  const [phaseA, phaseB, phaseSpeed, waves] = flight.seed;
  const startX = -birdWidth * 1.4;
  const endX = width + birdWidth * 0.4;
  const swell = height * FLIGHT_STYLE[flight.flyer].swell;

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
};

/**
 * Contact のアーチ越しに、少し奥の海の上をリュウキュウツバメが横切る。夜（時間帯が night）はコウモリになる。
 * 環境の気配だが、黒い点ではなく、見た瞬間に燕・コウモリと分かる大きさにする（大きさは TopHero.module.css）。
 * 同じ軌道の繰り返しに見えないよう、飛ぶたびに高さ・うねり・速さ・向きを変えて1羽だけ通す。
 * prefers-reduced-motion では飛ばさない（閲覧の途中で有効にしたときも、飛んでいる燕を止める）。
 */
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** 「動きを減らす」の設定を購読する（閲覧の途中で変わっても追従する） */
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

const ArchFlyby = () => {
  const [flight, setFlight] = useState<Flight | null>(null);
  // サーバーでは燕を描かないので、動きを減らす側（true）として扱う
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  const flyer: Flyer = useAmbient() === "night" ? "bat" : "swallow";
  const flightCount = useRef(0);
  const birdRef = useRef<HTMLSpanElement>(null);

  // 次の1羽を出すまでの間を空ける
  useEffect(() => {
    if (flight || reducedMotion) return;

    const delay =
      flightCount.current === 0 ? randomBetween(3000, 6000) : randomBetween(10000, 22000);
    const timer = window.setTimeout(() => {
      flightCount.current += 1;
      const { duration, flap } = FLIGHT_STYLE[flyer];
      setFlight({
        id: flightCount.current,
        flyer,
        enterY: randomBetween(0.14, 0.38),
        exitY: randomBetween(0.12, 0.4),
        duration: randomBetween(...duration),
        reverse: Math.random() < 0.4,
        flap: randomBetween(...flap),
        seed: [
          randomBetween(0, Math.PI * 2),
          randomBetween(0, Math.PI * 2),
          randomBetween(0, Math.PI * 2),
          randomBetween(0.8, 1.4),
        ],
      });
    }, delay);
    return () => window.clearTimeout(timer);
  }, [flight, reducedMotion, flyer]);

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
      className={styles[flight.flyer]}
      style={{ "--flap-duration": `${flight.flap}s` } as CSSProperties}
      aria-hidden="true"
    >
      <svg viewBox="0 0 40 20" focusable="false">
        <path
          d={SILHOUETTE[flight.flyer]}
          fill="currentColor"
        />
      </svg>
    </span>
  );
};

export default ArchFlyby;
