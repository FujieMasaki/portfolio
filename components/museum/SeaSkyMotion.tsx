import type { ReactNode } from "react";
import SeaWater from "./seaWater/SeaWater";
import styles from "./seaMotion.module.css";

type Props = {
  /** 海と空の静止画（next/image の fill）。ページごとの sizes で作り、ここで3回使う（取得は1回） */
  image: ReactNode;
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
const SeaSkyMotion = ({ image }: Props) => (
  <>
    <SeaWater />
    <div className={styles.skyStill}>{image}</div>
    <div className={styles.seaStill}>
      {image}
      <div className={styles.breath}>{image}</div>
    </div>
    <div className={styles.clouds} aria-hidden="true">
      <div className={styles.cloudFrame}>
        <div className={styles.cloudStrip} />
      </div>
    </div>
  </>
);

export default SeaSkyMotion;
