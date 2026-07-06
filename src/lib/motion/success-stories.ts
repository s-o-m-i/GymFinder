import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as STType } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion/config";
import { loadSplitType } from "@/lib/motion/gsap";

type Gsap = typeof GsapType;
type ScrollTrigger = typeof STType;

export async function initSuccessStoriesMotion(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  isReduced: boolean
) {
  const section = scope.querySelector<HTMLElement>("[data-section='success-stories']");
  if (!section) return;

  if (isReduced) {
    gsap.set(section.querySelectorAll("[data-success-stories-headline], [data-success-stories-card]"), {
      clearProps: "all",
      opacity: 1,
      y: 0,
      rotateX: 0,
      rotateY: 0,
    });
    return;
  }

  const headline = section.querySelector<HTMLElement>("[data-success-stories-headline]");
  if (headline) {
    const SplitType = await loadSplitType();
    const split = new SplitType(headline, { types: "lines,words" });
    if (split.words) {
      gsap.set(split.lines, { overflow: "hidden" });
      gsap.set(split.words, { yPercent: 100, opacity: 0 });
      gsap.to(split.words, {
        yPercent: 0,
        opacity: 1,
        duration: MOTION.duration.hero,
        stagger: 0.03,
        ease: MOTION.ease.expo,
        scrollTrigger: {
          trigger: headline,
          start: "top 88%",
          once: true,
        },
      });
    }
  }

  const featuredMedia = section.querySelector<HTMLElement>("[data-success-stories-featured-media]");
  if (featuredMedia) {
    gsap.set(featuredMedia, { clipPath: "inset(0 0 100% 0)", opacity: 0.6 });
    gsap.to(featuredMedia, {
      clipPath: "inset(0 0 0% 0)",
      opacity: 1,
      duration: MOTION.duration.slow,
      ease: MOTION.ease.inOut,
      scrollTrigger: {
        trigger: featuredMedia,
        start: "top 85%",
        once: true,
      },
    });

    gsap.to(featuredMedia, {
      y: -28,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.8,
      },
    });
  }

  const ctaBanner = section.querySelector<HTMLElement>("[data-success-stories-cta]");
  if (ctaBanner) {
    gsap.set(ctaBanner, { opacity: 0, y: 40, scale: 0.98 });
    gsap.to(ctaBanner, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: MOTION.duration.base,
      ease: MOTION.ease.out,
      scrollTrigger: {
        trigger: ctaBanner,
        start: "top 90%",
        once: true,
      },
    });
  }

  const weightCounters = section.querySelectorAll<HTMLElement>("[data-counter-locale]");
  weightCounters.forEach((el) => {
    const target = Number(el.dataset.counterLocale ?? 0);
    const suffix = el.dataset.counterSuffix ?? "";
    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: MOTION.duration.slow,
      ease: MOTION.ease.out,
      scrollTrigger: {
        trigger: el.closest("[data-counter-group]") ?? el,
        start: "top 85%",
        once: true,
      },
      onUpdate: () => {
        el.textContent = `${Math.round(obj.val).toLocaleString("en-PK")}${suffix}`;
      },
    });
  });

  initStoryCardTilt(gsap, section);
}

function initStoryCardTilt(gsap: Gsap, section: HTMLElement) {
  const cards = section.querySelectorAll<HTMLElement>("[data-success-stories-card]");
  const cleanups: (() => void)[] = [];

  cards.forEach((card) => {
    const inner = card.querySelector<HTMLElement>("[data-success-stories-card-inner]") ?? card;
    const setRotateX = gsap.quickSetter(inner, "rotateX", "deg");
    const setRotateY = gsap.quickSetter(inner, "rotateY", "deg");

    const onMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      setRotateY(x * 5);
      setRotateX(-y * 5);
    };

    const onLeave = () => {
      gsap.to(inner, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.6,
        ease: MOTION.ease.out,
      });
    };

    card.addEventListener("mousemove", onMove);
    card.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      card.removeEventListener("mousemove", onMove);
      card.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
