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
  /** コウモリが途中で向きを直す位置（進んだ割合）と、上下にずれる量（アーチの高さに対する割合） */
  turns: { at: number; dy: number }[];
};

/**
 * 飛び方の違い（羽ばたきの違いは wingbeat.ts）。duration は [最小, 最大] 秒。
 * 燕は大きな弧を描いてなめらかに横切り、コウモリは小さく上下しながら、途中で 2〜3 回だけ向きを直す
 */
const FLIGHT_STYLE: Record<Flyer, { duration: [number, number] }> = {
  swallow: { duration: [4, 6.5] },
  bat: { duration: [5, 7.5] },
};

/** 関節を支点に回す翼の1片。origin は viewBox 上の関節の位置 */
type WingPart = { path: string; origin: [number, number] };
/** 翼1枚。inner は肩から先（腕）、outer は手首から先（コウモリだけ） */
type Wing = { inner: WingPart; outer?: WingPart };

/**
 * viewBox 48 x 24 の、真横から見たシルエット（右へ進む向き）。右から左へ飛ぶときは、全体を常に左右に映して置く。
 * 胴体は動かさず、翼だけを関節で回す。手前の翼（near）が主で、奥の翼（far）は少し小さく、胴体の後ろに隠れる。
 * 形は滑空の姿勢（翼を後ろへ広げた形）で描き、羽ばたきは wingbeat.ts の角度で肩・手首を回して作る。
 */
const SILHOUETTE: Record<Flyer, { body: string; near: Wing; far: Wing }> = {
  // 丸い小さな頭と短いくちばし、細長い胴、後ろへ長く伸びる二又の尾。翼は細長い鎌形で、先が後ろへ反る
  swallow: {
    body: "M40.6 12.5L38.9 11.2C38.2 10.1 36.6 9.7 35.2 10.2C32 11.2 27.5 11.8 23.5 12.6L9 14.6L22.8 14.4L11 18L24.6 15.6C28.6 16 33 15.4 36.2 14.4C37.8 13.9 38.9 13.3 40.6 12.5Z",
    near: {
      inner: { path: "M31.8 11C27 8.6 19 6.6 9.6 6.2C16 8.4 22 11 28.6 13Z", origin: [31, 11.8] },
    },
    far: {
      inner: {
        path: "M32.52 10.38C28.78 8.5 22.54 6.94 15.21 6.63C20.2 8.35 24.88 10.38 30.03 11.94Z",
        origin: [31.9, 11],
      },
    },
  },
  // 尖った耳の小さな頭、横長の胴。翼は腕（肩〜手首）と手（手首〜指先）の広い膜に分け、後縁は指の間で深く波打つ
  bat: {
    body: "M39.6 11.2C39.2 10.2 38.4 9.6 37.6 9.4L37.8 7.2L36.4 9.2C34 9 30.6 9.6 28.2 10.6C26.6 11.2 25.6 12.2 25.4 13C27.6 13.8 31.4 13.8 34.4 13C36.8 12.4 38.8 11.9 39.6 11.2Z",
    near: {
      inner: { path: "M31.2 10.4L21.4 5L20.4 6.8Q21.8 10.4 24.4 12.6Q27.4 13.6 30 13.4Z", origin: [30.8, 11.4] },
      outer: {
        path: "M21.6 5Q13.6 3.6 4.8 5.8Q7 7.4 7.6 10Q10.4 8.6 12.6 11.2Q14.8 9.4 17.6 12Q19.4 10 20.6 7.6Z",
        origin: [21, 5.9],
      },
    },
    far: {
      inner: {
        path: "M32.12 9.7L24.28 5.38L23.48 6.82Q24.6 9.7 26.68 11.46Q29.08 12.26 31.16 12.1Z",
        origin: [31.8, 10.5],
      },
      outer: {
        path: "M24.44 5.38Q18.04 4.26 11 6.02Q12.76 7.3 13.24 9.38Q15.48 8.26 17.24 10.34Q19 8.9 21.24 10.98Q22.68 9.38 23.64 7.46Z",
        origin: [23.96, 6.1],
      },
    },
  },
};

const wingOrigin = ({ origin: [x, y] }: WingPart) => ({ transformOrigin: `${x}px ${y}px` });

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

/** 軌道を分割する点の数。多いほど滑らか */
const STEPS = 24;

/** コウモリが途中で向きを直す 2〜3 か所。飛ぶ区間にほぼ均等に散らし、上下どちらかへ少しだけずれる */
const planTurns = () => {
  const count = Math.random() < 0.5 ? 2 : 3;
  return Array.from({ length: count }, (_, i) => ({
    at: (i + 1) / (count + 1) + randomBetween(-0.06, 0.06),
    dy: randomBetween(0.015, 0.035) * (Math.random() < 0.5 ? -1 : 1),
  }));
};

/** 0 → 1 へなめらかに移る（向きの修正を、折れ線ではなく緩やかな曲がりにする） */
const smoothstep = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
};

