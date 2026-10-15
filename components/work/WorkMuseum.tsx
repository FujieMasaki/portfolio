import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import MuseumRoomNavigation from "@/components/museum/MuseumRoomNavigation";
import WindSway, { type SwayBranch } from "@/components/museum/WindSway";
import RevealOnce from "@/components/museum/RevealOnce";
import shared from "@/components/about/AboutMuseum.module.css";
import Projects from "./Projects";
import Studies from "./Studies";
import Writing from "./Writing";
import styles from "./WorkMuseum.module.css";

/** 窓の外の植物の素材（work-plant-base.png と、揺らす葉を切り出した元の1枚絵）の大きさ */
const CANOPY_CANVAS = { width: 1536, height: 1024 };
const CANOPY_SIZES = "(max-width: 760px) 92vw, 44vw";

/**
 * 風で揺らす葉（components/museum/WindSway）。窓の外の植物の1枚絵から、外側に垂れた葉の房を3つ切り出し、
 * その部分を抜いたベースに重ねる。位置と支点は元の1枚絵（work-plant-top-right.png。git の履歴にある）の px。
 * 周期は 25 秒前後で、房ごとに少しずつ変える。
 */
const CANOPY_SWAY: SwayBranch[] = [
  // 左上へ長く伸びた葉。枝の付け根を支点にする
  {
    src: "/images/work/work-plant-sway-01.png",
    rect: { x: 949, y: 79, width: 272, height: 322 },
    pivot: { x: 1195, y: 95 },
    angle: 0.35,
    duration: 24.8,
    delay: -4.2,
  },
  // 中ほどで左へ垂れた葉の房
  {
    src: "/images/work/work-plant-sway-02.png",
    rect: { x: 1004, y: 364, width: 307, height: 267 },
    pivot: { x: 1300, y: 465 },
    angle: 0.45,
    duration: 23.7,
    delay: -11.6,
  },
  // 下の方で垂れた長い葉
  {
    src: "/images/work/work-plant-sway-03.png",
    rect: { x: 1112, y: 534, width: 179, height: 247 },
    pivot: { x: 1262, y: 548 },
    angle: 0.5,
    duration: 26.1,
    delay: -18.9,
  },
];

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
 * 動くのは右上の植物の外側の葉と、その影だけで、風に揺れるくらいのごく遅い動きにする（prefers-reduced-motion では止める）。
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

          {/*
            窓の外の植物。葉の影（同じ植物を暗くぼかしたもの）を先に描き、壁に落ちているように見せる。
            影も同じ葉を同じように揺らし、葉と影が一緒に動くようにする
          */}
          <div className={styles.canopy} aria-hidden="true">
            <div className={styles.leafShadow}>
              <Image
                src="/images/work/work-plant-base.png"
                alt=""
                width={CANOPY_CANVAS.width}
                height={CANOPY_CANVAS.height}
                sizes={CANOPY_SIZES}
                className={styles.base}
              />
              <WindSway canvas={CANOPY_CANVAS} branches={CANOPY_SWAY} sizes={CANOPY_SIZES} />
            </div>
            <div className={styles.leaves}>
              <Image
                src="/images/work/work-plant-base.png"
                alt=""
                width={CANOPY_CANVAS.width}
                height={CANOPY_CANVAS.height}
                // 入ってすぐ目に入る位置にある
                loading="eager"
                sizes={CANOPY_SIZES}
                className={styles.base}
              />
              <WindSway canvas={CANOPY_CANVAS} branches={CANOPY_SWAY} sizes={CANOPY_SIZES} />
            </div>
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
