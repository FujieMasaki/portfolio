import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import CareerPath from "./CareerPath";
import Interests from "./Interests";
import styles from "./AboutMuseum.module.css";

/**
 * /about の展示室。TOP の左のアーチから入った先に、同じ壁が続く3つの展示がある。
 *
 *   ABOUT / Masaki Fujie  人物そのものを見る展示（壁・文章・額装した写真・床に置いた植物だけ）
 *   ABOUT / Career        これまで通ってきた時間と場所を見る展示（少し色褪せた写真を横に掛け並べる）
 *   ABOUT / Interests     今の自分を構成しているものを見る展示（低い展示台に実物を置く）
 *
 * 3つの札は同じ形（ABOUT ＋ 題 ＋ 短い日本語の文）にそろえる。
 *
 * 壁（about-wall.webp）は .museum に1枚だけ敷き、セクションごとに背景を変えない。床も同じ素材から作る。
 * Masaki Fujie は読み込み時に一度だけ現れる。Career / Interests の展示は CSS の scroll-driven animation で現れ、
 * 対応していないブラウザと prefers-reduced-motion では最初から全部見える（AboutMuseum.module.css の [data-reveal]）。
 */
const AboutMuseum = () => {
  return (
    <div className={styles.museum}>
      <MuseumNav current="about" />

      <main>
        <section className={styles.archive} aria-labelledby="person-title">
          <div className={styles.archiveText}>
            <h1 className={styles.heading} id="person-title">
              <span className={styles.eyebrow}>About</span>
              <span className={styles.roomTitle}>Masaki Fujie</span>
            </h1>
            <p className={styles.lead}>
              沖縄で暮らしながら、
              <br />
              つくること、考えること、
              <br />
              感じることを大切にしています。
            </p>
            <p className={styles.place}>Okinawa, Japan</p>
          </div>

          <figure className={styles.portrait}>
            <div className={`${styles.frame} ${styles.portraitFrame}`}>
              <Image
                src="/images/about/about-me.webp"
                alt="沖縄の海辺で、海に向かって砂浜を歩く後ろ姿"
                fill
                // 入ってすぐ目に入る展示なので、TOP の舞台の画像と同じく最優先で読む
                loading="eager"
                fetchPriority="high"
                sizes="(max-width: 760px) 62vw, (max-width: 923px) 240px, (max-width: 1538px) 26vw, 400px"
                className={styles.photo}
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

        <CareerPath />
        <Interests />
      </main>
    </div>
  );
};

export default AboutMuseum;
