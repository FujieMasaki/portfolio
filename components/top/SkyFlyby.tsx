"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import useAmbient from "@/components/museum/useAmbient";
import styles from "./TopHero.module.css";
import { buildFlightKeyframes, flybyDelayRange, planGroup, type Flight } from "./flight";
import { buildWingKeyframes, type Flyer } from "./wingbeat";

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

/** 空の箱の中での水平線の高さ（TopHero.module.css の .sky の --horizon を引き継ぐ）。読めなければ横長の値 */
const horizonOf = (element: HTMLElement) => {
  const value = Number.parseFloat(getComputedStyle(element).getPropertyValue("--horizon"));
  return Number.isFinite(value) ? value / 100 : 0.422;
};

type BirdProps = {
  flight: Flight;
  onDone: (id: number) => void;
};

/** 1羽分。軌道と羽ばたきを Web Animations で動かし、抜けたら知らせる。外されたら動きを取り消す */
const Bird = ({ flight, onDone }: BirdProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const bird = ref.current;
    const layer = bird?.parentElement;
    if (!bird || !layer) return;

    const { width, height } = layer.getBoundingClientRect();
    const timing: KeyframeAnimationOptions = {
      duration: flight.duration * 1000,
      // 群れの後続は、先頭から遅れて飛び始める（タイマーを増やさず、動きの delay で遅らせる）
      delay: flight.delay * 1000,
      easing: "linear",
      // 飛び始めるまでは最初のキーフレーム（画面の外）に置いておく
      fill: "both",
    };
    // 羽ばたきの時間割を先に作り、前へ進む速さをそれに合わせる
    const wings = buildWingKeyframes(flight.flyer, flight.duration);
    const path = buildFlightKeyframes(flight, wings.segments, {
      width,
      height,
      horizon: horizonOf(layer),
      birdWidth: bird.offsetWidth,
    });
    const animation = bird.animate(path, timing);
    // 手前と奥の翼を、それぞれ腕（inner）と手首から先（outer）のキーフレームで回す
    const wingAnimations = Array.from(bird.querySelectorAll<SVGGElement>("[data-wing]")).flatMap((element) => {
      const [side, part] = (element.dataset.wing ?? "").split("-") as ["near" | "far", "inner" | "outer"];
      const frames = wings[side]?.[part];
      return frames ? [element.animate(frames, timing)] : [];
    });
    animation.onfinish = () => onDone(flight.id);
    return () => {
      animation.onfinish = null;
      animation.cancel();
      wingAnimations.forEach((wing) => wing.cancel());
    };
  }, [flight, onDone]);

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
    <span ref={ref} className={styles[flight.flyer]}>
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

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

/** 「動きを減らす」の設定を購読する（閲覧の途中で変わっても追従する） */
const subscribeReducedMotion = (onChange: () => void) => {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
};

/**
 * TOP の空を、ときどきリュウキュウツバメ（夜・深夜はコウモリ）が横切る。
 * 空のレイヤー（Sky.tsx）の中に置くので、建物と植物の向こうの遠い空を飛び、手前を横切ることはない。
 * 主役ではなく「しばらく眺めていたら、今なにか飛んでいった」程度の気配にする。
 * 何羽で・いつ・どう飛ぶかは flight.ts、翼の動きは wingbeat.ts、大きさと色は TopHero.module.css。
 *
 * 待っている間に動かすのはタイマー1本だけで、群れが抜けきってから次の間を数え始める。
 * タブが見えていないときは飛ばさずに次の間を空け、ページを離れたらタイマーと動きを片付ける。
 * prefers-reduced-motion では飛ばさない（閲覧の途中で有効にしたときも、飛んでいる群れを消す）。
 */
const SkyFlyby = () => {
  const [group, setGroup] = useState<Flight[]>([]);
  // サーバーでは鳥を描かないので、動きを減らす側（true）として扱う
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => true,
  );
  const ambient = useAmbient();
  /** これまでに飛ばした数（id と、最初の群れかどうかの判定に使う） */
  const flown = useRef(0);

  // 次の群れを出すまでの間を空ける。群れが飛んでいる間と、動きを減らす設定の間は予約しない
  useEffect(() => {
    if (group.length > 0 || reducedMotion) return;

    let timer = 0;
    const wait = (first: boolean) => {
      timer = window.setTimeout(launch, randomBetween(...flybyDelayRange(ambient, first)));
    };
    const launch = () => {
      // 見えていないタブでは飛ばさず、もう一度間を空ける
      if (document.visibilityState !== "visible") {
        wait(false);
        return;
      }
      const next = planGroup(ambient, flown.current + 1);
      flown.current += next.length;
      setGroup(next);
    };
    wait(flown.current === 0);
    return () => window.clearTimeout(timer);
  }, [group, reducedMotion, ambient]);

  const onDone = useCallback((id: number) => {
    setGroup((current) => current.filter((flight) => flight.id !== id));
  }, []);

  // 動きを減らす設定の間は、飛んでいる途中の群れも描かない
  if (reducedMotion) return null;

  return (
    <div className={styles.flyby} aria-hidden="true">
      {group.map((flight) => (
        <Bird key={flight.id} flight={flight} onDone={onDone} />
      ))}
    </div>
  );
};

export default SkyFlyby;
