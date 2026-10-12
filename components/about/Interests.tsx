import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { INTERESTS, type Interest } from "./content";
import shared from "./AboutMuseum.module.css";
import styles from "./Interests.module.css";

/**
 * ABOUT / Interests：低い展示台（CSS）に、実物（透過画像）を1つずつ置いた収蔵品の展示。
 *
 * 展示台の高さと幅は少しずつ変え、下端（床の線）だけをそろえる。
 * 解説は展示台の下の床に小さく置き、hover / キーボードのフォーカスで静かに現れる。
 * hover の無い端末では、最初から解説を見せる（Interests.module.css の @media (hover: none)）。
 *
 * 展示を見終えて床を少し歩いた先に、次の展示室（Work）への案内を置く。ボタンにはせず、壁の札と同じ文字で示す。
 */
export default function Interests() {
  return (
    <section className={styles.interests} aria-labelledby="interests-title">
      <header className={shared.sectionHeader} data-reveal>
        <h2 className={shared.heading} id="interests-title">
          <span className={shared.eyebrow}>About</span>
          <span className={shared.roomTitle}>Interests</span>
        </h2>
        <p className={shared.lead}>好きなもの・こと、興味があるものたちです</p>
      </header>

      <ul
        className={styles.hall}
        style={
          {
            "--hall-columns": INTERESTS.map((item) => `${item.plinth.width}fr`).join(" "),
          } as CSSProperties
        }
        data-reveal
      >
        {INTERESTS.map((item) => (
          <Exhibit key={item.number} item={item} />
        ))}
      </ul>

      <nav className={styles.nextRoom} aria-label="次の展示室" data-reveal>
        <Link href="/work" className={styles.nextLink}>
          <span className={styles.nextLabel}>Next room</span>
          <span className={styles.nextTitle}>Work</span>
          <svg className={styles.nextArrow} viewBox="0 0 32 10" aria-hidden="true">
            <path d="M0 5h31M26 1l5 4-5 4" />
          </svg>
        </Link>
      </nav>
    </section>
  );
}

function Exhibit({ item }: { item: Interest }) {
  const { image } = item;
  const box = image.box ?? { x: 0, y: 0, width: image.width, height: image.height };

  return (
    <li
      className={styles.exhibit}
      style={{ "--plinth-h": item.plinth.height } as CSSProperties}
      // 解説を見るために、キーボードでも展示物に「近づける」ようにする
      tabIndex={0}
      aria-labelledby={`interest-title-${item.number}`}
      // フォーカスで現れる解説も、読み上げで一緒に伝える
      aria-describedby={`interest-note-${item.number}`}
    >
      {/* 画像の透明な余白を除いた範囲（box）だけを見せ、展示物の底を展示台の天板に載せる */}
      <div
        className={styles.object}
        style={{
          width: `${item.objectWidth}%`,
          translate: item.objectShift ? `${item.objectShift}% 0` : undefined,
          aspectRatio: `${box.width} / ${box.height}`,
        }}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          // 展示物の幅（列の幅 × objectWidth）に、切り落とす透明な余白の分を足した幅。広い列（Space）で約 26vw
          sizes="(max-width: 760px) 36vw, 26vw"
          style={{
            width: `${(image.width / box.width) * 100}%`,
            left: `${(-box.x / box.width) * 100}%`,
            top: `${(-box.y / box.height) * 100}%`,
          }}
        />
      </div>

      <div className={styles.plinth}>
        <p className={styles.number}>{item.number}</p>
        <h3 className={styles.title} id={`interest-title-${item.number}`}>
          {item.title}
        </h3>
      </div>

      <p className={styles.note} id={`interest-note-${item.number}`}>
        {item.note.map((line, index) => (
          <span key={line}>
            {index > 0 && <br />}
            <NoteLine line={line} link={item.link} />
          </span>
        ))}
      </p>
    </li>
  );
}

/** 解説の1行。リンクにする語があれば、キャプションの文字のまま控えめなリンクにする */
function NoteLine({ line, link }: { line: string; link?: Interest["link"] }) {
  const at = link ? line.indexOf(link.text) : -1;
  if (!link || at < 0) return line;
  return (
    <>
      {line.slice(0, at)}
      <a className={styles.noteLink} href={link.href} target="_blank" rel="noopener noreferrer">
        {link.text}
        <span className={styles.visuallyHidden}>（新しいタブで開く）</span>
      </a>
      {line.slice(at + link.text.length)}
    </>
  );
}
