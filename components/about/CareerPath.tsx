"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
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
 * 位置の計算は careerPosition にある。
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
            <li
              key={exhibit.number}
              className={styles.exhibit}
              data-exhibit
              data-text-only={exhibit.photo ? undefined : ""}
            >
              <div className={styles.label}>
                <p className={styles.number}>
                  <span className={styles.index}>{exhibit.number}</span>
                  <span className={styles.period}>{exhibit.period}</span>
                </p>
                <h3 className={styles.place}>{exhibit.title}</h3>
                {exhibit.paragraphs.map((lines) => (
                  <p key={lines[0]} className={styles.note}>
                    {lines.map((line, index) => (
                      <span key={line}>
                        {index > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                ))}
              </div>

              {exhibit.photo && (
                // 写真を掛ける場所。幅の狭い画面では大きさをそろえた枠にし、写真は元の縦横比のまま中央に掛ける
                <div className={styles.media}>
                  <div
                    className={`${shared.frame} ${styles.frame}`}
                    // 幅の狭い画面では、写真の縦横比（--ratio）のまま額を作る
                    style={{ "--ratio": exhibit.photo.width / exhibit.photo.height } as CSSProperties}
                    // 広い画面では、縦長の写真は 3:4、横長は 5:4 の額に収める（大きさをそろえすぎず、均等な並びにしない）
                    data-orientation={
                      exhibit.photo.width < exhibit.photo.height ? "portrait" : "landscape"
                    }
                  >
                    <Image
                      src={exhibit.photo.src}
                      alt={exhibit.photo.alt}
                      fill
                      sizes="(max-width: 760px) 84vw, 400px"
                      className={`${shared.photo} ${styles.memory}`}
                      // 壁をつかんで引くときに、画像そのものをドラッグしない
                      draggable={false}
                      style={{ objectPosition: exhibit.photo.position }}
                    />
                  </div>
                </div>
              )}
            </li>
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
