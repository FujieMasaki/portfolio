import { unstable_cache } from "next/cache";
import shared from "@/components/about/AboutMuseum.module.css";
import { WRITING } from "./content";
import { FEED_REVALIDATE, formatMonth, readFeed, type FeedEntry } from "./feeds";
import room from "./WorkMuseum.module.css";
import styles from "./Writing.module.css";

/** 媒体ごとに展示する文章の数。一覧ではなく、いくつかの文章を壁に掛けて見せる */
const ENTRIES_PER_SOURCE = 3;

/**
 * 記事を1日だけ覚えておく。期限が切れたら、次の再生成のときに readFeed をそのまま呼び直す（タイムアウトも効く）。
 * キャッシュの key は、この key と引数（RSS の URL・媒体のページ・件数）から作られる。
 * 読めなかったとき（例外）は覚えないので、次に作り直すときにまた読みに行く。
 */
const getFeed = unstable_cache(readFeed, ["work-writing-feed"], { revalidate: FEED_REVALIDATE });

/** 読めなかった媒体は null（記事を並べない） */
const loadFeed = (feed: string, site: string) =>
  getFeed(feed, site, ENTRIES_PER_SOURCE).catch(() => null);

/**
 * WORK の Writing：Zenn・note に書いた文章を、壁のキャプションのように数点ずつ展示する。
 * 題を主、年月を従にし、題の下に年月を小さく添える。媒体ごとの最後に、すべての記事への View all を置く。
 * 記事はサーバーで RSS から読み、1日だけ覚えておく（feeds.ts・getFeed）。読めなかった媒体は、媒体名と View all だけを置く。
 */
const Writing = async () => {
  const feeds = await Promise.all(WRITING.map((source) => loadFeed(source.feed, source.site)));

  return (
    <section className={room.section} aria-labelledby="writing-title">
      <header className={room.label} data-reveal>
        <h2 className={shared.heading} id="writing-title">
          <span className={shared.roomTitle}>Writing</span>
        </h2>
        <p className={shared.lead}>
          学んだことや、考えたことを
          <br />
          Zenn や note に書いています。
        </p>
      </header>

      <div className={styles.shelves} data-reveal>
        {WRITING.map((source, index) => (
          // 媒体ごとの枠はランドマークにせず、h3 の見出しだけで区切る
          <div key={source.name} className={styles.source}>
            <h3 className={styles.sourceName}>
              {source.name}
            </h3>
            {feeds[index] ? (
              <EntryList entries={feeds[index]} />
            ) : (
              <p className={styles.empty}>記事は {source.name} で読めます。</p>
            )}
            <ExternalLink href={source.site} className={styles.viewAll}>
              View all
              <svg className={styles.arrow} viewBox="0 0 10 10" aria-hidden="true">
                <path d="M1 9 9 1M3 1h6v6" />
              </svg>
              <span className={styles.visuallyHidden}>（{source.name}・新しいタブで開く）</span>
            </ExternalLink>
          </div>
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
          <span className={styles.visuallyHidden}>（新しいタブで開く）</span>
        </ExternalLink>
      </li>
    ))}
  </ul>
);

/** 外部のページを新しいタブで開くリンク */
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
  </a>
);

export default Writing;
