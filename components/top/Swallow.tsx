import styles from "./TopHero.module.css";

/** Contact のアーチの向こうを横切るリュウキュウツバメ（細い二股の尾と尖った翼のシルエット） */
export default function Swallow() {
  return (
    <svg
      className={styles.swallow}
      viewBox="0 0 40 20"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M20 9.2c-2.6-3.4-7.4-6.3-14.6-7.2 4.6 1.6 8.6 4.4 11 7.6-1.6.6-2.8 1.6-3.6 3l2.9-.8-1.6 4.4 3.4-3.6.9 0 3.4 3.6-1.6-4.4 2.9.8c-.8-1.4-2-2.4-3.6-3 2.4-3.2 6.4-6 11-7.6C27.4 2.9 22.6 5.8 20 9.2z"
        fill="currentColor"
      />
    </svg>
  );
}
