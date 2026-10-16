import Image from "next/image";
import ambientStyles from "@/components/museum/ambient.module.css";
import SeaSkyMotion from "@/components/museum/SeaSkyMotion";
import styles from "./TopHero.module.css";

type Props = {
  background: string;
};

// 縦横比 4/3 以下の横長（正方形に近い窓など）でも、舞台は約 207vw まで広がる
const SIZES = "(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, (max-aspect-ratio: 4/3) 200vw, 110vw";

/**
 * 海と空のレイヤー。
 *
 *   seaSky 動く海（いちばん奥。Water.js）・静止画の空と海・流れ続ける雲（SeaSkyMotion。/contact と共有）
 *   glaze  時間帯の光の色（朝の青み・昼の空色・夜の濃紺）。夕方は透明で、背景の色をそのまま見せる
 *   haze   水平線付近と建物の左右奥にだけ、ごく薄くかかる湿った空気
 *
 * 時間帯による色調補正（filter）・glaze の色・haze の濃さは、AmbientRoot が流す CSS 変数で決まる
 * （海と空の光は /contact と共有。components/museum/seaSky.ts）。
 * 同じ src なので画像の取得は1回で済む。
 */
const Sky = ({ background }: Props) => {
  const image = (
    <Image
      src={background}
      alt=""
      fill
      loading="eager"
      fetchPriority="high"
      sizes={SIZES}
    />
  );

  return (
    <div className={styles.sky} aria-hidden="true">
      <SeaSkyMotion image={image} />
      <div className={ambientStyles.glaze} />
      <div className={styles.haze} />
    </div>
  );
};

export default Sky;
