import type { ReactNode, SVGProps } from "react";
import styles from "./ThingsILike.module.css";

type Item = {
  title: string;
  description: ReactNode;
  icon: ReactNode;
};

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

const ITEMS: Item[] = [
  {
    title: "沖縄の海辺",
    description: (
      <>
        朝日を浴びながら歩き、
        <br />
        声に出して考えを整理する時間。
      </>
    ),
    icon: (
      <Icon>
        <path d="M2 6c.7.6 1.4 1.2 2.8 1.2 2.8 0 2.8-2.4 5.6-2.4S13.2 7.2 16 7.2 18.8 4.8 21.6 4.8" />
        <path d="M2 12c.7.6 1.4 1.2 2.8 1.2 2.8 0 2.8-2.4 5.6-2.4s2.8 2.4 5.6 2.4 2.8-2.4 5.6-2.4" />
        <path d="M2 18c.7.6 1.4 1.2 2.8 1.2 2.8 0 2.8-2.4 5.6-2.4s2.8 2.4 5.6 2.4 2.8-2.4 5.6-2.4" />
      </Icon>
    ),
  },
  {
    title: "一人で過ごす時間",
    description: (
      <>
        サウナやお風呂、ウォーキング。
        <br />
        静かな時間に頭の中が整っていきます。
      </>
    ),
    icon: (
      <Icon>
        <path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z" />
      </Icon>
    ),
  },
  {
    title: "心地よい空間",
    description: (
      <>
        ホテルのおもてなしや、
        <br />
        カフェ、レストランで人が自然に笑顔になる空気に惹かれます。
      </>
    ),
    icon: (
      <Icon>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
        <path d="M3 12h18" />
      </Icon>
    ),
  },
  {
    title: "バスケットボール",
    description: (
      <>
        琉球ゴールデンキングスを応援しています。
        <br />
        試合を見るだけでなく、選手の動きや戦術を考えることも好きです。
      </>
    ),
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18" />
        <path d="M12 3v18" />
        <path d="M5.8 5.8c2.8 2.6 2.8 9.8 0 12.4" />
        <path d="M18.2 5.8c-2.8 2.6-2.8 9.8 0 12.4" />
      </Icon>
    ),
  },
  {
    title: "シンプルなもの",
    description: (
      <>
        飾りすぎず、余白があり、
        <br />
        使う人のために丁寧につくられたものが好きです。
      </>
    ),
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
      </Icon>
    ),
  },
];

export default function ThingsILike() {
  return (
    <section className={styles.section} aria-label="Things I like">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>THINGS I LIKE ｜ 好きな時間、惹かれるもの</p>

        <div className={styles.list}>
          {ITEMS.map((item) => (
            <div className={styles.item} key={item.title}>
              <div className={styles.itemHead}>
                <span className={styles.icon}>{item.icon}</span>
                <h3 className={styles.itemTitle}>{item.title}</h3>
              </div>
              <p className={styles.itemDescription}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
