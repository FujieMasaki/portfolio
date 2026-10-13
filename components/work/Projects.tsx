import Image from "next/image";
import shared from "@/components/about/AboutMuseum.module.css";
import { PROJECT, type DeviceImage } from "./content";
import room from "./WorkMuseum.module.css";
import styles from "./Projects.module.css";

/**
 * WORK / Projects：今つくっているもの。壁に解説を書き、低い石の棚に実機（ノートパソコンとスマートフォン）を置く。
 * 公開したページが無い間は View Project を出さず、これからやること（Next）もリンクにしない（content.ts）。
 * 左下から、床に置いた植物の葉が少しだけ入る。
 */
const Projects = () => {
  const project = PROJECT;

  return (
    <section className={`${room.section} ${styles.projects}`} aria-labelledby="projects-title">
      <header className={room.label} data-reveal>
        <h2 className={`${shared.heading} ${room.ruled}`} id="projects-title">
          <span className={shared.eyebrow}>02</span>
          <span className={shared.roomTitle}>Projects</span>
        </h2>
        <p className={shared.lead}>
          今つくっているもの、
          <br />
          これまでに関わってきたプロダクトです。
        </p>
      </header>

      <article className={styles.project} aria-labelledby="project-title" data-reveal>
        <div className={styles.caption}>
          <p className={styles.tags}>
            <span className={styles.kind}>{project.kind}</span>
            <span className={styles.status}>{project.status}</span>
          </p>
          <h3 className={styles.title} id="project-title">
            {project.title}
          </h3>
          <p className={styles.description}>
            {project.description.map((line, index) => (
              <span key={line}>
                {index > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
          {project.url && (
            <a className={styles.view} href={project.url} target="_blank" rel="noopener noreferrer">
              View Project
              <span className={styles.visuallyHidden}>（新しいタブで開く）</span>
            </a>
          )}
        </div>

        {/* 低い石の棚。ノートパソコンの右に、少し重ねてスマートフォンを立てる */}
        <div className={styles.display}>
          <div className={styles.devices}>
            <Device
              image={project.laptop}
              className={styles.laptop}
              // 見える範囲（box）は画像の幅の 2/3 ほどなので、その分大きい画像を読む。1600px までは棚が広い2段の配置
              sizes="(max-width: 760px) 110vw, (max-width: 1600px) 48vw, 34vw"
            />
            <Device image={project.mobile} className={styles.mobile} sizes="(max-width: 760px) 50vw, (max-width: 1600px) 30vw, 22vw" />
          </div>
          <div className={styles.shelf} />
        </div>

        <div className={styles.next}>
          <h4 className={styles.nextLabel}>Next</h4>
          <ul className={styles.nextList}>
            {project.next.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ul>
        </div>
      </article>

      <div className={styles.plant} aria-hidden="true">
        <Image
          src="/images/work/work-plant-projects-left.png"
          alt=""
          width={1536}
          height={1024}
          sizes="(max-width: 760px) 56vw, 28vw"
        />
      </div>
    </section>
  );
};

/** 画像の透明な余白を除いた範囲（box）だけを見せ、機器の底を棚の天板に載せる */
const Device = ({ image, className, sizes }: { image: DeviceImage; className: string; sizes: string }) => {
  const { box } = image;
  return (
    <div className={`${styles.device} ${className}`} style={{ aspectRatio: `${box.width} / ${box.height}` }}>
      <Image
        src={image.src}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        style={{
          width: `${(image.width / box.width) * 100}%`,
          left: `${(-box.x / box.width) * 100}%`,
          top: `${(-box.y / box.height) * 100}%`,
        }}
      />
    </div>
  );
};

export default Projects;
