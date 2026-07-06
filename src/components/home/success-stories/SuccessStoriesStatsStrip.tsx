import type { HomeSuccessStoryCommunityStats } from "@/services/success-story/success-story.service";
import { formatShowcaseStatValue } from "@/lib/success-stories/home-showcase";

interface SuccessStoriesStatsStripProps {
  stats: HomeSuccessStoryCommunityStats;
}

const STAT_ITEMS = [
  { key: "stories" as const, label: "Stories" },
  { key: "verifiedTrainers" as const, label: "Verified Trainers" },
  { key: "partnerGyms" as const, label: "Partner Gyms" },
  { key: "weightLostKg" as const, label: "Weight Lost", locale: true, suffix: "kg+" },
  { key: "cities" as const, label: "Cities" },
];

export function SuccessStoriesStatsStrip({ stats }: SuccessStoriesStatsStripProps) {
  return (
    <div
      data-reveal
      data-counter-group
      className="mt-12 rounded-[24px] bg-white/70 px-4 py-8 ring-1 ring-[#0B2545]/8 backdrop-blur-sm sm:mt-14 sm:px-8 sm:py-10"
    >
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {STAT_ITEMS.map((item) => {
          const value = stats[item.key];
          const display = item.locale
            ? null
            : formatShowcaseStatValue(value);

          return (
            <div key={item.key} className="text-center">
              {item.locale ? (
                <p
                  data-counter-locale={value}
                  data-counter-suffix={item.suffix}
                  className="font-heading text-2xl font-bold text-[#0B2545] sm:text-3xl"
                >
                  {value.toLocaleString("en-PK")}
                  {item.suffix}
                </p>
              ) : (
                <p
                  data-counter={value}
                  data-counter-suffix="+"
                  className="font-heading text-2xl font-bold text-[#0B2545] sm:text-3xl"
                >
                  {display}
                </p>
              )}
              <p className="mt-1 text-xs font-medium text-[#5a6b7d] sm:text-sm">{item.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
