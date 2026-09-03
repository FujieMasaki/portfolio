import { getImageProps } from "next/image";
import styles from "./Hero.module.css";

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "ABOUT", href: "#about" },
  { label: "CAREER", href: "#career" },
  { label: "INTERESTS", href: "#likes" },
  { label: "MORE", href: "#more" },
  { label: "CONTACT", href: "#contact" },
];

const HERO_IMAGE_PROPS = {
  alt: "",
  fill: true,
  sizes: "100vw",
  fetchPriority: "high" as const,
  style: { objectFit: "cover" as const, objectPosition: "50% 40%" },
};

export default function Hero() {
  const {
    props: { srcSet: desktopSrcSet, ...desktopImageProps },
  } = getImageProps({
    ...HERO_IMAGE_PROPS,
    src: "/images/hero.webp",
  });
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    ...HERO_IMAGE_PROPS,
    src: "/images/hero-sp.webp",
  });

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.media} aria-hidden="true">
        <picture>
          <source media="(max-width: 860px)" srcSet={mobileSrcSet} />
          <img {...desktopImageProps} srcSet={desktopSrcSet} alt="" />
        </picture>
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.textBlock}>
          <p className={styles.eyebrow}>
            MASAKI FUJIE / 藤江正樹 — PRODUCT ENGINEER
          </p>
          <h1 className={styles.name}>Masaki Fujie</h1>
          <div className={styles.copy}>
            <p>
              沖縄に暮らしながら、
              <br />
              プロダクトづくりをしています。
            </p>
            <p>
              技術を使って、
              <br />
              使いやすい体験を考えています。
            </p>
          </div>
          <nav className={styles.nav} aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <a key={link.label} className={styles.navLink} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
