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

test("燕は 2〜3 回羽ばたいたら、1.5〜3 秒滑空する", () => {
  for (let seed = 1; seed <= 20; seed += 1) {
    const segments = planWingbeats("swallow", 6.5, seeded(seed));
    // 最初の滑空は羽ばたき始めの時機をずらすためのものなので、2つ目から見る
    let beats = 0;
    for (const segment of segments.slice(1)) {
      if (segment.kind === "beat") {
        beats += 1;
        continue;
      }
      assert.ok(beats === 2 || beats === 3, `seed ${seed}: 羽ばたき ${beats} 回`);
      assert.ok(segment.duration >= 1.5 && segment.duration <= 3, `seed ${seed}: 滑空 ${segment.duration}`);
      beats = 0;
    }
  }
});

test("コウモリの羽ばたきは、燕より短く、一定の周期にならない", () => {
  const beats = planWingbeats("bat", 7.5, seeded(7)).filter((segment) => segment.kind === "beat");
  const durations = beats.map((segment) => segment.duration);
  assert.ok(Math.max(...durations) <= 0.34);
  assert.ok(Math.max(...durations) - Math.min(...durations) > 0.05, "拍の長さがそろっている");
  assert.ok(new Set(beats.map((segment) => segment.amplitude.toFixed(3))).size > 1, "振れ幅がそろっている");
});

test("翼は回転だけで動かし、伸縮・反転をしない", () => {
  for (const flyer of ["swallow", "bat"]) {
    const { inner, outer } = buildWingKeyframes(flyer, 5, seeded(3));
    for (const frame of [...inner, ...(outer ?? [])]) {
      assert.match(frame.transform, /^rotate\(-?\d+(\.\d+)?deg\)$/);
    }
    assert.equal(inner[0].offset, 0);
    assert.equal(inner.at(-1).offset, 1);
  }
});

test("コウモリの手首から先は、腕に遅れて折れ曲がる（燕は手首を持たない）", () => {
  const { inner, outer } = buildWingKeyframes("bat", 5, seeded(11));
  const angles = outer.map((frame) => Number.parseFloat(frame.transform.slice(7)));
  assert.ok(Math.max(...angles) - Math.min(...angles) > 10, "手首から先がほとんど動いていない");
  assert.equal(inner.length, outer.length);
  assert.equal(buildWingKeyframes("swallow", 5, seeded(11)).outer, null);
});
