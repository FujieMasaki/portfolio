import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildFlightKeyframes,
  flockSize,
  flybyDelayRange,
  flyerFor,
  planGroup,
  progressCurve,
} from "../components/top/flight.ts";
import { planWingbeats } from "../components/top/wingbeat.ts";

/** 再現できる乱数（線形合同法） */
const seeded = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

const AMBIENTS = ["morning", "day", "evening", "night", "midnight"];
const BOX = { width: 1500, height: 980, horizon: 0.422, birdWidth: 28 };

const parse = (frame) => {
  const [, x, y, bank, scale] = frame.transform.match(
    /translate\(([-\d.]+)px, ([-\d.]+)px\) rotate\(([-\d.]+)deg\) scale\(([-\d.]+)\)/,
  );
  return { x: Number(x), y: Number(y), bank: Number(bank), scale: Number(scale), opacity: frame.opacity };
};

test("夜と深夜はコウモリ、それ以外の時間帯は燕が横切る", () => {
  assert.equal(flyerFor("night"), "bat");
  assert.equal(flyerFor("midnight"), "bat");
  for (const ambient of ["morning", "day", "evening"]) {
    assert.equal(flyerFor(ambient), "swallow", ambient);
  }
});

test("最初の群れは、ページを開いて 8〜20 秒後に出す（開いた直後には出さない）", () => {
  for (const ambient of AMBIENTS) {
    assert.deepEqual(flybyDelayRange(ambient, true), [8000, 20000], ambient);
  }
});

test("その後は 30 秒以上なにも飛ばさず、間隔の幅も大きく取る", () => {
  for (const ambient of AMBIENTS) {
    const [min, max] = flybyDelayRange(ambient, false);
    assert.ok(min >= 30000, `${ambient}: ${min}`);
    assert.ok(max - min >= 45000, `${ambient}: 間隔の幅 ${max - min}`);
  }
});

test("夕方は朝・昼より少なく、深夜は夜より少なく飛ぶ", () => {
  const [dayMin, dayMax] = flybyDelayRange("day", false);
  const [eveningMin, eveningMax] = flybyDelayRange("evening", false);
  assert.ok(eveningMin > dayMin && eveningMax > dayMax);
  assert.deepEqual(flybyDelayRange("morning", false), flybyDelayRange("day", false));
  const [nightMin, nightMax] = flybyDelayRange("night", false);
  const [midnightMin, midnightMax] = flybyDelayRange("midnight", false);
  assert.ok(midnightMin > nightMin && midnightMax > nightMax);
});

test("燕は 2〜8 羽で 3〜4 羽がいちばん多く、7〜8 羽はかなり稀。夕方も羽数は同じ", () => {
  for (const ambient of ["morning", "day", "evening"]) {
    const random = seeded(7);
    const sizes = Array.from({ length: 5000 }, () => flockSize(ambient, random));
    const share = (min, max) => sizes.filter((n) => n >= min && n <= max).length / sizes.length;
    assert.ok(Math.min(...sizes) === 2 && Math.max(...sizes) === 8, ambient);
    assert.ok(share(3, 4) > share(2, 2) && share(3, 4) > share(5, 6), ambient);
    assert.ok(share(2, 2) > share(5, 6), ambient);
    assert.ok(share(7, 8) > 0 && share(7, 8) < 0.1, `${ambient}: ${share(7, 8)}`);
  }
});

test("コウモリは 1〜2 匹（深夜は 1 匹）", () => {
  const limits = { night: 2, midnight: 1 };
  for (const ambient of ["night", "midnight"]) {
    const random = seeded(7);
    const seen = new Set(Array.from({ length: 200 }, () => flockSize(ambient, random)));
    assert.deepEqual([...seen].sort(), Array.from({ length: limits[ambient] }, (_, i) => i + 1), ambient);
  }
});

test("燕の群れは同じ向きに、1〜2 羽ずつ少し間を空けて通り、各個体は高さ・遠さ・大きさが少しずつ違う", () => {
  for (let seed = 1; seed <= 50; seed += 1) {
    const group = planGroup("day", 10, seeded(seed));
    assert.equal(group[0].delay, 0);
    assert.deepEqual(
      group.map((flight) => flight.id),
      group.map((_, i) => 10 + i),
    );
    for (let i = 1; i < group.length; i += 1) {
      assert.equal(group[i].reverse, group[0].reverse, `seed ${seed}`);
      const gap = group[i].delay - group[i - 1].delay;
      // 同じ塊の2羽目（0.05〜0.25 秒）か、次の塊（0.3〜1.2 秒）
      assert.ok(gap >= 0.05 && gap <= 1.2, `seed ${seed}: ${gap}`);
      // 速さはそろえ、群れが途中でばらけないようにする
      assert.ok(Math.abs(group[i].duration / group[0].duration - 1) <= 0.05, `seed ${seed}`);
    }
    // 群れ全体が通り始めるまでは数秒以内
    assert.ok(group.at(-1).delay < 8, `seed ${seed}: ${group.at(-1).delay}`);
    if (group.length > 1) {
      const sizes = new Set(group.map((flight) => flight.size));
      assert.equal(sizes.size, group.length, `seed ${seed}`);
    }
  }
});

