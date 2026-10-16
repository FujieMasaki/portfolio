import Image from "next/image";
import type { CSSProperties } from "react";
import {
  CANVAS,
  PLANT_SWAY_GROUPS,
  PLANT_SWAYS,
  PLANTS_BASE,
  type PlantSway,
  type PlantSwayGroup,
} from "./scene";
import styles from "./TopHero.module.css";

type Rect = { x: number; y: number; width: number; height: number };

const STAGE: Rect = { x: 0, y: 0, ...CANVAS };

/** box を、外側の範囲 outer に対する % で置く */
const placeWithin = (box: Rect, outer: Rect) => ({
  left: `${((box.x - outer.x) / outer.width) * 100}%`,
  top: `${((box.y - outer.y) / outer.height) * 100}%`,
  width: `${(box.width / outer.width) * 100}%`,
  height: `${(box.height / outer.height) * 100}%`,
});

/** 揺れの支点・形・周期を style に渡す（形と傾きの計算は TopHero.module.css） */
const swayStyle = (sway: Omit<PlantSway, "src">, outer: Rect) => {
  const { box, pivot } = sway;
  return {
    ...placeWithin(box, outer),
    transformOrigin: `${((pivot.x - box.x) / box.width) * 100}% ${((pivot.y - box.y) / box.height) * 100}%`,
    animationDuration: `${sway.duration}s`,
    animationDelay: `${sway.delay}s`,
    "--sway-gain": sway.gain,
  } as CSSProperties;
};

/** 植物の画像はどれも舞台の全幅で描く */
const SIZES =
  "(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, (max-aspect-ratio: 4/3) 200vw, 100vw";

/**
 * 揺らす葉1枚。葉のまわりの範囲（box）だけを層にして回し、
 * その中にキャンバス全体の画像を元の位置に合わせて置く（透明な余白ごと回すと、層が舞台の全面になって重い）。
 */
const Sway = ({ sway, outer }: { sway: PlantSway; outer: Rect }) => {
  const { box } = sway;
  return (
    <div
      className={styles.sway}
      data-sway={sway.id}
      data-shape={sway.shape}
      style={swayStyle(sway, outer)}
    >
      <span
        className={styles.swayCanvas}
        style={{
          left: `${(-box.x / box.width) * 100}%`,
          top: `${(-box.y / box.height) * 100}%`,
          width: `${(CANVAS.width / box.width) * 100}%`,
          height: `${(CANVAS.height / box.height) * 100}%`,
        }}
      >
        {/* 葉が抜けたベースだけが先に見えないよう、舞台はこの画像も待ってから現れる（ParallaxStage） */}
        <Image src={sway.src} alt="" fill loading="eager" fetchPriority="high" sizes={SIZES} />
      </span>
    </div>
  );
};

/** 葉をまとめて、株や木ごとゆっくり傾ける入れ物 */
const SwayGroup = ({ group }: { group: PlantSwayGroup }) => {
  const members = PLANT_SWAYS.filter((sway) => group.members.includes(sway.id));
  return (
    <div
      className={styles.swayGroup}
      data-sway-group={group.id}
      data-shape={group.shape}
      style={swayStyle(group, STAGE)}
    >
      {members.map((sway) => (
        <Sway key={sway.id} sway={sway} outer={group.box} />
      ))}
    </div>
  );
};

const grouped = new Set(PLANT_SWAY_GROUPS.flatMap((group) => group.members));

/**
 * 前景植物。動かないベースの上に、風で揺らす葉を同じ位置で重ねる（重ねた静止状態は元の1枚と同じ見た目）。
 * 建物の背後（plantsBack）と手前（plantsFront、マスクで切り出し）の両方で同じものを描く。
 * マスクと時間帯の filter は外側の静止した入れ物にかかり、回るのは葉だけ。
 * PLANT_SWAY_GROUPS に入れた葉は SwayGroup にまとめ、株や木ごとゆっくり傾く上に、それぞれの揺れが重なる。
 */
const ForegroundPlants = () => {
  return (
    <>
      <Image
        src={PLANTS_BASE}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes={SIZES}
      />
      {PLANT_SWAY_GROUPS.map((group) => (
        <SwayGroup key={group.id} group={group} />
      ))}
      {PLANT_SWAYS.filter((sway) => !grouped.has(sway.id)).map((sway) => (
        <Sway key={sway.id} sway={sway} outer={STAGE} />
      ))}
    </>
  );
};

export default ForegroundPlants;
