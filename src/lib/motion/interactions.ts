import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as STType } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion/config";

type Gsap = typeof GsapType;
type ScrollTrigger = typeof STType;

export function initNavbarHeroMotion(gsap: Gsap, isReduced: boolean) {
  const header = document.querySelector<HTMLElement>("[data-hero-nav]");
  if (!header || isReduced) return;

  const logo = header.querySelector("[data-hero-nav-logo]");
  const links = header.querySelectorAll("[data-hero-nav-link]");
  const actions = header.querySelectorAll("[data-hero-nav-action]");

  const tl = gsap.timeline({ defaults: { ease: MOTION.ease.out } });

  gsap.set(header, { y: -12, opacity: 0 });
  tl.to(header, { y: 0, opacity: 1, duration: 0.6 }, 0);

  if (logo) {
    gsap.set(logo, { y: -8, opacity: 0 });
    tl.to(logo, { y: 0, opacity: 1, duration: 0.5 }, 0.05);
  }

  if (links.length) {
    gsap.set(links, { y: -6, opacity: 0 });
    tl.to(links, { y: 0, opacity: 1, duration: 0.45, stagger: 0.04 }, 0.12);
  }

  if (actions.length) {
    gsap.set(actions, { opacity: 0, scale: 0.96 });
    tl.to(actions, { opacity: 1, scale: 1, duration: 0.4, stagger: 0.05 }, 0.25);
  }
}

export function initMagneticButtons(gsap: Gsap, scope: HTMLElement, isReduced: boolean) {
  if (isReduced) return;

  const buttons = scope.querySelectorAll<HTMLElement>("[data-magnetic]");
  const cleanups: (() => void)[] = [];

  buttons.forEach((btn) => {
    const onMove = (e: MouseEvent) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      gsap.to(btn, {
        x: x * 0.2,
        y: y * 0.2,
        scale: MOTION.scale.hover,
        duration: 0.35,
        ease: MOTION.ease.out,
        overwrite: "auto",
      });
    };
    const onLeave = () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: MOTION.ease.out,
      });
    };

    btn.addEventListener("mousemove", onMove);
    btn.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      btn.removeEventListener("mousemove", onMove);
      btn.removeEventListener("mouseleave", onLeave);
    });
  });

  return () => cleanups.forEach((fn) => fn());
}

export function initSectionParallax(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  isReduced: boolean
) {
  if (isReduced) return;

  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px)", () => {
    scope.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
      const speed = Number(el.dataset.parallaxSpeed ?? 15);
      gsap.to(el, {
        yPercent: speed,
        ease: "none",
        scrollTrigger: {
          trigger: el.closest("[data-section]") ?? el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      });
    });
  });
}

export function initMapPins(gsap: Gsap, ScrollTrigger: ScrollTrigger, scope: HTMLElement, isReduced: boolean) {
  const section = scope.querySelector("[data-section='map']");
  if (!section || isReduced) return;

  const pins = section.querySelectorAll<HTMLElement>("[data-map-pin]");
  const grid = section.querySelector<HTMLElement>("[data-map-grid]");

  if (grid) {
    gsap.to(grid, {
      backgroundPosition: "32px 32px",
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 1,
      },
    });
  }

  pins.forEach((pin, i) => {
    gsap.set(pin, { scale: 0, opacity: 0 });
    gsap.to(pin, {
      scale: 1,
      opacity: 1,
      duration: 0.5,
      ease: MOTION.ease.expo,
      delay: i * 0.08,
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        once: true,
      },
    });
    gsap.fromTo(
      pin,
      { y: -8 },
      {
        y: 0,
        duration: 0.35,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          once: true,
        },
      }
    );
  });
}

export function initListingCards(gsap: Gsap, ScrollTrigger: ScrollTrigger, scope: HTMLElement, isReduced: boolean) {
  const section = scope.querySelector("[data-section='listings']");
  if (!section || isReduced) return;

  const cards = section.querySelectorAll<HTMLElement>("[data-listing-card]");
  cards.forEach((card, i) => {
    const image = card.querySelector<HTMLElement>("[data-listing-image]");
    const badge = card.querySelector<HTMLElement>("[data-listing-badge]");

    gsap.set(card, { opacity: 0, y: 32, scale: 0.94 });
    if (image) gsap.set(image, { clipPath: "inset(0 0 100% 0)" });
    if (badge) gsap.set(badge, { scale: 0, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: { trigger: card, start: "top 90%", once: true },
      delay: (i % 3) * 0.08,
    });

    tl.to(card, { opacity: 1, y: 0, scale: 1, duration: MOTION.duration.base, ease: MOTION.ease.out });
    if (image) tl.to(image, { clipPath: "inset(0 0 0% 0)", duration: MOTION.duration.slow, ease: MOTION.ease.inOut }, 0);
    if (badge) tl.to(badge, { scale: 1, opacity: 1, duration: 0.4, ease: MOTION.ease.expo }, 0.2);
  });
}

export function initExploreParallax(_gsap: Gsap, _ScrollTrigger: ScrollTrigger, _scope: HTMLElement, _isReduced: boolean) {
  // Disabled: vertical parallax caused explore cards to clip under Swiper overflow.
}
