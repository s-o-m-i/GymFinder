/**
 * Homepage GSAP motion hooks — thin wrappers around the motion system.
 * Animations are orchestrated by HomeMotionProvider; these hooks are for
 * section-scoped or component-scoped extensions.
 */

export { useGsapScope } from "./useGsapScope";

/** @deprecated Use HomeMotionProvider — hero runs automatically on homepage */
export function useHeroAnimation() {
  // Orchestrated globally via HomeMotionProvider + initHeroMotion
}

/** @deprecated Use data-reveal attributes — reveal runs via HomeMotionProvider */
export function useRevealAnimation() {
  // See src/lib/motion/reveal.ts
}

/** @deprecated Use data-stagger-* attributes on section grids */
export function useCardsAnimation() {
  // See initStaggerChildren in src/lib/motion/reveal.ts
}

/** @deprecated Use data-counter attributes */
export function useCounterAnimation() {
  // See initCounters in src/lib/motion/reveal.ts
}

/** @deprecated Use data-magnetic on CTA elements */
export function useMagneticButtons() {
  // See initMagneticButtons in src/lib/motion/interactions.ts
}

/** @deprecated Use data-parallax attributes */
export function useParallax() {
  // See initSectionParallax in src/lib/motion/interactions.ts
}
