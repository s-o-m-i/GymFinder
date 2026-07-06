/** Global motion language — Apple / Stripe / Linear tier */

export const MOTION = {
  duration: {
    fast: 0.4,
    base: 0.65,
    slow: 0.9,
    hero: 1.1,
  },
  ease: {
    out: "power3.out",
    expo: "expo.out",
    inOut: "power2.inOut",
  },
  stagger: {
    tight: 0.05,
    base: 0.08,
    relaxed: 0.12,
  },
  y: {
    sm: 16,
    md: 28,
    lg: 40,
  },
  scale: {
    enter: 0.92,
    hover: 1.04,
  },
} as const;
