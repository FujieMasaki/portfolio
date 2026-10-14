"use client";

import { useEffect, type ComponentProps, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/** いまの展示が退く時間。次の部屋が現れる動き（AboutMuseum / ContactMuseum の room-step）より短くする */
const EXIT_MS = 600;
/** 退く距離。次の部屋は反対側の同じ距離から現れる */
const STEP_PX = 12;
/** 次の部屋の room-step が終わらなかったとき（入口の TOP には room-step が無い）に、印を外すまでの時間 */
const CLEAR_MS = 4000;
/** サイト共通の easing（--ease-calm と同じ値） */
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/**
 * いま退いている展示の動き。前後の札（別々のインスタンス）で共有し、どちらを押し直しても退く動きと遷移を重ねない
 */
let leaving: Animation | null = null;

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
 * 横にスライドするページ送りには見せない（距離は数 px、壁や景色の地は動かさない）。
 * 修飾キー付きのクリック・prefers-reduced-motion・Web Animations が無い環境では、通常の Link と同じ。
 */
const RoomStepLink = ({ href, direction, onClick, ...props }: Props) => {
  const router = useRouter();

  // 退いている途中にブラウザの戻る操作などでページを離れたら、退く動きを取り消し、後から遷移させない
  useEffect(
    () => () => {
      leaving?.cancel();
      leaving = null;
    },
    [],
  );

  const step = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const main = event.currentTarget.closest("main");
    if (!main || typeof main.animate !== "function") return;

    event.preventDefault();
    if (leaving) return;
    const root = document.documentElement;
    const sign = direction === "next" ? -1 : 1;

    // 次の部屋が現れ終えたら印を外す（Menu で移ったときや再読み込みでは、この動きをしない）
    let timer = 0;
    const clear = () => {
      delete root.dataset.roomStep;
      document.removeEventListener("animationend", onEnd);
      window.clearTimeout(timer);
    };
    // 印を付けてから遷移するまでの間は、退いたこの部屋の main にも着地の動きがかかる（見えない）ので、それの終わりは数えない
    const onEnd = (end: AnimationEvent) => {
      if (end.target !== main && end.animationName.includes("room-step")) clear();
    };

    leaving = main.animate(
      { opacity: [1, 0], translate: ["0 0", `${sign * STEP_PX}px 0`] },
      { duration: EXIT_MS, easing: EASE, fill: "forwards" },
    );
    leaving.finished
      .then(() => {
        leaving = null;
        if (!main.isConnected) return;
        root.dataset.roomStep = direction;
        document.addEventListener("animationend", onEnd);
        timer = window.setTimeout(clear, CLEAR_MS);
        router.push(href);
      })
      // 取り消された（ページを離れた）ときは遷移しない
      .catch(() => undefined);
  };

  return <Link href={href} onClick={step} {...props} />;
};

export default RoomStepLink;
