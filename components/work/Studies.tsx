import Link from "next/link";
import shared from "@/components/about/AboutMuseum.module.css";
import { STUDIES, type Study } from "./content";
import room from "./WorkMuseum.module.css";
import styles from "./Studies.module.css";

/**
 * WORK / Personal Studies：体験から学んだことと、ふと浮かんだアイデアをまとめる場所。
 * 壁に掛けた2枚の説明板として見せる。まとめたページができるまではリンクを出さない（content.ts の link）。
 */
const Studies = () => {
  return (
    <section className={room.section} aria-labelledby="studies-title">
      <header className={room.label} data-reveal>
        <h2 className={`${shared.heading} ${room.ruled}`} id="studies-title">
          <span className={shared.eyebrow}>03</span>
          <span className={shared.roomTitle}>Personal Studies</span>
        </h2>
        <p className={shared.lead}>
          体験から学んだことや、
          <br />
          ふと浮かんだアイデアをまとめています。
        </p>
      </header>

      <ul className={styles.boards} data-reveal>
        {STUDIES.map((study) => (
          <Board key={study.number} study={study} />
        ))}
      </ul>
    </section>
  );
};

const Board = ({ study }: { study: Study }) => (
  <li className={styles.board}>
    <p className={styles.number}>{study.number}</p>
    <StudyIcon icon={study.icon} />
    <div className={styles.body}>
      <h3 className={styles.title}>{study.title}</h3>
      <p className={styles.description}>
        {study.description.map((line, index) => (
          <span key={line}>
            {index > 0 && <br />}
            {line}
          </span>
        ))}
      </p>
      {study.link && (
        <Link href={study.link.href} className={styles.link}>
          {study.link.label}
        </Link>
      )}
    </div>
  </li>
);

/** 説明板の小さな線画（体験学はフラスコ、空想学は雲）。文字と同じ色・太さの線だけで描く */
const StudyIcon = ({ icon }: { icon: Study["icon"] }) => (
  <svg className={styles.icon} viewBox="0 0 32 32" aria-hidden="true">
    {icon === "flask" ? (
      <path d="M12.5 4h7M14 4v8.5L7.6 25.2A1.9 1.9 0 0 0 9.3 28h13.4a1.9 1.9 0 0 0 1.7-2.8L18 12.5V4M10.4 20h11.2" />
    ) : (
      <path d="M9.5 24.5h13.8a5 5 0 0 0 .4-10 7 7 0 0 0-13.3-1.4A5.7 5.7 0 0 0 9.5 24.5Z" />
    )}
  </svg>
);

export default Studies;
