import assert from "node:assert/strict";
import { test } from "node:test";
import { ESLint } from "eslint";

/**
 * eslint.config.mjs の「関数は const とアロー関数で書く」ルールが、狙った書き方だけを捕まえるかを確かめる。
 * ルールは no-restricted-syntax なので、エラーの message の書き出しで、どの決まりに当たったかを見分ける。
 */
const eslint = new ESLint();

const restricted = async (code) => {
  const [result] = await eslint.lintText(code, { filePath: "components/lint-rules-probe.tsx" });
  return result.messages.filter((message) => message.ruleId === "no-restricted-syntax").map((message) => message.message);
};

const startsWithEach = (messages, prefixes) =>
  assert.deepEqual(
    messages.map((message) => prefixes.find((prefix) => message.startsWith(prefix)) ?? message),
    prefixes,
  );

test("const とアロー関数・アロー関数のプロパティは通す", async () => {
  assert.deepEqual(
    await restricted(`
      const add = (a: number, b: number) => a + b;
      const handlers = { onClick: () => add(1, 2), value: 1 };
      export default handlers;
    `),
    [],
  );
});

test("function 宣言・function 式を捕まえる", async () => {
  startsWithEach(await restricted("export function a() { return 1; }\nexport const b = function () { return 2; };"), [
    "function 宣言ではなく",
    "function 式ではなく",
  ]);
});

test("class を捕まえる（宣言も式も）", async () => {
  startsWithEach(await restricted("export class A {}\nexport const B = class {};"), ["class ではなく", "class ではなく"]);
});

test("React の error boundary の class は通す（中のメソッドも）", async () => {
  assert.deepEqual(
    await restricted(`
      import { Component, type ReactNode } from "react";
      export class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
        state = { failed: false };
        static getDerivedStateFromError() {
          return { failed: true };
        }
        render() {
          return this.state.failed ? null : this.props.children;
        }
      }
      export class Logger extends Component<{ children: ReactNode }> {
        componentDidCatch() {}
        render() {
          return this.props.children;
        }
      }
    `),
    [],
  );
});

test("オブジェクトのメソッド記法と getter / setter を捕まえる", async () => {
  startsWithEach(
    await restricted("export const o = { run() { return 1; }, get size() { return 2; }, set size(v: number) {} };"),
    ["オブジェクトのメソッド記法", "getter / setter", "getter / setter"],
  );
});
