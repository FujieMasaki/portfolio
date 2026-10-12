"use client";

import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import Image from "next/image";
import { CAREER } from "./content";
import shared from "./AboutMuseum.module.css";
import styles from "./CareerPath.module.css";

/**
 * ABOUT / Career。これまで通ってきた場所を、壁に横へ掛け並べた写真としてたどる。
 *
 * 横の移動はブラウザのスクロールを土台にする（トラックパッドの横の操作・横スワイプ・矢印キーはそのまま）。
 * マウスでも壁沿いに歩いて見ていけるように、次の4つを足す。
 *   - 展示の上で回した縦のホイールを、横の移動に使う。先頭・末尾に着いたら、ページの縦のスクロールに戻す
 *   - 壁をつかんで横へ引く（マウスのドラッグ。タッチはブラウザの横スワイプのまま）
 *   - 下の細い線の上を動く短い光（展示1つ分の幅）で、いまどこにいるかを示す。線はつかんで動かせる
 *   - ← → で隣の展示へ進む
 * 幅の狭い画面では縦に並べ、線とボタンは出さない（CSS）。
 */

/** 線の上の光の幅（線の長さに対する割合）。展示1つ分にする */
const THUMB = 1 / CAREER.length;
export default function CareerPath() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  // ドラッグ中の状態。描画には使わないので ref に持つ
  const dragRef = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);
  // ホイールで向かっている位置と、そこへなめらかに寄せる描画のフレーム
  const wheelRef = useRef<{ target: number | null; frame: number }>({ target: null, frame: 0 });
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
        // 線の上の光の位置
        section.style.setProperty("--progress", progress.toFixed(4));
        const start = track.scrollLeft <= 2;
        const end = track.scrollLeft >= max - 2;
        // スクロール中は毎フレーム呼ばれるので、端の状態が変わったときだけ描き直す
        setEdge((prev) => (prev.start === start && prev.end === end ? prev : { start, end }));
      });
    };
    const wheel = wheelRef.current;
    const desktop = window.matchMedia("(min-width: 761px)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    // 向かう位置へ、毎フレーム残りの 2 割ずつ寄せる（1目盛りずつ飛ばない）
    const glide = () => {
      if (wheel.target === null) return;
      const current = track.scrollLeft;
      const rest = wheel.target - current;
      if (Math.abs(rest) <= 2) {
        track.scrollLeft = wheel.target;
        wheel.target = null;
        wheel.frame = 0;
        return;
      }
      // スクロール位置は端数が丸められるので、1フレームに最低 2px は進める
      track.scrollLeft = current + Math.sign(rest) * Math.max(Math.abs(rest) * 0.2, 2);
      // 進めなかった（幅が変わって端に着いたなど）ときは、そこで止める
      if (track.scrollLeft === current) {
        wheel.target = null;
        wheel.frame = 0;
        return;
      }
      wheel.frame = requestAnimationFrame(glide);
    };
    const stopGlide = () => {
      cancelAnimationFrame(wheel.frame);
      wheel.target = null;
      wheel.frame = 0;
    };
    // 一続きのホイール（間が 0.2 秒未満）の中で、一度ページに任せたら最後まで任せる（途中から横の移動に変えない）
    let lastWheelAt = -Infinity;
    let passing = false;
    // 列の外で回したホイールも記録する。ページを縦に送っている途中で列がカーソルの下に入ってきても、横に切り替えない
    const onPageWheel = (event: WheelEvent) => {
      if (event.target instanceof Node && track.contains(event.target)) return;
      lastWheelAt = event.timeStamp;
      passing = true;
    };
    const onWheel = (event: WheelEvent) => {
      const continuing = event.timeStamp - lastWheelAt < 200;
      lastWheelAt = event.timeStamp;
      if (continuing && passing) return;
      passing = true;
      // 幅の狭い画面（縦に並べる）・ピンチのズームはブラウザに任せる
      if (!desktop.matches || event.ctrlKey) return;
      // 横の操作（トラックパッド・Shift + ホイール）はブラウザに任せ、ホイールで寄せている途中なら止める
      if (event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
        stopGlide();
        return;
      }
      // 展示の列がほぼ画面に入っているときだけ横に動かす（一部しか見えていないうちは、ページを縦に送る）
      const rail = track.firstElementChild?.getBoundingClientRect();
      if (!rail || rail.height === 0) return;
      const seen = Math.min(rail.bottom, window.innerHeight) - Math.max(rail.top, 0);
      if (seen / rail.height < 0.6) return;
      const max = track.scrollWidth - track.clientWidth;
      const delta =
        event.deltaMode === WheelEvent.DOM_DELTA_LINE
          ? event.deltaY * 16
          : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
            ? event.deltaY * track.clientWidth
            : event.deltaY;
      // 先頭・末尾に実際に着いていたら奪わず、ページの縦のスクロールに戻す。
      // 向かう位置だけが端に着いていて、まだ寄せている途中なら、着くまでは横の操作として受ける（縦と横が同時に動かない）
      const now = track.scrollLeft;
      if (max <= 0 || (delta > 0 && now >= max - 1) || (delta < 0 && now <= 1)) {
        stopGlide();
        return;
      }
      // 続けて回したときは、いま向かっている位置から先へ足す
      const from = wheel.target ?? now;
      // 止められない wheel（ページのスクロールの途中から続くもの）では横に動かさず、縦と横が同時に動かないようにする
      if (!event.cancelable) return;
      passing = false;
      event.preventDefault();
      const to = Math.min(Math.max(from + delta, 0), max);
      if (reduce.matches) {
        // 寄せている途中で設定が変わっていたら、その動きを止めてからすぐに動かす（古い位置へ戻らない）
        stopGlide();
        track.scrollLeft = to;
        return;
      }
      wheel.target = to;
      if (!wheel.frame) wheel.frame = requestAnimationFrame(glide);
    };
    // キーボード（矢印キーなど）で動かし始めたら、ホイールで寄せている途中の動きを止める
    const onKeyDown = () => stopGlide();
    update();
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("wheel", onPageWheel, { passive: true, capture: true });
    track.addEventListener("keydown", onKeyDown);
    // 閲覧中に「動きを減らす」を有効にしたら、寄せている途中の動きもその場で止める
    reduce.addEventListener("change", stopGlide);
    // フォントの読み込みなどで展示の列の幅だけが変わっても、線と ← → を合わせ直す
    const observer = new ResizeObserver(update);
    observer.observe(track);
    if (track.firstElementChild) observer.observe(track.firstElementChild);
    return () => {
      cancelAnimationFrame(frame);
      stopGlide();
      track.removeEventListener("scroll", update);
      track.removeEventListener("wheel", onWheel);
      window.removeEventListener("wheel", onPageWheel, { capture: true });
      track.removeEventListener("keydown", onKeyDown);
      reduce.removeEventListener("change", stopGlide);
      observer.disconnect();
    };
  }, []);

  /** ホイールでなめらかに動かしている途中なら止める（ドラッグ・線・← → の操作を優先する） */
  const stopWheelGlide = () => {
    const wheel = wheelRef.current;
    cancelAnimationFrame(wheel.frame);
    wheel.target = null;
    wheel.frame = 0;
  };

  /** 隣の展示の左端が、壁の左の余白にそろう位置まで動かす */
  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    stopWheelGlide();
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
    stopWheelGlide();
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
    delete event.currentTarget.dataset.dragging;
  };

  /** 下の線の上の位置に合わせて、光の中心をそこへ動かす */
  const scrubTo = (clientX: number) => {
    const track = trackRef.current;
    const rule = ruleRef.current;
    if (!track || !rule) return;
    const rect = rule.getBoundingClientRect();
    const thumbLeft = (clientX - rect.left) / rect.width - THUMB / 2;
    const progress = Math.min(Math.max(thumbLeft / (1 - THUMB), 0), 1);
    track.scrollLeft = progress * (track.scrollWidth - track.clientWidth);
  };

  const onRulePointerDown = (event: PointerEvent<HTMLSpanElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    stopWheelGlide();
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
      style={{ "--thumb": THUMB } as CSSProperties}
      aria-labelledby="career-title"
    >
      <header className={shared.sectionHeader} data-reveal>
        <h2 className={shared.heading} id="career-title">
          <span className={shared.eyebrow}>About</span>
          <span className={shared.roomTitle}>Career</span>
        </h2>
        <p className={shared.lead}>
          人や場所に関わる仕事と、
          <br />
          プロダクト開発を経験してきました。
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
                <p className={styles.number}>
                  {exhibit.number}
                  <span className={styles.period}>{exhibit.period}</span>
                </p>
                <h3 className={styles.place}>{exhibit.title}</h3>
                {exhibit.paragraphs.map((lines) => (
                  <p key={lines[0]} className={styles.note}>
                    {lines.map((line, index) => (
                      <span key={line}>
                        {index > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                ))}
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
          data-direction="prev"
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
          onLostPointerCapture={endRuleDrag}
        >
          <span className={styles.ruleThumb} />
        </span>
        <button
          type="button"
          className={styles.step}
          data-direction="next"
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
