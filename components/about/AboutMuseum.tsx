import MuseumNav from "@/components/museum/MuseumNav";
import CareerPath from "./CareerPath";
import Interests from "./Interests";
import Personal from "./Personal";
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
 * 3つの展示はそれぞれ Personal・CareerPath・Interests にあり、ここでは壁と案内の上に順に並べるだけ。
 * Masaki Fujie は読み込み時に一度だけ現れる。Career / Interests の展示は CSS の scroll-driven animation で現れ、
 * 対応していないブラウザと prefers-reduced-motion では最初から全部見える（AboutMuseum.module.css の [data-reveal]）。
 */
const AboutMuseum = () => {
  return (
    <div className={styles.museum}>
      <MuseumNav current="about" />

      <main>
        <Personal />
        <CareerPath />
        <Interests />
      </main>
    </div>
  );
};

export default AboutMuseum;
