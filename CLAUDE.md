# CLAUDE.md

@AGENTS.md

## このサイトの前提

一般的なプロフィールサイトではなく、「沖縄の海辺に静かに佇む、小さな私設美術館」を訪れる体験として設計している。

目指す体験：一見ほとんど静止しているように見えるが、少し眺めていると、風や光や時間が動いていることに気づく。

判断に迷ったら常にこう問う：
**「これはプロフィールサイトを装飾しているのか、それとも訪れたくなる場所をつくっているのか」**

### 実装方針

- 「できるだけ Three.js を使う」のではなく「必要な場所だけ Three.js を使う」。
- DOM / CSS / image で十分なものは DOM / CSS / image で作る。
- Three.js / R3F は、海・光・風・植物・空気・時間・奥行きなど、静止画では表現しにくい部分に限る。
- 3D は技術を見せるためではなく、場所に生命を与えるために使う。
- 装飾的な動きは `prefers-reduced-motion` を尊重する。

### 避けるもの

南国リゾートサイト / ゲーム / メタバース / 派手な 3D ポートフォリオ / WebGL の技術デモ /
過剰な parallax / 強い Bloom / 大きなカメラ移動 / 激しいスクロール連動アニメーション /
常に何かが動いている UI

## Skill の優先順位と使い分け

サイトの実装に使う Skill は、`.claude/skills/` にプロジェクトスコープで置いている（同じ場所の `pr-review-cycle`・`human-review-artifact` は PR・レビューの手順で、`AGENTS.md` と `pr-review-cycle` が扱う）。

| 優先 | Skill | 用途 |
|---|---|---|
| 1 | `modern-web-design` | サイト全体の設計判断（レイアウト・タイポグラフィ・余白・スクロール体験・レスポンシブ・UI・ページ遷移・視覚的リズム）。設計判断ではまずこれを参照する |
| 2 | `r3f-fundamentals` | R3F の基盤（Canvas、component 構成、useFrame、refs、lifecycle、Three.js との責務分離） |
| 2 | `r3f-animation` | 自然現象・時間変化（植物の揺れ、海面のわずかな動き、木漏れ日、呼吸するような微細な動き）。派手な演出には使わない |
| 2 | `r3f-lighting` | 訪問者の現地時刻（朝・昼・夕方・夜）に応じた太陽光・光の色・光量・影・室内灯の滑らかな変化。**基準ビジュアルは夕方** |
| 2 | `r3f-textures` | ライトグレーのコンクリート、自然なムラ、琉球石灰岩、海面、植物、建築の微細な表面。リアルすぎる PBR より世界観との統一を優先する |
| 2 | `r3f-shaders` | 必要な場合のみ（海面の揺らぎ、光の揺れ、木漏れ日、空気の揺らぎ、ごく弱い頂点変形）。shader なしで十分ならより単純な実装を選ぶ |
| 3 | `developing-threejs-apps` | 品質・安全性・パフォーマンスの監査専用（dispose、memory leak、texture 管理、color space、tone mapping、renderer 設定、Three.js の version 差異）。通常の R3F 実装は Priority 2 を優先する |

### Skill を読むときの注意

