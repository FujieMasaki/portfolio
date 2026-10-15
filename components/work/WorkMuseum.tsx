import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import MuseumRoomNavigation from "@/components/museum/MuseumRoomNavigation";
import RevealOnce from "@/components/museum/RevealOnce";
import shared from "@/components/about/AboutMuseum.module.css";
import Projects from "./Projects";
import Studies from "./Studies";
import Writing from "./Writing";
import styles from "./WorkMuseum.module.css";

/**
 * /work の展示室。ABOUT の Interests の先の床を歩いて入る、同じ壁が続く部屋。
 *
 *   WORK              部屋の札（部屋の名前・3つの展示の名前・短い文）。右上から、窓の外の植物が見切れて入り、壁に淡い葉の影を落とす
 *   Writing           書いてきたもの（Zenn・note の文章を、壁のキャプションのように数点ずつ掛ける）
 *   Projects          今つくっているもの（壁から張り出した薄い石の棚に実機を置く）
 *   Explorations      体験と空想をまとめる場所（壁に掛けた2枚の説明板。投稿ができるまでは準備中）
 *
 * 部屋の名前（WORK）は最初の札にだけ書き、展示の題（Writing など）には番号も部屋の名前も付けない（/about と同じ決まり）。
 * 最初の札の題は、/about の Masaki Fujie にあたるもので、この部屋で見る3つの展示の名前を並べる。
 * 壁・文字・札・床・現れ方（[data-reveal]）は /about と同じもの（AboutMuseum.module.css）を使い、部屋ごとに別の体系を作らない。
 * 右上の植物と葉の影は静止したまま置く（風の揺れは、枝・葉を自然に分けた素材ができてから改めて考える）。
 */
const WorkMuseum = () => {
  return (
    <div className={`${shared.museum} ${styles.work}`}>
      <MuseumNav current="work" />

      <main>
        <section className={styles.intro} aria-labelledby="work-title">
          <div className={styles.introText}>
            {/* /about の「ABOUT / Masaki Fujie」と同じ骨格。部屋の名前（WORK）の下に、この部屋で見るもの（3つの展示）を題として置く */}
            <h1 className={shared.heading} id="work-title">
              <span className={shared.eyebrow}>Work</span>
              <span className={`${shared.roomTitle} ${styles.subjects}`}>
                {/* 区切りの前は改行させない空白にし、折り返すときは「/」の後ろで切る */}
                Writing{"\u00a0"}
                <span className={styles.divider} aria-hidden="true">
                  /
                </span>{" "}
                Projects{"\u00a0"}
                <span className={styles.divider} aria-hidden="true">
                  /
                </span>{" "}
                Explorations
              </span>
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

      <RevealOnce />
    </div>
  );
};

export default WorkMuseum;
