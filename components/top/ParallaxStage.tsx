"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  className: string;
  children: ReactNode;
};

/**
 * ポインタ位置を -1〜1 の CSS 変数（--px / --py）として流すだけのラッパー。
 * 動かす量は各レイヤーの CSS 側で決める（背景はごく弱く）。
 * タッチ端末と prefers-reduced-motion では何もしない。
 *
 * 背景・植物の大きな PNG が建物より遅れて出ると空間が崩れて見えるので、
 * 先に読み込む画像がそろってから data-ready を付けて一度にフェードインさせる。
 * JS が動かない環境では TopHero の <noscript> が舞台をそのまま表示する。
 */
/** JS 側の保険。TopHero.module.css の .stage:not([data-ready]) の保険（6 秒）より先に表示する */
const JS_FALLBACK_MS = 5000;

export default function ParallaxStage({ className, children }: Props) {
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
    // 待つのは先に読み込む画像（背景・植物・建物・アーチ内の展示室）。loading="lazy" の画像は待たない
    const images = Array.from(
      node.querySelectorAll<HTMLImageElement>('img:not([loading="lazy"])'),
    );
    Promise.all(images.map((img) => img.decode().catch(() => undefined))).then(
      reveal,
    );
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
    if (!finePointer.matches || reducedMotion.matches) return;

    let frame = 0;
    const onMove = (event: PointerEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const x = (event.clientX / window.innerWidth) * 2 - 1;
        const y = (event.clientY / window.innerHeight) * 2 - 1;
        node.style.setProperty("--px", x.toFixed(3));
        node.style.setProperty("--py", y.toFixed(3));
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={ref} className={className} data-ready={ready ?? undefined}>
      {children}
    </div>
  );
}
