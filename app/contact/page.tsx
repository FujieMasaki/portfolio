import type { Metadata } from "next";
import ContactMuseum from "@/components/contact/ContactMuseum";

export const metadata: Metadata = {
  title: "Contact — Masaki Fujie",
  description:
    "Masaki Fujie / 藤江正樹 — 展示を見終えて、美術館の海側へ出た場所。メールと外部のリンク。",
};

const ContactPage = () => {
  return <ContactMuseum />;
};

export default ContactPage;
