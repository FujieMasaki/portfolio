import type { Metadata } from "next";
import WorkMuseum from "@/components/work/WorkMuseum";

export const metadata: Metadata = {
  title: "Work — Masaki Fujie",
  description:
    "Masaki Fujie / 藤江正樹 — つくったもの、学んだこと、考えていることを展示する部屋。",
};

/*
 * Writing の記事（Zenn・note の RSS）を1日ごとに読み直すため、ページも1日ごとに作り直す。
 * 値は components/work/feeds.ts の FEED_REVALIDATE と同じにする（ここは静的に解析されるので、式や定数を書けない）。
 */
export const revalidate = 86400;

const WorkPage = () => {
  return <WorkMuseum />;
};

export default WorkPage;
