import Image from "next/image";
import styles from "./Hero.module.css";

type NavLink = {
  label: string;
  href: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "About", href: "#about" },
  { label: "Career", href: "#career" },
  { label: "Interests", href: "#likes" },
  { label: "Contact", href: "#contact" },
];

export default function Hero() {
  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.media} aria-hidden="true">
        <Image
          src="/images/hero-sunrise.png"
          alt=""
          fill
          priority
          sizes="100vw"
          style={{ objectFit: "cover", objectPosition: "50% 40%" }}
        />
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
