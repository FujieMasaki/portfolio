import Image from "next/image";
import { CAREER } from "@/components/about/content";
import styles from "./TopHero.module.css";

/**
 * About の入口に掛ける4枚の写真。
 * 建築は Work と同じ画像。展示する実際の写真は /about と同じデータを参照する。
 * 写真を差し替えるときは components/about/content.ts の CAREER を変更すればよい。
 *
 * 配置は共通建築（1122 × 1402）の正面壁に合わせた %。
 * 木枠は CSS、写真との間に白い台紙・余白は設けない。
 */
const PHOTO_FRAMES = [
  { careerIndex: 0, left: "28.10%", top: "30.10%", width: "17.50%", height: "16.80%" },
  { careerIndex: 1, left: "47.20%", top: "31.80%", width: "24.00%", height: "15.00%" },
  { careerIndex: 2, left: "29.40%", top: "49.90%", width: "21.00%", height: "14.80%" },
  { careerIndex: 3, left: "52.60%", top: "49.50%", width: "17.00%", height: "15.20%" },
] as const;

const AboutArchGallery = () => (
  <>
    {PHOTO_FRAMES.map(({ careerIndex, ...position }) => {
      const photo = CAREER[careerIndex].photo;
      if (!photo) return null;

      return (
        <span className={styles.archPhotoSlot} style={position} key={careerIndex}>
          <Image
            src={photo.src}
            alt=""
            fill
            sizes="(max-width: 767px) 30vw, 6vw"
            style={{ objectFit: "cover", objectPosition: photo.position ?? "center" }}
          />
        </span>
      );
    })}
  </>
);

export default AboutArchGallery;
