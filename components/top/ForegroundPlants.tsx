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

/**
 * 舞台の幅のうち ratio の割合で描く画像の sizes。
 * 舞台の幅は、幅 767px 以下の縦長（縦横比 6/7 以下か幅 700px 以下）と縦横比 4/3 以下の横長で 200vw、
 * それ以外では画面の比率により 100〜約135vw になる（ArchEntrance の interiorSizes と同じ）
 */
const sizes = (ratio: number) => {
  const narrow = `${Math.ceil(ratio * 200)}vw`;
  return `(max-width: 700px) ${narrow}, (max-width: 767px) and (max-aspect-ratio: 4/3) ${narrow}, ${Math.ceil(ratio * 135)}vw`;
};

/**
 * 揺らす葉1枚。画像は葉のまわりの範囲（box）だけを切り出したもので、その範囲を層にして回す
 * （キャンバス全体の画像を透明な余白ごと回すと、層が舞台の全面になり、decode したメモリも大きい）。
 */
const Sway = ({ sway, outer }: { sway: PlantSway; outer: Rect }) => {
  return (
    <div
      className={styles.sway}
      data-sway={sway.id}
      data-shape={sway.shape}
      style={swayStyle(sway, outer)}
    >
      {/* 葉が抜けたベースだけが先に見えないよう、舞台はこの画像も待ってから現れる（ParallaxStage） */}
      <Image
        src={sway.src}
        alt=""
        fill
        loading="eager"
        fetchPriority="high"
        sizes={sizes(sway.box.width / CANVAS.width)}
      />
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
        sizes={sizes(1)}
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
