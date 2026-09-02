import Image from "next/image";
import styles from "./About.module.css";

export default function About() {
  return (
    <section
      className={styles.section}
      aria-labelledby="about-title"
      id="about"
    >
      <div className={styles.grid}>
        <div className={styles.aboutText}>
          <h2 className={styles.eyebrow} id="about-title">
            ABOUT ME ｜ 私について
          </h2>
          <p className={styles.paragraph}>
            Webエンジニアとして、
            <br />
            フロントエンドを中心に、
            <br />
            プロダクト開発に関わっています。
          </p>
          <p className={styles.paragraph}>
            実装だけでなく、
            <br />
            使う人にとって何が必要かを考えながら、
            <br />
            仕様検討やUI改善にも取り組んでいます。
          </p>
        </div>

        <div className={`${styles.photoFrame} ${styles.photoPrimary}`}>
          <Image
            src="/images/about-beach-walk.png"
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 860px) 50vw, 33vw"
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>

        <div className={styles.rhythmText}>
          <p className={styles.paragraphSmall}>
            考えがまとまらないときは、
            <br />
            一度外に出て、歩きながら考えを整理します。
          </p>
        </div>

        <div className={`${styles.photoFrame} ${styles.photoSecondary}`}>
          <Image
            src="/images/about-workspace.png"
            alt=""
            fill
            sizes="(max-width: 600px) 100vw, (max-width: 860px) 50vw, 25vw"
            style={{ objectFit: "cover", objectPosition: "50% 55%" }}
          />
        </div>
      </div>
    </section>
  );
}
