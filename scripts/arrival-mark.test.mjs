import assert from "node:assert/strict";
import { afterEach, beforeEach, mock, test } from "node:test";

/**
 * 着地の印（components/museum/arrivalMark.ts）が外れる時機。
 * DOM は使わず、印を付ける <html> の dataset と、document の animationstart / animationend だけを置き換える
 */

/** 要素の代わり。contains だけを持つ（arrivalMark の instanceof Node は、Node を Object に置き換えて通す） */
const fakeNode = (children = []) => {
  const node = { contains: (other) => other === node || children.some((child) => child.contains(other)) };
  return node;
};

const listeners = { animationstart: new Set(), animationend: new Set() };
globalThis.Node = Object;
globalThis.window = globalThis;
globalThis.document = {
  documentElement: { dataset: {} },
  addEventListener: (type, listener) => listeners[type].add(listener),
  removeEventListener: (type, listener) => listeners[type].delete(listener),
};

const { clearMark, setMark } = await import("../components/museum/arrivalMark.ts");

const dataset = document.documentElement.dataset;
const fire = (type, animationName, target = fakeNode()) =>
  [...listeners[type]].forEach((listener) => listener({ animationName, target }));

beforeEach(() => mock.timers.enable({ apis: ["setTimeout"] }));

afterEach(() => {
  clearMark("roomStep");
  clearMark("roomGround");
  mock.timers.reset();
});

test("遷移が遅くても、次の部屋の着地の動きが始まるまでは印を外さない", () => {
  setMark("roomGround", "wall", "room-step");
  mock.timers.tick(10000);
  assert.equal(dataset.roomGround, "wall");
});

test("着地の動きが始まってから終わらないときは、始まってから 4 秒で外す", () => {
  setMark("roomStep", "next", "room-step");
  mock.timers.tick(10000);
  fire("animationstart", "AboutMuseum-module__x__room-step-hold");
  mock.timers.tick(3999);
  assert.equal(dataset.roomStep, "next");
  mock.timers.tick(1);
  assert.equal(dataset.roomStep, undefined);
});

test("名前に animationName を含む着地の動きが終わったら外す（含まない動きでは外さない）", () => {
  setMark("roomStep", "previous", "room-step");
  fire("animationstart", "AboutMuseum-module__x__room-enter");
  fire("animationend", "AboutMuseum-module__x__room-enter");
  assert.equal(dataset.roomStep, "previous");
  fire("animationstart", "AboutMuseum-module__x__room-step-hold");
  fire("animationend", "AboutMuseum-module__x__room-step-hold");
  assert.equal(dataset.roomStep, undefined);
});

test("今の部屋（ignore）の中の動きの始まりと終わりは数えない", () => {
  const inside = fakeNode();
  const room = fakeNode([inside]);
  setMark("roomGround", "dark", "room-step", room);
  fire("animationstart", "room-step-hold", inside);
  mock.timers.tick(10000);
  fire("animationend", "room-step-hold", inside);
  assert.equal(dataset.roomGround, "dark");
});

test("着地の動きが一度も始まらないときは、印を付けてから 20 秒で外す", () => {
  setMark("roomGround", "dark", "room-step");
  mock.timers.tick(19999);
  assert.equal(dataset.roomGround, "dark");
  mock.timers.tick(1);
  assert.equal(dataset.roomGround, undefined);
});

test("付け直したら、前の印の時間では外さない", () => {
  setMark("roomGround", "wall", "room-step");
  mock.timers.tick(15000);
  setMark("roomGround", "dark", "room-step");
  mock.timers.tick(10000);
  assert.equal(dataset.roomGround, "dark");
});
