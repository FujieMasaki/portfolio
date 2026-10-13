import { useEffect, useRef, useState } from "react";
import { CAREER } from "./content";
import { indexAt, stopsOf } from "./careerPosition";

/**
 * Career の横の移動（ホイール・← →）と、いまの位置の表示（線の上の光・← → の端の状態）。
 *
 * 横の移動はブラウザのスクロールを土台にし、展示の上で回した縦のホイールを横の移動に使う。
 * 先頭・末尾に着いたら、ページの縦のスクロールに戻す。
 * 光の位置は section の --progress に書き、描き直さずに CSS で動かす。
 * 返す sectionRef・trackRef を、それぞれ section と壁（track）の要素に付ける。
 */
const useCareerTrack = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  // ホイールで向かっている位置と、そこへなめらかに寄せる描画のフレーム。smooth は ← → でブラウザが横に動かしている途中か
  const wheelRef = useRef<{ target: number | null; frame: number; smooth: boolean }>({
    target: null,
    frame: 0,
    smooth: false,
  });
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
        const progress = indexAt(track.scrollLeft, stopsOf(track)) / (CAREER.length - 1);
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
      // ← → で始めたブラウザの smooth scroll も、いまの位置で止める
      if (wheel.smooth) {
        wheel.smooth = false;
        track.scrollTo({ left: track.scrollLeft, behavior: "instant" });
      }
    };
    const onScrollEnd = () => {
      wheel.smooth = false;
    };
    // 一続きのホイール（間が 0.2 秒未満）の中で、一度ページに任せたら最後まで任せる（途中から横の移動に変えない）
    let lastWheelAt = -Infinity;
    let passing = false;
    // 列の外で回したホイールも記録する。ページを縦に送っている途中で列がカーソルの下に入ってきても、横に切り替えない。
    // ページを送り始めたら、横に寄せている途中の動きも止める（ページと展示が同時に動かない）
    const onPageWheel = (event: WheelEvent) => {
      if (event.target instanceof Node && track.contains(event.target)) return;
      lastWheelAt = event.timeStamp;
      passing = true;
      stopGlide();
    };
    // ブラウザに任せる（横に動かさない）ときは、寄せている途中の動きを止める。同じ理由で、ページと展示が同時に動かない
    const onWheel = (event: WheelEvent) => {
      if (!takeWheel(event)) stopGlide();
    };
    /** ホイールを横の移動として受けたら true。ブラウザ（ページの縦のスクロールなど）に任せるなら false */
    const takeWheel = (event: WheelEvent) => {
      const continuing = event.timeStamp - lastWheelAt < 200;
      lastWheelAt = event.timeStamp;
      if (continuing && passing) return false;
      passing = true;
      // 幅の狭い画面（縦に並べる）・ピンチのズームはブラウザに任せる
      if (!desktop.matches || event.ctrlKey) return false;
      // 横の操作（トラックパッド・Shift + ホイール）はブラウザに任せる
      if (event.shiftKey || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return false;
      // 展示の列がほぼ画面に入っているときだけ横に動かす（一部しか見えていないうちは、ページを縦に送る）
      const rail = track.firstElementChild?.getBoundingClientRect();
      if (!rail || rail.height === 0) return false;
      const seen = Math.min(rail.bottom, window.innerHeight) - Math.max(rail.top, 0);
      if (seen / rail.height < 0.6) return false;
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
      if (max <= 0 || (delta > 0 && now >= max - 1) || (delta < 0 && now <= 1)) return false;
      // 続けて回したときは、いま向かっている位置から先へ足す
      const from = wheel.target ?? now;
      // 止められない wheel（ページのスクロールの途中から続くもの）では横に動かさず、縦と横が同時に動かないようにする
      if (!event.cancelable) return false;
      passing = false;
      event.preventDefault();
      const to = Math.min(Math.max(from + delta, 0), max);
      if (reduce.matches) {
        // 寄せている途中で設定が変わっていたら、その動きを止めてからすぐに動かす（古い位置へ戻らない）
        stopGlide();
        track.scrollLeft = to;
        return true;
      }
      wheel.target = to;
      if (!wheel.frame) wheel.frame = requestAnimationFrame(glide);
      return true;
    };
    // キーボード（矢印キーなど）で動かし始めたら、ホイールで寄せている途中の動きを止める
    const onKeyDown = () => stopGlide();
    update();
    track.addEventListener("scroll", update, { passive: true });
    track.addEventListener("scrollend", onScrollEnd);
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
      track.removeEventListener("scrollend", onScrollEnd);
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

  /** 隣の展示を、壁（画面）の中央まで動かす。展示の前に1点ずつ立って見る */
  const step = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    stopWheelGlide();
    const center = track.getBoundingClientRect().left + track.clientWidth / 2;
    const items = Array.from(track.querySelectorAll<HTMLElement>("[data-exhibit]"));
    // 各展示の中心が、壁の中央からどれだけ離れているか（右が正）
    const offsets = items.map((item) => {
      const rect = item.getBoundingClientRect();
      return rect.left + rect.width / 2 - center;
    });
    const target =
      direction === 1
        ? offsets.find((offset) => offset > 4)
        : offsets.filter((offset) => offset < -4).at(-1);
    if (target === undefined) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollBy({ left: target, behavior: reduce ? "auto" : "smooth" });
    // ページに任せるホイールや「動きを減らす」の切り替えで、途中で止められるようにする（stopGlide）
    wheelRef.current.smooth = !reduce;
  };

  return { sectionRef, trackRef, edge, step, stopWheelGlide };
};

export default useCareerTrack;
