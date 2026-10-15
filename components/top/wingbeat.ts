/**
 * 燕・コウモリの翼の動き（ArchFlyby が Web Animations のキーフレームとして使う）。
 * React にも DOM にも依存しない純粋関数だけを置き、scripts/wingbeat.test.mjs で確かめる。
 *
 * 鳥は真横（右向き）から見たシルエットで、胴体は動かさず、翼だけを関節（肩・手首）を支点に回す。
 * シルエット全体を伸縮・反転させない。角度は正の値で翼の先が上がる。
 * - 燕：滑空が主。1〜3回羽ばたいたら、翼を後ろへ広げたまま 1.5〜3 秒滑空する。1拍の長さも毎回変える
 * - コウモリ：1拍 0.45〜0.65 秒で数回羽ばたき、ごく短い間を置く。手首から先（outer）が腕（inner）に遅れて付いてくるので、
 *   打ち上げでは翼が折れ、打ち下ろしでは伸びる
 * 奥の翼は手前の翼よりわずかに遅れ、振れ幅も少し小さい（左右の翼がぴったりそろって見えないように）。
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
const pickInt = (random: Random, min: number, max: number) => min + Math.floor(random() * (max - min + 1));

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
      const beats = pickInt(random, 1, 3);
      for (let i = 0; i < beats; i += 1) push("beat", between(random, 0.24, 0.34), between(random, 0.8, 1));
      push("glide", between(random, 1.5, 3));
    }
  } else {
    while (time < total) {
      const beats = pickInt(random, 2, 5);
      for (let i = 0; i < beats; i += 1) push("beat", between(random, 0.45, 0.65), between(random, 0.75, 1.05));
      // ごく短い間だけ、翼を広げて流れる
      push("glide", between(random, 0.15, 0.35));
    }
  }
  return segments;
};

/**
 * 翼の角度（度）。base は滑空のときの角度（翼を後ろへ広げ、先をわずかに上げる）、
 * up・down は打ち上げ・打ち下ろしで base からどれだけ振るか
 */
const WING = {
  swallow: { base: 2, up: 40, down: 26, sway: 2 },
  bat: { base: 2, up: 48, down: 32, sway: 2.5 },
} as const;

/** 奥の翼の遅れ（秒）と振れ幅の割合 */
const FAR_LAG = 0.03;
const FAR_AMPLITUDE = 0.9;

/** 手首から先が腕に遅れる時間（秒）と、その遅れを角度に移す割合 */
const OUTER_LAG = 0.08;
const OUTER_FOLLOW = 0.8;
const OUTER_LIMIT = 35;
/** 滑空のときも、手首から先をわずかに下げておく */
const OUTER_REST = -4;

/** ある時刻の、腕（肩から先）の角度 */
const innerAngle = (flyer: Flyer, segments: WingSegment[], time: number, scale = 1) => {
  const { base, up, down, sway } = WING[flyer];
  const segment = segments.find((s) => time < s.start + s.duration) ?? segments[segments.length - 1];
  if (!segment || segment.kind === "glide" || time < segment.start) {
    // 滑空中は翼を広げたまま、風を受けて数度だけ揺れる
    return base + sway * Math.sin((2 * Math.PI * Math.max(0, time)) / 1.6);
  }
  const phase = (time - segment.start) / segment.duration;
  // 前半で打ち上げ、後半で打ち下ろす。始めと終わりは滑空の角度に戻るので、つなぎ目で跳ばない
  const stroke = Math.sin(2 * Math.PI * phase);
  return base + (stroke > 0 ? up : down) * segment.amplitude * scale * stroke;
};

/** キーフレームを切る間隔（秒）。回転の補間は linear なので、細かく刻んで曲線に近づける */
const SAMPLE = 1 / 30;

type Frame = { offset: number; transform: string };

const rotate = (angle: number) => ({ transform: `rotate(${angle.toFixed(2)}deg)` });

/**
 * 1回の飛行（total 秒）分の、翼のキーフレーム。
 * near は手前の翼、far は奥の翼。inner は肩を支点にした腕、
 * outer は手首を支点にした手首から先（コウモリだけ。腕の回転に重ねて効く）
 */
export const buildWingKeyframes = (flyer: Flyer, total: number, random: Random = Math.random) => {
  const segments = planWingbeats(flyer, total, random);
  const steps = Math.max(1, Math.ceil(total / SAMPLE));
  const hasHand = flyer === "bat";

  const wing = (lag: number, scale: number) => {
    const inner: Frame[] = [];
    const outer: Frame[] = [];
    for (let i = 0; i <= steps; i += 1) {
      const offset = i / steps;
      const time = offset * total - lag;
      const angle = innerAngle(flyer, segments, time, scale);
      inner.push({ offset, ...rotate(angle) });
      if (hasHand) {
        const lagged = innerAngle(flyer, segments, time - OUTER_LAG, scale);
        const bend = Math.max(-OUTER_LIMIT, Math.min(OUTER_LIMIT, OUTER_FOLLOW * (lagged - angle)));
        outer.push({ offset, ...rotate(OUTER_REST + bend) });
      }
    }
    return { inner, outer: hasHand ? outer : null };
  };

  return { segments, near: wing(0, 1), far: wing(FAR_LAG, FAR_AMPLITUDE) };
};
