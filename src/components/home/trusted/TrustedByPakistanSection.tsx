import {
  getTrustedEcosystemStats,
  getTrustedPartners,
} from "@/services/home/trusted-partners.service";
import { TrustedPartnersShowcase } from "@/components/home/trusted/TrustedPartnersShowcase";

export async function TrustedByPakistanSection() {
  const [partners, stats] = await Promise.all([getTrustedPartners(), getTrustedEcosystemStats()]);

  return (
    <section
      id="trusted-by-pakistan"
      data-section="trusted-partners"
      className="trusted-by-pakistan-section relative overflow-hidden bg-[#050A14] py-16 sm:py-20 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#0B2545] to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto mb-10 max-w-4xl px-4 text-center sm:mb-12 sm:px-6 lg:px-8">
        <div data-reveal>
          <div className="mb-5 flex items-center justify-center gap-4">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#FF6A3D]/70 sm:w-16" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FF6A3D] sm:text-xs">
              Trusted by Pakistan
            </p>
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#FF6A3D]/70 sm:w-16" />
          </div>

          <h2 className="font-heading text-[1.75rem] font-bold leading-tight text-white sm:text-4xl lg:text-[2.65rem]">
            Trusted by Pakistan&apos;s Growing{" "}
            <span className="text-[#FF6A3D]">Fitness Community</span>
          </h2>

          <p className="mx-auto mt-4 max-w-3xl text-sm leading-relaxed text-white/55 sm:text-base">
            Leading gyms, trainers, fitness studios, boxing clubs, MMA academies, and wellness brands
            are building their presence on{" "}
            <span className="font-semibold text-white">
              Fitness<span className="text-[#FF6A3D]">Adda</span>
            </span>
            .
          </p>
        </div>
      </div>

      <TrustedPartnersShowcase partners={partners} stats={stats} />
    </section>
  );
}
