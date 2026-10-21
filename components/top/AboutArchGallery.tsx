import Image from "next/image";
import { CAREER, INTERESTS } from "@/components/about/content";
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

/**
 * 写真の下、石のベンチの手前の床に置く、趣味の展示（/about の Interests の展示台を小さくしたもの）。
 * 展示物は /about と同じ INTERESTS の画像を使う（interestIndex：靴・バスケットボール）。
 *
 * 位置は写真と同じく共通建築に対する %。展示台の下端はベンチの足元（床との境目、約 86.7%）にそろえ、
 * 高さだけを変えて、左右対称にならないようにする。
 * light は天井のダウンライト（開口の中央の真上）のある側。展示台の側面の陰と、展示物の影の向きを決める。
 * objectWidth は展示台の幅に対する展示物の幅（%）、objectShift は天板の中央からのずれ（展示物の幅に対する %）。
 */
const PLINTHS = [
  { interestIndex: 0, left: "33.60%", top: "59.70%", width: "13.20%", height: "27.00%", light: "right", objectWidth: 86, objectShift: -4 },
  { interestIndex: 1, left: "57.40%", top: "57.40%", width: "11.00%", height: "29.30%", light: "left", objectWidth: 69, objectShift: 0 },
] as const;

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

    {PLINTHS.map(({ interestIndex, light, objectWidth, objectShift, ...position }) => {
      const image = INTERESTS[interestIndex]?.image;
      if (!image) return null;
      const box = image.box ?? { x: 0, y: 0, width: image.width, height: image.height };

      return (
        <span className={styles.archPlinth} data-light-side={light} style={position} key={interestIndex}>
          {/* 画像の透明な余白を除いた範囲（box）の底を、天板に載せる（/about の Interests と同じ切り出し方） */}
          <span
            className={styles.archPlinthObject}
            style={{
              width: `${objectWidth}%`,
              left: `${50 - objectWidth / 2 + (objectWidth * objectShift) / 100}%`,
              aspectRatio: `${box.width} / ${box.height}`,
            }}
          >
            <Image
              src={image.src}
              alt=""
              width={image.width}
              height={image.height}
              loading="eager"
              // 描く幅（透明な余白を含む）は、靴・ボールとも建築画像の幅の約12%。
              // スライドの About のアップで画面幅の約10%、768px 以上（hover で拡大したとき）で約3%なので、ほぼ余裕はない。
              // objectWidth・展示台の幅を大きくするときは sizes も上げる
              sizes="(max-width: 767.98px) 10vw, 3vw"
              style={{
                width: `${(image.width / box.width) * 100}%`,
                left: `${(-box.x / box.width) * 100}%`,
                top: `${(-box.y / box.height) * 100}%`,
              }}
            />
          </span>
        </span>
      );
    })}
  </>
);

export default AboutArchGallery;
