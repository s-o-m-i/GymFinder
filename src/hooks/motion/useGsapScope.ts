"use client";

import { useEffect, useRef } from "react";

/**
 * Scoped GSAP context with automatic cleanup on unmount.
 * Prefer HomeMotionProvider + data attributes for homepage sections.
 */
export function useGsapScope(
  setup: (ctx: { scope: HTMLElement; isReduced: boolean }) => void | (() => void),
  deps: unknown[] = []
) {
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    let reverted = false;
    let cleanup: (() => void) | undefined;

    async function run() {
      const { loadGsap } = await import("@/lib/motion/gsap");
      const { prefersReducedMotion } = await import("@/lib/motion/reduced-motion");
      const gsap = await loadGsap();
      if (reverted || !scopeRef.current) return;

      const ctx = gsap.context(() => {
        const result = setup({ scope: scopeRef.current!, isReduced: prefersReducedMotion() });
        if (typeof result === "function") cleanup = result;
      }, scopeRef);

      return () => ctx.revert();
    }

    let revertCtx: (() => void) | undefined;
    void run().then((revert) => {
      revertCtx = revert;
    });

    return () => {
      reverted = true;
      cleanup?.();
      revertCtx?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
