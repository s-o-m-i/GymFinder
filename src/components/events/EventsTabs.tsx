"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

interface EventsTabsProps {
  basePath: string;
}

export function EventsTabs({ basePath }: EventsTabsProps) {
  const searchParams = useSearchParams();
  const time = searchParams.get("time") === "past" ? "past" : "upcoming";

  function hrefFor(tab: "upcoming" | "past") {
    const params = new URLSearchParams(searchParams.toString());
    if (tab === "upcoming") {
      params.delete("time");
    } else {
      params.set("time", "past");
    }
    params.delete("page");
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const tabs = [
    { id: "upcoming" as const, label: "Upcoming Events" },
    { id: "past" as const, label: "Past Events" },
  ];

  return (
    <div
      className="inline-flex p-1 gap-1 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-sm"
      role="tablist"
      aria-label="Event time filter"
    >
      {tabs.map(({ id, label }) => (
        <Link
          key={id}
          href={hrefFor(id)}
          role="tab"
          aria-selected={time === id}
          className={cn(
            "px-4 py-2.5 rounded-xl text-sm font-semibold transition-all",
            time === id
              ? "bg-gradient-to-br from-[#0B2545] via-[#123a6b] to-[#071832] text-white shadow-md"
              : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg)]"
          )}
        >
          {label}
        </Link>
      ))}
    </div>
  );
}
