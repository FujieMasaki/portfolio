import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 関数は const とアロー関数で書く（function 宣言・function 式を使わない）。
    // クラス・オブジェクトのメソッド記法（foo() {}）は対象にしない。
    // .claude/skills/ は外部から取り込んだ skill で、出典の commit のまま保つため対象にしない
    ignores: [".claude/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message: "function 宣言ではなく、const とアロー関数で書く（default export は const で定義してから export default する）",
        },
        {
          selector: "FunctionExpression:not(MethodDefinition > FunctionExpression):not(Property[method=true] > FunctionExpression)",
          message: "function 式ではなく、アロー関数で書く",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
