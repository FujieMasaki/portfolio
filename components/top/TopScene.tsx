import LayeredBuilding from "@/components/museum/LayeredBuilding";
import { SEA_SKY_BACKGROUND } from "@/components/museum/seaSky";
import ArchEntrance from "./ArchEntrance";
import ArchSigns from "./ArchSigns";
import ForegroundPlants from "./ForegroundPlants";
import Sky from "./Sky";
import {
  ARCHES,
  BUILDING,
  BUILDING_LAYERS,
  CANVAS,
  FOREGROUND,
  roomsSizes,
  toPercentBox,
  type ArchId,
} from "./scene";
import styles from "./TopHero.module.css";

type Props = {
  /**
   * スマホ幅の部屋に置くとき、その部屋のアーチ。ほかのアーチと部屋名は画面の端にかかっても押せないようにする（inert）。
   * 省くと3つとも入口にする
   */
  focus?: ArchId;
  /**
   * 入口のまとまりの要素。舞台が1つなら nav にし、部屋ごとに舞台を置くときは、部屋を包む側を nav にして、ここは div にする
   * （同じ名前のメニューが3つ並ばないように）
   */
  archesAs?: "nav" | "div";
  /** 空の動き（燕・コウモリと水面）を付ける条件の media query。見えていない側の舞台では動かさない */
  motionMedia: string;
  /** 水面を描くか（スマホ幅では、窓から海が見える Contact の部屋だけで描く） */
  water: boolean;
  /** 燕・コウモリを飛ばすか（スマホ幅では、空の見える About の部屋だけで飛ばす） */
  flyby: boolean;
};

/** 建物の sizes。建物は舞台の幅の約 77% */
const BUILDING_SIZES = `${roomsSizes(BUILDING.width / CANVAS.width)}, (max-width: 700px) 160vw, (max-width: 767.98px) and (max-aspect-ratio: 4/3) 160vw, (max-aspect-ratio: 1672/941) 94vw, 80vw`;

/**
 * 舞台（.lens）の中のレイヤー（奥 → 手前の順は TopHero.tsx の説明のとおり）。
 * 768px 以上などの舞台と、スマホ幅の部屋の舞台（TopHero.tsx）の両方で、同じ中身をこの component で描く。
 */
const TopScene = ({ focus, archesAs: Arches = "nav", motionMedia, water, flyby }: Props) => {
  return (
    <div className={styles.lens}>
      <Sky background={SEA_SKY_BACKGROUND} motionMedia={motionMedia} water={water} flyby={flyby} />

      <div className={styles.plantsBack} style={toPercentBox(FOREGROUND)} aria-hidden="true">
        <ForegroundPlants />
      </div>

      <Arches className={styles.arches} aria-label={Arches === "nav" ? "メインメニュー" : undefined}>
        {ARCHES.map((arch) => (
          <ArchEntrance
            key={arch.id}
            arch={arch}
            background={SEA_SKY_BACKGROUND}
            inert={focus !== undefined && focus !== arch.id}
          />
        ))}
      </Arches>

      <LayeredBuilding
        layers={BUILDING_LAYERS}
        className={styles.building}
        style={toPercentBox(BUILDING)}
        sizes={BUILDING_SIZES}
      />

      <div className={styles.plantsFront} style={toPercentBox(FOREGROUND)} aria-hidden="true">
        <ForegroundPlants />
      </div>

      <div className={styles.atmosphere} aria-hidden="true" />

      <ArchSigns focus={focus} />
    </div>
  );
};

export default TopScene;
