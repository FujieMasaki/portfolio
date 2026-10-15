"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  className: string;
  children: ReactNode;
};

/**
 * ポインタ位置を -1〜1 の CSS 変数（--px / --py）として流すだけのラッパー。
 * 動かす量は各レイヤーの CSS 側で決める（背景はごく弱く）。
 * タッチ端末と prefers-reduced-motion では何もしない（閲覧の途中で設定が変わっても追従する）。
 *
 * 背景・植物の大きな PNG が建物より遅れて出ると空間が崩れて見えるので、
 * 空・植物・建物の画像がそろってから data-ready を付けて一度にフェードインさせる。
 * JS が動かない環境では TopHero の <noscript> が舞台をそのまま表示する。
 */
/** JS 側の保険。TopHero.module.css の .stage:not([data-ready]) の保険（6 秒）より先に表示する */
const JS_FALLBACK_MS = 5000;

const ParallaxStage = ({ className, children }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  /** "true" は通常どおりフェードイン、"late" は CSS の保険ですでに表示されているのでそのまま見せる */
  const [ready, setReady] = useState<"true" | "late" | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    let revealed = false;
    // 画像がそろったときと保険のタイマーの、先に来た方で1回だけ表示する
    // （2回目で "late" に付け替わると、進行中のフェードインが打ち切られるため）
    const reveal = () => {
      if (cancelled || revealed) return;
      revealed = true;
      window.clearTimeout(fallback);
      // CSS の保険ですでに舞台が見え始めていれば、フェードインをやり直すと一度暗転するので、
      // "late" としてそのまま表示する。ページ内の移動で戻ってきたときは新しく透明から始まるので "true"
      const alreadyShown = Number.parseFloat(getComputedStyle(node).opacity) > 0.01;
      setReady(alreadyShown ? "late" : "true");
    };
    // 待つのは空間の骨格になる画像（空・植物・建物。fetchPriority="high" を付けたもの）だけ。
    // アーチ内の展示室は奥にあって遅れて出ても目立たないので待たず、表示を早める
    const images = Array.from(
      node.querySelectorAll<HTMLImageElement>('img[fetchpriority="high"]'),
    );
    // CSS の mask-image などで使う画像（<img> ではないもの）は、data-await-images に空白区切りで書いた URL を読んで待つ
    // （建物の陰と光のマスク。待たないと、舞台が出た後に陰と光が遅れて乗る）
    const cssImages = Array.from(
      node.querySelectorAll<HTMLElement>("[data-await-images]"),
    ).flatMap((element) => (element.dataset.awaitImages ?? "").split(" ").filter(Boolean));
    const decodeUrl = (src: string) => {
      const img = new Image();
      img.src = src;
      return img.decode();
    };
    Promise.all([
      ...images.map((img) => img.decode().catch(() => undefined)),
      ...cssImages.map((src) => decodeUrl(src).catch(() => undefined)),
    ]).then(reveal);
    // 画像が極端に遅い回線でも、いつまでも真っ暗にはしない。
    // CSS 側の保険（6 秒）より先に表示し、保険で出た後に暗転し直すちらつきを避ける
    const fallback = window.setTimeout(reveal, JS_FALLBACK_MS);
    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let listening = false;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        node.style.setProperty("--px", x.toFixed(3));
        node.style.setProperty("--py", y.toFixed(3));
      });
    };

    // 閲覧の途中で「動きを減らす」やポインタの種類が変わっても、そのたびに付け外しする。
    // 外すときは、ずらした背景を元の位置に戻す
    const sync = () => {
      const shouldListen = finePointer.matches && !reducedMotion.matches;
      if (shouldListen && !listening) {
        window.addEventListener("pointermove", onMove, { passive: true });
        listening = true;
      } else if (!shouldListen && listening) {
        window.removeEventListener("pointermove", onMove);
        cancelAnimationFrame(frame);
        node.style.setProperty("--px", "0");
        node.style.setProperty("--py", "0");
        listening = false;
      }
    };

    sync();
    finePointer.addEventListener("change", sync);
    reducedMotion.addEventListener("change", sync);
    return () => {
      finePointer.removeEventListener("change", sync);
      reducedMotion.removeEventListener("change", sync);
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className={className} data-ready={ready ?? undefined}>
      {children}
    </div>
  );
};

export default ParallaxStage;
