"use client";

import { Building2, CalendarDays, MapPin, Star, UserRound } from "lucide-react";
import { formatTrustedStatDisplay, type TrustedEcosystemStats } from "@/lib/trusted-partners-data";

const STAT_ICONS = [Building2, UserRound, MapPin, Star, CalendarDays] as const;

function getTrustedStatsForDisplay(stats: TrustedEcosystemStats) {
  return [
    { label: "Gyms", value: formatTrustedStatDisplay(stats.gyms, 500) },
    { label: "Trainers", value: formatTrustedStatDisplay(stats.trainers, 2000) },
    { label: "Cities", value: formatTrustedStatDisplay(stats.cities, 60) },
    { label: "Success Stories", value: formatTrustedStatDisplay(stats.successStories, 1200) },
    { label: "Events", value: formatTrustedStatDisplay(stats.events, 300) },
  ];
}

interface TrustedPartnersStatsProps {
  stats: TrustedEcosystemStats;
}

export function TrustedPartnersStats({ stats }: TrustedPartnersStatsProps) {
  const items = getTrustedStatsForDisplay(stats);

  return (
    <div
      data-trusted-stats
      data-reveal
      data-reveal-delay="0.1"
      className="mx-auto mt-8 max-w-5xl rounded-[22px] border border-white/[0.08] bg-[#0a1628]/75 px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_16px_50px_rgba(0,0,0,0.28)] sm:px-6 sm:py-6"
    >
      <div className="grid grid-cols-2 gap-y-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-y-0">
        {items.map((item, index) => {
          const Icon = STAT_ICONS[index];

          return (
            <div
              key={item.label}
              data-trusted-stat
              className="relative flex flex-col items-center px-2 text-center"
            >
              {index > 0 && (
                <span className="absolute left-0 top-1/2 hidden h-10 w-px -translate-y-1/2 bg-white/10 lg:block" />
              )}
              <Icon className="mb-2 h-5 w-5 text-[#FF6A3D]" strokeWidth={2} />
              <p className="font-heading text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-medium text-white/45 sm:text-sm">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
