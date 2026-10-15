"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import useAmbient from "@/components/museum/useAmbient";
import styles from "./TopHero.module.css";
import { buildWingKeyframes, type Flyer } from "./wingbeat";

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
  /** 軌道のうねりを毎回変えるための乱数 */
  seed: number[];
};

/**
 * 飛び方の違い。コウモリは上下にひらひらと揺れながら進む（羽ばたきの違いは wingbeat.ts）。
 * duration は [最小, 最大] 秒、swell は上下の揺れの大きさ（アーチの高さに対する割合）
 */
const FLIGHT_STYLE: Record<Flyer, { duration: [number, number]; swell: number }> = {
  swallow: { duration: [4, 6.5], swell: 0.022 },
  bat: { duration: [5, 7.5], swell: 0.045 },
};

/** 関節を支点に回す翼の1片。origin は viewBox 上の関節の位置 */
type WingPart = { path: string; origin: [number, number] };

/**
 * viewBox 48 x 24 の、下から見上げたシルエット。胴体は動かさず、翼だけを関節で回す。
 * 翼は右側だけを描き、左側は同じ形を左右に映して置く（羽ばたきのための変形ではなく、常に同じ鏡像）。
 * 翼の端から端までは、燕が viewBox の幅の約 7 割、コウモリがほぼいっぱい（大きさは TopHero.module.css）。
 */
const SILHOUETTE: Record<Flyer, { body: string; inner: WingPart; outer?: WingPart }> = {
  // 細い胴と、深く切れ込んだ燕尾。翼は細長く、先が後ろへ反る
  swallow: {
    body: "M24 6C25 6 25.6 6.8 25.7 7.8L26.1 11L26.4 13.6L28.6 19.4L25.6 15.8L24 17L22.4 15.8L19.4 19.4L21.6 13.6L21.9 11L22.3 7.8C22.4 6.8 23 6 24 6Z",
    inner: {
      path: "M25.4 8.8C30.4 7.8 36 8.4 41.5 12.4C36.2 11.6 31 12 25.6 12.8Z",
      origin: [25.4, 10.6],
    },
  },
  // 耳の立った小さな胴。翼は腕（肩〜手首）と手（手首〜指先）に分け、後縁は指の間の膜で波打つ
  bat: {
    body: "M22.9 7.6L23.3 5.6L23.9 7.2L24.1 7.2L24.7 5.6L25.1 7.6C25.9 8.1 26.3 9.1 26.3 10.2C26.3 12.6 25.4 14.8 24 15.8C22.6 14.8 21.7 12.6 21.7 10.2C21.7 9.1 22.1 8.1 22.9 7.6Z",
    inner: {
      path: "M25.4 8.6L34.2 6.2L34.8 7.6Q32.6 10.4 30.4 11.6Q28.2 11.2 25.8 13Z",
      origin: [25.4, 10],
    },
    outer: {
      path: "M34 6Q39.6 5.2 46.8 8.6Q44.4 8.6 42.8 11Q40.8 9.6 38.6 11.4Q36.6 9.8 34.6 11.8Q33.6 10.2 33.4 8.8Z",
      origin: [34.2, 7],
    },
  },
};

const wingOrigin = ({ origin: [x, y] }: WingPart) => ({ transformOrigin: `${x}px ${y}px` });

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
      const { duration } = FLIGHT_STYLE[flyer];
      setFlight({
        id: flightCount.current,
        flyer,
        enterY: randomBetween(0.14, 0.38),
        exitY: randomBetween(0.12, 0.4),
        duration: randomBetween(...duration),
        reverse: Math.random() < 0.4,
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
    const timing: KeyframeAnimationOptions = {
      duration: flight.duration * 1000,
      easing: "linear",
      fill: "both",
    };
    const animation = bird.animate(buildFlightPath(flight, width, height, bird.offsetWidth), timing);
    // 翼は左右とも同じ角度で回す（左は鏡像の中にあるので、そのまま左右対称に動く）
    const wings = buildWingKeyframes(flight.flyer, flight.duration);
    const wingAnimations = Array.from(bird.querySelectorAll<SVGGElement>("[data-wing]")).map((wing) =>
      wing.animate(wing.dataset.wing === "outer" && wings.outer ? wings.outer : wings.inner, timing),
    );
    animation.onfinish = () => setFlight(null);
    return () => {
      animation.cancel();
      wingAnimations.forEach((wing) => wing.cancel());
    };
  }, [flight, reducedMotion]);

  // 動きを減らす設定の間は、飛んでいる途中の燕も描かない（次の燕も予約しない）
  if (!flight || reducedMotion) return null;

  const { body, inner, outer } = SILHOUETTE[flight.flyer];
  const wing = (
    <g data-wing="inner" className={styles.wing} style={wingOrigin(inner)}>
      <path d={inner.path} />
      {outer && (
        <g data-wing="outer" className={styles.wing} style={wingOrigin(outer)}>
          <path d={outer.path} />
        </g>
      )}
    </g>
  );

  return (
    <span key={flight.id} ref={birdRef} className={styles[flight.flyer]} aria-hidden="true">
      <svg viewBox="0 0 48 24" fill="currentColor" focusable="false">
        {wing}
        <g transform="matrix(-1 0 0 1 48 0)">{wing}</g>
        <path d={body} />
      </svg>
    </span>
  );
};

export default ArchFlyby;
