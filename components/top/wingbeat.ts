/**
 * 燕・コウモリの翼の動き（ArchFlyby が Web Animations のキーフレームとして使う）。
 * React にも DOM にも依存しない純粋関数だけを置き、scripts/wingbeat.test.mjs で確かめる。
 *
 * 胴体は動かさず、翼だけを関節（肩・手首）を支点に回す。シルエット全体を伸縮・反転させない。
 * - 燕：滑空が主。2〜3回羽ばたいたら、翼を広げたまま 1.5〜3 秒滑空する
 * - コウモリ：燕より短い周期で、拍ごとに長さと振れ幅を変える。手首から先（outer）が腕（inner）に遅れて付いてくるので、
 *   打ち上げでは翼が折れ、打ち下ろしでは伸びる
 */

export type Flyer = "swallow" | "bat";

export type WingSegment = {
  kind: "beat" | "glide";
  /** 飛び始めからの秒数 */
  start: number;
  duration: number;
  /** 羽ばたきの振れ幅（1 = 基準） */
  amplitude: number;
};

type Random = () => number;

const between = (random: Random, min: number, max: number) => min + random() * (max - min);

/** 羽ばたきと滑空の時間割を、飛ぶ時間（秒）いっぱいまで作る */
export const planWingbeats = (flyer: Flyer, total: number, random: Random = Math.random) => {
  const segments: WingSegment[] = [];
  let time = 0;
  const push = (kind: WingSegment["kind"], duration: number, amplitude = 1) => {
    segments.push({ kind, start: time, duration, amplitude });
    time += duration;
  };

  if (flyer === "swallow") {
    // 飛ぶたびに羽ばたき始めの時機を変える（いつも同じ瞬間から羽ばたかないように）
    push("glide", between(random, 0.2, 1.2));
    while (time < total) {
      const beats = random() < 0.5 ? 2 : 3;
      for (let i = 0; i < beats; i += 1) push("beat", between(random, 0.26, 0.32), between(random, 0.85, 1));
      push("glide", between(random, 1.5, 3));
    }
  } else {
    while (time < total) {
      push("beat", between(random, 0.2, 0.34), between(random, 0.75, 1.05));
      // ときどき、ほんの一瞬だけ翼を広げて流れる
      if (random() < 0.12) push("glide", between(random, 0.25, 0.5));
    }
  }
  return segments;
};

/** 翼の角度（度）。負の値で翼の先が上がる。base は滑空のときの角度（わずかに上反りさせる） */
const WING = {
  swallow: { base: -3, up: 30, down: 18, sway: 1.5 },
  bat: { base: -6, up: 36, down: 26, sway: 2 },
} as const;

/** 手首から先が腕に遅れる時間（秒）と、その遅れを角度に移す割合 */
const OUTER_LAG = 0.06;
const OUTER_FOLLOW = 0.9;
const OUTER_LIMIT = 24;

/** ある時刻の、腕（肩から先）の角度 */
const innerAngle = (flyer: Flyer, segments: WingSegment[], time: number) => {
  const { base, up, down, sway } = WING[flyer];
  const segment = segments.find((s) => time < s.start + s.duration) ?? segments[segments.length - 1];
  if (!segment || segment.kind === "glide" || time < segment.start) {
    // 滑空中も、風を受けてごくわずかに揺れる
    return base + sway * Math.sin((2 * Math.PI * time) / 1.4);
  }
  const phase = (time - segment.start) / segment.duration;
  // 前半で打ち上げ、後半で打ち下ろす。始めと終わりは滑空の角度に戻るので、つなぎ目で跳ばない
  const stroke = Math.sin(2 * Math.PI * phase);
  return base - (stroke > 0 ? up : down) * segment.amplitude * stroke;
};

/** キーフレームを切る間隔（秒）。回転の補間は linear なので、細かく刻んで曲線に近づける */
const SAMPLE = 1 / 30;

const rotate = (angle: number) => ({ transform: `rotate(${angle.toFixed(2)}deg)` });

/**
 * 1回の飛行（total 秒）分の、翼のキーフレーム。
 * inner は肩を支点にした腕、outer は手首を支点にした手首から先（コウモリだけ。腕の回転に重ねて効く）
 */
export const buildWingKeyframes = (flyer: Flyer, total: number, random: Random = Math.random) => {
  const segments = planWingbeats(flyer, total, random);
  const steps = Math.max(1, Math.ceil(total / SAMPLE));
  const inner: { offset: number; transform: string }[] = [];
  const outer: { offset: number; transform: string }[] = [];

  for (let i = 0; i <= steps; i += 1) {
    const offset = i / steps;
    const time = offset * total;
    const angle = innerAngle(flyer, segments, time);
    inner.push({ offset, ...rotate(angle) });
    if (flyer === "bat") {
      const lagged = innerAngle(flyer, segments, Math.max(0, time - OUTER_LAG));
      const bend = Math.max(-OUTER_LIMIT, Math.min(OUTER_LIMIT, OUTER_FOLLOW * (lagged - angle)));
      // わずかに折った状態を基本にし、腕の動きに遅れた分だけ折れ・伸びが加わる
      outer.push({ offset, ...rotate(4 + bend) });
    }
  }
  return { segments, inner, outer: flyer === "bat" ? outer : null };
};
