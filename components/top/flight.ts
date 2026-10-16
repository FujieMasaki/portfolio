/**
 * TOP の空を横切る燕・コウモリの「いつ・何羽・どう飛ぶか」（SkyFlyby が Web Animations のキーフレームとして使う）。
 * 翼の動きは wingbeat.ts。React にも DOM にも依存しない純粋関数だけを置き、scripts/flight.test.mjs で確かめる。
 *
 * 鳥は建物の向こうの空を遠く飛ぶ環境の気配で、主役ではない。
 * - 何も飛ばない時間を長く取り、間隔も毎回変える（「待てば定期的に飛ぶ」と覚えられないように）
 * - 真横から見た姿のまま、左右どちらかへ横切る（こちらへ向かってこない）
 * - 軌道の中で奥へ遠ざかる（または少し近づく）。遠いほどわずかに小さく淡く、水平線へ寄る
 * - 前へ進む速さは羽ばたきで少し伸び、滑空のあいだにゆっくり落ちる（羽ばたきと速さがずれて見えないように）
 */

import type { AmbientId } from "../museum/ambient";
import type { Flyer, WingSegment } from "./wingbeat";

type Random = () => number;

const between = (random: Random, min: number, max: number) => min + random() * (max - min);

/** 時間帯ごとに、空を横切るもの。夜（night）と深夜（midnight）はコウモリ、それ以外は燕 */
export const flyerFor = (ambient: AmbientId): Flyer =>
  ambient === "night" || ambient === "midnight" ? "bat" : "swallow";

/**
 * 次の群れを出すまでの間（ミリ秒の [最小, 最大]）。前の群れが抜けきってから数える。
 * first は、ページを開いてから最初の群れ（開いた直後には出さない）。
 * 夕方は朝・昼より少なく、深夜は夜よりさらに静かにする
 */
export const flybyDelayRange = (ambient: AmbientId, first: boolean): [number, number] => {
  if (first) return [8000, 20000];
  switch (ambient) {
    case "evening":
      return [45000, 110000];
    case "night":
      return [35000, 95000];
    case "midnight":
      return [60000, 150000];
    default:
      return [30000, 90000];
  }
};

/**
 * リュウキュウツバメの群れの羽数と、その出やすさ。つがいの 2 羽、数羽の小さな群れ、巣立ち後の家族群（5〜6 羽）を
 * 思わせる数にする。3〜4 羽がいちばん多く、2 羽も比較的多く、5〜6 羽はときどき、7〜8 羽はかなり稀。
 * 夕方も羽数は変えず、出る回数（flybyDelayRange）で静けさを出す
 */
const SWALLOW_FLOCK: [size: number, weight: number][] = [
  [2, 0.25],
  [3, 0.23],
  [4, 0.22],
  [5, 0.14],
  [6, 0.1],
  [7, 0.04],
  [8, 0.02],
];

/** 1回に横切る数。燕は 2〜8 羽（上の割合）、コウモリは 1〜2 匹（深夜は 1 匹だけ） */
export const flockSize = (ambient: AmbientId, random: Random = Math.random) => {
  const roll = random();
  switch (ambient) {
    case "night":
      return roll < 0.7 ? 1 : 2;
    case "midnight":
      return 1;
    default: {
      let sum = 0;
      return SWALLOW_FLOCK.find(([, weight]) => (sum += weight) > roll)?.[0] ?? SWALLOW_FLOCK[0][0];
    }
  }
};

export type Flight = {
  id: number;
  flyer: Flyer;
  /** 横切りにかかる秒数 */
  duration: number;
  /** 群れの先頭から遅れて飛び始める秒数（先頭は 0） */
  delay: number;
  /** 右から左へ飛ぶか（群れの中ではそろえる） */
  reverse: boolean;
  /** 入る・抜けるときの高さ。水平線を 0、空の箱の上端を 1 とした割合（近い位置での値） */
  altitude: [number, number];
  /** 入る・抜けるときの遠さ。0 = 近い（基準の大きさ）、1 = いちばん遠い */
  depth: [number, number];
  /** 個体ごとの大きさの違い（1 = 基準） */
  size: number;
  /** 燕が軌道に重ねる弧の大きさ（高さの割合。正なら一度少し上がってから下りる） */
  arc: number;
  /** コウモリの小さな上下の位相と回数 */
  flutter: { phase: number; cycles: number };
  /** コウモリが途中で向きを直す位置（進んだ割合）と、上下にずれる量（高さの割合） */
  turns: { at: number; dy: number }[];
};

/** 飛び方の違い。duration は [最小, 最大] 秒（画面の幅いっぱいを横切る時間） */
const FLIGHT_STYLE: Record<Flyer, { duration: [number, number] }> = {
  swallow: { duration: [7, 10] },
  bat: { duration: [9, 12] },
};

