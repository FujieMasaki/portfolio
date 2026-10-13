import Image from "next/image";
import shared from "./AboutMuseum.module.css";
import styles from "./Personal.module.css";

/**
 * ABOUT / Masaki Fujie：人物そのものを見る展示。壁に文章、文章の近くに額装した写真、右端の床に鉢ごと置いた植物だけを置く。
 * 入った直後に見える展示なので、スクロールではなく読み込み時に一度だけ現れる（Personal.module.css の arrive）。
 */
const Personal = () => {
  return (
    <section className={styles.archive} aria-labelledby="person-title">
      <div className={styles.archiveText}>
        <h1 className={shared.heading} id="person-title">
          <span className={shared.eyebrow}>About</span>
          <span className={shared.roomTitle}>Masaki Fujie</span>
        </h1>
        <p className={shared.lead}>
          沖縄で暮らしながら、
          <br />
          つくること、考えること、
          <br />
          感じることを大切にしています。
        </p>
        <p className={styles.place}>Okinawa, Japan</p>
      </div>

      <figure className={styles.portrait}>
        <div className={`${shared.frame} ${styles.portraitFrame}`}>
          <Image
            src="/images/about/about-me.webp"
            alt="沖縄の海辺で、海に向かって砂浜を歩く後ろ姿"
            fill
            // 入ってすぐ目に入る展示なので、TOP の舞台の画像と同じく最優先で読む
            loading="eager"
            fetchPriority="high"
            sizes="(max-width: 760px) 62vw, (max-width: 923px) 240px, (max-width: 1538px) 26vw, 400px"
            className={shared.photo}
          />
        </div>
      </figure>

      <div className={styles.plant} aria-hidden="true">
        <Image
          src="/images/about/about-alocasia-plant.png"
          alt=""
          width={1150}
          height={1368}
          // 幅の狭い画面は min(44vw, 200px)、広い画面は clamp(200px, 24vw, 400px)
          sizes="(max-width: 454px) 44vw, (max-width: 833px) 200px, (max-width: 1666px) 24vw, 400px"
        />
      </div>
    </section>
  );
};

export default Personal;
