"use client";

import { useEffect, useState } from "react";
import styles from "./Header.module.css";

const NAV_LINKS = [
  { label: "ABOUT", href: "#about", id: "about" },
  { label: "CAREER", href: "#career", id: "career" },
  { label: "INTERESTS", href: "#likes", id: "likes" },
  { label: "MORE", href: "#more", id: "more" },
  { label: "CONTACT", href: "#contact", id: "contact" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('section[aria-label="Hero"]');

    if (!hero) {
      requestAnimationFrame(() => setIsHeaderVisible(true));
      return;
    }

    let animationFrame = 0;

    const updateHeaderVisibility = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const headerHeight = parseFloat(
          getComputedStyle(document.documentElement)
            .getPropertyValue("--header-height")
            .trim(),
        );
        const triggerOffset = (Number.isNaN(headerHeight) ? 64 : headerHeight) + 96;

        const nextIsHeaderVisible =
          hero.getBoundingClientRect().bottom <= triggerOffset;

        setIsHeaderVisible(nextIsHeaderVisible);

        if (!nextIsHeaderVisible) {
          setIsMenuOpen(false);
        }
      });
    };

    const observer = new IntersectionObserver(updateHeaderVisibility, {
      threshold: [0, 0.25, 0.5, 0.75, 1],
    });

    observer.observe(hero);
    updateHeaderVisibility();
    window.addEventListener("scroll", updateHeaderVisibility, { passive: true });
    window.addEventListener("resize", updateHeaderVisibility);

    return () => {
      cancelAnimationFrame(animationFrame);
      observer.disconnect();
      window.removeEventListener("scroll", updateHeaderVisibility);
      window.removeEventListener("resize", updateHeaderVisibility);
    };
  }, []);

  useEffect(() => {
    const sections = NAV_LINKS.map((link) => document.getElementById(link.id)).filter(
      (section): section is HTMLElement => Boolean(section),
    );

    if (sections.length === 0) {
      return;
    }

    const updateActiveSection = () => {
      const headerHeight = parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--header-height")
          .trim(),
      );
      const markerY = headerHeight + 32;
      const currentSection = sections.find((section) => {
        const rect = section.getBoundingClientRect();

        return rect.top <= markerY && rect.bottom > markerY;
      });

      setActiveId(currentSection?.id ?? null);
    };

    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const renderLinks = () =>
    NAV_LINKS.map((link) => (
      <a
        key={link.href}
        className={styles.navLink}
        href={link.href}
        aria-current={activeId === link.id ? "page" : undefined}
        onClick={() => setIsMenuOpen(false)}
      >
        {link.label}
      </a>
    ));

  return (
    <header
      className={`${styles.header} ${isHeaderVisible ? styles.headerVisible : ""}`}
    >
      <div className={styles.inner}>
        <a className={styles.brand} href="#" aria-label="Masaki Fujie, page top">
          Masaki Fujie
        </a>

        <nav className={styles.desktopNav} aria-label="Primary">
          {renderLinks()}
        </nav>

        <button
          className={styles.menuButton}
          type="button"
          aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-controls="site-navigation"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          {isMenuOpen ? "CLOSE" : "MENU"}
        </button>
      </div>

      <nav
        className={`${styles.mobileNav} ${isMenuOpen ? styles.mobileNavOpen : ""}`}
        id="site-navigation"
        aria-label="Primary"
      >
        <div className={styles.mobileNavInner}>{renderLinks()}</div>
      </nav>
    </header>
  );
}
