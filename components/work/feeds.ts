/**
 * WORK / Publishing の記事一覧。Zenn・note の RSS をサーバーで読み、新しい順に数件だけ取り出す。
 *
 * 取得はビルド時と、1日ごとの再生成のときだけ（app/work/page.tsx の revalidate）。訪問者のブラウザからは外部へ通信しない。
 * 取得や解析に失敗したら null を返し、一覧を出さずに「Zenn ↗ / note ↗」の札だけを見せる（Publishing.tsx）。
 *
 * scripts/work-feeds.test.mjs から Node で直接読むので、ほかのファイルを import せず、型の注釈以外の TypeScript の構文を使わない。
 */

export type FeedEntry = {
  title: string;
  url: string;
  /** 公開日時（ISO 8601） */
  publishedAt: string;
};

/** 1日（秒）。app/work/page.tsx の revalidate と同じ値 */
const ONE_DAY = 86400;

const ENTITIES = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["nbsp", "\u00a0"],
]);

/** 文字参照（&amp; &#39; &#x2F; など）を文字に戻す。知らない名前の参照はそのまま残す */
const decodeEntities = (text: string) =>
  text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, ref: string) => {
    if (ref[0] !== "#") return ENTITIES.get(ref.toLowerCase()) ?? whole;
    const code = ref[1] === "x" || ref[1] === "X" ? parseInt(ref.slice(2), 16) : parseInt(ref.slice(1), 10);
    return Number.isInteger(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : whole;
  });

/** <tag>…</tag> の中身を、CDATA を外し、文字参照を戻した文字列で返す */
const readTag = (item: string, tag: string) => {
  const match = item.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`));
  if (!match) return undefined;
  const cdata = match[1].trim().match(/^<!\[CDATA\[([\s\S]*?)\]\]>$/);
  return (cdata ? cdata[1] : decodeEntities(match[1])).trim();
};

/**
 * RSS 2.0 の <item> から、題・URL・公開日時を取り出す。新しい順に並べ、limit 件までにする。
 * URL は site（例: "https://zenn.dev/fujee"）の下にあるものだけを使う（フィードの中身をそのまま href にしない）。
 */
export const parseFeed = (xml: string, site: string, limit: number): FeedEntry[] => {
  const entries: FeedEntry[] = [];
  for (const [, item] of xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/g)) {
    const title = readTag(item, "title");
    const url = readTag(item, "link");
    const published = new Date(readTag(item, "pubDate") ?? "");
    if (!title || !url?.startsWith(`${site}/`) || Number.isNaN(published.getTime())) continue;
    // 同じ記事が2度載っていても、目録には1行だけ置く（URL を一覧の key にする）
    if (entries.some((entry) => entry.url === url)) continue;
    entries.push({ title, url, publishedAt: published.toISOString() });
  }
  return entries.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)).slice(0, limit);
};

/** 公開した年月を、展示の札の書き方（2026.09）にする。日付は日本時間で数える */
export const formatMonth = (iso: string) => {
  const date = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
  return `${date.getUTCFullYear()}.${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
};

/** RSS を読んで記事を返す。読めない・1件もないときは null（一覧を出さない） */
export const fetchFeed = async (feedUrl: string, site: string, limit: number) => {
  try {
    const response = await fetch(feedUrl, {
      next: { revalidate: ONE_DAY },
      // 相手が応答しないときに、ビルドや再生成を止めない
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;
    const entries = parseFeed(await response.text(), site, limit);
    return entries.length > 0 ? entries : null;
  } catch {
    return null;
  }
};
