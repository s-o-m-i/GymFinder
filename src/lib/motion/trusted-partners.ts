import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as STType } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion/config";

type Gsap = typeof GsapType;
type ScrollTrigger = typeof STType;

export function bootTrustedPartnersMarquee(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  root: HTMLElement,
  isReduced: boolean
): () => void {
  const section = root.closest<HTMLElement>("[data-section='trusted-partners']") ?? root;
  const track = root.querySelector<HTMLElement>("[data-trusted-track]");
  const set = root.querySelector<HTMLElement>("[data-trusted-set]");
  const marquee = root.querySelector<HTMLElement>("[data-trusted-marquee]");
  const prevBtn = root.querySelector<HTMLButtonElement>("[data-trusted-prev]");
  const nextBtn = root.querySelector<HTMLButtonElement>("[data-trusted-next]");

  if (!track || !set || isReduced) {
    if (track) gsap.set(track, { clearProps: "transform" });
    return () => {};
  }

  let marqueeTween: gsap.core.Tween | null = null;
  let inView = false;
  const cleanups: (() => void)[] = [];

  const getSetWidth = () => set.getBoundingClientRect().width + 32;

  const playIfVisible = () => {
    if (inView && marqueeTween) marqueeTween.play();
  };

  const setupMarquee = () => {
    const setWidth = getSetWidth();
    if (setWidth <= 32) return false;

    marqueeTween?.kill();
    gsap.set(track, { x: 0 });

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const pixelsPerSecond = isMobile ? 44 : 26;
    const duration = Math.max(setWidth / pixelsPerSecond, 22);

    marqueeTween = gsap.to(track, {
      x: -setWidth,
      duration,
      ease: "none",
      repeat: -1,
      paused: true,
    });

    playIfVisible();
    return true;
  };

  const ensureMarquee = () => {
    if (setupMarquee()) return;
    window.setTimeout(ensureMarquee, 80);
  };

  const pauseMarquee = () => marqueeTween?.pause();
  const resumeMarquee = () => playIfVisible();

  if (marquee) {
    marquee.addEventListener("mouseenter", pauseMarquee);
    marquee.addEventListener("mouseleave", resumeMarquee);
    cleanups.push(() => {
      marquee.removeEventListener("mouseenter", pauseMarquee);
      marquee.removeEventListener("mouseleave", resumeMarquee);
    });
  }

  const nudge = (direction: -1 | 1) => {
    if (!marqueeTween) return;
    pauseMarquee();
    gsap.to(track, {
      x: `+=${direction * 196}`,
      duration: 0.5,
      ease: MOTION.ease.out,
      onComplete: playIfVisible,
    });
  };

  if (prevBtn) {
    const onPrev = () => nudge(1);
    prevBtn.addEventListener("click", onPrev);
    cleanups.push(() => prevBtn.removeEventListener("click", onPrev));
  }

  if (nextBtn) {
    const onNext = () => nudge(-1);
    nextBtn.addEventListener("click", onNext);
    cleanups.push(() => nextBtn.removeEventListener("click", onNext));
  }

  const viewportTrigger = ScrollTrigger.create({
    trigger: section,
    start: "top bottom",
    end: "bottom top",
    onEnter: () => {
      inView = true;
      ensureMarquee();
      playIfVisible();
    },
    onLeave: () => {
      inView = false;
      pauseMarquee();
    },
    onEnterBack: () => {
      inView = true;
      playIfVisible();
    },
    onLeaveBack: () => {
      inView = false;
      pauseMarquee();
    },
  });

  const resizeObserver = new ResizeObserver(() => {
    ensureMarquee();
    playIfVisible();
  });
  resizeObserver.observe(set);

  ensureMarquee();
  ScrollTrigger.refresh();

  if (ScrollTrigger.isInViewport(section, 0.05)) {
    inView = true;
    playIfVisible();
  }

  return () => {
    viewportTrigger.kill();
    resizeObserver.disconnect();
    marqueeTween?.kill();
    gsap.set(track, { clearProps: "transform" });
    cleanups.forEach((cleanup) => cleanup());
  };
}

export function initTrustedPartnersMotion(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  isReduced: boolean
): () => void {
  const section = scope.querySelector<HTMLElement>("[data-section='trusted-partners']");
  if (!section) return () => {};

  const cards = section.querySelectorAll<HTMLElement>("[data-trusted-card]");
  const stats = section.querySelectorAll<HTMLElement>("[data-trusted-stat]");
  const cardCleanups: (() => void)[] = [];

  if (!isReduced) {
    cards.forEach((card, index) => {
      gsap.set(card, { opacity: 0, y: 18, scale: 0.96 });
      gsap.to(card, {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        delay: 0.04 + (index % 14) * 0.035,
        ease: MOTION.ease.out,
        scrollTrigger: { trigger: section, start: "top 78%", once: true },
      });
    });

    stats.forEach((stat, index) => {
      gsap.set(stat, { opacity: 0, y: 16 });
      gsap.to(stat, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        delay: 0.12 + index * 0.07,
        ease: MOTION.ease.out,
        scrollTrigger: { trigger: section, start: "top 76%", once: true },
      });
    });
  }

  section.querySelectorAll<HTMLElement>("[data-trusted-card]").forEach((card) => {
    const onEnter = () => {
      gsap.to(card, {
        scale: 1.05,
        y: -4,
        duration: 0.32,
        ease: MOTION.ease.out,
        overwrite: "auto",
      });
    };
    const onLeave = () => {
      gsap.to(card, {
        scale: 1,
        y: 0,
        duration: 0.32,
        ease: MOTION.ease.out,
        overwrite: "auto",
      });
    };

    card.addEventListener("mouseenter", onEnter);
    card.addEventListener("mouseleave", onLeave);
    card.addEventListener("focus", onEnter);
    card.addEventListener("blur", onLeave);

    cardCleanups.push(() => {
      card.removeEventListener("mouseenter", onEnter);
      card.removeEventListener("mouseleave", onLeave);
      card.removeEventListener("focus", onEnter);
      card.removeEventListener("blur", onLeave);
    });
  });

  return () => {
    cardCleanups.forEach((cleanup) => cleanup());
  };
}
