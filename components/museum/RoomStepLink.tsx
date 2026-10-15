"use client";

import { useEffect, type ComponentProps, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** いまの展示が退く時間。次の部屋が現れる動き（AboutMuseum / ContactMuseum の room-step）より短くする */
const EXIT_MS = 600;
/** 退く距離。次の部屋は反対側の同じ距離から現れる */
const STEP_PX = 12;
/**
 * 次の部屋の room-step が終わらなかったときに、印を外すまでの時間。
 * TODO: 遷移が極端に遅いと、着地の途中で切れる（ArchPassage の CLEAR_MS と同じ。原因の見当はそちらに書いた）
 */
const CLEAR_MS = 4000;
/** サイト共通の easing（--ease-calm と同じ値） */
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/**
 * 前後の札（別々のインスタンス）で共有する状態。
 *   stepping  押してから、この部屋を離れる（unmount する）まで true。退き終えて遷移を待つ間に押し直しても、動きと遷移を重ねない
 *   leaving   いま退いている展示の動き。途中でページを離れたら取り消す
 *   clearMark 前に付けた印（data-room-step）・listener・タイマーの片付け。新しく付け直す前に呼び、古いタイマーが新しい印を消さないようにする
 */
let stepping = false;
let leaving: Animation | null = null;
let clearMark: (() => void) | null = null;

type Props = ComponentProps<typeof Link> & {
  href: string;
  /** 順路の向き。"next" は奥へ進む（展示は左へ退き、次の部屋は右から現れる） */
  direction: "previous" | "next";
};

/**
 * 順路の案内（MuseumRoomNavigation）のリンク。隣の展示室へ数歩進んだ感覚だけを出す。
 *
 *   1. いまの展示（main）を、進む向きと逆へ 12px ずらしながら薄くする
 *   2. <html data-room-step> に向きを残して遷移する
 *   3. 次の部屋の main は、その向きの 12px 先から静かに着地する（AboutMuseum.module.css・ContactMuseum.module.css）
 *
 * 横にスライドするページ送りには見せない（距離は数 px、館内の壁は動かさない）。
 * /contact は景色ごと main の中にあるので、景色も一緒に数 px ずれて、館の外の暗い地の上で入れ替わる。
 * 修飾キー付きのクリック・prefers-reduced-motion・Web Animations が無い環境では、通常の Link と同じ。
 */
const RoomStepLink = ({ href, direction, onClick, ...props }: Props) => {
  const router = useRouter();

  // 退いている途中で
  //   ・「動きを減らす」に変わったら、退く動きをその場で終わらせ、遷移はそのまま続ける
  //     （cancel すると finished が reject され、遷移まで止まるので finish する）
  //   ・ブラウザの戻る操作などでページを離れたら、退く動きを取り消し、後から遷移させない
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotionChange = () => {
      if (reducedMotion.matches) leaving?.finish();
    };
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      reducedMotion.removeEventListener("change", onMotionChange);
      leaving?.cancel();
      leaving = null;
      stepping = false;
    };
  }, []);

  const step = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = event.currentTarget.closest("main");
    if (!main || typeof main.animate !== "function") return;

    event.preventDefault();
    if (stepping) return;
    stepping = true;
    const root = document.documentElement;
    const sign = direction === "next" ? -1 : 1;

    // 次の部屋に印を残す。現れ終えたら外す（Menu で移ったときや再読み込みでは、この動きをしない）。
    // 入口（TOP）には着地の動きが無いので、印を残さない
    const mark = () => {
      clearMark?.();
      if (href === "/") return;
      let timer = 0;
      const clear = () => {
        delete root.dataset.roomStep;
        document.removeEventListener("animationend", onEnd);
        window.clearTimeout(timer);
        if (clearMark === clear) clearMark = null;
      };
      // 印を付けてから遷移するまでの間は、退いたこの部屋の main にも着地の動きがかかる（見えない）ので、それの終わりは数えない
      const onEnd = (end: AnimationEvent) => {
        if (end.target !== main && end.animationName.includes("room-step")) clear();
      };
      root.dataset.roomStep = direction;
      document.addEventListener("animationend", onEnd);
      timer = window.setTimeout(clear, CLEAR_MS);
      clearMark = clear;
    };

    leaving = main.animate(
      { opacity: [1, 0], translate: ["0 0", `${sign * STEP_PX}px 0`] },
      { duration: EXIT_MS, easing: EASE, fill: "forwards" },
    );
    leaving.finished
      .then(() => {
        leaving = null;
        if (!main.isConnected) return;
        mark();
        router.push(href);
      })
      // 取り消された（ページを離れた）ときは遷移しない
      .catch(() => undefined);
  };

  return <Link href={href} onClick={step} {...props} />;
};

export default RoomStepLink;