/** コウモリの2匹目が、1匹目から遅れる秒数 */
const BAT_FOLLOW_DELAY: [number, number] = [0.8, 3.2];

/**
 * 燕の群れの通り方。1〜2 羽ずつの小さな塊（wave）に分け、塊の中はほぼ同時に、
 * 塊の間は少し空けて通す（先頭の塊 → 0.3〜0.8 秒 → 次の塊 → 0.4〜1.2 秒 → …）
 */
const SWALLOW_WAVE_GAP: { first: [number, number]; rest: [number, number] } = {
  first: [0.3, 0.8],
  rest: [0.4, 1.2],
};
/** 同じ塊の中で、2羽目がわずかに遅れる秒数 */
const SWALLOW_PAIR_GAP: [number, number] = [0.05, 0.25];

/** 群れの各個体の飛び始め（秒）。燕は塊ごと、コウモリは1匹ずつ */
const planDelays = (flyer: Flyer, count: number, random: Random) => {
  if (flyer === "bat") {
    return Array.from({ length: count }, (_, i) => (i === 0 ? 0 : between(random, ...BAT_FOLLOW_DELAY)));
  }
  const delays: number[] = [];
  let start = 0;
  let wave = 0;
  while (delays.length < count) {
    if (wave > 0) start += between(random, ...(wave === 1 ? SWALLOW_WAVE_GAP.first : SWALLOW_WAVE_GAP.rest));
    const members = Math.min(count - delays.length, random() < 0.5 ? 1 : 2);
    delays.push(start);
    if (members === 2) delays.push(start + between(random, ...SWALLOW_PAIR_GAP));
    wave += 1;
  }
  return delays;
};

/** コウモリが途中で向きを直す 2〜3 か所。飛ぶ区間にほぼ均等に散らし、上下どちらかへ少しだけずれる */
const planTurns = (random: Random) => {
  const count = random() < 0.5 ? 2 : 3;
  return Array.from({ length: count }, (_, i) => ({
    at: (i + 1) / (count + 1) + between(random, -0.06, 0.06),
    dy: between(random, 0.04, 0.08) * (random() < 0.5 ? -1 : 1),
  }));
};

/** 1回分の群れ。firstId から順に id を振る */
export const planGroup = (ambient: AmbientId, firstId: number, random: Random = Math.random): Flight[] => {
  const flyer = flyerFor(ambient);
  const reverse = random() < 0.45;
  // 多くは奥へ遠ざかりながら抜け、ときどき少し近づきながら抜ける
  const receding = random() < 0.7;
  const near = between(random, 0, 0.35);
  const far = between(random, 0.55, 1);
  const lead = {
    altitude: [between(random, 0.4, 0.75), between(random, 0.35, 0.75)] as [number, number],
    depth: (receding ? [near, far] : [far, near]) as [number, number],
    duration: between(random, ...FLIGHT_STYLE[flyer].duration),
    // 弧の向きは群れでそろえ、大きさだけを個体ごとに変える
    arcSign: random() < 0.75 ? 1 : -1,
  };
  const delays = planDelays(flyer, flockSize(ambient, random), random);
  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

  return delays.map((delay, i) => {
    // 後続は先頭の近くを、高さ・遠さ・速さを少しだけ変えて通る（ぴったり同じ軌道にせず、群れとしてはまとまる）
    const spread = i === 0 ? 0 : 1;
    return {
      id: firstId + i,
      flyer,
      duration: lead.duration * (1 + spread * between(random, -0.05, 0.05)),
      delay,
      reverse,
      altitude: lead.altitude.map((a) => clamp01(a + spread * between(random, -0.07, 0.07))) as [number, number],
      depth: lead.depth.map((d) => clamp01(d + spread * between(random, -0.12, 0.12))) as [number, number],
      size: between(random, 0.92, 1.06),
      arc: between(random, 0.04, 0.1) * lead.arcSign,
      flutter: { phase: between(random, 0, Math.PI * 2), cycles: between(random, 1.5, 3) },
      turns: flyer === "bat" ? planTurns(random) : [],
    };
  });
};

/** 遠いほど小さく・淡く・水平線へ寄せる量（いちばん遠いときの割合）。鳥を目立たせないよう、ごく小さく留める */
const DEPTH_SHRINK = 0.2;
const DEPTH_FADE = 0.26;
const DEPTH_SINK = 0.35;

/** 近いときの濃さ。真っ黒のアイコンに見えないよう、空に馴染む濃さにする */
const OPACITY: Record<Flyer, number> = { swallow: 0.86, bat: 0.9 };

/** 羽ばたきで伸びる速さの割合。燕は滑空でよく伸びて落ち、コウモリは羽ばたき続けるので速さがほぼ一定 */
const THRUST_GAIN: Record<Flyer, number> = { swallow: 0.35, bat: 0.12 };

/** 速さを積み上げる刻み（秒） */
const DT = 1 / 30;

/** 0 → 1 へなめらかに移る */
export const smoothstep = (t: number) => {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
};

