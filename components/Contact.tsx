import Image from "next/image";
import styles from "./Contact.module.css";

const CONTACT_EMAIL = "contact@masakifujie.com";

export default function Contact() {
  return (
    <section className={styles.section} aria-label="Contact" id="contact">
      <div className={styles.grid}>
        <div className={styles.textBlock}>
          <p className={styles.eyebrow}>CONTACT</p>
          <p className={styles.statement}>
            一緒にプロダクトをつくることや、
            <br />
            体験について考える仕事に興味があります。
          </p>
          <p className={styles.supporting}>
            仕事の相談や、
            <br />
            個人開発についてのメッセージも歓迎しています。
          </p>
          <a className={styles.button} href={`mailto:${CONTACT_EMAIL}`}>
            メールを送る
            <span className={styles.buttonArrow} aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className={styles.photoFrame}>
          <Image
            src="/images/contact-seascape.png"
            alt=""
            fill
            sizes="(max-width: 860px) 100vw, 50vw"
            style={{ objectFit: "cover", objectPosition: "40% center" }}
          />
        </div>
      </div>
    </section>
  );
}
