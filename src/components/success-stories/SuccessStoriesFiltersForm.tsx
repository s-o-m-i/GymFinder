"use client";

import { CITIES } from "@/lib/constants";
import {
  SUCCESS_STORY_GOAL_LABELS,
  SUCCESS_STORY_PUBLISHER_LABELS,
} from "@/lib/success-stories/types";
import { trackFilterUsed } from "@/lib/google-analytics";
import { SuccessStoryGender } from "@prisma/client";

interface SuccessStoriesFiltersFormProps {
  searchParams: Record<string, string | undefined>;
}

export function SuccessStoriesFiltersForm({ searchParams }: SuccessStoriesFiltersFormProps) {
  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);
    trackFilterUsed("success_stories", {
      q: (formData.get("q") as string) || undefined,
      publisher_type: (formData.get("publisherType") as string) || undefined,
      goal: (formData.get("goal") as string) || undefined,
      city: (formData.get("city") as string) || undefined,
      gender: (formData.get("gender") as string) || undefined,
      verified: formData.get("verified") === "1" ? "true" : undefined,
      featured: formData.get("featured") === "1" ? "true" : undefined,
    });
  }

  return (
    <form
      method="get"
      onSubmit={handleSubmit}
      className="mb-8 grid grid-cols-1 gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      <input
        name="q"
        defaultValue={searchParams.q}
        placeholder="Search title, client, gym, trainer…"
        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm sm:col-span-2 lg:col-span-4"
      />
      <select
        name="publisherType"
        defaultValue={searchParams.publisherType}
        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm"
      >
        <option value="">All publishers</option>
        {Object.entries(SUCCESS_STORY_PUBLISHER_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        name="goal"
        defaultValue={searchParams.goal}
        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm"
      >
        <option value="">All goals</option>
        {Object.entries(SUCCESS_STORY_GOAL_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <select
        name="city"
        defaultValue={searchParams.city}
        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm"
      >
        <option value="">All cities</option>
        {CITIES.map((city) => (
          <option key={city} value={city}>
            {city}
          </option>
        ))}
      </select>
      <select
        name="gender"
        defaultValue={searchParams.gender}
        className="h-11 rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 text-sm"
      >
        <option value="">All genders</option>
        {Object.entries(SuccessStoryGender).map(([value]) => (
          <option key={value} value={value}>
            {value.replace(/_/g, " ")}
          </option>
        ))}
      </select>
      <label className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <input
          type="checkbox"
          name="verified"
          value="1"
          defaultChecked={searchParams.verified === "1"}
        />
        Verified only
      </label>
      <label className="inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
        <input
          type="checkbox"
          name="featured"
          value="1"
          defaultChecked={searchParams.featured === "1"}
        />
        Featured only
      </label>
      <button
        type="submit"
        className="h-11 rounded-xl bg-[#0B2545] text-sm font-semibold text-white sm:col-span-2"
      >
        Apply filters
      </button>
    </form>
  );
}
