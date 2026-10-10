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
 * 舞台内の画像がそろってから data-ready を付けて一度にフェードインさせる。
 */
export default function ParallaxStage({ className, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    let cancelled = false;
    const reveal = () => {
      if (!cancelled) setReady(true);
    };
    const images = Array.from(node.querySelectorAll("img"));
    Promise.all(images.map((img) => img.decode().catch(() => undefined))).then(
      reveal,
    );
    // 画像が極端に遅い回線でも、いつまでも真っ暗にはしない
    const fallback = window.setTimeout(reveal, 6000);
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
    <div ref={ref} className={className} data-ready={ready || undefined}>
      {children}
    </div>
  );
}
