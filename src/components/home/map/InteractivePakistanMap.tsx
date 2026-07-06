"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Radio } from "lucide-react";
import { PakistanMapSvg } from "@/components/home/map/PakistanMapSvg";
import type { PakistanMapCityStat } from "@/lib/home-map-data";
import { cn } from "@/lib/utils";

interface InteractivePakistanMapProps {
  cities: PakistanMapCityStat[];
  totalGyms: number;
}

function formatGymCount(count: number): string {
  if (count === 1) return "1 gym";
  return `${count} gyms`;
}

export function InteractivePakistanMap({ cities, totalGyms }: InteractivePakistanMapProps) {
  const [activeCity, setActiveCity] = useState<string | null>(null);

  return (
    <section
      id="pakistan-map"
      data-section="map"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(255,106,61,0.06), transparent 42%), radial-gradient(circle at 80% 70%, rgba(11,37,69,0.04), transparent 40%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
          <div data-reveal>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Nationwide Coverage
            </p>
            <h2 className="font-heading mb-4 text-2xl font-bold text-[#0B2545] sm:text-3xl lg:text-4xl">
              Fitness Across Pakistan
            </h2>
            <p className="mb-6 max-w-lg text-sm leading-relaxed text-[#5a6b7d] sm:text-base">
              From Karachi to Peshawar, discover verified gyms and fighting clubs in Pakistan&apos;s
              major cities. Hover a city to see live listings — click to explore gyms near you.
            </p>

            <div className="mb-8 flex flex-wrap gap-2">
              {cities.map((city) => (
                <Link
                  key={city.id}
                  href={city.href}
                  onMouseEnter={() => setActiveCity(city.id)}
                  onMouseLeave={() => setActiveCity((current) => (current === city.id ? null : current))}
                  onFocus={() => setActiveCity(city.id)}
                  onBlur={() => setActiveCity((current) => (current === city.id ? null : current))}
                  className={cn(
                    "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm",
                    activeCity === city.id
                      ? "border-[#FF6A3D]/50 bg-[#FF6A3D]/10 text-[#0B2545]"
                      : "border-[#0B2545]/12 bg-white text-[#5a6b7d] hover:border-[#FF6A3D]/30 hover:text-[#0B2545]"
                  )}
                >
                  {city.name}
                </Link>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="rounded-2xl border border-[#0B2545]/10 bg-[#F8FAFC] px-4 py-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5a6b7d]">
                  Listed nationwide
                </p>
                <p className="font-heading mt-0.5 text-2xl font-bold text-[#FF6A3D]">
                  {totalGyms > 0 ? `${totalGyms}+` : "Growing"}
                </p>
              </div>
              <Link
                href="/gyms"
                data-magnetic
                className="inline-flex items-center gap-2 rounded-2xl bg-[#FF6A3D] px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/25 transition-colors hover:bg-[#e85528]"
              >
                <MapPin className="h-4 w-4" />
                Browse all gyms
              </Link>
            </div>
          </div>

          <div
            data-pakistan-map
            data-reveal
            data-reveal-delay="0.08"
            className="relative overflow-hidden rounded-[28px] border border-[#0B2545]/10 bg-gradient-to-br from-[#F4F7FB] via-white to-[#EEF2F7] p-3 shadow-[0_24px_80px_rgba(11,37,69,0.08)] sm:p-5"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(255,106,61,0.06),transparent_58%)]" />

            <div className="relative mx-auto aspect-[1628/1544] w-full max-w-lg">
              <PakistanMapSvg className="h-full w-full drop-shadow-[0_8px_28px_rgba(11,37,69,0.12)]" />

              {cities.map((city) => {
                const isActive = activeCity === city.id;

                return (
                  <Link
                    key={city.id}
                    href={city.href}
                    data-map-pin
                    data-city={city.id}
                    aria-label={`${city.name}: ${formatGymCount(city.gymCount)}`}
                    onMouseEnter={() => setActiveCity(city.id)}
                    onMouseLeave={() => setActiveCity((current) => (current === city.id ? null : current))}
                    onFocus={() => setActiveCity(city.id)}
                    onBlur={() => setActiveCity((current) => (current === city.id ? null : current))}
                    className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${city.x}%`, top: `${city.y}%` }}
                  >
                    <span
                      data-map-glow
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-1/2 h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FF6A3D]/45",
                        isActive && "opacity-90"
                      )}
                    />
                    <span
                      data-map-dot
                      className={cn(
                        "relative flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-white bg-[#FF6A3D] shadow-[0_0_18px_rgba(255,106,61,0.85)]",
                        isActive && "scale-125"
                      )}
                    >
                      <span className="absolute inset-0 rounded-full bg-white/35" />
                    </span>

                    <span
                      className={cn(
                        "pointer-events-none absolute left-1/2 top-full z-20 mt-2 min-w-[9.5rem] -translate-x-1/2 rounded-xl border border-white/12 bg-[#0A0D10]/95 px-3 py-2 text-center shadow-xl backdrop-blur-md transition-all duration-300",
                        isActive
                          ? "translate-y-0 opacity-100"
                          : "translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100"
                      )}
                    >
                      <span className="block text-[11px] font-bold uppercase tracking-wide text-white">
                        {city.name}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold text-[#FF6A3D]">
                        {city.gymCount > 0 ? formatGymCount(city.gymCount) : "Explore gyms"}
                      </span>
                      <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-white/55">
                        View gyms
                        <ArrowRight className="h-3 w-3" />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-2">
              {[
                { label: "Punjab", color: "#6cab58" },
                { label: "Sindh", color: "#d4ad2a" },
                { label: "Balochistan", color: "#3f7a48" },
                { label: "KPK", color: "#2f9494" },
                { label: "GB & AJK", color: "#5fa862" },
              ].map((item) => (
                <span key={item.label} className="inline-flex items-center gap-1.5 text-[10px] text-[#5a6b7d]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#5a6b7d]">
              <Radio className="h-3.5 w-3.5 text-[#FF6A3D]" />
              Live gym coverage across Pakistan
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
