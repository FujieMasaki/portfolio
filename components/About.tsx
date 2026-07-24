import Image from "next/image";
import styles from "./About.module.css";

export default function About() {
  return (
    <section className={styles.section} aria-label="About / My rhythm">
      <div className={styles.grid}>
        <div className={styles.aboutText}>
          <p className={styles.eyebrow}>ABOUT ME</p>
          <p className={styles.paragraph}>
            フロントエンドを軸に、
            <br />
            バックエンドや外部サービスとの連携まで、
            <br />
            プロダクトを形にするために必要な領域へ関わっています。
          </p>
          <p className={styles.paragraph}>
            技術だけではなく、
            <br />
            使う人がどう感じるか、
            <br />
            どのようなきっかけで前へ進めるかを考えながら、
            <br />
            プロダクトをつくっています。
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
          <p className={styles.eyebrow}>MY RHYTHM ｜ 日々のリズム</p>
          <p className={styles.paragraphSmall}>
            朝日を浴びながら海辺を歩き、
            <br />
            声に出して考えを整理することがあります。
          </p>
          <p className={styles.paragraphSmall}>
            一人で歩く時間や、
            <br />
            サウナ、お風呂の静かな時間が、
            <br />
            日々のものづくりにもつながっています。
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
