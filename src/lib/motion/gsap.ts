import type { gsap as GsapType } from "gsap";

let gsapInstance: typeof GsapType | null = null;
let scrollTriggerRegistered = false;

export async function loadGsap() {
  if (gsapInstance) return gsapInstance;

  const gsapModule = await import("gsap");
  const gsap = gsapModule.gsap;
  gsapInstance = gsap;

  if (!scrollTriggerRegistered && typeof window !== "undefined") {
    const { ScrollTrigger } = await import("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
    scrollTriggerRegistered = true;
  }

  return gsap;
}

export async function loadSplitType() {
  const mod = await import("split-type");
  return mod.default;
}
