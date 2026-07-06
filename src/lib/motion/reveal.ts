import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as STType } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion/config";

type Gsap = typeof GsapType;
type ScrollTrigger = typeof STType;

export function initScrollReveals(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  isReduced: boolean
) {
  if (isReduced) {
    gsap.set(scope.querySelectorAll("[data-reveal]"), { clearProps: "all", opacity: 1, y: 0, scale: 1 });
    return;
  }

  const items = scope.querySelectorAll<HTMLElement>("[data-reveal]");
  items.forEach((el) => {
    const y = Number(el.dataset.revealY ?? MOTION.y.md);
    const scale = el.dataset.revealScale ? Number(el.dataset.revealScale) : 1;
    const delay = Number(el.dataset.revealDelay ?? 0);

    gsap.set(el, { opacity: 0, y, scale: scale < 1 ? scale : 1 });

    gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: MOTION.duration.base,
      ease: MOTION.ease.out,
      delay,
      scrollTrigger: {
        trigger: el,
        start: "top 88%",
        once: true,
        toggleActions: "play none none none",
      },
    });
  });
}

export function initStaggerChildren(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  selector: string,
  isReduced: boolean,
  options?: { stagger?: number; y?: number }
) {
  const containers = scope.querySelectorAll<HTMLElement>(selector);
  if (!containers.length) return;

  containers.forEach((container) => {
    const children = container.querySelectorAll<HTMLElement>(":scope > [data-stagger-item]");
    if (!children.length) return;

    if (isReduced) {
      gsap.set(children, { clearProps: "all", opacity: 1, y: 0, scale: 1 });
      return;
    }

    gsap.set(children, {
      opacity: 0,
      y: options?.y ?? MOTION.y.sm,
      scale: 0.96,
    });

    gsap.to(children, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: MOTION.duration.base,
      ease: MOTION.ease.out,
      stagger: options?.stagger ?? MOTION.stagger.base,
      scrollTrigger: {
        trigger: container,
        start: "top 85%",
        once: true,
      },
    });
  });
}

export function initCounters(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  isReduced: boolean
) {
  const counters = scope.querySelectorAll<HTMLElement>("[data-counter]");
  counters.forEach((el) => {
    const target = Number(el.dataset.counter ?? 0);
    const suffix = el.dataset.counterSuffix ?? "";
    const prefix = el.dataset.counterPrefix ?? "";

    if (isReduced || !target) {
      el.textContent = `${prefix}${target}${suffix}`;
      return;
    }

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
        el.textContent = `${prefix}${Math.round(obj.val)}${suffix}`;
      },
    });
  });
}
