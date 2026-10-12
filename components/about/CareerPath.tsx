"use client";

import type { CSSProperties } from "react";
import CareerEntry from "./CareerEntry";
import { THUMB } from "./careerPosition";
import { CAREER } from "./content";
import useCareerDrag from "./useCareerDrag";
import useCareerTrack from "./useCareerTrack";
import shared from "./AboutMuseum.module.css";
import styles from "./CareerPath.module.css";

/**
 * ABOUT / Career。これまで通ってきた場所を、壁に横へ掛け並べた写真としてたどる。
 *
 * 横の移動はブラウザのスクロールを土台にする（トラックパッドの横の操作・横スワイプ・矢印キーはそのまま）。
 * マウスでも壁沿いに歩いて見ていけるように、次の4つを足す。
 *   - 展示の上で回した縦のホイールを、横の移動に使う（useCareerTrack）
 *   - 壁をつかんで横へ引く（useCareerDrag）
 *   - 下の細い線の上を動く短い光（展示1つ分の幅）で、いまどこにいるかを示す。線はつかんで動かせる（useCareerTrack・useCareerDrag）
 *   - ← → で隣の展示へ進む（useCareerTrack）
 * 位置の計算は careerPosition、展示1点の表示は CareerEntry にある。
 * 幅の狭い画面では縦に並べ、線とボタンは出さない（CSS）。
 */
const CareerPath = () => {
  const { sectionRef, trackRef, edge, step, stopWheelGlide } = useCareerTrack();
  const { ruleRef, trackHandlers, ruleHandlers } = useCareerDrag(trackRef, stopWheelGlide);

  return (
    <section
      ref={sectionRef}
      className={styles.path}
      style={{ "--thumb": THUMB } as CSSProperties}
      aria-labelledby="career-title"
    >
      <header className={shared.sectionHeader} data-reveal>
        <h2 className={shared.heading} id="career-title">
          <span className={shared.eyebrow}>About</span>
          <span className={shared.roomTitle}>Career</span>
        </h2>
        <p className={shared.lead}>
          人や場所に関わる仕事と、
          <br />
          プロダクト開発を経験してきました。
        </p>
      </header>

      <div
        ref={trackRef}
        className={styles.track}
        // 展示は横に流れる中にあるので、1点ずつではなく列全体を一度に現す
        data-reveal
        // 横にスクロールできる範囲なので、キーボードでもフォーカスして矢印キーで動かせるようにする
        tabIndex={0}
        role="region"
        aria-label="これまでの場所"
        {...trackHandlers}
      >
        <ol className={styles.rail}>
          {CAREER.map((exhibit) => (
            <CareerEntry key={exhibit.number} exhibit={exhibit} />
          ))}
        </ol>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.step}
          data-direction="prev"
          onClick={() => step(-1)}
          // disabled にすると、押してフォーカスがあるボタンからフォーカスが外れて見失うので aria-disabled にする
          aria-disabled={edge.start}
          aria-label="前の展示へ"
        >
          ←
        </button>
        {/* スクロールバーの代わりの線。キーボードでは壁（track）と ← → で同じことができるので、読み上げからは外す */}
        <span
          ref={ruleRef}
          className={styles.rule}
          aria-hidden="true"
          {...ruleHandlers}
        >
          <span className={styles.ruleThumb} />
        </span>
        <button
          type="button"
          className={styles.step}
          data-direction="next"
          onClick={() => step(1)}
          aria-disabled={edge.end}
          aria-label="次の展示へ"
        >
          →
        </button>
      </div>
    </section>
  );
};

export default CareerPath;
