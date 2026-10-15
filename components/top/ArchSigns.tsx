import type { CSSProperties } from "react";
import Link from "next/link";
import { ARCHES, toPercentBox } from "./scene";
import styles from "./TopHero.module.css";

/**
 * 各アーチの真上に静かに取り付けた部屋名（ABOUT / WORK / CONTACT）。文字と上下の細線だけ。
 *
 * 建物・前景植物より手前に出すため、アーチのリンク（建物の奥にある）とは別の層に置く。
 * hover / focus の連動は、舞台（.stage）の :has() で ArchEntrance の状態を見て、
 * 選ばれた入口の部屋名だけ、文字と上下の線をわずかに濃くする。
 * hover の無い端末でも、この部屋名だけで入口だと分かるようにし、押せばその入口へ行ける。
 */
const ArchSigns = () => {
  return (
    <div className={styles.archSigns} aria-hidden="true">
      {ARCHES.map((arch) => (
        <div
          key={arch.id}
          className={styles.archSign}
          data-arch={arch.id}
          style={
            {
              ...toPercentBox(arch.body),
              // 縦長画面ではアーチが画面端にかかるので、プレートを開口部の中心に寄せる
              "--opening-center": `${
                ((arch.opening.x + arch.opening.width / 2 - arch.body.x) / arch.body.width) * 100
              }%`,
            } as CSSProperties
          }
        >
          {/*
            見えている部屋名を押しても入口へ行けるよう、同じ行き先のリンクにする。
            Tab と読み上げはアーチ側のリンクに任せ、こちらは重ねない。
          */}
          <Link href={arch.href} className={styles.archPlate} tabIndex={-1}>
            {arch.title}
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ArchSigns;
