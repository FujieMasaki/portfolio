import Link from "next/link";
import styles from "./MuseumRoomNavigation.module.css";

/** 順路の先の1か所。label は館内案内の札の文字（BACK TO ENTRANCE・PREVIOUS ROOM・NEXT ROOM） */
export type RoomLink = {
  label: string;
  title: string;
  href: string;
};

type Props = {
  /** 左下：来た方向（前の展示室、または入口） */
  previous: RoomLink;
  /** 右下：進む方向（次の展示室、または入口） */
  next: RoomLink;
  /** 床の上での置き方（高さ・余白）。展示室ごとに床の作りが違うので、使う側で決める */
  className?: string;
};

/**
 * 展示を見終えた床に置く、順路の案内。左に来た方向、右に進む方向を置き、中央は建築の余白として空ける。
 * どの部屋へも自由に移る館内案内（左上の Menu）とは役割を分け、ここは展示の順路に沿った前後の移動だけを受け持つ。
 *
 *   ABOUT    BACK TO ENTRANCE ← Top     /  NEXT ROOM Work →
 *   WORK     PREVIOUS ROOM ← About      /  NEXT ROOM Contact →
 *   CONTACT  PREVIOUS ROOM ← Work       /  BACK TO ENTRANCE Top →
 *
 * ページ送りのボタンには見せず、壁の札と同じ文字と細い線だけで示す。
 */
const MuseumRoomNavigation = ({ previous, next, className }: Props) => {
  return (
    <nav className={`${styles.route} ${className ?? ""}`} aria-label="順路" data-reveal>
      <RoomSign room={previous} direction="previous" />
      <RoomSign room={next} direction="next" />
    </nav>
  );
};

const RoomSign = ({ room, direction }: { room: RoomLink; direction: "previous" | "next" }) => (
  <Link href={room.href} className={`${styles.sign} ${styles[direction]}`}>
    <span className={styles.label}>{room.label}</span>
    <span className={styles.title}>
      {direction === "previous" && <Arrow direction={direction} />}
      {room.title}
      {direction === "next" && <Arrow direction={direction} />}
    </span>
  </Link>
);

const Arrow = ({ direction }: { direction: "previous" | "next" }) => (
  <svg className={styles.arrow} viewBox="0 0 32 10" aria-hidden="true">
    <path d={direction === "next" ? "M0 5h31M26 1l5 4-5 4" : "M32 5H1M6 1 1 5l5 4"} />
  </svg>
);

export default MuseumRoomNavigation;
