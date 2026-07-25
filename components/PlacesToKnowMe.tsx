import type { SVGProps } from "react";
import styles from "./PlacesToKnowMe.module.css";

type Place = {
  title: string;
  description: string;
  href?: string;
  external?: boolean;
  comingSoon?: boolean;
  icon: React.ReactNode;
};

function Icon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={22}
      height={22}
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

const PLACES: Place[] = [
  {
    title: "Tech Notes",
    description:
      "フロントエンド開発や個人開発で得た知見、設計や実装についてまとめています。",
    href: "https://zenn.dev/fujee",
    external: true,
    icon: (
      <Icon>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8" />
        <path d="M8 17h8" />
      </Icon>
    ),
  },
  {
    title: "GitHub",
    description: "個人開発や技術検証、日々の実装の記録。",
    href: "https://github.com/FujieMasaki",
    external: true,
    icon: (
      <Icon>
        <path d="m8 6-6 6 6 6" />
        <path d="m16 6 6 6-6 6" />
      </Icon>
    ),
  },
  {
    title: "Blog",
    description:
      "プロダクトづくりや自己理解、日々考えたことについて書いています。",
    href: "https://note.com/fujee",
    external: true,
    icon: (
      <Icon>
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
      </Icon>
    ),
  },
  {
    title: "Focus on Dot",
    description:
      "話すことで自分の考えを整理し、今日の小さな気づきを見つける音声ジャーナリングアプリ。",
    comingSoon: true,
    icon: (
      <Icon>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      </Icon>
    ),
  },
];

export default function PlacesToKnowMe() {
  return (
    <section className={styles.section} aria-label="Places to know me">
      <p className={styles.eyebrow}>PLACES TO KNOW ME ｜ もっと知る</p>

      <div className={styles.grid}>
        {PLACES.map((place) => {
          const inner = (
            <>
              <span className={styles.icon}>{place.icon}</span>
              <span className={styles.itemTitle}>
                {place.title}
                {place.comingSoon ? (
                  <span className={styles.badge}>準備中</span>
                ) : (
                  <span className={styles.arrow} aria-hidden="true">
                    →
                  </span>
                )}
              </span>
              <span className={styles.itemDescription}>
                {place.description}
              </span>
            </>
          );

          if (place.comingSoon) {
            return (
              <div
                key={place.title}
                className={`${styles.item} ${styles.itemDisabled}`}
              >
                {inner}
              </div>
            );
          }

          return (
            <a
              key={place.title}
              className={styles.item}
              href={place.href}
              {...(place.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {inner}
            </a>
          );
        })}
      </div>
    </section>
  );
}
