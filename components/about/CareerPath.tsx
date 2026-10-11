"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CAREER } from "./content";
import shared from "./AboutMuseum.module.css";
import styles from "./CareerPath.module.css";

/**
 * 02 Path。これまで通ってきた場所を、壁に横へ掛け並べた写真としてたどる。
 *
 * 横の移動はブラウザのスクロールそのまま（トラックパッド・横スワイプ・Shift + ホイール・矢印キー）で、
 * 縦のホイールを横へ置き換える scroll jack はしない。
 * 続きがあることは、右端にのぞく次の額と、下の細い線（いまどこを見ているか）で示す。
 * ← → は横に動かす手段のないマウスでも次の展示へ進めるためのもの。
 * 幅の狭い画面では縦に並べ、線とボタンは出さない（CSS）。
 */
export default function CareerPath() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = track.scrollWidth - track.clientWidth;
        const progress = max > 0 ? track.scrollLeft / max : 0;
        // 線の上の濃い部分＝いま見えている範囲
        section.style.setProperty("--progress", progress.toFixed(4));
        section.style.setProperty(
          "--visible",
          (track.clientWidth / track.scrollWidth).toFixed(4),
        );
        setEdge({ start: track.scrollLeft <= 2, end: track.scrollLeft >= max - 2 });
      });
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(track);
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  /** 隣の展示の左端が、壁の左の余白にそろう位置まで動かす */
  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const start =
      track.getBoundingClientRect().left +
      Number.parseFloat(getComputedStyle(track).paddingLeft);
    const items = Array.from(track.querySelectorAll<HTMLElement>("[data-exhibit]"));
    const offsets = items.map((item) => item.getBoundingClientRect().left - start);
    const target =
      direction === 1
        ? offsets.find((offset) => offset > 4)
        : offsets.filter((offset) => offset < -4).at(-1);
    if (target === undefined) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: target, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <section
      ref={sectionRef}
      className={styles.path}
      aria-labelledby="path-title"
    >
      <header className={styles.header} data-reveal>
        <h2 className={shared.heading} id="path-title">
          <span className={shared.eyebrow}>Career</span>
          <span className={`${shared.roomTitle} ${styles.title}`}>Path</span>
        </h2>
        <p className={`${shared.lead} ${styles.lead}`}>
          これまでの時間の中で、
          <br />
          出会った場所、人、仕事。
        </p>
      </header>

      <div
        ref={trackRef}
        className={styles.track}
        // 展示は横に流れる中にあるので、1点ずつではなく列全体を一度に現す
        data-reveal
        // 横にスクロールできる範囲なので、キーボードでもフォーカスして矢印キーで動かせるようにする
        tabIndex={0}
        role="region"
        aria-label="これまでの場所"
      >
        <ol className={styles.rail}>
          {CAREER.map((exhibit) => (
            <li
              key={exhibit.number}
              className={styles.exhibit}
              data-exhibit
              data-text-only={exhibit.photo ? undefined : ""}
            >
              <div className={styles.label}>
                <p className={styles.number}>{exhibit.number}</p>
                <h3 className={styles.place}>{exhibit.title}</h3>
                <p className={styles.note}>
                  {exhibit.lines.map((line, index) => (
                    <span key={line}>
                      {index > 0 && <br />}
                      {line}
                    </span>
                  ))}
                </p>
                {exhibit.period && <p className={styles.period}>{exhibit.period}</p>}
              </div>

              {exhibit.photo && (
                <div
                  className={`${shared.frame} ${styles.frame}`}
                  // 縦長の写真は 3:4、横長は 5:4 の額に収める（大きさをそろえすぎず、均等な並びにしない）
                  data-orientation={
                    exhibit.photo.width < exhibit.photo.height ? "portrait" : "landscape"
                  }
                >
                  <Image
                    src={exhibit.photo.src}
                    alt={exhibit.photo.alt}
                    fill
                    sizes="(max-width: 760px) 72vw, 360px"
                    className={shared.photo}
                    style={{ objectPosition: exhibit.photo.position }}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.step}
          onClick={() => step(-1)}
          disabled={edge.start}
          aria-label="前の展示へ"
        >
          ←
        </button>
        <span className={styles.rule} aria-hidden="true">
          <span className={styles.ruleSeen} />
        </span>
        <button
          type="button"
          className={styles.step}
          onClick={() => step(1)}
          disabled={edge.end}
          aria-label="次の展示へ"
        >
          →
        </button>
      </div>
    </section>
  );
}