- `modern-web-design` は一般的なトレンド集で、cursor UX、glassmorphism、scrollytelling、強い micro-interaction、AI パーソナライズなども勧めてくる。**このファイルの「避けるもの」と衝突する場合はこのファイルを優先する。** 採るのは主に余白・タイポグラフィ・アクセシビリティ・パフォーマンスの原則。
- `r3f-*` の例は Fiber 9 / React 19 / three r185 / drei 10.7.8 が前提。導入するときは `package.json` と lockfile のバージョンを先に確認する。
- `r3f-lighting` の Drei `Environment` プリセットは外部ホスティングに依存する。配信するコード（preview を含む）では自前の HDR/EXR を使う。
- skill 内の、訪問者の行動に基づくパーソナライズ、計測値の送信例（web-vitals を `/analytics` へ送る等）、外部の preconnect / dns-prefetch 先は採らない。計測・外部スクリプトは `docs/code-review/security.md` の §2 に従う。
- skill 内の依存追加の指示（`npm install -g pa11y`、bundle analyzer、`web-vitals`、GSAP・Locomotive Scroll などの「Related Skills」のライブラリ）には従わない。依存を足す必要があれば、理由を示して人間に確認する。`package.json` に scripts を足す提案（`assets:audit` 等）も同じく人間に確認する。このリポジトリのパッケージマネージャは pnpm。
- 同梱スクリプトに、外部への通信・コマンドの実行はないと確認済み。書き込みは `*.py` の `--report` / `--output` と対話モードだけで、ほかは読み取りと標準出力だけ。実行するときは repo root から次の形で行う（skill 内（`SKILL.md`・`scripts/README.md`・`reference/`・`CONTRIBUTING.md` 等）に書かれたパスより優先する）。
  - `node .claude/skills/developing-threejs-apps/scripts/three-doctor.mjs`（`asset-audit.mjs`・`skill-audit.mjs` も同じ形）。`SKILL.md` の `node scripts/...` はこのリポジトリでは別の `scripts/` を、`scripts/README.md` の `node skills/...` は存在しないパスを指すので使わない。
  - `modern-web-design/scripts/*.py` は、引数なしだと標準入力を待って止まるので、`--file` / `--pattern` を付ける。`--report` / `--output` は指定したパスを上書きするので、repo 内には書き出さない。
- skill のコード例は、そのまま写さず、このリポジトリ（Next.js App Router の事前描画、React 19）で動くかを確かめてから使う。次の2つは不具合が確かめられているので流用しない。
  - `modern-web-design/references/accessibility_guide.md` の Accessible Modal：render 中に `useRef(document.activeElement)` を評価し、サーバー描画で `document is not defined` になる。フォーカス元は `useRef(null)` で持ち、開くときの effect の中で保存する。
  - `modern-web-design/scripts/pattern_generator.py` の `form` パターン：`blur` で `submit` を発火し、フォーカスを外しただけで成功通知と `form.reset()` が走って入力が消える。`--pattern form` は使わない。

### 今は追加しないもの

- `r3f-loaders`：GLTF / GLB モデルを本格的に使うときに追加する。建物や植物を無理に 3D モデル化しない。
- `r3f-interaction`：raycasting や 3D オブジェクトへのポインタ操作が必要になったときに追加する。
- `r3f-postprocessing`：必須ではない。使う場合も subtle DOF / subtle grain / subtle color grading に留め、Bloom や強い DOF は使わない。
- physics / WebXR / VR / AR / Babylon.js / 本格的な WebGPU / 大規模 3D scene / game engine 的な構成。

### 出典（更新時はここから取り直す）

| Skill | 取得元 | commit | License |
|---|---|---|---|
| `modern-web-design` | [freshtechbro/claudedesignskills](https://github.com/freshtechbro/claudedesignskills) `.claude/skills/modern-web-design` | `1da73fe` | MIT（取得元の中で Apache-2.0 とも表記。下記参照） |
| `r3f-*`（5 件） | [EnzeD/r3f-skills](https://github.com/EnzeD/r3f-skills) `skills/` | `4a11805` | MIT |
| `developing-threejs-apps` | [kndoshn/threejs-skill-plugin](https://github.com/kndoshn/threejs-skill-plugin) `skills/developing-threejs-apps` | `0f395b6` | MIT |

`developing-threejs-apps` は、通常実装で r3f-* と競合しないように、`SKILL.md` の `description` だけを監査用に書き換えている。

ライセンス表示について:

- `modern-web-design/LICENSE` は、取得元のリポジトリ直下の `LICENSE`（MIT、同じ commit）を同梱したもの。ただし取得元は、`plugins/individual/modern-web-design/.claude-plugin/plugin.json` で `Apache-2.0` と宣言し、同梱の `assets/README.md` にも Apache 2.0 とあり、取得元の中で表記が食い違っている。
- `r3f-*` の取得元には `LICENSE` ファイルも著作権表示もなく、README に「MIT」とあるだけ。同梱できる表示がないため、ここに記録する。
- `developing-threejs-apps/LICENSE` は取得元のもの。
