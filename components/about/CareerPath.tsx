"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import Image from "next/image";
import { CAREER } from "./content";
import shared from "./AboutMuseum.module.css";
import styles from "./CareerPath.module.css";

/**
 * 02 Career。これまで通ってきた場所を、壁に横へ掛け並べた写真としてたどる。
 *
 * 横の移動はブラウザのスクロールそのまま（トラックパッド・横スワイプ・Shift + ホイール・矢印キー）で、
 * 縦のホイールを横へ置き換える scroll jack はしない。
 * 縦のホイールしかないマウスでも歩いて見ていけるように、次の3つを足す。
 *   - 壁をつかんで横へ引く（マウスのドラッグ。タッチはブラウザの横スワイプのまま）
 *   - 下の細い線をスクロールバーとして使う（いまどこを見ているかを示し、つかんで動かせる）
 *   - ← → で隣の展示へ進む
 * 幅の狭い画面では縦に並べ、線とボタンは出さない（CSS）。
 */
export default function CareerPath() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  // ドラッグ中の状態。描画には使わないので ref に持つ
  const dragRef = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
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
        const start = track.scrollLeft <= 2;
        const end = track.scrollLeft >= max - 2;
        // スクロール中は毎フレーム呼ばれるので、端の状態が変わったときだけ描き直す
        setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
      });
    };
    update();
    track.addEventListener("scroll", update, { passive: true });
    // フォントの読み込みなどで展示の列の幅だけが変わっても、線と ← → を合わせ直す
    const observer = new ResizeObserver(update);
    observer.observe(track);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
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

  /** 壁をつかんで横へ引く（マウスだけ。タッチ・ペンはブラウザのスクロールに任せる） */
  const onTrackPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    dragRef.current = {
      id: event.pointerId,
      x: event.clientX,
      left: event.currentTarget.scrollLeft,
      moved: false,
    };
  };

  const onTrackPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== event.pointerId) return;
    const track = event.currentTarget;
    // 壁の外でボタンを離すと pointerup が届かないので、ボタンが離れていたらここで終える
    if ((event.buttons & 1) === 0) {
      dragRef.current = null;
      delete track.dataset.dragging;
      return;
    }
    const dx = event.clientX - drag.x;
    if (!drag.moved) {
      // クリックや文字の選択と区別するため、少し動いてからドラッグとして扱う
      if (Math.abs(dx) < 4) return;
      drag.moved = true;
      track.setPointerCapture(event.pointerId);
      track.dataset.dragging = "";
      window.getSelection()?.removeAllRanges();
    }
    track.scrollLeft = drag.left - dx;
  };

  const endTrackDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current?.id !== event.pointerId) return;
    dragRef.current = null;
    // 離したあとに scroll-snap（proximity）が効き、近い展示があればそこで止まる
    delete event.currentTarget.dataset.dragging;
  };

  /** 下の線の上の位置に合わせて、見えている範囲（濃い部分）の中心をそこへ動かす */
  const scrubTo = (clientX: number) => {
    const track = trackRef.current;
    const rule = ruleRef.current;
    if (!track || !rule) return;
    const rect = rule.getBoundingClientRect();
    const visible = track.clientWidth / track.scrollWidth;
    if (visible >= 1) return;
    const seenLeft = (clientX - rect.left) / rect.width - visible / 2;
    const progress = Math.min(Math.max(seenLeft / (1 - visible), 0), 1);
    track.scrollLeft = progress * (track.scrollWidth - track.clientWidth);
  };

  const onRulePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    if (trackRef.current) trackRef.current.dataset.dragging = "";
    scrubTo(event.clientX);
  };

  const onRulePointerMove = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) scrubTo(event.clientX);
  };

  const endRuleDrag = () => {
    if (trackRef.current) delete trackRef.current.dataset.dragging;
  };

  return (
    <section
      ref={sectionRef}
      className={styles.path}
      aria-labelledby="career-title"
    >
      <header className={shared.sectionHeader} data-reveal>
        <h2 className={shared.heading} id="career-title">
          <span className={shared.eyebrow}>About</span>
          <span className={shared.roomTitle}>Career</span>
        </h2>
        <p className={shared.subtitle}>Path</p>
        <p className={shared.lead}>
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
        onPointerDown={onTrackPointerDown}
        onPointerMove={onTrackPointerMove}
        onPointerUp={endTrackDrag}
        onPointerCancel={endTrackDrag}
        onLostPointerCapture={endTrackDrag}
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
                    sizes="(max-width: 760px) 76vw, 400px"
                    className={`${shared.photo} ${styles.memory}`}
                    // 壁をつかんで引くときに、画像そのものをドラッグしない
                    draggable={false}
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
          // disabled にすると、押してフォーカスがあるボタンからフォーカスが外れて見失うので aria-disabled にする
          aria-disabled={edge.start}
          aria-label="前の展示へ"
        >
          ←
        </button>
        {/* スクロールバーの代わりの線。キーボードでは壁（track）と ← → で同じことができるので、読み上げからは外す */}
        <span
          ref={ruleRef}
          className={styles.rule}
          aria-hidden="true"
          onPointerDown={onRulePointerDown}
          onPointerMove={onRulePointerMove}
          onPointerUp={endRuleDrag}
          onPointerCancel={endRuleDrag}
        >
          <span className={styles.ruleSeen} />
        </span>
        <button
          type="button"
          className={styles.step}
          onClick={() => step(1)}
          aria-disabled={edge.end}
          aria-label="次の展示へ"
        >
          →
        </button>
      </div>
    </section>
  );
}
