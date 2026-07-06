"use client";

import { useEffect, useRef } from "react";

export function ScrollProgressBar() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let trigger: { kill: () => void } | null = null;
    let cancelled = false;

    async function init() {
      const { loadGsap } = await import("@/lib/motion/gsap");
      const { prefersReducedMotion } = await import("@/lib/motion/reduced-motion");
      const gsap = await loadGsap();
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (cancelled || !barRef.current || prefersReducedMotion()) return;

      gsap.set(barRef.current, { scaleX: 0, transformOrigin: "left center" });

      trigger = ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => {
          if (barRef.current) {
            gsap.set(barRef.current, { scaleX: self.progress });
          }
        },
      });
    }

    void init();

    return () => {
      cancelled = true;
      trigger?.kill();
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[2px] bg-transparent"
      aria-hidden
    >
      <div
        ref={barRef}
        className="h-full w-full origin-left bg-[#FF6A3D] will-change-transform"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
