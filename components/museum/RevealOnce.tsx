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

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          (entry.target as HTMLElement).dataset.reveal = "shown";
          observer.unobserve(entry.target);
        }
      },
      // 画面の下端から少し入ったところで現す（下端に触れた瞬間では、ほとんど見えないうちに終わる）
      { rootMargin: "0px 0px -12% 0px" },
    );

    const targets = document.querySelectorAll<HTMLElement>("main [data-reveal]");
    for (const target of targets) {
      // 少しでも画面に入っている展示は、隠さずそのまま見せる（見えている部分を一度薄くしない）
      if (target.getBoundingClientRect().top < window.innerHeight) continue;
      target.dataset.reveal = "pending";
      observer.observe(target);
    }

    return () => {
      observer.disconnect();
      for (const target of targets) {
        if (target.dataset.reveal === "pending") target.dataset.reveal = "";
      }
    };
  }, []);

  return null;
};

export default RevealOnce;
