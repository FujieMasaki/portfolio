import type { CSSProperties } from "react";
import AmbientRoot from "@/components/museum/AmbientRoot";
import ArchPassage from "./ArchPassage";
import ParallaxStage from "./ParallaxStage";
import { ROOMS, ROOMS_MEDIA, TOP_AMBIENT_VARIABLES } from "./scene";
import styles from "./TopHero.module.css";
import TopScene from "./TopScene";

/**
 * TOP のヒーロー。海辺の小さな私設美術館の入口として、3つのアーチを About / Work / Contact の入口にする。
 *
 * レイヤー（奥 → 手前）:
 *   1. sky        海と空（雲の流れ・海の揺らぎ・水平線の霞・ときどき遠くを横切る燕とコウモリを含む。Sky.tsx）
 *   2. plantsBack 前景植物の全体（建物の背後に回る木立をここで見せる）。アダン・ソテツ・クワズイモの葉が風で揺れる（ForegroundPlants）
 *   3. arch       アーチ内の展示室と、Contact の窓辺（＋ hover のスモークと GO TO の案内）。
 *                 Contact の画像は窓を透過していて、1 の空と海がそのまま覗く
 *   4. building   建物本体（開口部は透過）。素地・陰・奥行き・植物の影・夕方の光の5枚を重ねる（LayeredBuilding）
 *   5. plantsFront 前景植物のうち建物より手前の茂みだけ（マスクで切り出し）
 *   6. atmosphere 周辺減光と、時間帯の空気の色
 *   7. archSigns  アーチ上部の部屋名（ABOUT / WORK / CONTACT）
 *
 * 1〜7 は .lens にまとめ（TopScene）、アーチの hover で、景色ごとまっすぐ前へわずかに近づく（館名は動かさない）。
 * 縦長のスマホ（scene.ts の ROOMS_MEDIA）では、同じ舞台をアーチごとの部屋に置き、アーチ1つずつのアップを縦に並べる。
 *
 * 光・霞・室内灯・空気は訪問者のローカル時刻で変わる（AmbientRoot が scene.ts の TOP_AMBIENT_VARIABLES を
 * CSS 変数として流し、TopHero.module.css の「時間帯の光」が各レイヤーの filter や色に使う）。建物・植物・アーチの形と配置は時間帯で変えない。
 *
 * 館名と舞台を ArchPassage で包み、アーチを選んだときに、舞台の上へ通り抜ける遷移の窓を重ねる。
 */
const TopHero = () => {
  return (
    <AmbientRoot
      as="section"
      className={styles.hero}
      labelledBy="top-title"
      variables={TOP_AMBIENT_VARIABLES}
    >
      {/* アーチを選んだときに、開口部が画面いっぱいに広がって次の部屋へ通り抜ける（館名と舞台を包む） */}
      <ArchPassage>
        {/* 読み上げ・Tab の順で、館名がメニューより先に来るよう舞台より前に置く（見た目は absolute で左下） */}
        <header className={styles.plaque}>
          <h1 className={styles.name} id="top-title">
            Masaki Fujie
          </h1>
          <p className={styles.role}>Web Engineer</p>
        </header>

        {/* 768px 以上などの舞台。スマホ幅の部屋の条件（ROOMS_MEDIA）では隠し、下の部屋を見せる */}
        <ParallaxStage className={`${styles.stage} ${styles.mainStage}`}>
          {/* 舞台の全レイヤーを1枚にまとめ、アーチの hover で景色ごとまっすぐ前へわずかに近づける */}
          <TopScene motionMedia={`not all and ${ROOMS_MEDIA}`} water flyby />
        </ParallaxStage>

        {/*
          スマホ幅の部屋：アーチ1つずつのアップを、About → Work → Contact と縦に並べる（ROOMS_MEDIA のときだけ見せる）。
          部屋ごとに同じ舞台を置き、その部屋のアーチだけを入口にする。メニューの名前は部屋を包むこの nav に付ける
        */}
        <nav className={styles.rooms} aria-label="メインメニュー">
          {ROOMS.map((room, index) => (
            <div
              key={room.arch.id}
              className={styles.room}
              data-room={room.arch.id}
              style={{ "--room-cx": room.centerX, "--room-top": room.top } as CSSProperties}
            >
              <ParallaxStage className={styles.stage}>
                <TopScene
                  focus={room.arch.id}
                  archesAs="div"
                  motionMedia={ROOMS_MEDIA}
                  // 窓から海が見えるのは Contact だけ、空が見えるのは最初の About だけ
                  water={room.arch.id === "contact"}
                  flyby={index === 0}
                />
              </ParallaxStage>
              {/* 下へ続くことの目印。動かさない（常に動いている UI にしない） */}
              {index === 0 && (
                <span className={styles.scrollCue} aria-hidden="true">
                  Scroll
                </span>
              )}
            </div>
          ))}
        </nav>
      </ArchPassage>

      {/* JS が動かない環境では、画像を待つフェードインをせず舞台をそのまま見せる */}
      <noscript>
        {/* .stage:not([data-ready]) と同じ詳細度にし、後に出るこちらを勝たせる */}
        <style>{`.${styles.stage}:not([data-ready]){opacity:1;visibility:visible;animation:none}`}</style>
      </noscript>
    </AmbientRoot>
  );
};

export default TopHero;
