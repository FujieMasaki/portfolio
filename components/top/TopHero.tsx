import Image from "next/image";
import ArchEntrance from "./ArchEntrance";
import ParallaxStage from "./ParallaxStage";
import {
  AMBIENTS,
  ARCHES,
  BUILDING,
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
 *   1. sky        海と空の背景
 *   2. plantsBack 前景植物の全体（建物の背後に回る岬・木立をここで見せる）
 *   3. arch       アーチ内の展示室・海への抜け（＋ hover の幕と案内文字）
 *   4. building   建物本体（開口部は透過）
 *   5. plantsFront 前景植物のうち建物より手前の茂みだけ（マスクで切り出し）
 *   6. atmosphere 周辺減光と夕方の光
 */
export default function TopHero({ ambient = "evening" }: Props) {
  const { background, backgroundFilter, buildingFilter, sceneFilter } =
    AMBIENTS[ambient];

  return (
    <section className={styles.hero} aria-label="Masaki Fujie">
      <ParallaxStage className={styles.stage}>
        <div className={styles.sky} aria-hidden="true">
          <Image
            src={background}
            alt=""
            fill
            priority
            sizes="(max-aspect-ratio: 4/5) 200vw, 110vw"
            style={{ filter: backgroundFilter }}
          />
        </div>

        <div
          className={styles.plantsBack}
          style={{ ...toPercentBox(FOREGROUND), filter: sceneFilter }}
          aria-hidden="true"
        >
          <Image
            src="/images/top/top-foreground-tropical-plants.png"
            alt=""
            fill
            priority
            sizes="(max-aspect-ratio: 4/5) 200vw, 100vw"
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
            priority
            sizes="(max-aspect-ratio: 4/5) 160vw, 80vw"
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
            priority
            sizes="(max-aspect-ratio: 4/5) 200vw, 100vw"
          />
        </div>

        <div className={styles.atmosphere} aria-hidden="true" />
      </ParallaxStage>

      <header className={styles.plaque}>
        <h1 className={styles.name}>Masaki Fujie</h1>
        <p className={styles.role}>Product Engineer</p>
      </header>
    </section>
  );
}
