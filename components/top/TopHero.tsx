import Image from "next/image";
import AmbientRoot from "@/components/museum/AmbientRoot";
import LayeredBuilding from "@/components/museum/LayeredBuilding";
import { SEA_SKY_BACKGROUND } from "@/components/museum/seaSky";
import ArchEntrance from "./ArchEntrance";
import ArchPassage from "./ArchPassage";
import ArchSigns from "./ArchSigns";
import ParallaxStage from "./ParallaxStage";
import Sky from "./Sky";
import {
  ARCHES,
  BUILDING,
  BUILDING_LAYERS,
  FOREGROUND,
  TOP_AMBIENT_VARIABLES,
  toPercentBox,
} from "./scene";
import styles from "./TopHero.module.css";

/**
 * TOP のヒーロー。海辺の小さな私設美術館の入口として、3つのアーチを About / Work / Contact の入口にする。
 *
 * レイヤー（奥 → 手前）:
 *   1. sky        海と空（雲の流れ・海の揺らぎ・水平線の霞・ときどき遠くを横切る燕とコウモリを含む。Sky.tsx）
 *   2. plantsBack 前景植物の全体（建物の背後に回る木立をここで見せる）
 *   3. arch       アーチ内の展示室と、Contact の半屋外の場所（＋ hover のスモークと GO TO の案内）。
 *                 Contact の画像は空と海を透過していて、1 の空と海がそのまま覗く
 *   4. building   建物本体（開口部は透過）。素地・陰・奥行き・植物の影・夕方の光の5枚を重ねる（LayeredBuilding）
 *   5. plantsFront 前景植物のうち建物より手前の茂みだけ（マスクで切り出し）
 *   6. atmosphere 周辺減光と、時間帯の空気の色
 *   7. archSigns  アーチ上部の部屋名（ABOUT / WORK / CONTACT）
 *
 * 光・霞・室内灯・空気は訪問者のローカル時刻で変わる（AmbientRoot が scene.ts の TOP_AMBIENT_VARIABLES を
 * CSS 変数として流し、TopHero.module.css の「時間帯の光」が各レイヤーの filter や色に使う）。建物・植物・アーチの形と配置は時間帯で変えない。
 *
 * 館名と舞台を ArchPassage で包み、アーチを選んだときに、舞台の上へ通り抜ける遷移の窓を重ねる。
 */
const TopHero = () => {
  return (
    <AmbientRoot
      as="section"
      className={styles.hero}
      labelledBy="top-title"
      variables={TOP_AMBIENT_VARIABLES}
    >
      {/* アーチを選んだときに、開口部が画面いっぱいに広がって次の部屋へ通り抜ける（館名と舞台を包む） */}
      <ArchPassage>
        {/* 読み上げ・Tab の順で、館名がメニューより先に来るよう舞台より前に置く（見た目は absolute で左下） */}
        <header className={styles.plaque}>
          <h1 className={styles.name} id="top-title">
            Masaki Fujie
          </h1>
          <p className={styles.role}>Web Engineer</p>
        </header>

        <ParallaxStage className={styles.stage}>
          <Sky background={SEA_SKY_BACKGROUND} />

          <div
            className={styles.plantsBack}
            style={toPercentBox(FOREGROUND)}
            aria-hidden="true"
          >
            <Image
              src="/images/top/top-foreground-tropical-plants.png"
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, (max-aspect-ratio: 4/3) 200vw, 100vw"
            />
          </div>

          <nav className={styles.arches} aria-label="メインメニュー">
            {ARCHES.map((arch) => (
              <ArchEntrance
                key={arch.id}
                arch={arch}
                background={SEA_SKY_BACKGROUND}
              />
            ))}
          </nav>

          <LayeredBuilding
            layers={BUILDING_LAYERS}
            className={styles.building}
            style={toPercentBox(BUILDING)}
            sizes="(max-aspect-ratio: 6/7) 160vw, (max-width: 700px) 160vw, (max-aspect-ratio: 4/3) 160vw, 80vw"
          />

          <div
            className={styles.plantsFront}
            style={toPercentBox(FOREGROUND)}
            aria-hidden="true"
          >
            <Image
              src="/images/top/top-foreground-tropical-plants.png"
              alt=""
              fill
              loading="eager"
              fetchPriority="high"
              sizes="(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, (max-aspect-ratio: 4/3) 200vw, 100vw"
            />
          </div>

          <div className={styles.atmosphere} aria-hidden="true" />

          <ArchSigns />
        </ParallaxStage>
      </ArchPassage>

      {/* JS が動かない環境では、画像を待つフェードインをせず舞台をそのまま見せる */}
      <noscript>
        {/* .stage:not([data-ready]) と同じ詳細度にし、後に出るこちらを勝たせる */}
        <style>{`.${styles.stage}:not([data-ready]){opacity:1;visibility:visible;animation:none}`}</style>
      </noscript>
    </AmbientRoot>
  );
};

export default TopHero;
