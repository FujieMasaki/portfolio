"use client";

import { useEffect } from "react";

/**
 * 展示（[data-reveal] を付けたもの）を、最初に視界へ入ったときに一度だけ静かに現す。
 * 描画はせず、ページの中の [data-reveal] を見張るだけ。
 *
 * 読み込んだ時点で画面より下にある展示にだけ data-reveal="pending" を付けて隠し、
 * 画面に入ったら "shown" にして、見張りをやめる（スクロールを戻しても、また薄くはならない）。
 * 見え方は AboutMuseum.module.css の [data-reveal] が決める。
 * JS が動かない環境・prefers-reduced-motion・IntersectionObserver が無い環境では何もせず、最初から全部見える。
 */
const RevealOnce = () => {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onEntries = (entries: IntersectionObserverEntry[]) => {
      for (const entry of entries) {
        if (entry.isIntersecting) show(entry.target);
      }
    };
    // 画面の下端から、画面の高さの 12% だけ入ったところで現す（下端に触れた瞬間では、ほとんど見えないうちに終わる）。
    // rootMargin の % は画面の幅を基準にする場合があり、横長の大きな画面では帯が広がりすぎて、
    // ページ末尾の順路の案内が届かなくなるので、高さから px で決める
    const entering = new IntersectionObserver(onEntries, {
      rootMargin: `0px 0px -${Math.round(window.innerHeight * 0.12)}px 0px`,
    });
    // ページの末尾にある短い展示は、その帯まで上がってこないことがあるので、すべて画面に入ったときにも現す
    const whole = new IntersectionObserver(onEntries, { threshold: 0.99 });

    const show = (target: Element) => {
      (target as HTMLElement).dataset.reveal = "shown";
      entering.unobserve(target);
      whole.unobserve(target);
    };

    // Tab でフォーカスが隠れた展示の中へ入ったら、画面に入りきる前でもすぐ現す（見えない場所にフォーカスを置かない）
    const onFocusIn = (event: FocusEvent) => {
      const target = (event.target as Element | null)?.closest?.('[data-reveal="pending"]');
      if (target) show(target);
    };
    document.addEventListener("focusin", onFocusIn);

    const targets = document.querySelectorAll<HTMLElement>("main [data-reveal]");
    for (const target of targets) {
      // 少しでも画面に入っている展示は、隠さずそのまま見せる（見えている部分を一度薄くしない）
      if (target.getBoundingClientRect().top < window.innerHeight) continue;
      target.dataset.reveal = "pending";
      entering.observe(target);
      whole.observe(target);
    }

    return () => {
      entering.disconnect();
      whole.disconnect();
      document.removeEventListener("focusin", onFocusIn);
      for (const target of targets) {
        if (target.dataset.reveal === "pending") target.dataset.reveal = "";
      }
    };
  }, []);

  return null;
};

export default RevealOnce;
