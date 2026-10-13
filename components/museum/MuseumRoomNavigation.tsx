import Link from "next/link";
import styles from "./NextRoom.module.css";

type Props = {
  href: string;
  /** 次の展示室の名前 */
  title: string;
  /** 床の上での置き方（高さ・余白）。展示室ごとに床の作りが違うので、使う側で決める */
  className?: string;
};

/**
 * 展示を見終えて床を少し歩いた先にある、次の展示室への案内（NEXT ROOM / 部屋名 / →）。
 * ボタンにはせず、壁の札と同じ文字で、床に引いた細い縦線の先に置く。
 */
const NextRoom = ({ href, title, className }: Props) => {
  return (
    <nav className={`${styles.nextRoom} ${className ?? ""}`} aria-label="次の展示室" data-reveal>
      <Link href={href} className={styles.nextLink}>
        <span className={styles.nextLabel}>Next room</span>
        <span className={styles.nextTitle}>{title}</span>
        <svg className={styles.nextArrow} viewBox="0 0 32 10" aria-hidden="true">
          <path d="M0 5h31M26 1l5 4-5 4" />
        </svg>
      </Link>
    </nav>
  );
};

export default NextRoom;
