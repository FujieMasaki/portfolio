"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ARCHES, type ArchId } from "./scene";
import styles from "./TopHero.module.css";

/** 通り抜けにかける時間。ズームと開口部の広がりは同じ時間で終える */
const DURATION = 1150;
/** 舞台のズーム量。カメラが大きく動いたと感じない、数歩近づく程度 */
const ZOOM = 1.05;
/** サイト共通の easing（--ease-calm と同じ値） */
const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
/** 開口部の広がりを刻む数。拡大率を等比で刻み、広がる速さが途中で急に変わって見えないようにする */
const STEPS = 12;
/**
 * 広がっている間だけ、次の部屋の地にかける陰。着地したら LIFT_MS かけて元の色に戻す。
 * 明るい壁の部屋（/about・/work）は深めにし、もともと暗い館の外（/contact）は浅いままにする
 */
const SHADE: Record<ArchId, string> = {
  about: "rgb(24 20 16 / 0.36)",
  work: "rgb(24 20 16 / 0.36)",
  contact: "rgb(24 20 16 / 0.24)",
};
const LIFT_MS = 1200;
/** 次の部屋の passage-arrive が終わらなかったときに、着地の印を外すまでの時間 */
const CLEAR_MS = 4000;

/**
 * TOP のアーチを「通り抜けて」展示室へ入る遷移（Mask transition + Zoom through）。
 *
 *   1. 選んだアーチ以外と館名を少しだけ落ち着かせる（.hero[data-passage]。TopHero.module.css）
 *   2. 舞台を、選んだアーチの開口部を中心に 1 → 1.05 へごく弱くズームする
 *   3. 同時に、開口部と同じアーチの形をした窓（.passage）を画面全体が収まるまで広げる。
 *      窓の中は行き先の壁（/about・/work）か、館の外の暗がり（/contact）で、遷移先の最初の地と同じにする
 *      広がっている間は、窓と同じ形の陰（shade）を重ねて、次の部屋の地を少しだけ暗く見せる
 *   4. 広がり終えたら router.push で遷移する。<html data-arrival="passage"> を付けておき、
 *      /about・/work の展示はズームの続きのように少しだけ広がりながら、Menu と /contact は静かに薄く現れる
 *      （AboutMuseum / ContactMuseum の passage-arrive・passage-fade）
 *   5. 次の部屋に替わって TOP が外れたら（この effect の後片付け）、陰を静かに消して元の色に戻す。
 *      陰は遷移の後も残るよう、React の外（body の直下）に置き、TOP の CSS が外れても困らないよう style を直に書く
 *
 * アーチ（ArchEntrance）と部屋名（ArchSigns）は Link のままにし、ここではクリックを横取りするだけにする。
 * JS が動かない環境・修飾キー付きのクリック・prefers-reduced-motion・Web Animations が無い環境では
 * 何もせず、Link の通常の遷移になる。
 */
