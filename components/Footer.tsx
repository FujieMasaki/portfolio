import styles from "./Footer.module.css";

type FooterLink = {
  label: string;
  href: string;
  external: boolean;
};

const FOOTER_LINKS: FooterLink[] = [
  { label: "Tech Notes", href: "https://zenn.dev/fujee", external: true },
  { label: "GitHub", href: "https://github.com/FujieMasaki", external: true },
  { label: "Blog", href: "https://note.com/fujee", external: true },
  { label: "Focus on Dot", href: "#", external: false },
];

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.name}>Masaki Fujie</span>
      <nav className={styles.nav} aria-label="Footer">
        {FOOTER_LINKS.map((link) => (
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
        ))}
      </nav>
      <span className={styles.copyright}>© 2026 Masaki Fujie</span>
    </footer>
  );
}
