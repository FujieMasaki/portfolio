import shared from "@/components/about/AboutMuseum.module.css";
import { PUBLISHING } from "./content";
import { fetchFeed, formatMonth, type FeedEntry } from "./feeds";
import room from "./WorkMuseum.module.css";
import styles from "./Publishing.module.css";

/** 媒体ごとに並べる記事の数 */
const ENTRIES_PER_SOURCE = 4;

/**
 * WORK / Publishing：Zenn・note に書いてきた記事を、壁に書いた目録のように並べる展示。
 * 記事はサーバーで RSS から読む（feeds.ts）。読めなかった媒体は、一覧を出さずに札（媒体名 ↗）だけを置く。
 */
const Publishing = async () => {
  const feeds = await Promise.all(
    PUBLISHING.map((source) => fetchFeed(source.feed, source.site, ENTRIES_PER_SOURCE)),
  );

  return (
    <section className={room.section} aria-labelledby="publishing-title">
      <header className={room.label} data-reveal>
        <h2 className={`${shared.heading} ${room.ruled}`} id="publishing-title">
          <span className={shared.eyebrow}>01</span>
          <span className={shared.roomTitle}>Publishing</span>
        </h2>
        <p className={shared.lead}>
          学んだことや、考えたことを
          <br />
          Zenn や note に書いています。
        </p>
      </header>

      <div className={styles.shelves} data-reveal>
        {PUBLISHING.map((source, index) => (
          <section key={source.name} className={styles.source} aria-labelledby={`publishing-${source.name}`}>
            <h3 className={styles.sourceName} id={`publishing-${source.name}`}>
              <ExternalLink href={source.site} className={styles.sourceLink}>
                {source.name}
                <svg className={styles.arrow} viewBox="0 0 10 10" aria-hidden="true">
                  <path d="M1 9 9 1M3 1h6v6" />
                </svg>
              </ExternalLink>
            </h3>
            {feeds[index] ? (
              <EntryList entries={feeds[index]} />
            ) : (
              <p className={styles.empty}>記事は {source.name} で読めます。</p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
};

const EntryList = ({ entries }: { entries: FeedEntry[] }) => (
  <ul className={styles.list}>
    {entries.map((entry) => (
      <li key={entry.url}>
        <ExternalLink href={entry.url} className={styles.entry}>
          <span className={styles.entryTitle}>{entry.title}</span>
          <time className={styles.date} dateTime={entry.publishedAt}>
            {formatMonth(entry.publishedAt)}
          </time>
        </ExternalLink>
      </li>
    ))}
  </ul>
);

/** 外部のページを新しいタブで開くリンク。読み上げでは、新しいタブで開くことを伝える */
const ExternalLink = ({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) => (
  <a href={href} className={className} target="_blank" rel="noopener noreferrer">
    {children}
    <span className={styles.visuallyHidden}>（新しいタブで開く）</span>
  </a>
);

export default Publishing;