const ArchPassage = () => {
  const router = useRouter();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = ref.current;
    const hero = overlay?.parentElement;
    const stage = hero?.querySelector<HTMLElement>(`.${styles.stage}`);
    if (!overlay || !hero || !stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animations: Animation[] = [];
    let shade: HTMLDivElement | null = null;
    let passing = false;

    const archFor = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return undefined;
      const link = target.closest("a[href]");
      if (!link || !stage.contains(link)) return undefined;
      return ARCHES.find((arch) => arch.href === link.getAttribute("href"));
    };

    // 入口を選びそうな気配（hover・focus・指が触れた）で行き先を決めておき、窓の中の壁の画像を先に読み始める
    const onIntent = (event: Event) => {
      const arch = archFor(event.target);
      if (!arch || passing || overlay.dataset.to === arch.id) return;
      overlay.dataset.to = arch.id;
      // 遷移先も先に読み、広がり終えてから次の部屋が描かれるまでの待ちを短くする
      router.prefetch(arch.href);
    };

    const onClick = (event: MouseEvent) => {
      const arch = archFor(event.target);
      if (!arch) return;
      // 通り抜けている途中のクリックは、もう一度遷移させない
      if (passing) {
        event.preventDefault();
        return;
      }
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (reducedMotion.matches || typeof overlay.animate !== "function") return;
      const opening = stage.querySelector<HTMLElement>(`.${styles.arch}[data-arch="${arch.id}"]`);
      if (!opening) return;

      // Link より先に呼ばれる（React のイベントは hero より外側の root で受ける）ので、ここで止めれば Link は遷移しない
      event.preventDefault();
      passing = true;
      overlay.dataset.to = arch.id;
      hero.dataset.passage = arch.id;
      router.prefetch(arch.href);

      // 開口部の外形（上端は幅の半分を半径にした半円）を、画面に対する位置で取る
      const view = overlay.getBoundingClientRect();
      const rect = opening.getBoundingClientRect();
      const halfW = rect.width / 2;
      const halfH = rect.height / 2;
      const cx = rect.left + halfW - view.left;
      const cy = rect.top + halfH - view.top;
      // 中心を保ったまま何倍にすれば、半円より下の四角い部分が画面全体を覆うか
      const cover =
        Math.max(
          cx / halfW,
          (view.width - cx) / halfW,
          cy / Math.max(halfH - halfW, 1),
          (view.height - cy) / halfH,
        ) * 1.04;
      const archShape = (scale: number) => {
        const w = halfW * scale;
        const h = halfH * scale;
        return `inset(${cy - h}px ${view.width - cx - w}px ${view.height - cy - h}px ${cx - w}px round ${w}px ${w}px 0 0)`;
      };
      const openingKeyframes = Array.from({ length: STEPS + 1 }, (_, i) => ({
        offset: i / STEPS,
        clipPath: archShape(cover ** (i / STEPS)),
      }));

      // 舞台は、選んだアーチの開口部の中心を支点にズームする
      const stageRect = stage.getBoundingClientRect();
      stage.style.transformOrigin = `${((rect.left + halfW - stageRect.left) / stageRect.width) * 100}% ${
        ((rect.top + halfH - stageRect.top) / stageRect.height) * 100
      }%`;

      shade = document.createElement("div");
      shade.setAttribute("aria-hidden", "true");
      Object.assign(shade.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10",
        background: SHADE[arch.id],
        pointerEvents: "none",
      });
      document.body.append(shade);

      const timing = { duration: DURATION, easing: EASE, fill: "forwards" } as const;
      animations = [
        stage.animate({ scale: [1, ZOOM] }, timing),
        overlay.animate(openingKeyframes, timing),
        // 開口部の奥から現れるよう、窓の中の地は前半で静かに濃くする
        overlay.animate({ opacity: [0, 1] }, { ...timing, duration: DURATION * 0.45 }),
        // 陰は窓と同じ形で広げ、窓の中だけを暗くする（TOP の景色は暗くしない）
        shade.animate(openingKeyframes, timing),
        shade.animate({ opacity: [0, 1] }, timing),
      ];
      Promise.all(animations.map((animation) => animation.finished))
        .then(() => {
          markArrival();
          router.push(arch.href);
        })
        // 途中で取り消された（ページを離れた）ときは何もしない
        .catch(() => undefined);
    };

    // 次の部屋の着地の動きが終わったら、印を外す（Menu で移ったときや再読み込みでは、この動きをしない）
    const markArrival = () => {
      const root = document.documentElement;
      let timer = 0;
      const clear = () => {
        delete root.dataset.arrival;
        document.removeEventListener("animationend", onEnd);
        window.clearTimeout(timer);
      };
      const onEnd = (end: AnimationEvent) => {
        if (end.animationName.includes("passage-arrive")) clear();
      };
      // 順路の案内で TOP へ戻った直後なら、その印（RoomStepLink）が残っているので外し、着地の動きを1つにする
      delete root.dataset.roomStep;
      root.dataset.arrival = "passage";
      document.addEventListener("animationend", onEnd);
      timer = window.setTimeout(clear, CLEAR_MS);
    };

    // 通り抜けている途中で「動きを減らす」に変わったら、動きをその場で終わらせ、遷移はそのまま続ける
    // （cancel すると finished が reject され、遷移まで止まるので finish する）
    const onMotionChange = () => {
      if (reducedMotion.matches) animations.forEach((animation) => animation.finish());
    };
    reducedMotion.addEventListener("change", onMotionChange);

    hero.addEventListener("pointerover", onIntent);
    hero.addEventListener("focusin", onIntent);
    hero.addEventListener("pointerdown", onIntent);
    hero.addEventListener("click", onClick);
    return () => {
      hero.removeEventListener("pointerover", onIntent);
      hero.removeEventListener("focusin", onIntent);
      hero.removeEventListener("pointerdown", onIntent);
      hero.removeEventListener("click", onClick);
      reducedMotion.removeEventListener("change", onMotionChange);
      // cancel すると playState が戻るので、広がりきったかどうかは先に取っておく
      const finished = animations.length > 0 && animations.every((animation) => animation.playState === "finished");
      animations.forEach((animation) => animation.cancel());
      delete hero.dataset.passage;
      stage.style.transformOrigin = "";
      // 次の部屋に替わった。陰は画面全体を覆ったまま、元の色へ静かに戻す。
      // 広がりきる前に（戻る操作などで）離れたときは、元のページを暗くしないよう、すぐ外す
      // 「動きを減らす」のときも、フェードせずにすぐ外す
      if (shade && (!finished || reducedMotion.matches)) shade.remove();
      if (shade && finished && !reducedMotion.matches) {
        const leaving = shade;
        leaving.style.clipPath = "none";
        const lift = leaving.animate({ opacity: [1, 0] }, { duration: LIFT_MS, easing: EASE, fill: "forwards" });
        // 陰が晴れていく間に「動きを減らす」に変わったら、フェードをやめてすぐ外す（この effect の購読はもう外れている）
        const onLiftMotionChange = () => {
          if (reducedMotion.matches) lift.cancel();
        };
        reducedMotion.addEventListener("change", onLiftMotionChange);
        lift.finished
          .catch(() => undefined)
          .then(() => {
            reducedMotion.removeEventListener("change", onLiftMotionChange);
            leaving.remove();
          });
      }
    };
  }, [router]);

  return <div ref={ref} className={styles.passage} aria-hidden="true" />;
};

export default ArchPassage;
