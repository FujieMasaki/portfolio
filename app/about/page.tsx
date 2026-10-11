import type { Metadata } from "next";
import AboutMuseum from "@/components/about/AboutMuseum";

export const metadata: Metadata = {
  title: "About — Masaki Fujie",
  description:
    "Masaki Fujie / 藤江正樹 — これまでの時間と、今の自分をつくっているものを展示する部屋。",
};

export default function AboutPage() {
  return <AboutMuseum />;
}
