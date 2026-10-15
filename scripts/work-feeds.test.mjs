import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMonth, parseFeed } from "../components/work/feeds.ts";

const SITE = "https://zenn.dev/fujee";

const item = ({ title, link, pubDate }) =>
  `<item><title>${title}</title><link>${link}</link><pubDate>${pubDate}</pubDate></item>`;

test("Zenn の形（CDATA の題）と note の形（文字参照の題）の両方を読む", () => {
  const xml = `<rss><channel><title>feed</title>
    ${item({ title: "<![CDATA[AI と <Rails>]]>", link: `${SITE}/articles/a`, pubDate: "Sat, 19 Sep 2026 02:58:05 GMT" })}
    ${item({ title: "体験 &amp; 設計 &#x2F; &#12354;&nbsp;Day1 &unknown;", link: `${SITE}/articles/b`, pubDate: "Thu, 10 Sep 2026 11:34:44 +0900" })}
  </channel></rss>`;

  assert.deepEqual(parseFeed(xml, SITE, 4), [
    { title: "AI と <Rails>", url: `${SITE}/articles/a`, publishedAt: "2026-09-19T02:58:05.000Z" },
    { title: "体験 & 設計 / あ\u00a0Day1 &unknown;", url: `${SITE}/articles/b`, publishedAt: "2026-09-10T02:34:44.000Z" },
  ]);
});

test("新しい順に並べ、limit 件までにする", () => {
  const xml = ["2026-01-01", "2026-03-01", "2026-02-01"]
    .map((day) => item({ title: day, link: `${SITE}/articles/${day}`, pubDate: new Date(day).toUTCString() }))
    .join("");

  assert.deepEqual(
    parseFeed(xml, SITE, 2).map((entry) => entry.title),
    ["2026-03-01", "2026-02-01"],
  );
});

test("同じ URL の記事は1件だけにする", () => {
  const pubDate = "Sat, 19 Sep 2026 02:58:05 GMT";
  const xml = [1, 2].map(() => item({ title: "同じ記事", link: `${SITE}/articles/a`, pubDate })).join("");

  assert.equal(parseFeed(xml, SITE, 4).length, 1);
});

test("site の外の URL・題や日付の無い記事は使わない", () => {
  const pubDate = "Sat, 19 Sep 2026 02:58:05 GMT";
  const xml = [
    item({ title: "外のサイト", link: "https://example.com/fujee/a", pubDate }),
    item({ title: "javascript", link: "javascript:alert(1)", pubDate }),
    item({ title: "前方一致だけの別ユーザー", link: "https://zenn.dev/fujeee/articles/a", pubDate }),
    item({ title: "日付なし", link: `${SITE}/articles/a`, pubDate: "" }),
    item({ title: "", link: `${SITE}/articles/b`, pubDate }),
  ].join("");

  assert.deepEqual(parseFeed(xml, SITE, 4), []);
  assert.deepEqual(parseFeed("<html>not a feed</html>", SITE, 4), []);
});

test("年月は日本時間で数える", () => {
  // 日本時間では 2026-10-01 00:30
  assert.equal(formatMonth("2026-09-30T15:30:00.000Z"), "2026.10");
  assert.equal(formatMonth("2026-09-19T02:58:05.000Z"), "2026.09");
});
