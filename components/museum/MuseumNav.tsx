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
 * Menu は、hover できる端末では hover で一時的に開き（CSS の @media (hover: hover)）、
 * クリック・タップ・キーボードではボタンで開閉する（aria-expanded）。
 * 閉じている間は visibility: hidden にして、見えないリンクに Tab でフォーカスが入らないようにする。
 */
export default function MuseumNav({ current }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
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
        // フォーカスが Menu の外へ出たら閉じる（Tab で通り過ぎたとき）
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen((value) => !value)}
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
                  onClick={() => setOpen(false)}
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
