import type { CSSProperties } from "react";
import Image from "next/image";
import ArchEntrance from "./ArchEntrance";
import ArchSigns from "./ArchSigns";
import ParallaxStage from "./ParallaxStage";
import Sky from "./Sky";
import {
  AMBIENTS,
  ARCHES,
  BUILDING,
  FOLIAGE_SWAY,
  FOREGROUND,
  toPercentBox,
  type AmbientId,
} from "./scene";
import styles from "./TopHero.module.css";

type Props = {
  /** 時間帯演出を足すときはここに現在の時間帯を渡す（scene.ts の AMBIENTS を参照） */
  ambient?: AmbientId;
};

/**
 * TOP のヒーロー。海辺の小さな私設美術館の入口として、3つのアーチを About / Work / Contact の入口にする。
 *
 * レイヤー（奥 → 手前）:
 *   1. sky        海と空（雲の流れ・海の揺らぎ・水平線の霞を含む。Sky.tsx）
 *   2. plantsBack 前景植物の全体（建物の背後に回る木立をここで見せる）
 *   3. arch       アーチ内の展示室・ツバメ（＋ hover のスモークと GO TO の案内）
 *   4. building   建物本体（開口部は透過）
 *   5. plantsFront 前景植物のうち建物より手前の茂みだけ（マスクで切り出し）
 *      sway       風で揺らす枝・葉（scene.ts の FOLIAGE_SWAY。初期実装では空）
 *   6. atmosphere 周辺減光と夕方の光
 *   7. archSigns  アーチ上部の部屋名（ABOUT / WORK / CONTACT）
 */
export default function TopHero({ ambient = "evening" }: Props) {
  const { background, backgroundFilter, buildingFilter, sceneFilter } =
    AMBIENTS[ambient];

  return (
    <section className={styles.hero} aria-labelledby="top-title">
      {/* 読み上げ・Tab の順で、館名がメニューより先に来るよう舞台より前に置く（見た目は absolute で左下） */}
      <header className={styles.plaque}>
        <h1 className={styles.name} id="top-title">
          Masaki Fujie
        </h1>
        <p className={styles.role}>Product Engineer</p>
      </header>

      <ParallaxStage className={styles.stage}>
        <Sky background={background} backgroundFilter={backgroundFilter} />

        <div
          className={styles.plantsBack}
          style={{ ...toPercentBox(FOREGROUND), filter: sceneFilter }}
          aria-hidden="true"
        >
          <Image
            src="/images/top/top-foreground-tropical-plants.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-aspect-ratio: 6/7) 200vw, 100vw"
          />
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
            sizes="(max-aspect-ratio: 6/7) 160vw, 80vw"
          />
        </div>

        <div
          className={styles.plantsFront}
          style={{ ...toPercentBox(FOREGROUND), filter: sceneFilter }}
          aria-hidden="true"
        >
          <Image
            src="/images/top/top-foreground-tropical-plants.png"
            alt=""
            fill
            loading="eager"
            fetchPriority="high"
            sizes="(max-aspect-ratio: 6/7) 200vw, 100vw"
          />
        </div>

        {FOLIAGE_SWAY.map((layer) => (
          <div
            key={layer.src}
            className={styles.sway}
            style={
              {
                ...toPercentBox(layer.rect),
                filter: sceneFilter,
                transformOrigin: layer.origin,
                "--sway-angle": `${layer.angle}deg`,
                "--sway-duration": `${layer.duration}s`,
              } as CSSProperties
            }
            aria-hidden="true"
          >
            <Image src={layer.src} alt="" fill sizes="100vw" />
          </div>
        ))}

        <div className={styles.atmosphere} aria-hidden="true" />

        <ArchSigns />
      </ParallaxStage>

      {/* JS が動かない環境では、画像を待つフェードインをせず舞台をそのまま見せる */}
      <noscript>
        {/* .stage:not([data-ready]) と同じ詳細度にし、後に出るこちらを勝たせる */}
        <style>{`.${styles.stage}:not([data-ready]){opacity:1;visibility:visible;animation:none}`}</style>
      </noscript>
    </section>
  );
}
