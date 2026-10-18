"use client";

import { useEffect, type ComponentProps, type MouseEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearMark, setMark } from "./arrivalMark";

/** いまの部屋が溶けて退く時間。次の部屋が現れる動き（AboutMuseum / ContactMuseum の room-enter・room-step）より短くする */
const EXIT_MS = 600;
/** 中身が退く距離。次の部屋の札・展示は反対側の同じ距離から現れる */
const STEP_PX = 12;
/** サイト共通の easing（--ease-calm と同じ値） */
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";

/**
 * 前後の札（別々のインスタンス）で共有する状態。
 *   stepping  押してから、この部屋を離れる（unmount する）まで true。退き終えて遷移を待つ間に押し直しても、動きと遷移を重ねない
 *   leaving   いま退いている部屋の動き。途中でページを離れたら取り消す
 */
let stepping = false;
let leaving: Animation[] = [];

type Props = ComponentProps<typeof Link> & {
  href: string;
  /** 順路の向き。"next" は奥へ進む（展示は左へ退き、次の部屋は右から現れる） */
  direction: "previous" | "next";
  /**
   * 行き先の地の色。部屋が入れ替わる間、body にその色を敷く（globals.css の [data-room-ground]）。
   * 省くと館内の壁の色。"dark" は館の外の暗がり（/contact と入口の TOP。どちらも地は同じ色）
   */
  ground?: "dark";
};

/**
 * 順路の案内（MuseumRoomNavigation）のリンク。隣の展示室へ数歩進んだ感覚だけを出す。
 *
 *   1. いまの部屋を、壁・床・Menu ごと地の色（body）へ溶かす。中身（main）は進む向きと逆へ 12px 退く
 *   2. <html data-room-step> に向きを残して遷移する
 *   3. 次の部屋は、地の色の上に部屋ごと静かに現れ、入ってすぐの札・展示が、その向きの 12px 先から時間差で着地する
 *      （AboutMuseum.module.css。/contact は ContactMuseum.module.css）
 *
 * 順路の案内はページの末尾にあり、次の部屋は先頭から見せるので、床や壁の見えている場所は前後で同じにならない。
 * 部屋ごと地の色に溶かし、入れ替わる瞬間（スクロール位置が末尾から先頭へ飛ぶところ）を見せない（TOP の通り抜けの暗がりと同じ考え方）。
 * 地の色は、館内の部屋どうしは壁の色、/contact と入口へ向かうときは館の外の暗がり（<html data-room-ground>。globals.css）。
 * 横にスライドするページ送りには見せない（ずれる距離は数 px）。
 * 修飾キー付きのクリック・prefers-reduced-motion・Web Animations が無い環境では、通常の Link と同じ。
 */
const RoomStepLink = ({ href, direction, ground, onClick, ...props }: Props) => {
  const router = useRouter();

  // 退いている途中にブラウザの戻る操作などでページを離れたら、退く動きを取り消し、後から遷移させない。
  // 敷いた地の色も外す（退き終えて遷移したときは、次の部屋が現れ終わるまで残す）。
  // Web Animations は React の外の動きなので、この後片付けだけを effect に置く
  useEffect(
    () => () => {
      if (leaving.length > 0) clearMark("roomGround");
      leaving.forEach((animation) => animation.cancel());
      leaving = [];
      stepping = false;
    },
    [],
  );

  const step = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;
    const main = event.currentTarget.closest("main");
    // 部屋のルート（.museum / .contact）。順路の案内を置くページは、main の親を部屋のルートにする
    // （body の直下に main を置くページでは、body ごと透明になり、地の色も見えなくなる）
    const room = main?.parentElement;
    if (!main || !room || typeof main.animate !== "function") return;

    event.preventDefault();
    if (stepping) return;
    stepping = true;
    const sign = direction === "next" ? -1 : 1;

    // 部屋の外の地の色を、行き先に合わせて先に敷いておく。次の部屋の着地の動きが終わったら外れる。
    // 入口（TOP）には着地の動きが無いので、TOP が描かれたら ArchPassage が外す（同じ色の TOP の地が上を覆う）。
    // この部屋に順路で着いた直後は、まだこの部屋の着地の動きが続いているので、ignore でそれを数えない
    setMark("roomGround", ground ?? "wall", "room-step", room);

    // 部屋ごと地の色へ溶かし、中身だけを進む向きと逆へ退かせる
    const timing = { duration: EXIT_MS, easing: EASE, fill: "forwards" } as const;
    leaving = [
      room.animate({ opacity: 0 }, timing),
      main.animate({ translate: `${sign * STEP_PX}px 0` }, timing),
    ];

    // 退いている途中で「動きを減らす」に変わったら、退く動きをその場で終わらせ、遷移はそのまま続ける
    // （cancel すると finished が reject され、遷移まで止まるので finish する）。見張るのは退いている間だけ
    const finishNow = () => {
      if (reducedMotion.matches) leaving.forEach((animation) => animation.finish());
    };
    reducedMotion.addEventListener("change", finishNow);

    Promise.all(leaving.map((animation) => animation.finished))
      .then(() => {
        leaving = [];
        if (!main.isConnected) return;
        // 次の部屋に印を残す。入口（TOP）には着地の動きが無いので、印を残さない。
        // 印を付けてから遷移するまでの間は、退いたこの部屋にも着地の動きがかかる（見えない）ので、それの始まりと終わりは数えない
        clearMark("roomStep");
        if (href !== "/") setMark("roomStep", direction, "room-step", room);
        router.push(href);
      })
      // 取り消された（ページを離れた）ときは遷移しない
      .catch(() => undefined)
      .finally(() => reducedMotion.removeEventListener("change", finishNow));
  };

  return <Link href={href} onClick={step} {...props} />;
};

export default RoomStepLink;
