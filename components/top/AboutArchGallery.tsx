import Image from "next/image";
import { CAREER } from "@/components/about/content";
import styles from "./TopHero.module.css";

/**
 * About の入口に掛ける2枚の写真（ホテル・自宅の作業机）。
 * 建築は Work と同じ画像。展示する実際の写真は /about と同じデータを参照する。
 * 写真を差し替えるときは components/about/content.ts の CAREER を変更すればよい（careerIndex の写真を使う）。
 * objectPosition は、小さな額でも被写体が分かるように TOP だけで決める切り抜き位置（未指定なら CAREER の position）。
 *
 * 配置は共通建築（1122 × 1402）の正面壁に合わせた %。ホテルを左、作業机を右に、高さを少しだけずらして掛ける。
 * 開口部から見える範囲は横 約 27.4〜72.2% なので、額は約 30.5〜68.5% に収め、アーチの縁との間を空ける。
 * 木枠は CSS、写真との間に白い台紙・余白は設けない。
 */
const PHOTO_FRAMES: readonly {
  careerIndex: number;
  left: string;
  top: string;
  width: string;
  height: string;
  objectPosition?: string;
}[] = [
  { careerIndex: 1, left: "30.60%", top: "33.00%", width: "17.00%", height: "12.00%" },
  // 左右を少し削る。時計の側を落とし、モニターとノートパソコンを両方とも額に残す
  { careerIndex: 3, left: "52.00%", top: "36.00%", width: "16.50%", height: "12.00%", objectPosition: "62% 50%" },
];

const AboutArchGallery = () => (
  <>
    {PHOTO_FRAMES.map(({ careerIndex, objectPosition, ...position }) => {
      const photo = CAREER[careerIndex]?.photo;
      if (!photo) return null;

      return (
        <span className={styles.archPhotoSlot} style={position} key={careerIndex}>
          <Image
            src={photo.src}
            alt=""
            fill
            // 下の展示室の画像と同じく最初から見える位置にあるので、遅れて現れないよう遅延させない
            loading="eager"
            sizes="(max-width: 767.98px) 30vw, 6vw"
            style={{ objectFit: "cover", objectPosition: objectPosition ?? photo.position ?? "center" }}
          />
        </span>
      );
    })}
  </>
);

export default AboutArchGallery;
