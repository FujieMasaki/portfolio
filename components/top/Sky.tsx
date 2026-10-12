import Image from "next/image";
import styles from "./TopHero.module.css";

type Props = {
  background: string;
  backgroundFilter: string;
};

// 縦横比 4/3 以下の横長（正方形に近い窓など）でも、舞台は約 207vw まで広がる
const SIZES = "(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, (max-aspect-ratio: 4/3) 200vw, 110vw";

/**
 * 海と空のレイヤー。背景は1枚絵なので、同じ画像を水平線で上下に切り分けた写しを重ねて動かす。
 *
 *   base   元の画像（静止）。写しが動いても隙間が見えないよう常に下に敷く
 *   clouds 水平線より上だけの写し。ごくゆっくり横へ往復させ、時間の流れの気配にする
 *   sea    水平線より下だけの写し。水平線を支点にわずかに伸縮させ、呼吸するような揺らぎにする
 *   haze   水平線付近と建物の左右奥にだけ、ごく薄くかかる湿った空気
 *
 * 同じ src なので画像の取得は1回で済む。
 */
const Sky = ({ background, backgroundFilter }: Props) => {
  const image = (
    <Image
      src={background}
      alt=""
      fill
      loading="eager"
      fetchPriority="high"
      sizes={SIZES}
      style={{ filter: backgroundFilter }}
    />
  );

  return (
    <div className={styles.sky} aria-hidden="true">
      {image}
      <div className={styles.clouds}>{image}</div>
      <div className={styles.sea}>{image}</div>
      <div className={styles.haze} />
    </div>
  );
};

export default Sky;
