import { INTERVIEW } from "./content";
import shared from "./AboutMuseum.module.css";
import styles from "./CareerInterview.module.css";

/**
 * ABOUT / Career の後に添える、インタビューの札。
 * 経歴をたどり終えた壁の続きに、文字とリンクだけで置く（写真・カードは置かない）。
 * 見出しは Career（h2）の続きとして h3 にし、記事は新しいタブで開く。
 */
const CareerInterview = () => {
  const { title, description, link } = INTERVIEW;

  return (
    <section className={styles.interview} aria-labelledby="interview-title" data-reveal>
      <p className={shared.eyebrow}>Interview</p>
      <h3 className={styles.title} id="interview-title">
        {title}
      </h3>
      <p className={styles.description}>{description}</p>
      <a className={styles.link} href={link.href} target="_blank" rel="noopener noreferrer">
        {link.text}
        <svg className={styles.arrow} viewBox="0 0 10 10" aria-hidden="true">
          <path d="M1 9 9 1M3 1h6v6" />
        </svg>
        <span className={styles.visuallyHidden}>（新しいタブで開く）</span>
      </a>
    </section>
  );
};

export default CareerInterview;
