import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import MuseumRoomNavigation from "@/components/museum/MuseumRoomNavigation";
import ParallaxStage from "@/components/top/ParallaxStage";
import shared from "@/components/about/AboutMuseum.module.css";
import styles from "./ContactMuseum.module.css";

const EMAIL = "masakifujie.work@gmail.com";

/**
 * 外の世界への案内。GitHub は旧 Footer・PlacesToKnowMe と同じ URL。X とメールアドレスは /contact を作るときに指定されたもの。
 * メールアドレスは文字では出さず、ほかと同じく名前だけのリンクにする（読み上げにはアドレスを添える）
 */
const LINKS = [
  { label: "Mail", href: `mailto:${EMAIL}`, hint: `（${EMAIL}）` },
  { label: "GitHub", href: "https://github.com/FujieMasaki", hint: "（新しいタブで開く）", newTab: true },
  { label: "X", href: "https://x.com/Maski23421424", hint: "（新しいタブで開く）", newTab: true },
];

/** TOP の Sky.tsx と同じ指定にし、TOP から来たときに同じ大きさの画像を使い回せるようにする */
const SKY_SIZES =
  "(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, (max-aspect-ratio: 4/3) 200vw, 110vw";
/** 舞台の幅（縦長・狭い画面は最大 240vw、正方形に近い窓は約 207vw まで、16:9 に近い窓は約 133vw まで）に合わせる。建物は舞台の 68% */
const PLANTS_SIZES =
  "(max-aspect-ratio: 6/7) 240vw, (max-width: 700px) 240vw, (max-aspect-ratio: 4/3) 210vw, 135vw";
const BUILDING_SIZES =
  "(max-aspect-ratio: 6/7) 165vw, (max-width: 700px) 165vw, (max-aspect-ratio: 4/3) 143vw, 92vw";

const SKY_FILTER = "saturate(0.6) brightness(0.98) contrast(0.92)";

/**
 * /contact。3つ目の展示室ではなく、TOP の右のアーチ（Contact）を抜けて、美術館の海側・裏側へ出た場所。
 * 見えている建物は、TOP の3アーチの美術館を裏から見たもので、通り抜けてきたアーチが1つだけ見える。
 *
 * レイヤー（奥 → 手前）:
 *   1. sky      TOP と同じ海と空（top-bg-sea-sky.png）を左右反転して、館の反対側から見ていることにする
 *   2. building 美術館の背面とアーチ（植物の影は画像に含まれる。固定）
 *   3. plants   植物・琉球石灰岩（1枚の PNG。静止）
 *   4. sign     壁に置いた小さな案内（CONTACT / Email & Links / Mail・GitHub・X）
 *
 * 建物・植物・案内は、完成イメージと同じ 1672:941 の舞台（.stage）に % で置く。素材の PNG もこの寸法で作られている。
 * 海と空は舞台の外に置く（揺らす写しや反転を舞台と分けるため）。水平線はどの画面でも舞台の上から約 58%（アーチの開口部の中）に合わせ、
 * 縦長の画面では画面の上端まで空を伸ばす。
 * ポインタに合わせたごく弱いパララックスと、画像がそろってからのフェードインは TOP の ParallaxStage を使う。
 */
const ContactMuseum = () => {
  return (
    <div className={styles.contact}>
      <MuseumNav current="contact" />

      <main>
        <ParallaxStage className={styles.scene}>
          {/* 反転は wrapper にだけかけ、画像の object-fit / object-position の計算には触れない */}
          <div className={styles.sky} aria-hidden="true">
            <div className={styles.skyFlip}>
              <Image
                src="/images/top/top-bg-sea-sky.png"
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes={SKY_SIZES}
                style={{ filter: SKY_FILTER }}
              />
            </div>
          </div>

          <div className={styles.stage}>
            {/* 建物の画像が読めなかったときだけ見える、案内の下地（読めれば壁がすべて覆う） */}
            <div className={styles.wallFallback} aria-hidden="true" />
            <div className={styles.building} aria-hidden="true">
              <Image
                src="/images/contact/contact-building-back.png"
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes={BUILDING_SIZES}
              />
            </div>

            <div className={styles.ground} aria-hidden="true" />

            <div className={styles.plants} aria-hidden="true">
              <Image
                src="/images/contact/contact-plants.png"
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes={PLANTS_SIZES}
              />
            </div>

            {/* 通り抜けてきたアーチの右、コンクリートの壁に置いた小さな案内 */}
            <section className={styles.sign} aria-labelledby="contact-title">
              <h1 className={shared.heading} id="contact-title">
                <span className={`${shared.eyebrow} ${styles.eyebrow}`}>Contact</span>
                <span className={styles.title}>Email &amp; Links</span>
              </h1>

              <ul className={styles.links}>
                {LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      className={styles.link}
                      href={link.href}
                      {...(link.newTab && { target: "_blank", rel: "noopener noreferrer" })}
                    >
                      {link.label}
                      <svg className={styles.external} viewBox="0 0 10 10" aria-hidden="true">
                        <path d="M2 8 8 2M3.5 2H8v4.5" />
                      </svg>
                      <span className={styles.visuallyHidden}>{link.hint}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className={styles.atmosphere} aria-hidden="true" />
        </ParallaxStage>

        <MuseumRoomNavigation
          previous={{ label: "Previous room", title: "Work", href: "/work" }}
          next={{ label: "Back to entrance", title: "Top", href: "/" }}
          className={styles.roomNavigation}
        />
      </main>

      {/* JS が動かない環境では、画像を待つフェードインをせず、景色と案内をそのまま見せる */}
      <noscript>
        {/* .scene:not([data-ready]) と同じ詳細度にし、後に出るこちらを勝たせる */}
        <style>{`.${styles.scene}:not([data-ready]){opacity:1;visibility:visible;animation:none}`}</style>
      </noscript>
    </div>
  );
};

export default ContactMuseum;
