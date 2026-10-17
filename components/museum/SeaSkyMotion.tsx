import type { ReactNode } from "react";
import SeaWater from "./seaWater/SeaWater";
import styles from "./seaMotion.module.css";

/** 雲のタイル（seaMotion.module.css の .cloudStrip の背景と同じ URL） */
const CLOUD_TILE = "/images/top/sea-sky-cloud-tile.jpg";

type Props = {
  /** 海と空の静止画（next/image の fill）。ページごとの sizes で作り、ここで3回使う（取得は1回） */
  image: ReactNode;
  /**
   * 水面（SeaWater）を描く条件の media query。省くと常に描き、null なら描かない
   * （TOP のスマホ幅のように、同じ海を別の舞台にも置き、水面は見える舞台の1つでだけ動かすときに使う）
   */
  waterMedia?: string | null;
};

/**
 * 海と空（TOP と /contact で共有）。ページの空の箱いっぱいに、奥 → 手前の順に重ねる。
 *
 *   water     three の Water.js で描く穏やかな水面（SeaWater）。いちばん奥に、水平線より下にだけ敷く
 *   skyStill  静止画の水平線より上。水平線の線もこの画像のものを見せ、奥の海の上端をなじませる
 *   seaStill  静止画の海。水面が描き始めたら薄くなり、写真の質感を残したまま水面の動きを見せる。使えないときは残り、
 *             水平線を支点にわずかに伸縮する写し（breath）で、呼吸するような揺らぎだけを足す
 *   clouds    水平線より上。左右がつながる空のタイルを、一方向へごくゆっくり流し続ける（CSS だけ）
 *
 * 位置と色の合わせ方は seaMotion.module.css。/contact の左右反転は、ページ側の反転の箱の中に置けばそのままかかる。
 */
const SeaSkyMotion = ({ image, waterMedia }: Props) => (
  <>
    {waterMedia !== null && <SeaWater media={waterMedia} />}
    <div className={styles.skyStill}>{image}</div>
    <div className={styles.seaStill}>
      {image}
      <div className={styles.breath}>{image}</div>
    </div>
    {/* 雲のタイルは CSS の背景なので、舞台を出す前に読み終えるよう ParallaxStage に URL を渡す */}
    <div className={styles.clouds} data-await-images={CLOUD_TILE} aria-hidden="true">
      <div className={styles.cloudFrame}>
        <div className={styles.cloudStrip} />
      </div>
    </div>
  </>
);

export default SeaSkyMotion;