test("コウモリの2匹目は、1匹目から少し遅れて飛び始める", () => {
  for (let seed = 1; seed <= 30; seed += 1) {
    const group = planGroup("night", 1, seeded(seed));
    if (group.length === 2) assert.ok(group[1].delay >= 0.8 && group[1].delay <= 3.2, `seed ${seed}`);
  }
});

test("羽ばたいている間は滑空の間より速く進み、後戻りはしない", () => {
  const segments = planWingbeats("swallow", 9, seeded(3));
  const progress = progressCurve("swallow", segments, 9);
  const speed = (time) => (progress(time + 0.05) - progress(time - 0.05)) / 0.1;
  // 羽ばたきの終わりと、長い滑空の終わりの速さを比べる
  const beat = segments.find((s) => s.kind === "beat");
  const glide = segments.find((s) => s.kind === "glide" && s.start > beat.start);
  assert.ok(speed(beat.start + beat.duration - 0.06) > speed(glide.start + glide.duration - 0.06));
  let last = -1;
  for (let t = 0; t <= 9; t += 0.05) {
    const u = progress(t);
    assert.ok(u >= last, `t ${t}`);
    last = u;
  }
  assert.equal(progress(0), 0);
  assert.equal(progress(9), 1);
});

test("画面の外から外へ横切り、横に後戻りせず、水平線より上を飛ぶ", () => {
  for (const ambient of ["day", "night"]) {
    for (let seed = 1; seed <= 20; seed += 1) {
      const random = seeded(seed);
      for (const flight of planGroup(ambient, 1, random)) {
        const frames = buildFlightKeyframes(flight, planWingbeats(flight.flyer, flight.duration, random), BOX).map(parse);
        const xs = frames.map((frame) => frame.x);
        const [first, last] = [xs[0], xs.at(-1)];
        assert.ok(Math.min(first, last) < 0 && Math.max(first, last) > BOX.width, `${ambient} seed ${seed}`);
        const direction = flight.reverse ? -1 : 1;
        xs.slice(1).forEach((x, i) => assert.ok((x - xs[i]) * direction >= -0.1, `${ambient} seed ${seed}: x ${i}`));
        frames.forEach((frame) => assert.ok(frame.y < BOX.height * BOX.horizon, `${ambient} seed ${seed}: y ${frame.y}`));
      }
    }
  }
});

test("軌道は直線にならず、機首の傾きは数度に留まる", () => {
  for (let seed = 1; seed <= 20; seed += 1) {
    const random = seeded(seed);
    const [flight] = planGroup("morning", 1, random);
    const frames = buildFlightKeyframes(flight, planWingbeats(flight.flyer, flight.duration, random), BOX).map(parse);
    // 入口と出口を結ぶ直線から、途中で離れる
    const [a, b] = [frames[0], frames.at(-1)];
    const offLine = frames.map((f) => Math.abs(f.y - (a.y + ((b.y - a.y) * (f.x - a.x)) / (b.x - a.x))));
    assert.ok(Math.max(...offLine) > 4, `seed ${seed}: ${Math.max(...offLine)}`);
    frames.forEach((frame) => assert.ok(Math.abs(frame.bank) <= 10, `seed ${seed}`));
  }
});

test("遠いほど小さく淡くなるが、変化はごく小さい", () => {
  for (let seed = 1; seed <= 20; seed += 1) {
    const random = seeded(seed);
    for (const flight of planGroup("day", 1, random)) {
      const frames = buildFlightKeyframes(flight, planWingbeats(flight.flyer, flight.duration, random), BOX).map(parse);
      frames.forEach((frame) => {
        assert.ok(frame.scale >= 0.92 * 0.8 && frame.scale <= 1.06, `seed ${seed}: scale ${frame.scale}`);
        assert.ok(frame.opacity >= 0.58 && frame.opacity <= 0.9, `seed ${seed}: opacity ${frame.opacity}`);
      });
      // 大きさと濃さは同じ向きに変わる（遠いほど小さく、淡い）
      const [start, end] = [frames[0], frames.at(-1)];
      assert.equal(Math.sign(end.scale - start.scale), Math.sign(end.opacity - start.opacity), `seed ${seed}`);
    }
  }
});
