/**
 * 美術館の時間帯（訪問者のブラウザのローカル時刻で決める。サーバーの時刻や日本時間には固定しない）。
 * TOP と /contact（同じ美術館の表と裏）が同じ時刻から同じ時間帯を使う。/about・/work も後からここを参照できる。
 * React にも DOM にも依存しない純粋関数だけを置き、scripts/ambient.test.mjs で確かめる。
 */

export type AmbientId = "midnight" | "morning" | "day" | "evening" | "night";

/** サーバーでの描画と、JS が動かない環境で見せる時間帯（基準のビジュアル） */
export const FALLBACK_AMBIENT: AmbientId = "evening";

/**
 * 各時間帯が始まる時刻（0〜23 時）。早い順に並べる。
 * 夜は、景色がまだ見える前半（night 20〜23 時）と、景色が闇へ沈み館内の灯りだけが残る深夜（midnight 0〜4 時）に分ける
 */
const AMBIENT_STARTS: { id: AmbientId; hour: number }[] = [
  { id: "midnight", hour: 0 },
  { id: "morning", hour: 5 },
  { id: "day", hour: 11 },
  { id: "evening", hour: 16 },
  { id: "night", hour: 20 },
];

const AMBIENT_IDS = AMBIENT_STARTS.map((start) => start.id);

/**
 * 時間帯ごとの風の強さ（windStrength。0 = 無風、1 = この美術館で想定するいちばん強い風）。
 * 植物・海面・木漏れ日・光が同じ風を参照できるよう、各ページが CSS 変数 --wind として流す
 * （ページごとの場所の違いは、ページ側で係数を掛ける）。
 * 昼がいちばん風があり、朝・夕方は弱く、夜は凪に近い
 */
export const WIND_STRENGTH: Record<AmbientId, number> = {
  midnight: 0.15,
  morning: 0.4,
  day: 0.55,
  evening: 0.4,
  night: 0.2,
};

export const getAmbientFromHour = (hour: number): AmbientId => {
  return AMBIENT_STARTS.findLast((start) => hour >= start.hour)?.id ?? "midnight";
};

/** 次の時間帯が始まるまでのミリ秒。時刻を常時見張らず、境界に1回だけ確かめ直すために使う */
export const msUntilNextAmbient = (now: Date) => {
  const next = new Date(now);
  next.setMinutes(0, 0, 0);
  const upcoming = AMBIENT_STARTS.find((start) => start.hour > now.getHours());
  if (upcoming) {
    next.setHours(upcoming.hour);
  } else {
    next.setDate(next.getDate() + 1);
    next.setHours(AMBIENT_STARTS[0].hour);
  }
  return next.getTime() - now.getTime();
};

/**
 * 確認用の `?ambient=morning` などを読む。
 * 指定がなければ undefined、知らない値なら null（ローカル時刻の判定に戻す合図）を返す
 */
export const parseAmbientOverride = (search: string): AmbientId | null | undefined => {
  const value = new URLSearchParams(search).get("ambient");
  if (value === null) return undefined;
  return AMBIENT_IDS.find((id) => id === value) ?? null;
};
