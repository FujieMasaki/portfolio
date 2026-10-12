"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import styles from "./MuseumNav.module.css";

type RoomId = "about" | "work" | "contact";

const ROOMS: { id: RoomId; href: string; label: string }[] = [
  { id: "about", href: "/about", label: "About" },
  { id: "work", href: "/work", label: "Work" },
  { id: "contact", href: "/contact", label: "Contact" },
];

type Props = {
  /** いま居る展示室。Menu の中で aria-current を付ける */
  current: RoomId;
};

/**
 * 館内（/about など）の最小限の案内。左上に入口へ戻る道、右上に Menu だけを置く。
 *
 * Menu は、マウスでは hover で一時的に開き（"hover"）、クリック・タップ・キーボードではボタンで開閉する（"pinned"）。
 * どちらの開き方も同じ state で持つので、aria-expanded が表示と一致し、Escape でいつでも閉じられる。
 * 閉じている間は visibility: hidden にして、見えないリンクに Tab でフォーカスが入らないようにする。
 */
export default function MuseumNav({ current }: Props) {
  // "hover"：マウスが乗っている間だけ開く / "pinned"：ボタンで開いた（マウスが離れても開いたまま）
  const [mode, setMode] = useState<"closed" | "hover" | "pinned">("closed");
  const open = mode !== "closed";
  const close = () => setMode("closed");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      // マウスが乗ったままでも閉じる。もう一度開くのは、いったん離れて乗り直すかボタンを押したとき
      close();
      // フォーカスが Menu の中にあるときだけボタンへ戻す（hover で開いただけなら、ほかの場所のフォーカスを奪わない）
      if (rootRef.current?.contains(document.activeElement)) buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.back}>
        <span className={styles.arrow} aria-hidden="true">
          ←
        </span>
        Back to Home
      </Link>

      <div
        ref={rootRef}
        className={styles.menu}
        data-open={open || undefined}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setMode((value) => (value === "closed" ? "hover" : value));
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setMode((value) => (value === "hover" ? "closed" : value));
        }}
        // フォーカスが Menu の外へ出たら閉じる（Tab で通り過ぎたとき）
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) close();
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={listId}
          // hover で開いているときに押すと、開いたまま留める
          onClick={() => setMode((value) => (value === "pinned" ? "closed" : "pinned"))}
        >
          Menu
          <span className={styles.lines} aria-hidden="true" />
        </button>

        <nav aria-label="展示室">
          <ul className={styles.list} id={listId}>
            {ROOMS.map((room) => (
              <li key={room.id}>
                <Link
                  href={room.href}
                  className={styles.item}
                  aria-current={room.id === current ? "page" : undefined}
                  // 閉じた Menu の中のリンクも画面内と見なされて先読みされるので、開いて選んだときだけ読む
                  prefetch={false}
                  onClick={close}
                >
                  {room.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