/**
 * 1回分の飛行軌道を、Web Animations のキーフレームとして作る。
 * - 横：ほぼ一定に進むが、速さがごくわずかに揺らぐ（後戻りはしない）
 * - 縦：入る高さから抜ける高さへゆるやかに移る。燕はその上に大きな弧を1つだけ重ね、
 *   コウモリは小さな上下に、途中 2〜3 回の向きの修正を重ねる（ジグザグにはしない）
 * - 向き：軌道の傾きに合わせて、機首をわずかに上げ下げする
 */
const buildFlightPath = (flight: Flight, width: number, height: number, birdWidth: number) => {
  const [phaseA, phaseB, phaseSpeed, waves] = flight.seed;
  const startX = -birdWidth * 1.4;
  const endX = width + birdWidth * 0.4;

  const offsetY = (u: number) => {
    if (flight.flyer === "swallow") {
      // 上か下へふくらむ、弱く大きな弧
      const arc = height * 0.045 * waves * (phaseA < Math.PI ? -1 : 1);
      return arc * Math.sin(Math.PI * u);
    }
    const flutter = height * 0.012 * Math.sin(2 * Math.PI * waves * 2 * u + phaseB);
    const turns = flight.turns.reduce(
      (sum, turn) => sum + height * turn.dy * smoothstep((u - turn.at) / 0.12 + 0.5),
      0,
    );
    return flutter + turns;
  };

  const pointAt = (t: number) => {
    // 速さのごく小さな揺らぎ（±12% 程度。0.015 * 2π * 1.3 < 1 なので後戻りしない）
    const u = t + 0.015 * Math.sin(2 * Math.PI * 1.3 * t + phaseSpeed);
    const progress = flight.reverse ? 1 - u : u;
    const x = startX + (endX - startX) * progress;
    const y = height * (flight.enterY + (flight.exitY - flight.enterY) * u) + offsetY(u);
    return { x, y };
  };

  const frames: Keyframe[] = [];
  for (let i = 0; i <= STEPS; i += 1) {
    const t = i / STEPS;
    const { x, y } = pointAt(t);
    const ahead = pointAt(Math.min(1, t + 0.02));
    const behind = pointAt(Math.max(0, t - 0.02));
    const slope = Math.atan2(ahead.y - behind.y, Math.abs(ahead.x - behind.x) || 1);
    const bank = Math.max(-10, Math.min(10, (slope * 180) / Math.PI * 0.8));
    frames.push({
      offset: t,
      transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(flight.reverse ? -bank : bank).toFixed(2)}deg)`,
    });
  }
  return frames;
};

/**
 * Contact のアーチ越しに、少し奥の海の上をリュウキュウツバメが横切る。夜（時間帯が night）はコウモリになる。
 * 主役ではなく「見ていたら、たまたま横切った」程度の気配だが、黒い点やアイコンではなく、
 * 真横から見た姿で、静止していても燕・コウモリと分かるようにする（大きさは TopHero.module.css）。
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
        turns: flyer === "bat" ? planTurns() : [],
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
    // 手前と奥の翼を、それぞれ腕（inner）と手首から先（outer）のキーフレームで回す
    const wings = buildWingKeyframes(flight.flyer, flight.duration);
    const wingAnimations = Array.from(bird.querySelectorAll<SVGGElement>("[data-wing]")).flatMap((element) => {
      const [side, part] = (element.dataset.wing ?? "").split("-") as ["near" | "far", "inner" | "outer"];
      const frames = wings[side]?.[part];
      return frames ? [element.animate(frames, timing)] : [];
    });
    animation.onfinish = () => setFlight(null);
    return () => {
      animation.cancel();
      wingAnimations.forEach((wing) => wing.cancel());
    };
  }, [flight, reducedMotion]);

  // 動きを減らす設定の間は、飛んでいる途中の燕も描かない（次の燕も予約しない）
  if (!flight || reducedMotion) return null;

  const { body, near, far } = SILHOUETTE[flight.flyer];
  const wing = (side: "near" | "far", { inner, outer }: Wing) => (
    <g data-wing={`${side}-inner`} className={styles.wing} style={wingOrigin(inner)}>
      <path d={inner.path} />
      {outer && (
        <g data-wing={`${side}-outer`} className={styles.wing} style={wingOrigin(outer)}>
          <path d={outer.path} />
        </g>
      )}
    </g>
  );

  return (
    <span key={flight.id} ref={birdRef} className={styles[flight.flyer]} aria-hidden="true">
      {/* 右から左へ飛ぶときは、全体を常に左右に映す（羽ばたきのための変形ではない） */}
      <svg
        viewBox="0 0 48 24"
        fill="currentColor"
        focusable="false"
        className={flight.reverse ? styles.flyLeft : undefined}
      >
        <g className={styles.farWing}>{wing("far", far)}</g>
        <path d={body} />
        {wing("near", near)}
      </svg>
    </span>
  );
};

export default ArchFlyby;
