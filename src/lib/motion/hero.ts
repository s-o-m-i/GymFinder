import type { gsap as GsapType } from "gsap";
import { MOTION } from "@/lib/motion/config";
import { loadSplitType } from "@/lib/motion/gsap";

type Gsap = typeof GsapType;

export async function initHeroMotion(gsap: Gsap, scope: Document | HTMLElement, isReduced: boolean) {
  const root = scope instanceof Document ? scope : scope;
  const hero = root.querySelector<HTMLElement>("[data-hero]");
  if (!hero) return;

  const headline = hero.querySelector<HTMLElement>("[data-hero-headline]");
  const sub = hero.querySelector<HTMLElement>("[data-hero-sub]");
  const search = hero.querySelector<HTMLElement>("[data-hero-search]");
  const searchIcon = hero.querySelector<HTMLElement>("[data-hero-search-icon]");
  const chips = hero.querySelectorAll<HTMLElement>("[data-hero-chip]");
  const stats = hero.querySelectorAll<HTMLElement>("[data-hero-stat]");
  const bgGlows = hero.querySelectorAll<HTMLElement>("[data-hero-glow]");
  const grid = hero.querySelector<HTMLElement>("[data-hero-grid]");
  const scrollHint = hero.querySelector<HTMLElement>("[data-hero-scroll]");

  if (isReduced) {
    gsap.set([headline, sub, search, ...chips, ...stats, scrollHint].filter(Boolean), {
      clearProps: "all",
      opacity: 1,
    });
    return;
  }

  const tl = gsap.timeline({ defaults: { ease: MOTION.ease.out } });

  // Background
  if (grid) gsap.set(grid, { opacity: 0 });
  if (bgGlows.length) gsap.set(bgGlows, { opacity: 0, scale: 0.9 });

  tl.to(grid, { opacity: 0.3, duration: 1.2, ease: MOTION.ease.inOut }, 0.4);
  tl.to(bgGlows, { opacity: 1, scale: 1, duration: 1.1, stagger: 0.15, ease: MOTION.ease.inOut }, 0.5);

  // Headline — SplitType line reveal
  if (headline) {
    const SplitType = await loadSplitType();
    const lines = headline.querySelectorAll<HTMLElement>("[data-hero-line]");
    gsap.set(headline, { opacity: 1 });

    lines.forEach((line, lineIndex) => {
      const split = new SplitType(line, { types: "lines,words" });
      const accents = line.querySelectorAll<HTMLElement>("[data-hero-accent]");

      if (split.lines) {
        gsap.set(split.lines, { overflow: "hidden" });
        gsap.set(split.words, { yPercent: 110, opacity: 0 });
        tl.to(
          split.words,
          {
            yPercent: 0,
            opacity: 1,
            duration: MOTION.duration.hero,
            stagger: 0.04,
            ease: MOTION.ease.expo,
          },
          0.15 + lineIndex * 0.12
        );
      }

      if (accents.length) {
        gsap.set(accents, { scale: 0.92, opacity: 0, display: "inline-block" });
        tl.to(
          accents,
          {
            scale: 1,
            opacity: 1,
            duration: MOTION.duration.base,
            stagger: 0.06,
            ease: MOTION.ease.out,
          },
          0.35 + lineIndex * 0.12
        );
      }
    });
  }

  if (sub) {
    gsap.set(sub, { opacity: 0, y: 16 });
    tl.to(sub, { opacity: 1, y: 0, duration: MOTION.duration.base }, 0.55);
  }

  if (search) {
    gsap.set(search, { opacity: 0, scale: 0.95, transformOrigin: "center top" });
    tl.to(
      search,
      { opacity: 1, scale: 1, duration: MOTION.duration.slow, ease: MOTION.ease.expo },
      0.65
    );
  }

  if (chips.length) {
    gsap.set(chips, { opacity: 0, y: 14 });
    tl.to(chips, { opacity: 1, y: 0, duration: 0.5, stagger: MOTION.stagger.tight }, 0.85);
  }

  if (stats.length) {
    stats.forEach((stat) => {
      const valueEl = stat.querySelector<HTMLElement>("[data-hero-stat-value]");
      const raw = Number(stat.dataset.statValue ?? 0);
      const suffix = stat.dataset.statSuffix ?? "";

      gsap.set(stat, { opacity: 0, scale: 0.9 });
      tl.to(stat, { opacity: 1, scale: 1, duration: MOTION.duration.base, ease: MOTION.ease.out }, 1);

      if (valueEl && raw > 0) {
        const obj = { v: 0 };
        tl.to(
          obj,
          {
            v: raw,
            duration: MOTION.duration.slow,
            ease: MOTION.ease.out,
            onUpdate: () => {
              valueEl.textContent = formatStatDisplay(Math.round(obj.v), suffix);
            },
          },
          1.05
        );
      }
    });
  }

  if (scrollHint) {
    gsap.set(scrollHint, { opacity: 0 });
    tl.to(scrollHint, { opacity: 1, duration: 0.5 }, 1.4);
  }

  // Search focus micro-interactions
  const input = hero.querySelector<HTMLInputElement>("[data-hero-search-input]");
  if (input && search) {
    input.addEventListener("focus", () => {
      gsap.to(search, { boxShadow: "0 12px 48px rgba(255,106,61,0.15)", duration: 0.35, ease: MOTION.ease.out });
      if (searchIcon) gsap.to(searchIcon, { rotate: 12, duration: 0.35, ease: MOTION.ease.out });
    });
    input.addEventListener("blur", () => {
      gsap.to(search, { boxShadow: "0 8px 40px rgba(0,0,0,0.35)", duration: 0.35, ease: MOTION.ease.out });
      if (searchIcon) gsap.to(searchIcon, { rotate: 0, duration: 0.35, ease: MOTION.ease.out });
    });
  }

  // Subtle hero parallax on mouse (desktop only)
  const mm = gsap.matchMedia();
  mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
    const onMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth - 0.5) * 20;
      const y = (e.clientY / innerHeight - 0.5) * 12;
      gsap.to(bgGlows, { x, y, duration: 0.8, ease: MOTION.ease.inOut, overwrite: "auto" });
    };
    hero.addEventListener("mousemove", onMove);
    return () => hero.removeEventListener("mousemove", onMove);
  });
}

function formatStatDisplay(n: number, suffix: string): string {
  if (suffix === "+" && n >= 1000) return `${n.toLocaleString("en-US")}+`;
  if (suffix === "+" && n >= 100) return `${Math.floor(n / 10) * 10}+`;
  if (suffix === "+" && n >= 10) return `${n}+`;
  return `${n}${suffix}`;
}
