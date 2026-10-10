# 最終チェック（Codex）

`pr-review-cycle`の最後の段階で、Codexが行うレビューの役割と手順を定める。前段では
Claude Codeのセルフレビューとサブエージェント（[`code-reviewer`](../../.claude/agents/code-reviewer.md)）が
論点を広く拾っている。この段階は、**少数の指摘を実際に確かめて当てる**ことに集中する。

レビュー観点の正本は[`README.md`](./README.md)と[`security.md`](./security.md)であり、この文書には複製しない。

## 1. 前提

- 他の段階のレビュー結果は受け取らない。差分と仕様から独立して判断する。
- 読み取り専用のsandboxで実行される。`$CODEX_HOME/config.toml`（MCPサーバ・pluginの設定を含む）と
  execpolicyのrulesは読み込まず、web検索・browser等の機能は無効にしている（`scripts/codex-final-check.mjs`が
  引数で固定している）。`AGENTS.md`等の指示ファイルは読み込まれる。
  ファイルの変更、コミット、外部への投稿はしない。
- 秘密情報（`.env*`等）を読まない・出力しない。秘密情報が混入していないかは、差分（`git diff`）の内容で判断する。

## 2. 手順

1. 指示されたbase（例: `origin/main`）に対し、`git diff <base>...HEAD`でレビュー対象の差分を取得する。
   冒頭で、確認した差分の範囲（baseの先端・merge-base・HEADのコミット）を報告する。
2. [`security.md`](./security.md)と[`README.md`](./README.md)（報告形式の出典）を必ず読む。UI・体験の変更では
   `CLAUDE.md`の「このサイトの前提」「避けるもの」も読む。
3. 差分と、判断に必要な関連実装・設定を読む。
4. 次の観点を優先して確認する。
   - security（秘密情報、`NEXT_PUBLIC_`の公開範囲、計測で送る情報、外部リンク・外部スクリプト）
   - 正しさ: React・Next.js・Three.jsの実際の挙動（server / client componentの境界、effectの実行回数、
     描画ループ、GPU資源の破棄）と、意図・実装の食い違い
   - `prefers-reduced-motion`・WebGLが使えない環境・スマホ幅で、表示が壊れる・固まる経路
5. 指摘は、可能な限り**再現して確かめる**。ファイルを書き込まないコマンド（`node -e`、既存の実装の
   読み取り等）で再現する。再現できない場合は、具体的な条件と壊れる経路を示す。
   どちらもできない場合は「要確認」とする。

命名・書き方の好み・一般論の改善提案は挙げない。

## 3. 報告

各指摘は、[`README.md`](./README.md)の「レビュー出力」の形式（重大度・場所・根拠・影響・修正案・区分・確信度）に、
次の1行を加えて書く。

```text
確かめ方: 再現した（実行したコマンドと結果） / 経路を追った（条件と壊れる経路） / 未確認
```

Critical・High・Mediumの指摘がなければ`LGTM`と明記する。securityの問題や疑いがある間は`LGTM`にしない。
