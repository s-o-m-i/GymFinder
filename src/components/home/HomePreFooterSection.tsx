import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Play,
  Star,
  UserRound,
} from "lucide-react";
import type { HeroStats } from "@/lib/hero-data";
import {
  buildHomeCtaStats,
  HOME_CTA_ACTION_CARDS,
  HOME_CTA_REVIEW_AVATARS,
  HOME_CTA_TRUST_ITEMS,
} from "@/lib/home-cta-data";

interface HomePreFooterSectionProps {
  stats: HeroStats;
  eventsCount?: number;
}

export function HomePreFooterSection({ stats, eventsCount = 500 }: HomePreFooterSectionProps) {
  const ctaStats = buildHomeCtaStats(stats, eventsCount);

  return (
    <section
      id="home-join-cta"
      data-section="cta"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
      aria-label="Join FitnessAdda call to action"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 78% 22%, rgba(255,106,61,0.06), transparent 34%), radial-gradient(circle at 10% 90%, rgba(11,37,69,0.04), transparent 28%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:gap-12 xl:gap-16">
          <div data-reveal>
            <div className="mb-5 flex items-center gap-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#FF6A3D] sm:text-xs">
                Join FitnessAdda
              </p>
              <span className="h-px w-12 bg-gradient-to-r from-[#FF6A3D]/80 to-transparent sm:w-16" />
            </div>

            <h2 className="font-heading max-w-xl text-[1.85rem] font-bold leading-[1.12] text-[#0B2545] sm:text-4xl lg:text-[2.65rem]">
              Be Part of Pakistan&apos;s Largest{" "}
              <span className="text-[#FF6A3D]">Fitness Network</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5a6b7d] sm:text-base">
              List your gym, grow your brand, connect with more members, and be part of a community
              that&apos;s transforming lives across Pakistan.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3 sm:mt-8">
              <Link
                href="/owner/register"
                data-magnetic
                className="inline-flex items-center gap-2.5 rounded-xl bg-[#FF6A3D] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(255,106,61,0.25)] transition-colors hover:bg-[#e85528]"
              >
                <UserRound className="h-4 w-4" strokeWidth={2.2} />
                Get Started Now
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/for-businesses"
                className="inline-flex items-center gap-2.5 rounded-xl border border-[#0B2545]/12 bg-white px-5 py-3.5 text-sm font-semibold text-[#0B2545] shadow-sm transition-colors hover:border-[#FF6A3D]/30 hover:text-[#FF6A3D]"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#0B2545]/12 bg-[#F8FAFC]">
                  <Play className="h-3 w-3 fill-[#0B2545] text-[#0B2545]" />
                </span>
                Learn More
              </Link>
            </div>
          </div>

          <div
            data-reveal
            data-reveal-delay="0.08"
            className="relative mx-auto w-full max-w-[560px] lg:mx-0 lg:ml-auto lg:max-w-none"
          >
            <Image
              src="/images/CTA.png"
              alt="Fitness professionals on FitnessAdda"
              width={1536}
              height={1024}
              className="h-auto w-full max-h-[280px] object-contain object-center sm:max-h-[340px] lg:max-h-[420px] lg:object-right"
              sizes="(max-width: 1024px) 100vw, 560px"
            />
          </div>
        </div>

        {/* Stats bar */}
        <div
          data-reveal
          data-reveal-delay="0.06"
          className="mt-12 rounded-[22px] border border-[#0B2545]/10 bg-white px-4 py-5 shadow-[0_8px_30px_rgba(11,37,69,0.08)] sm:mt-14 sm:px-6 sm:py-6"
        >
          <div className="grid grid-cols-2 gap-y-6 lg:grid-cols-4 lg:gap-y-0">
            {ctaStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.id}
                  className="relative flex items-center gap-3 px-2 sm:gap-4 sm:px-3"
                >
                  {index > 0 && (
                    <span className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-[#0B2545]/10 lg:block" />
                  )}
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FF6A3D]/10 text-[#FF6A3D]">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span>
                    <span className="font-heading block text-2xl font-bold leading-none text-[#0B2545] sm:text-[1.65rem]">
                      {stat.display}
                    </span>
                    <span className="mt-1 block text-xs text-[#5a6b7d] sm:text-sm">{stat.label}</span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action cards */}
        <div
          data-stagger-cta-cards
          className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 md:grid-cols-2 xl:grid-cols-4 xl:gap-5"
        >
          {HOME_CTA_ACTION_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.id}
                href={card.href}
                aria-label={`${card.title}: ${card.linkLabel}`}
                className="group relative flex min-h-[260px] flex-col overflow-hidden rounded-[22px] border border-[#0B2545]/10 bg-white p-5 shadow-[0_8px_30px_rgba(11,37,69,0.06)] transition-[transform,box-shadow,border-color] duration-500 ease-out motion-safe:hover:-translate-y-1.5 hover:border-[#FF6A3D]/35 hover:shadow-[0_20px_48px_rgba(255,106,61,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6A3D]/60 focus-visible:ring-offset-2 active:scale-[0.99] sm:p-6"
              >
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[22px] bg-[radial-gradient(circle_at_50%_0%,rgba(255,106,61,0.1),transparent_72%)] opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100"
                />

                <span className="relative mb-5 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#FF6A3D]/20 bg-[#FF6A3D]/10 text-[#FF6A3D] transition-[transform,background-color,border-color] duration-500 ease-out motion-safe:group-hover:scale-110 group-hover:border-[#FF6A3D]/35 group-hover:bg-[#FF6A3D]/15">
                  <Icon className="h-5 w-5 transition-transform duration-500 ease-out motion-safe:group-hover:scale-105" strokeWidth={2} />
                </span>

                <p className="relative text-[10px] font-semibold uppercase tracking-[0.18em] text-[#FF6A3D] sm:text-[11px]">
                  {card.eyebrow}
                </p>
                <h3 className="font-heading relative mt-2 text-lg font-bold text-[#0B2545] transition-colors duration-300 ease-out group-hover:text-[#FF6A3D] sm:text-xl">
                  {card.title}
                </h3>
                <p className="relative mt-2 flex-1 text-sm leading-relaxed text-[#5a6b7d] transition-colors duration-300 ease-out group-hover:text-[#4a5a6b]">
                  {card.description}
                </p>

                <div className="relative mt-5 flex items-end justify-between gap-3">
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6A3D] transition-colors duration-300 ease-out group-hover:text-[#e85528]">
                    {card.linkLabel}
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-1" />
                  </span>

                  <span
                    aria-hidden
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A3D] text-white shadow-[0_8px_20px_rgba(255,106,61,0.25)] transition-[transform,box-shadow,background-color] duration-500 ease-out motion-safe:group-hover:scale-110 group-hover:bg-[#e85528] group-hover:shadow-[0_14px_32px_rgba(255,106,61,0.38)]"
                  >
                    <ArrowUpRight
                      className="h-4 w-4 transition-transform duration-500 ease-out motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                      strokeWidth={2.2}
                    />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Trust bar */}
        <div
          data-reveal
          data-reveal-delay="0.1"
          className="mt-8 grid grid-cols-1 gap-4 rounded-[22px] border border-[#0B2545]/10 bg-white px-4 py-5 shadow-[0_8px_30px_rgba(11,37,69,0.06)] sm:mt-10 sm:px-6 sm:py-6 lg:grid-cols-[1fr_1fr_1.05fr] lg:gap-6"
        >
          {HOME_CTA_TRUST_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-start gap-3 sm:items-center">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FF6A3D]/10 text-[#FF6A3D]">
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span>
                  <p className="text-sm font-bold text-[#0B2545] sm:text-base">{item.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-[#5a6b7d] sm:text-sm">
                    {item.description}
                  </p>
                </span>
              </div>
            );
          })}

          <div className="flex items-center gap-4 lg:justify-end">
            <div className="flex -space-x-2.5">
              {HOME_CTA_REVIEW_AVATARS.map((avatar) => (
                <span
                  key={avatar.initials}
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm ${avatar.className}`}
                >
                  {avatar.initials}
                </span>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg font-bold text-[#FF6A3D]">4.9/5</span>
                <span className="inline-flex items-center gap-0.5 text-[#FF6A3D]">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />
                  ))}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-[#5a6b7d] sm:text-sm">From 2,500+ reviews</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
