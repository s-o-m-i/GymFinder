import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as STType } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion/config";

type Gsap = typeof GsapType;
type ScrollTrigger = typeof STType;

export function initPakistanMapMotion(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  isReduced: boolean
) {
  const section = scope.querySelector<HTMLElement>("[data-section='map']");
  if (!section) return;

  const mapFrame = section.querySelector<HTMLElement>("[data-pakistan-map]");
  const outline = section.querySelector<HTMLElement>("[data-pakistan-outline]");
  const pins = section.querySelectorAll<HTMLElement>("[data-map-pin]");
  const glows = section.querySelectorAll<HTMLElement>("[data-map-glow]");
  const dots = section.querySelectorAll<HTMLElement>("[data-map-dot]");
  const cleanups: (() => void)[] = [];

  if (isReduced) {
    gsap.set([mapFrame, outline, ...pins], { clearProps: "all", opacity: 1, scale: 1, y: 0 });
    return;
  }

  if (mapFrame) {
    gsap.set(mapFrame, { opacity: 0, y: 32, scale: 0.98 });
    gsap.to(mapFrame, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: MOTION.duration.slow,
      ease: MOTION.ease.out,
      scrollTrigger: { trigger: section, start: "top 80%", once: true },
    });
  }

  if (outline) {
    gsap.set(outline, { opacity: 0, scale: 0.94, transformOrigin: "50% 50%" });
    gsap.to(outline, {
      opacity: 1,
      scale: 1,
      duration: MOTION.duration.slow,
      ease: MOTION.ease.expo,
      scrollTrigger: { trigger: section, start: "top 78%", once: true },
    });
  }

  pins.forEach((pin, index) => {
    gsap.set(pin, { opacity: 0, scale: 0.4 });
    gsap.to(pin, {
      opacity: 1,
      scale: 1,
      duration: 0.55,
      delay: 0.15 + index * 0.09,
      ease: MOTION.ease.expo,
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
    });
  });

  glows.forEach((glow, index) => {
    gsap.set(glow, { scale: 0.6, opacity: 0.55 });
    gsap.to(glow, {
      scale: 2.4,
      opacity: 0,
      duration: 2.4,
      repeat: -1,
      delay: index * 0.35,
      ease: "sine.out",
    });
  });

  dots.forEach((dot) => {
    const onEnter = () => {
      gsap.to(dot, {
        scale: 1.35,
        duration: 0.35,
        ease: MOTION.ease.out,
      });
    };
    const onLeave = () => {
      gsap.to(dot, {
        scale: 1,
        duration: 0.45,
        ease: "elastic.out(1, 0.5)",
      });
    };

    dot.addEventListener("mouseenter", onEnter);
    dot.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      dot.removeEventListener("mouseenter", onEnter);
      dot.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
