import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getAmbientFromHour,
  msUntilNextAmbient,
  parseAmbientOverride,
} from "../components/museum/ambient.ts";

test("各時間帯の始まりと終わりの時刻で、時間帯が切り替わる", () => {
  const expected = {
    0: "night",
    4: "night",
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
  // 夜は日付をまたいで、翌朝 5 時まで
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 15, 22, 0))), 7 * 60);
  assert.equal(minutes(msUntilNextAmbient(new Date(2026, 9, 16, 3, 45))), 75);
});

test("確認用の ambient の指定は、4つの時間帯だけを受け付ける", () => {
  assert.equal(parseAmbientOverride("?ambient=night"), "night");
  assert.equal(parseAmbientOverride("?foo=1&ambient=morning"), "morning");
  for (const search of ["?ambient=", "?ambient=Night", "?ambient=noon", "?ambient=toString"]) {
    assert.equal(parseAmbientOverride(search), null, search);
  }
});

test("ambient の指定がないときは、知らない値と区別する", () => {
  assert.equal(parseAmbientOverride(""), undefined);
  assert.equal(parseAmbientOverride("?foo=1"), undefined);
});
