import Image from "next/image";
import styles from "./Hero.module.css";

type NavLink = {
  label: string;
  href?: string;
  external?: boolean;
  disabled?: boolean;
};

const NAV_LINKS: NavLink[] = [
  { label: "Tech Notes", href: "https://zenn.dev/fujee", external: true },
  { label: "GitHub", href: "https://github.com/FujieMasaki", external: true },
  { label: "Blog", href: "https://note.com/fujee", external: true },
  { label: "Focus on Dot（準備中）", disabled: true },
  { label: "Contact", href: "#contact", external: false },
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
            {NAV_LINKS.map((link) =>
              link.disabled ? (
                <span key={link.label} className={styles.navLinkDisabled}>
                  {link.label}
                </span>
              ) : (
                <a
                  key={link.label}
                  className={styles.navLink}
                  href={link.href}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                >
                  {link.label}
                </a>
              ),
            )}
          </nav>
        </div>
      </div>
    </section>
  );
}
