import type { CSSProperties } from "react";
import Image from "next/image";
import type { CareerExhibit } from "./content";
import shared from "./AboutMuseum.module.css";
import styles from "./CareerPath.module.css";

/** Career の展示1点。札（番号・期間・場所・解説）と、写真があれば額装した写真 */
const CareerEntry = ({ exhibit }: { exhibit: CareerExhibit }) => {
  return (
    <li
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
  );
};

export default CareerEntry;
