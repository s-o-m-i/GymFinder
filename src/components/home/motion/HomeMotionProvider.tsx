"use client";

import { useEffect } from "react";
import { ScrollProgressBar } from "@/components/home/motion/ScrollProgressBar";
import { MOTION } from "@/lib/motion/config";

interface HomeMotionProviderProps {
  children: React.ReactNode;
}

export function HomeMotionProvider({ children }: HomeMotionProviderProps) {
  useEffect(() => {
    let ctxRevert: (() => void) | undefined;
    let cancelled = false;

    async function init() {
      const { loadGsap } = await import("@/lib/motion/gsap");
      const { prefersReducedMotion } = await import("@/lib/motion/reduced-motion");
      const { initHeroMotion } = await import("@/lib/motion/hero");
      const { initScrollReveals, initStaggerChildren, initCounters } = await import("@/lib/motion/reveal");
      const {
        initNavbarHeroMotion,
        initMagneticButtons,
        initSectionParallax,
        initListingCards,
        initExploreParallax,
      } = await import("@/lib/motion/interactions");
      const { initPakistanMapMotion } = await import("@/lib/motion/pakistan-map");
      const { initSuccessStoriesMotion } = await import("@/lib/motion/success-stories");

      const gsap = await loadGsap();
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (cancelled) return;

      const isReduced = prefersReducedMotion();
      const scope = document.querySelector<HTMLElement>("[data-home-motion]");
      if (!scope) return;

      const ctx = gsap.context(() => {
        initNavbarHeroMotion(gsap, isReduced);
        void initHeroMotion(gsap, scope, isReduced);

        initScrollReveals(gsap, ScrollTrigger, scope, isReduced);
        initStaggerChildren(gsap, ScrollTrigger, scope, "[data-stagger]", isReduced);
        initStaggerChildren(gsap, ScrollTrigger, scope, "[data-stagger-features]", isReduced, {
          stagger: 0.1,
          y: MOTION.y.md,
        });
        initStaggerChildren(gsap, ScrollTrigger, scope, "[data-stagger-events]", isReduced, {
          stagger: 0.08,
        });
        initStaggerChildren(gsap, ScrollTrigger, scope, "[data-stagger-blog]", isReduced, {
          stagger: 0.08,
        });
        initStaggerChildren(gsap, ScrollTrigger, scope, "[data-stagger-success-stories]", isReduced, {
          stagger: 0.07,
          y: MOTION.y.md,
        });
        initCounters(gsap, ScrollTrigger, scope, isReduced);
        const mapCleanup = initPakistanMapMotion(gsap, ScrollTrigger, scope, isReduced);
        initListingCards(gsap, ScrollTrigger, scope, isReduced);
        initExploreParallax(gsap, ScrollTrigger, scope, isReduced);
        initSectionParallax(gsap, ScrollTrigger, scope, isReduced);
        void initSuccessStoriesMotion(gsap, ScrollTrigger, scope, isReduced);

        const magneticCleanup = initMagneticButtons(gsap, scope, isReduced);

        const footer = scope.querySelector("[data-section='footer']");
        if (footer && !isReduced) {
          const items = footer.querySelectorAll("[data-footer-item]");
          gsap.set(items, { opacity: 0, y: 20 });
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            stagger: 0.04,
            ease: MOTION.ease.out,
            scrollTrigger: { trigger: footer, start: "top 92%", once: true },
          });
        }

        if (!isReduced) {
          scope.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
            gsap.fromTo(
              section,
              { opacity: 0.94 },
              {
                opacity: 1,
                ease: "none",
                scrollTrigger: {
                  trigger: section,
                  start: "top 90%",
                  end: "top 65%",
                  scrub: 0.5,
                },
              }
            );
          });
        }

        return () => {
          mapCleanup?.();
          magneticCleanup?.();
        };
      }, scope);

      ctxRevert = () => ctx.revert();
    }

    void init();

    return () => {
      cancelled = true;
      ctxRevert?.();
    };
  }, []);

  return (
    <>
      <ScrollProgressBar />
      {children}
    </>
  );
}
