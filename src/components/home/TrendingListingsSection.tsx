"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ListingCard } from "@/components/home/ListingCard";
import type { HomeListingItem } from "@/lib/home-data";
import { cn } from "@/lib/utils";

interface TrendingListingsSectionProps {
  gyms: HomeListingItem[];
  trainers: HomeListingItem[];
}

type Tab = "gyms" | "trainers";

export function TrendingListingsSection({ gyms, trainers }: TrendingListingsSectionProps) {
  const [tab, setTab] = useState<Tab>("gyms");
  const items = tab === "gyms" ? gyms : trainers;

  return (
    <section
      id="featured-listings"
      data-section="listings"
      className="bg-[#0B2545] py-14 sm:py-16 lg:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div data-reveal className="mb-8 flex flex-col items-center gap-5 text-center sm:mb-10">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Top picks
            </p>
            <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
              Featured Cards
            </h2>
            <p className="mt-2 text-sm text-white/65">
              Top gyms and trainers hand-picked across Pakistan
            </p>
          </div>

          <div className="inline-flex rounded-full border border-white/15 bg-white/10 p-1">
            {(
              [
                { key: "gyms" as const, label: "Gyms" },
                { key: "trainers" as const, label: "Trainers" },
              ] as const
            ).map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-semibold transition-colors cursor-pointer",
                  tab === key
                    ? "bg-[#FF6A3D] text-white shadow-md shadow-[#FF6A3D]/25"
                    : "text-white/65 hover:text-white"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
            {items.slice(0, 6).map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/15 bg-white/5 p-10 text-center">
            <p className="font-heading text-lg font-bold text-white">
              No featured {tab} yet
            </p>
            <p className="mt-2 text-sm text-white/65">
              Check back soon or browse all listings.
            </p>
          </div>
        )}

        <div className="mt-8 text-center sm:mt-10">
          <Link
            href={tab === "gyms" ? "/gyms" : "/trainers"}
            data-magnetic
            className="inline-flex items-center gap-2 rounded-full bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#FF6A3D]/25 transition-colors hover:bg-[#e85528]"
          >
            View all {tab === "gyms" ? "gyms" : "trainers"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
