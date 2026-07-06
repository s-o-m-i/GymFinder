import type { gsap as GsapType } from "gsap";
import type { ScrollTrigger as STType } from "gsap/ScrollTrigger";
import { MOTION } from "@/lib/motion/config";

type Gsap = typeof GsapType;
type ScrollTrigger = typeof STType;

export function initEcosystemNetworkMotion(
  gsap: Gsap,
  ScrollTrigger: ScrollTrigger,
  scope: HTMLElement,
  isReduced: boolean
) {
  const section = scope.querySelector<HTMLElement>("[data-section='ecosystem-network']");
  if (!section) return;

  const stage = section.querySelector<HTMLElement>("[data-network-stage]");
  const paths = section.querySelectorAll<SVGPathElement>("[data-network-path]");
  const flows = section.querySelectorAll<SVGPathElement>("[data-network-flow]");
  const nodes = section.querySelectorAll<HTMLElement>("[data-network-node]");
  const pulses = section.querySelectorAll<SVGCircleElement>("[data-network-pulse]");
  const legends = section.querySelectorAll<HTMLElement>("[data-network-legend]");
  const nodeGlows = section.querySelectorAll<HTMLElement>("[data-network-node-glow]");

  if (isReduced) {
    gsap.set([stage, ...nodes, ...legends], { clearProps: "all", opacity: 1, scale: 1, y: 0 });
    paths.forEach((path) => {
      gsap.set(path, { strokeDasharray: "none", strokeDashoffset: 0, opacity: 1 });
    });
    return;
  }

  if (stage) {
    gsap.set(stage, { opacity: 0, y: 36, scale: 0.96 });
    gsap.to(stage, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: MOTION.duration.slow,
      ease: MOTION.ease.out,
      scrollTrigger: { trigger: section, start: "top 78%", once: true },
    });
  }

  paths.forEach((path, index) => {
    const length = path.getTotalLength();
    gsap.set(path, {
      strokeDasharray: length,
      strokeDashoffset: length,
      opacity: 0.35,
    });
    gsap.to(path, {
      strokeDashoffset: 0,
      opacity: 1,
      duration: 1.1,
      delay: 0.08 + index * 0.06,
      ease: MOTION.ease.inOut,
      scrollTrigger: { trigger: section, start: "top 75%", once: true },
    });
  });

  flows.forEach((flow, index) => {
    gsap.fromTo(
      flow,
      { opacity: 0 },
      {
        opacity: 1,
        duration: 0.6,
        delay: 0.4 + index * 0.05,
        ease: MOTION.ease.out,
        scrollTrigger: { trigger: section, start: "top 72%", once: true },
      }
    );
  });

  nodes.forEach((node, index) => {
    gsap.set(node, { opacity: 0, scale: 0.5, y: 12 });
    gsap.to(node, {
      opacity: 1,
      scale: 1,
      y: 0,
      duration: 0.65,
      delay: 0.2 + index * 0.12,
      ease: MOTION.ease.expo,
      scrollTrigger: { trigger: section, start: "top 74%", once: true },
    });
  });

  nodeGlows.forEach((glow, index) => {
    gsap.to(glow, {
      scale: 1.35,
      opacity: 0.55,
      duration: 1.8,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.25,
    });
  });

  pulses.forEach((pulse, index) => {
    gsap.set(pulse, { opacity: 0, scale: 0.6, transformOrigin: "50% 50%" });
    gsap.to(pulse, {
      opacity: 0.7,
      scale: 1.45,
      duration: 2.2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.3,
    });
  });

  legends.forEach((item, index) => {
    gsap.set(item, { opacity: 0, x: -16 });
    gsap.to(item, {
      opacity: 1,
      x: 0,
      duration: 0.55,
      delay: 0.15 + index * 0.08,
      ease: MOTION.ease.out,
      scrollTrigger: { trigger: section, start: "top 76%", once: true },
    });
  });
}
