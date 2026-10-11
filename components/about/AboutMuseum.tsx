import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import CareerPath from "./CareerPath";
import styles from "./AboutMuseum.module.css";

/**
 * /about の展示室。TOP の左のアーチから入った先に、同じ壁が続く3つの展示がある。
 *
 *   01 Personal Archive  人物展示（壁・文章・額装した写真・植物だけ）
 *   02 Path              記録の展示（写真を横に掛け並べ、時間の順にたどる）
 *   03 Things I'm Drawn To.  収蔵品の展示（低い展示台に実物を置く）
 *
 * 壁（about-wall.webp）は .museum に1枚だけ敷き、セクションごとに背景を変えない。
 * 01 は読み込み時に一度だけ現れる。02 / 03 の展示は CSS の scroll-driven animation で現れ、対応していないブラウザと
 * prefers-reduced-motion では最初から全部見える（AboutMuseum.module.css の [data-reveal]）。
 */
export default function AboutMuseum() {
  return (
    <div className={styles.museum}>
      <MuseumNav current="about" />

      <main>
        <section className={styles.archive} aria-labelledby="archive-title">
          <div className={styles.archiveText}>
            <h1 className={styles.heading} id="archive-title">
              <span className={styles.eyebrow}>About</span>
              <span className={styles.roomTitle}>Personal Archive</span>
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
                priority
                sizes="(max-width: 760px) 62vw, (max-width: 1417px) 24vw, 340px"
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
              sizes="(max-width: 760px) 40vw, (max-width: 1572px) 21vw, 330px"
            />
          </div>
        </section>

        <CareerPath />
      </main>
    </div>
  );
}