/**
 * 経過時間（秒）から、横切りの進み具合（0〜1）を返す関数。
 * 羽ばたいている間は推力が上がって少し速く進み、滑空のあいだにゆっくり速さが落ちる。後戻りはしない
 */
export const progressCurve = (flyer: Flyer, segments: WingSegment[], total: number) => {
  const steps = Math.max(1, Math.ceil(total / DT));
  const distance = [0];
  let thrust = 0.5;
  for (let i = 1; i <= steps; i += 1) {
    const time = Math.min(total, i * DT);
    const segment = segments.find((s) => time < s.start + s.duration);
    const beating = segment?.kind === "beat" && time >= segment.start;
    // 羽ばたきは 0.25 秒ほどで推力が乗り、滑空では 1.2 秒ほどかけて抜ける
    thrust += ((beating ? 1 : 0) - thrust) * (DT / (beating ? 0.25 : 1.2));
    distance.push(distance[i - 1] + (1 + THRUST_GAIN[flyer] * (thrust - 0.5)) * DT);
  }
  const length = distance[steps];
  return (time: number) => {
    const at = (Math.max(0, Math.min(total, time)) / total) * steps;
    const i = Math.min(steps - 1, Math.floor(at));
    const f = at - i;
    return (distance[i] + (distance[i + 1] - distance[i]) * f) / length;
  };
};

export type SkyBox = {
  /** 鳥が飛ぶ箱（空のレイヤー）の幅と高さ（px） */
  width: number;
  height: number;
  /** 箱の上端から水平線までの割合（0〜1） */
  horizon: number;
  /** 鳥の要素の幅（px）。画面の外から入り、外へ抜けるのに使う */
  birdWidth: number;
};

/** キーフレームを切る間隔（秒）。この間は直線で補間されるので、軌道の曲がりが角張らない細かさにする */
const KEYFRAME_SPACING = 0.2;

/**
 * 1羽分の軌道を、Web Animations のキーフレームにする（transform と opacity）。
 * - 横：画面の外から外へ。進み具合は progressCurve（羽ばたきと速さを合わせる）
 * - 縦：入る高さから抜ける高さへゆるやかに移る。燕は弱く大きな弧を1つだけ重ね、
 *   コウモリは小さな上下に、途中 2〜3 回の向きの修正を重ねる（ジグザグにはしない）
 * - 遠さ：入る遠さから抜ける遠さへなめらかに移り、遠いほどわずかに小さく淡く、水平線へ寄る
 * - 向き：軌道の傾きに合わせて、機首をわずかに上げ下げする
 */
export const buildFlightKeyframes = (flight: Flight, segments: WingSegment[], box: SkyBox) => {
  const progress = progressCurve(flight.flyer, segments, flight.duration);
  const startX = -box.birdWidth * 1.5;
  const endX = box.width + box.birdWidth * 0.5;
  const horizonY = box.height * box.horizon;

  const altitudeAt = (u: number) => {
    const [enter, exit] = flight.altitude;
    const base = enter + (exit - enter) * u;
    if (flight.flyer === "swallow") return base + flight.arc * Math.sin(Math.PI * u);
    const flutter = 0.025 * Math.sin(2 * Math.PI * flight.flutter.cycles * u + flight.flutter.phase);
    const turns = flight.turns.reduce((sum, turn) => sum + turn.dy * smoothstep((u - turn.at) / 0.12 + 0.5), 0);
    return base + flutter + turns;
  };

  const pointAt = (time: number) => {
    const u = progress(time);
    const depth = flight.depth[0] + (flight.depth[1] - flight.depth[0]) * smoothstep(u);
    const altitude = Math.max(0.15, Math.min(0.95, altitudeAt(u)));
    return {
      x: startX + (endX - startX) * (flight.reverse ? 1 - u : u),
      y: horizonY * (1 - altitude * (1 - DEPTH_SINK * depth)),
      depth,
    };
  };

  const steps = Math.max(1, Math.ceil(flight.duration / KEYFRAME_SPACING));
  return Array.from({ length: steps + 1 }, (_, i) => {
    const offset = i / steps;
    const time = offset * flight.duration;
    const { x, y, depth } = pointAt(time);
    const ahead = pointAt(time + 0.1);
    const behind = pointAt(time - 0.1);
    const slope = Math.atan2(ahead.y - behind.y, Math.abs(ahead.x - behind.x) || 1);
    const bank = Math.max(-10, Math.min(10, ((slope * 180) / Math.PI) * 0.8));
    const scale = flight.size * (1 - DEPTH_SHRINK * depth);
    return {
      offset,
      transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(flight.reverse ? -bank : bank).toFixed(2)}deg) scale(${scale.toFixed(3)})`,
      opacity: Number((OPACITY[flight.flyer] - DEPTH_FADE * depth).toFixed(3)),
    };
  });
};
