import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 関数は const とアロー関数で書く（function 宣言・function 式を使わない）。
    // クラス・オブジェクトのメソッド記法（foo() {}）と getter / setter（get foo() {}）は、アロー関数で書けないので対象にしない。
    // .claude/skills/ は外部から取り込んだ skill で、出典の commit のまま保つため対象にしない
    ignores: [".claude/skills/**"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "FunctionDeclaration",
          message: "function 宣言ではなく、const とアロー関数で書く（default export は const で定義してから export default する）",
        },
        {
          selector:
            "FunctionExpression:not(MethodDefinition > FunctionExpression):not(Property[method=true] > FunctionExpression):not(Property[kind=/^(get|set)$/] > FunctionExpression)",
          message: "function 式ではなく、アロー関数で書く",
        },
        {
          // Next.js（16.2）は、fetch のキャッシュを期限切れで取り直すときに signal を外す。タイムアウトなどが再生成で効かなくなる。
          // 検出するのは、同じオブジェクトに next（または cache: "force-cache"）と signal を並べた書き方だけ
          selector:
            "ObjectExpression:has(> Property[key.name='signal']):matches(:has(> Property[key.name='next']), :has(> Property[key.name='cache'][value.value='force-cache']))",
          message:
            "fetch のキャッシュ（next・cache: \"force-cache\"）と signal を一緒に使わない。再生成の取り直しでは signal が外れる。cache: \"no-store\" で読み、関数ごと unstable_cache で覚える（components/work/Publishing.tsx の getFeed）",
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
