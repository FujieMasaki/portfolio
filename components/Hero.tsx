import { getImageProps } from "next/image";
import styles from "./Hero.module.css";

const HERO_IMAGE_PROPS = {
  alt: "",
  fill: true,
  sizes: "100vw",
  fetchPriority: "high" as const,
  style: { objectFit: "cover" as const, objectPosition: "50% 40%" },
};

export default function Hero() {
  const {
    props: { srcSet: desktopSrcSet, ...desktopImageProps },
  } = getImageProps({
    ...HERO_IMAGE_PROPS,
    src: "/images/hero.webp",
  });
  const {
    props: { srcSet: mobileSrcSet },
  } = getImageProps({
    ...HERO_IMAGE_PROPS,
    src: "/images/hero-sp.webp",
  });

  return (
    <section className={styles.hero} aria-label="Hero">
      <div className={styles.media} aria-hidden="true">
        <picture>
          <source media="(max-width: 860px)" srcSet={mobileSrcSet} />
          <img {...desktopImageProps} srcSet={desktopSrcSet} alt="" />
        </picture>
        <div className={styles.overlay} />
      </div>

      <div className={styles.content}>
        <div className={styles.textBlock}>
          <p className={styles.eyebrow}>
            PRODUCT ENGINEER
          </p>
          <h1 className={styles.name}>Masaki Fujie</h1>
          <div className={styles.copy}>
            <p>
              沖縄に暮らしながら、
              <br />
              プロダクトづくりをしています。
            </p>
            <p>
              技術を使って、
              <br />
              使いやすい体験を考えています。
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
