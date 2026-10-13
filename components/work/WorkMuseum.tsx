import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import NextRoom from "@/components/museum/NextRoom";
import shared from "@/components/about/AboutMuseum.module.css";
import Projects from "./Projects";
import Publishing from "./Publishing";
import Studies from "./Studies";
import styles from "./WorkMuseum.module.css";

/**
 * /work の展示室。ABOUT の Interests の先の床を歩いて入る、同じ壁が続く部屋。
 *
 *   WORK              部屋の札。右上から、窓の外の植物が見切れて入り、壁に淡い葉の影を落とす
 *   01 Publishing     書いてきたもの（Zenn・note の記事を、壁に書いた目録のように並べる）
 *   02 Projects       今つくっているもの（低い棚に実機を置く）
 *   03 Personal Studies  体験と空想をまとめる場所（壁に掛けた2枚の説明板）
 *
 * 壁・文字・札・床・現れ方（[data-reveal]）は /about と同じもの（AboutMuseum.module.css）を使い、部屋ごとに別の体系を作らない。
 * 動くのは右上の植物と葉の影だけで、風に揺れるくらいのごく遅い動きにする（prefers-reduced-motion では止める）。
 */
const WorkMuseum = () => {
  return (
    <div className={`${shared.museum} ${styles.work}`}>
      <MuseumNav current="work" />

      <main>
        <section className={styles.intro} aria-labelledby="work-title">
          <div className={styles.introText}>
            <h1 className={`${shared.heading} ${styles.ruled}`} id="work-title">
              <span className={`${shared.roomTitle} ${styles.introTitle}`}>Work</span>
            </h1>
            <p className={shared.lead}>つくったもの、学んだこと、考えていること。</p>
          </div>

          {/* 窓の外の植物。葉の影（同じ画像を暗くぼかしたもの）を先に描き、壁に落ちているように見せる */}
          <div className={styles.canopy} aria-hidden="true">
            <Image
              src="/images/work/work-plant-top-right.png"
              alt=""
              width={1536}
              height={1024}
              sizes="(max-width: 760px) 92vw, 44vw"
              className={styles.leafShadow}
            />
            <Image
              src="/images/work/work-plant-top-right.png"
              alt=""
              width={1536}
              height={1024}
              // 入ってすぐ目に入る位置にある
              loading="eager"
              sizes="(max-width: 760px) 92vw, 44vw"
              className={styles.leaves}
            />
          </div>
        </section>

        <Publishing />
        <Projects />
        <Studies />

        <div className={styles.floor}>
          <NextRoom href="/contact" title="Contact" className={styles.nextRoom} />
        </div>
      </main>
    </div>
  );
};

export default WorkMuseum;
