import type { Metadata } from "next";
import WorkMuseum from "@/components/work/WorkMuseum";

export const metadata: Metadata = {
  title: "Work — Masaki Fujie",
  description:
    "Masaki Fujie / 藤江正樹 — つくったもの、学んだこと、考えていることを展示する部屋。",
};

/*
 * Publishing の記事（Zenn・note の RSS）を1日ごとに読み直す。
 * RSS の取得に失敗したときも、翌日には読み直す（fetch の revalidate だけだと、失敗したまま固定される）。
 * 値は components/work/feeds.ts の ONE_DAY と同じにする（ここは静的に解析されるので、式や定数を書けない）。
 */
export const revalidate = 86400;

const WorkPage = () => {
  return <WorkMuseum />;
};

export default WorkPage;
