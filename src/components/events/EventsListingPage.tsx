import Link from "next/link";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { EventCard } from "@/components/events/EventCard";
import { EventsTabs } from "@/components/events/EventsTabs";
import { EventsFilters } from "@/components/events/EventsFilters";
import { getEventsListing, getEventFilterGyms } from "@/services/events/event.service";
import { getEventsBasePath, EVENT_CITY_SEO } from "@/lib/events-routes";
import { EVENT_TIME_OF_DAY_LABELS, type EventTimeOfDay } from "@/lib/event-constants";
import type { City } from "@/lib/constants";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface EventsListingPageProps {
  searchParams: Record<string, string | string[] | undefined>;
  city?: City;
}

function Pagination({
  page,
  totalPages,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  if (totalPages <= 1) return null;

  function pageHref(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      if (typeof v === "string" && k !== "page") params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  return (
    <div className="flex items-center justify-center gap-3 mt-10">
      {page > 1 ? (
        <Link
          href={pageHref(page - 1)}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold hover:border-[#FF6A3D]/30"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm text-[var(--text-muted)]">Previous</span>
      )}
      <span className="text-sm text-[var(--text-muted)]">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={pageHref(page + 1)}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-semibold hover:border-[#FF6A3D]/30"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm text-[var(--text-muted)]">Next</span>
      )}
    </div>
  );
}

export async function EventsListingPage({ searchParams, city }: EventsListingPageProps) {
  const [{ events, total, page, totalPages, filters }, gyms] = await Promise.all([
    getEventsListing(searchParams, city),
    getEventFilterGyms(city),
  ]);
  const basePath = getEventsBasePath({ city }).split("?")[0];
  const selectedGym = gyms.find((g) => g.id === filters.gymId);
  const formattedDate = filters.date
    ? new Date(`${filters.date}T12:00:00`).toLocaleDateString("en-PK", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const h1 = city
    ? `Events in ${city}`
    : filters.time === "past"
      ? "Past Events"
      : "Upcoming Events";
  const intro = city
    ? EVENT_CITY_SEO[city].description
    : "Browse boxing, MMA, fitness, and martial arts events across gyms and fighting clubs.";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumbs
              className="mb-3"
              items={[
                { label: "Home", href: "/" },
                { label: "Events", href: "/events" },
                ...(city ? [{ label: city }] : []),
              ]}
            />
            <div className="flex items-center gap-3 mb-2">
              <CalendarDays className="w-7 h-7 text-[#FF6A3D]" />
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)]">{h1}</h1>
            </div>
            <p className="text-[var(--text-muted)] text-sm max-w-2xl">{intro}</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Suspense fallback={null}>
              <EventsTabs basePath={basePath} />
            </Suspense>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
            <Suspense fallback={null}>
              <EventsFilters basePath={basePath} fixedCity={city} gyms={gyms} />
            </Suspense>

            <div className="flex-1 min-w-0 w-full">
              <p className="text-sm text-[var(--text-muted)] mb-6">
                {total} {filters.time === "past" ? "past" : "upcoming"} event{total === 1 ? "" : "s"}
                {filters.featured ? " · featured" : ""}
                {filters.search ? ` · “${filters.search}”` : ""}
                {selectedGym ? ` · ${selectedGym.name}` : ""}
                {formattedDate ? ` · ${formattedDate}` : ""}
                {filters.timeOfDay
                  ? ` · ${EVENT_TIME_OF_DAY_LABELS[filters.timeOfDay as EventTimeOfDay]} events`
                  : ""}
              </p>

              {events.length === 0 ? (
                <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center">
                  <CalendarDays className="w-12 h-12 text-[var(--text-muted)] mx-auto mb-4 opacity-40" />
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">No events found</h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Try changing filters or check back later for new events.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              )}

              <Pagination
                page={page}
                totalPages={totalPages}
                basePath={basePath}
                searchParams={searchParams}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
