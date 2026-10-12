import { useRef, type PointerEvent, type RefObject } from "react";
import { CAREER } from "./content";
import { THUMB, leftAt, stopsOf } from "./careerPosition";

/**
 * Career をつかんで動かす操作。
 *   - 壁をつかんで横へ引く（マウスのドラッグ。タッチはブラウザの横スワイプのまま）
 *   - 下の細い線をつかんで、光の中心をそこへ動かす
 * どちらも、ホイールでなめらかに動かしている途中なら止めてから動かす（stopWheelGlide）。
 * 返す trackHandlers を壁（track）に、ruleRef・ruleHandlers を線（rule）の要素に渡す。
 */
const useCareerDrag = (
  trackRef: RefObject<HTMLDivElement | null>,
  stopWheelGlide: () => void,
) => {
  const ruleRef = useRef<HTMLSpanElement>(null);
  // ドラッグ中の状態。描画には使わないので ref に持つ
  const dragRef = useRef<{ id: number; x: number; left: number; moved: boolean } | null>(null);

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
    track.scrollLeft = leftAt(progress * (CAREER.length - 1), stopsOf(track));
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

  return {
    ruleRef,
    trackHandlers: {
      onPointerDown: onTrackPointerDown,
      onPointerMove: onTrackPointerMove,
      onPointerUp: endTrackDrag,
      onPointerCancel: endTrackDrag,
      onLostPointerCapture: endTrackDrag,
    },
    ruleHandlers: {
      onPointerDown: onRulePointerDown,
      onPointerMove: onRulePointerMove,
      onPointerUp: endRuleDrag,
      onPointerCancel: endRuleDrag,
      onLostPointerCapture: endRuleDrag,
    },
  };
};

export default useCareerDrag;
