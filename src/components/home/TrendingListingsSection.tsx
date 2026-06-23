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
    <section id="featured-listings" className="border-y border-[var(--border)] bg-[var(--card)] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">
              Trending Listings
            </p>
            <h2 className="font-heading text-2xl font-bold text-[var(--text)] sm:text-3xl">
              Featured Gyms &amp; Trainers
            </h2>
          </div>

          <div className="inline-flex rounded-xl border border-[var(--border)] bg-[var(--bg)] p-1">
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
                  "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                  tab === key
                    ? "bg-[#0B2545] text-white"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.slice(0, 6).map((item) => (
              <ListingCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg)] p-10 text-center">
            <p className="font-heading text-lg font-bold text-[var(--text)]">
              No featured {tab} yet
            </p>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Check back soon or browse all listings.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={tab === "gyms" ? "/gyms" : "/trainers"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6A3D] hover:text-[#e85528] transition-colors"
          >
            View all {tab === "gyms" ? "gyms" : "trainers"}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
