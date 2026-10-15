import assert from "node:assert/strict";
import { test } from "node:test";
import { buildWingKeyframes, planWingbeats } from "../components/top/wingbeat.ts";

/** 再現できる乱数（線形合同法） */
const seeded = (seed) => {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

test("燕は 1〜3 回羽ばたいたら、1.5〜3 秒滑空し、飛ぶ時間の大半は滑空している", () => {
  for (let seed = 1; seed <= 20; seed += 1) {
    const segments = planWingbeats("swallow", 6.5, seeded(seed));
    // 最初の滑空は羽ばたき始めの時機をずらすためのものなので、2つ目から見る
    let beats = 0;
    for (const segment of segments.slice(1)) {
      if (segment.kind === "beat") {
        beats += 1;
        continue;
      }
      assert.ok(beats >= 1 && beats <= 3, `seed ${seed}: 羽ばたき ${beats} 回`);
      assert.ok(segment.duration >= 1.5 && segment.duration <= 3, `seed ${seed}: 滑空 ${segment.duration}`);
      beats = 0;
    }
    const beating = segments.filter((s) => s.kind === "beat").reduce((sum, s) => sum + s.duration, 0);
    const flown = segments.at(-1).start + segments.at(-1).duration;
    assert.ok(beating / flown < 0.5, `seed ${seed}: 羽ばたいている割合 ${beating / flown}`);
  }
});

test("燕の1拍の長さは毎回そろわない", () => {
  const beats = planWingbeats("swallow", 6.5, seeded(5)).filter((s) => s.kind === "beat");
  const durations = beats.map((s) => s.duration);
  assert.ok(Math.max(...durations) - Math.min(...durations) > 0.02);
});

test("コウモリは 1拍 0.45〜0.65 秒で数回羽ばたき、ごく短い間を置く。周期は一定にならない", () => {
  const segments = planWingbeats("bat", 7.5, seeded(7));
  const beats = segments.filter((s) => s.kind === "beat");
  const pauses = segments.filter((s) => s.kind === "glide");
  for (const beat of beats) assert.ok(beat.duration >= 0.45 && beat.duration <= 0.65, `${beat.duration}`);
  for (const pause of pauses) assert.ok(pause.duration >= 0.15 && pause.duration <= 0.35, `${pause.duration}`);
  const durations = beats.map((s) => s.duration);
  assert.ok(Math.max(...durations) - Math.min(...durations) > 0.05, "拍の長さがそろっている");
  assert.ok(new Set(beats.map((s) => s.amplitude.toFixed(3))).size > 1, "振れ幅がそろっている");
});

test("翼は回転だけで動かし、伸縮・反転をしない", () => {
  for (const flyer of ["swallow", "bat"]) {
    const { near, far } = buildWingKeyframes(flyer, 5, seeded(3));
    for (const frame of [near.inner, near.outer ?? [], far.inner, far.outer ?? []].flat()) {
      assert.match(frame.transform, /^rotate\(-?\d+(\.\d+)?deg\)$/);
    }
    assert.equal(near.inner[0].offset, 0);
    assert.equal(near.inner.at(-1).offset, 1);
  }
});

test("奥の翼は手前の翼とぴったりそろわない", () => {
  const { near, far } = buildWingKeyframes("swallow", 6.5, seeded(9));
  const differs = near.inner.some((frame, i) => frame.transform !== far.inner[i].transform);
  assert.ok(differs);
});

test("コウモリの手首から先は、腕に遅れて折れ曲がる（燕は手首を持たない）", () => {
  const { near } = buildWingKeyframes("bat", 5, seeded(11));
  const angles = near.outer.map((frame) => Number.parseFloat(frame.transform.slice(7)));
  assert.ok(Math.max(...angles) - Math.min(...angles) > 10, "手首から先がほとんど動いていない");
  assert.equal(buildWingKeyframes("swallow", 5, seeded(11)).near.outer, null);
});
