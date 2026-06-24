import Link from "next/link";
import {
  Dumbbell,
  MapPin,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
} from "lucide-react";
import type { HeroStats } from "@/lib/hero-data";
import { formatHeroStatCount } from "@/lib/hero-data";

const POPULAR_SEARCHES = [
  { label: "Martial Arts", href: "/gyms/martial-arts", icon: Trophy },
  { label: "Group Fitness", href: "/gyms?search=group+fitness", icon: Users },
  { label: "MMA Clubs", href: "/gyms/mma", icon: Swords },
  { label: "Fighting Clubs", href: "/gyms/fighting-clubs", icon: Shield },
  { label: "Fitness Trainers", href: "/trainers", icon: Dumbbell },
  { label: "Upcoming Events", href: "/events", icon: Sparkles },
] as const;

const MAP_PINS = [
  { top: "22%", left: "28%" },
  { top: "38%", left: "52%" },
  { top: "55%", left: "35%" },
  { top: "48%", left: "68%" },
  { top: "68%", left: "58%" },
] as const;

interface HomePreFooterSectionProps {
  stats: HeroStats;
}

export function HomePreFooterSection({ stats }: HomePreFooterSectionProps) {
  const networkStats = [
    { value: formatHeroStatCount(stats.gyms), label: "Gyms Listed" },
    { value: formatHeroStatCount(stats.trainers), label: "Trainers" },
    { value: formatHeroStatCount(stats.cities), label: "Cities Covered" },
  ];

  return (
    <section
      id="home-pre-footer"
      className="relative overflow-hidden bg-[#0B2545] py-14 sm:py-16 lg:py-20"
      aria-label="Gym owners, network stats, and popular searches"
    >
      {/* Decorative accents */}
      <div
        className="pointer-events-none absolute -bottom-24 left-[4%] h-48 w-48 rounded-full border border-white/[0.06] opacity-40"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 bottom-0 h-56 w-56 opacity-[0.07]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle at center, #FF6A3D 0%, transparent 70%)",
        }}
      />
      <Sparkles
        className="pointer-events-none absolute bottom-16 right-[18%] hidden h-24 w-24 text-white/[0.04] lg:block"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-0 lg:divide-x lg:divide-white/10">
          {/* Column 1 — Own a Gym CTA */}
          <div className="relative flex flex-col justify-between border-b border-white/10 pb-10 lg:border-b-0 lg:pb-0 lg:px-8 lg:pr-10 xl:pr-12">
            <div>
              <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
                Own a Gym?
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/60">
                List your gym or training center on Pakistan&apos;s fitness marketplace. Get
                discovered by customers searching in Lahore, Karachi, Islamabad, and beyond.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/owner/register"
                  className="inline-flex items-center justify-center rounded-full bg-[#FF6A3D] px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/25 transition-colors hover:bg-[#e85528]"
                >
                  Register Your Gym
                </Link>
                <Link
                  href="/trainer/register"
                  className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:border-white/35 hover:bg-white/5"
                >
                  List as Trainer
                </Link>
              </div>
            </div>

            <div
              className="pointer-events-none mt-10 hidden h-28 w-28 opacity-[0.08] sm:block"
              aria-hidden
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='35' fill='none' stroke='white' stroke-width='0.5'/%3E%3Ccircle cx='50' cy='50' r='25' fill='none' stroke='white' stroke-width='0.5'/%3E%3Cpath d='M50 5 L50 95 M5 50 L95 50 M15 15 L85 85 M85 15 L15 85' stroke='white' stroke-width='0.3'/%3E%3C/svg%3E")`,
                backgroundSize: "contain",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>

          {/* Column 2 — Growing Fitness Network */}
          <div className="border-b border-white/10 pb-10 lg:border-b-0 lg:pb-0 lg:px-8 xl:px-10">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Growing Fitness Network
            </h2>

            <div className="mt-6 flex items-center gap-5 sm:gap-6">
              <ul className="shrink-0 space-y-4 sm:space-y-5">
                {networkStats.map((stat) => (
                  <li key={stat.label}>
                    <div className="font-heading text-3xl font-bold leading-none text-[#FF6A3D] sm:text-4xl">
                      {stat.value}
                    </div>
                    <div className="mt-1 text-xs font-medium text-white/50 sm:text-sm">
                      {stat.label}
                    </div>
                  </li>
                ))}
              </ul>

              <div className="relative min-h-[180px] flex-1 overflow-hidden rounded-2xl border border-white/10 bg-[#081c33] sm:min-h-[200px]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#0a2240] via-[#0B2545] to-[#12345f]" />
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "24px 24px",
                  }}
                  aria-hidden
                />
                {/* Simplified map silhouette */}
                <svg
                  viewBox="0 0 120 140"
                  className="absolute inset-0 h-full w-full p-3 text-white/[0.12]"
                  aria-hidden
                >
                  <path
                    fill="currentColor"
                    d="M62 8c-8 6-18 8-26 14-6 5-10 14-8 22 2 10 10 18 12 28 1 8-2 16-8 22-4 5-10 8-14 14-2 3-2 8 0 11 4 6 14 10 22 12 8 2 18 0 26-4 8-4 14-12 16-20 2-10-2-20-6-30-4-12-6-24-4-36 1-8 4-16 10-22 4-4 10-8 12-14 2-6-2-12-8-14-4-2-10-2-14-1z"
                  />
                </svg>
                {MAP_PINS.map((pin, i) => (
                  <span
                    key={i}
                    className="absolute flex h-3 w-3 -translate-x-1/2 -translate-y-full items-end justify-center"
                    style={{ top: pin.top, left: pin.left }}
                    aria-hidden
                  >
                    <MapPin className="h-5 w-5 fill-[#FF6A3D] text-[#FF6A3D] drop-shadow-sm" />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3 — Popular Searches */}
          <div className="relative lg:pl-8 xl:pl-10">
            <h2 className="font-heading text-xl font-bold text-white sm:text-2xl">
              Popular Searches
            </h2>

            <nav className="mt-6" aria-label="Popular fitness searches">
              <ul className="space-y-3 sm:space-y-3.5">
                {POPULAR_SEARCHES.map(({ label, href, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="group flex items-center gap-3 text-sm font-medium text-white/75 transition-colors hover:text-white"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-white/80 transition-colors group-hover:bg-[#FF6A3D]/15 group-hover:text-[#FF6A3D]">
                        <Icon className="h-4 w-4" strokeWidth={1.75} />
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
