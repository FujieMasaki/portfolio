import Image from "next/image";
import WindSway from "@/components/museum/WindSway";
import ArchEntrance from "./ArchEntrance";
import ArchPassage from "./ArchPassage";
import ArchSigns from "./ArchSigns";
import ParallaxStage from "./ParallaxStage";
import Sky from "./Sky";
import {
  AMBIENTS,
  ARCHES,
  BUILDING,
  CANVAS,
  FOLIAGE_SWAY,
  FOREGROUND,
  toPercentBox,
  type AmbientId,
} from "./scene";
import styles from "./TopHero.module.css";

/** 舞台の幅に合わせた前景植物の sizes（縦長・正方形に近い窓は 200vw、横長は 100vw） */
const PLANTS_SIZES =
  "(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, (max-aspect-ratio: 4/3) 200vw, 100vw";

type Props = {
  /** 時間帯演出を足すときはここに現在の時間帯を渡す（scene.ts の AMBIENTS を参照） */
  ambient?: AmbientId;
};

/**
 * TOP のヒーロー。海辺の小さな私設美術館の入口として、3つのアーチを About / Work / Contact の入口にする。
 *
 * レイヤー（奥 → 手前）:
 *   1. sky        海と空（雲の流れ・海の揺らぎ・水平線の霞を含む。Sky.tsx）
 *   2. plantsBack 前景植物の全体（建物の背後に回る木立をここで見せる。揺らす枝・葉を抜いたベース）
 *      swayBack   建物の奥で揺らす枝・葉（scene.ts の FOLIAGE_SWAY.back）
 *   3. arch       アーチ内の展示室・ツバメ（＋ hover のスモークと GO TO の案内）
 *   4. building   建物本体（開口部は透過）
 *   5. plantsFront 前景植物のうち建物より手前の茂みだけ（マスクで切り出し）
 *      swayFront  建物より手前で揺らす枝・葉（scene.ts の FOLIAGE_SWAY.front）
 *   6. atmosphere 周辺減光と夕方の光
 *   7. archSigns  アーチ上部の部屋名（ABOUT / WORK / CONTACT）
 *
 * 舞台の上に、アーチを通り抜ける遷移の窓（ArchPassage）を重ねる。
 */
const TopHero = ({ ambient = "evening" }: Props) => {
  const { background, backgroundFilter, buildingFilter, sceneFilter } =
    AMBIENTS[ambient];

  return (
    <section className={styles.hero} aria-labelledby="top-title">
      {/* 読み上げ・Tab の順で、館名がメニューより先に来るよう舞台より前に置く（見た目は absolute で左下） */}
      <header className={styles.plaque}>
        <h1 className={styles.name} id="top-title">
          Masaki Fujie
        </h1>
        <p className={styles.role}>Web Engineer</p>
      </header>

      <ParallaxStage className={styles.stage}>
        <Sky background={background} backgroundFilter={backgroundFilter} />

        <div
          className={styles.plantsBack}
          style={{ ...toPercentBox(FOREGROUND), filter: sceneFilter }}
          aria-hidden="true"
        >
          <Image
            src="/images/top/top-plants-base.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes={PLANTS_SIZES}
          />
        </div>

        <div
          className={styles.swayBack}
          style={{ ...toPercentBox(FOREGROUND), filter: sceneFilter }}
          aria-hidden="true"
        >
          <div className={styles.swayShift}>
            <WindSway canvas={CANVAS} branches={FOLIAGE_SWAY.back} sizes={PLANTS_SIZES} />
          </div>
        </div>

        <nav className={styles.arches} aria-label="メインメニュー">
          {ARCHES.map((arch) => (
            <ArchEntrance
              key={arch.id}
              arch={arch}
              background={background}
              backgroundFilter={backgroundFilter}
            />
          ))}
        </nav>

        <div
          className={styles.building}
          style={{ ...toPercentBox(BUILDING), filter: buildingFilter }}
          aria-hidden="true"
        >
          <Image
            src="/images/top/top-building-arches.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-aspect-ratio: 6/7) 160vw, (max-width: 700px) 160vw, (max-aspect-ratio: 4/3) 160vw, 80vw"
          />
        </div>

        <div
          className={styles.plantsFront}
          style={{ ...toPercentBox(FOREGROUND), filter: sceneFilter }}
          aria-hidden="true"
        >
          <Image
            src="/images/top/top-plants-base.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes={PLANTS_SIZES}
          />
        </div>

        <div
          className={styles.swayFront}
          style={{ ...toPercentBox(FOREGROUND), filter: sceneFilter }}
          aria-hidden="true"
        >
          <div className={styles.swayShift}>
            <WindSway canvas={CANVAS} branches={FOLIAGE_SWAY.front} sizes={PLANTS_SIZES} />
          </div>
        </div>

        <div className={styles.atmosphere} aria-hidden="true" />

        <ArchSigns />
      </ParallaxStage>

      {/* アーチを選んだときに、開口部が画面いっぱいに広がって次の部屋へ通り抜ける */}
      <ArchPassage />

      {/* JS が動かない環境では、画像を待つフェードインをせず舞台をそのまま見せる */}
      <noscript>
        {/* .stage:not([data-ready]) と同じ詳細度にし、後に出るこちらを勝たせる */}
        <style>{`.${styles.stage}:not([data-ready]){opacity:1;visibility:visible;animation:none}`}</style>
      </noscript>
    </section>
  );
};

export default TopHero;
