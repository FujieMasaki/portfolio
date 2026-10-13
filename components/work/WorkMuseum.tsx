import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import MuseumRoomNavigation from "@/components/museum/MuseumRoomNavigation";
import shared from "@/components/about/AboutMuseum.module.css";
import Projects from "./Projects";
import Studies from "./Studies";
import Writing from "./Writing";
import styles from "./WorkMuseum.module.css";

/**
 * /work の展示室。ABOUT の Interests の先の床を歩いて入る、同じ壁が続く部屋。
 *
 *   WORK              部屋の札（部屋の名前と短い文）。右上から、窓の外の植物が見切れて入り、壁に淡い葉の影を落とす
 *   Writing           書いてきたもの（Zenn・note の文章を、壁のキャプションのように数点ずつ掛ける）
 *   Projects          今つくっているもの（壁から張り出した薄い石の棚に実機を置く）
 *   Personal Studies  体験と空想をまとめる場所（壁に掛けた2枚の説明板）
 *
 * 部屋の名前（WORK）は最初の札にだけ書き、展示の題（Writing など）には番号も部屋の名前も付けない（/about と同じ決まり）。
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
            {/* /about の「ABOUT」と同じ小さな展示室の札。この部屋には人物の名前のような題が無いので、短い文を札の主にする */}
            <h1 className={`${shared.eyebrow} ${styles.roomName}`} id="work-title">
              Work
            </h1>
            <p className={styles.statement}>
              つくったもの、
              <br />
              学んだこと、
              <br />
              考えていること。
            </p>
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

        <Writing />
        <Projects />
        <Studies />

        <div className={styles.floor}>
          <MuseumRoomNavigation
            previous={{ label: "Previous room", title: "About", href: "/about" }}
            next={{ label: "Next room", title: "Contact", href: "/contact" }}
            className={styles.roomNavigation}
          />
        </div>
      </main>
    </div>
  );
};

export default WorkMuseum;
