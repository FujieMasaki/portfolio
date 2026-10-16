import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // 関数は const とアロー関数で書く（function 宣言・function 式・class・オブジェクトのメソッド記法・getter / setter を使わない）。
    // class は React の error boundary（継承していて、getDerivedStateFromError か componentDidCatch を持つもの）だけ許す。
    // そのメソッドは、メソッドの書き方でもアロー関数のフィールドでもよい。
    // （esquery の :has は「直下の子」に限れず、中に入れ子の class を持つ場合も通るが、継承していない class は捕まえる）
    // error boundary は class でしか作れず（受け止める hook がない）、その中のメソッドも class の書き方のままにする。
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
          selector:
            ":matches(ClassDeclaration, ClassExpression):not([superClass]:has(ClassBody > :matches(MethodDefinition, PropertyDefinition)[key.name=/^(getDerivedStateFromError|componentDidCatch)$/]))",
          message:
            "class ではなく、const とアロー関数で書く（class にしてよいのは、getDerivedStateFromError か componentDidCatch を持つ React の error boundary だけ）",
        },
        {
          selector: "Property[method=true]",
          message: "オブジェクトのメソッド記法（foo() {}）ではなく、アロー関数のプロパティ（foo: () => {}）で書く",
        },
        {
          selector: "Property[kind=/^(get|set)$/]",
          message: "getter / setter ではなく、値かアロー関数のプロパティで書く",
        },
        {
          // Next.js（16.2）は、fetch のキャッシュを期限切れで取り直すときに signal を外す。タイムアウトなどが再生成で効かなくなる。
          // 検出するのは、同じオブジェクトに next（または cache: "force-cache"）と signal を並べた書き方だけ。
          // ページの revalidate・fetchCache による暗黙のキャッシュは対象外（docs/code-review/README.md の履歴）
          selector:
            "ObjectExpression:has(> Property[key.name='signal']):matches(:has(> Property[key.name='next']), :has(> Property[key.name='cache'][value.value='force-cache']))",
          message:
            "fetch のキャッシュ（next・cache: \"force-cache\"）と signal を一緒に使わない。再生成の取り直しでは signal が外れる。cache: \"no-store\" で読み、関数ごと unstable_cache で覚える（components/work/Writing.tsx の getFeed）",
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
