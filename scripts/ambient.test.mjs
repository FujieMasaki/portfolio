import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAmbientFromHour,
  msUntilNextAmbient,
  parseAmbientOverride,
  WIND_STRENGTH,
} from "../components/museum/ambient.ts";

test("各時間帯の始まりと終わりの時刻で、時間帯が切り替わる", () => {
  const expected = {
    0: "midnight",
    4: "midnight",
    5: "morning",
    10: "morning",
    11: "day",
    15: "day",
    16: "evening",
    19: "evening",
    20: "night",
    23: "night",
  };
  for (const [hour, ambient] of Object.entries(expected)) {
    assert.equal(getAmbientFromHour(Number(hour)), ambient, `${hour} 時`);
  }
});

test("次の時間帯が始まるまでの時間を、ローカル時刻で数える", () => {
  const minutes = (ms) => ms / 60000;
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 15, 15, 30))), 30);
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 15, 16, 0))), 4 * 60);
  // 夜（20〜23 時）の次は、日付をまたいだ 0 時の深夜
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 15, 22, 0))), 2 * 60);
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 15, 23, 59))), 1);
  // 深夜（0〜4 時）の次は、5 時の朝
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 16, 0, 0))), 5 * 60);
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 16, 4, 30))), 30);
});

test("23 時台の次の境界は翌日 0 時の深夜、4 時台の次の境界は 5 時の朝", () => {
  const nextBoundary = (date) => {
    const next = new Date(date.getTime() + msUntilNextAmbient(date));
    return { date: next.getDate(), hour: next.getHours(), minute: next.getMinutes(), ambient: getAmbientFromHour(next.getHours()) };
  };
  assert.deepEqual(nextBoundary(new Date(2026, 9, 15, 23, 20)), { date: 16, hour: 0, minute: 0, ambient: "midnight" });
  assert.deepEqual(nextBoundary(new Date(2026, 9, 16, 4, 10)), { date: 16, hour: 5, minute: 0, ambient: "morning" });
});

test("確認用の ambient の指定は、5つの時間帯だけを受け付ける", () => {
  assert.equal(parseAmbientOverride("?ambient=night"), "night");
  assert.equal(parseAmbientOverride("?ambient=midnight"), "midnight");
  assert.equal(parseAmbientOverride("?foo=1&ambient=morning"), "morning");
  for (const search of ["?ambient=", "?ambient=Night", "?ambient=noon", "?ambient=toString"]) {
    assert.equal(parseAmbientOverride(search), null, search);
  }
});

test("ambient の指定がないときは、知らない値と区別する", () => {
  assert.equal(parseAmbientOverride(""), undefined);
  assert.equal(parseAmbientOverride("?foo=1"), undefined);
});

test("風は昼がいちばん強く、朝・夕方は弱く、夜・深夜は凪に近い（どれも 0〜1）", () => {
  for (const value of Object.values(WIND_STRENGTH)) assert.ok(value >= 0 && value <= 1);
  assert.ok(WIND_STRENGTH.day > WIND_STRENGTH.morning && WIND_STRENGTH.day > WIND_STRENGTH.evening);
  assert.ok(WIND_STRENGTH.evening > WIND_STRENGTH.night && WIND_STRENGTH.night > WIND_STRENGTH.midnight);
});
