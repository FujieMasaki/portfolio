import Image from "next/image";
import MuseumNav from "@/components/museum/MuseumNav";
import MuseumRoomNavigation from "@/components/museum/MuseumRoomNavigation";
import ParallaxStage from "@/components/top/ParallaxStage";
import shared from "@/components/about/AboutMuseum.module.css";
import styles from "./ContactMuseum.module.css";

const EMAIL = "masakifujie.work@gmail.com";

/** 外の世界への案内。URL は旧 Footer / PlacesToKnowMe と同じもの */
const LINKS = [
  { label: "GitHub", href: "https://github.com/FujieMasaki" },
  { label: "X", href: "https://x.com/Maski23421424" },
];

const SKY_FILTER = "saturate(0.6) brightness(0.98) contrast(0.92)";

/**
 * /contact。3つ目の展示室ではなく、TOP の右のアーチ（Contact）を抜けて、美術館の海側・裏側へ出た場所。
 * 見えている建物は、TOP の3アーチの美術館を裏から見たもので、通り抜けてきたアーチが1つだけ見える。
 *
 * レイヤー（奥 → 手前）:
 *   1. sky      TOP と同じ海と空（top-bg-sea-sky.png）を左右反転して、館の反対側から見ていることにする
 *   2. building 美術館の背面とアーチ（植物の影は画像に含まれる。固定）
 *   3. plants   植物・琉球石灰岩（1枚の PNG。左上の木の梢だけを写しで切り出し、ごく弱く揺らす）
 *   4. sign     壁に置いた小さな案内（CONTACT / Email & Links / メール / 外部リンク）
 *
 * 建物・植物・案内は、完成イメージと同じ 1672:941 の舞台（.stage）に % で置く。素材の PNG もこの寸法で作られている。
 * 海と空だけは舞台の外で画面全体に敷き、縦長の画面でも上まで空が続くようにする。
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
                sizes="(max-aspect-ratio: 6/7) 220vw, 110vw"
                style={{ filter: SKY_FILTER }}
              />
            </div>
          </div>

          <div className={styles.stage}>
            <div className={styles.building} aria-hidden="true">
              <Image
                src="/images/contact/contact-building-back.png"
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-aspect-ratio: 6/7) 200vw, (max-width: 700px) 200vw, 72vw"
              />
            </div>

            {/* 同じ画像を2枚重ね、下は梢を抜いたもの、上は梢だけの写し（揺らす）にする。取得は1回で済む */}
            <div className={styles.plants} aria-hidden="true">
              <Image
                src="/images/contact/contact-plants.png"
                alt=""
                fill
                loading="eager"
                fetchPriority="high"
                sizes="(max-aspect-ratio: 6/7) 290vw, (max-width: 700px) 290vw, 100vw"
              />
            </div>
            <div className={styles.canopy} aria-hidden="true">
              <Image
                src="/images/contact/contact-plants.png"
                alt=""
                fill
                loading="eager"
                sizes="(max-aspect-ratio: 6/7) 290vw, (max-width: 700px) 290vw, 100vw"
              />
            </div>

            {/* 通り抜けてきたアーチの右、コンクリートの壁に置いた小さな案内 */}
            <section className={styles.sign} aria-labelledby="contact-title">
              <h1 className={shared.heading} id="contact-title">
                <span className={`${shared.eyebrow} ${styles.eyebrow}`}>Contact</span>
                <span className={styles.title}>Email &amp; Links</span>
              </h1>

              <a className={styles.email} href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>

              <ul className={styles.links}>
                {LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      className={styles.link}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                      <svg className={styles.external} viewBox="0 0 10 10" aria-hidden="true">
                        <path d="M2 8 8 2M3.5 2H8v4.5" />
                      </svg>
                      <span className={styles.visuallyHidden}>（新しいタブで開く）</span>
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
