"use client";

import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck } from "lucide-react";
import { TrustedPartnerCard } from "@/components/home/trusted/TrustedPartnerCard";
import { TrustedPartnersStats } from "@/components/home/trusted/TrustedPartnersStats";
import type { TrustedEcosystemStats, TrustedPartner } from "@/lib/trusted-partners-data";

interface TrustedPartnersShowcaseProps {
  partners: TrustedPartner[];
  stats: TrustedEcosystemStats;
}

export function TrustedPartnersShowcase({ partners, stats }: TrustedPartnersShowcaseProps) {
  const carouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    async function bootMarquee() {
      const { loadGsap } = await import("@/lib/motion/gsap");
      const { prefersReducedMotion } = await import("@/lib/motion/reduced-motion");
      const { bootTrustedPartnersMarquee } = await import("@/lib/motion/trusted-partners");

      if (cancelled || !carouselRef.current) return;

      const gsap = await loadGsap();
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      cleanup = bootTrustedPartnersMarquee(
        gsap,
        ScrollTrigger,
        carouselRef.current,
        prefersReducedMotion()
      );
    }

    void bootMarquee();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [partners]);

  return (
    <div className="relative">
      <div
        ref={carouselRef}
        data-trusted-carousel
        className="relative left-1/2 z-10 w-screen max-w-[100vw] -translate-x-1/2"
      >
        <div className="pointer-events-none absolute left-1/2 top-1/2 z-0 h-[420px] w-[min(100vw,520px)] -translate-x-1/2 -translate-y-1/2 sm:h-[520px]">
          <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(255,106,61,0.16)_0%,rgba(255,106,61,0.04)_38%,transparent_72%)]" />
          <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full opacity-35" aria-hidden>
            {[110, 170, 230, 290].map((radius) => (
              <circle
                key={radius}
                cx="260"
                cy="260"
                r={radius}
                fill="none"
                stroke="rgba(255,106,61,0.22)"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>

        <div className="relative">
          <button
            type="button"
            data-trusted-prev
            aria-label="Scroll partners left"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0a1628]/90 text-white/75 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all hover:border-[#FF6A3D]/40 hover:text-white sm:left-5 sm:h-11 sm:w-11 lg:left-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            data-trusted-next
            aria-label="Scroll partners right"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-[#0a1628]/90 text-white/75 shadow-[0_8px_24px_rgba(0,0,0,0.35)] transition-all hover:border-[#FF6A3D]/40 hover:text-white sm:right-5 sm:h-11 sm:w-11 lg:right-8"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div
            data-trusted-marquee
            className="trusted-marquee-row relative overflow-hidden py-2"
            aria-label="Trusted fitness partners"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[#050A14] via-[#050A14]/95 to-transparent sm:w-20 lg:w-28" />
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[#050A14] via-[#050A14]/95 to-transparent sm:w-20 lg:w-28" />

            <div data-trusted-track className="trusted-marquee-track flex w-max will-change-transform">
              {[0, 1].map((copy) => (
                <div
                  key={copy}
                  data-trusted-set
                  aria-hidden={copy === 1}
                  className="flex shrink-0 items-center gap-8 pr-8"
                >
                  {partners.map((partner) => (
                    <TrustedPartnerCard key={`${copy}-${partner.id}`} partner={partner} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal data-reveal-delay="0.06" className="mt-8 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-[#0a1628]/80 px-4 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.22)]">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#FF6A3D]/15">
              <ShieldCheck className="h-4 w-4 text-[#FF6A3D]" strokeWidth={2.2} />
            </span>
            <span className="text-sm font-medium text-white/85">Verified &amp; Trusted Partners</span>
          </div>
        </div>

        <TrustedPartnersStats stats={stats} />

        <p className="mt-6 text-center text-sm text-white/45">
          And many more partners joining every month...
        </p>
      </div>
    </div>
  );
}
