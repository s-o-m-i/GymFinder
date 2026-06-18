import type { Metadata } from "next";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GymFilters } from "@/components/gym/GymFilters";
import { GymsResultsSection } from "@/components/gym/GymsResultsSection";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { GymFilters as GymFiltersType } from "@/types";
import { gymTypeLabel } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const city = params.city as string | undefined;
  const type = params.type as string | undefined;

  const parts = ["Gyms"];
  if (type) parts.unshift(gymTypeLabel(type));
  if (city) parts.push(`in ${city}`);
  else parts.push("in Rawalpindi & Islamabad");

  const title = parts.join(" ");
  return {
    title,
    description: `Browse ${title}. Filter by price, discipline, and ladies timings. Contact directly on WhatsApp.`,
  };
}

async function getGyms(searchParams: Record<string, string | string[] | undefined>) {
  const getString = (key: string) => {
    const val = searchParams[key];
    return typeof val === "string" ? val : undefined;
  };

  const filters: GymFiltersType = {
    search:       getString("search"),
    city:         getString("city"),
    area:         getString("area"),
    type:         getString("type"),
    priceMin:     getString("priceMin") ? Number(getString("priceMin")) : undefined,
    priceMax:     getString("priceMax") ? Number(getString("priceMax")) : undefined,
    ladiesStatus: getString("ladiesStatus"),
    discipline:   getString("discipline"),
    sort:         (getString("sort") as GymFiltersType["sort"]) ?? "featured",
    page:         getString("page") ? Number(getString("page")) : 1,
    limit:        12,
  };

  const where  = buildWhere(filters);
  const orderBy = buildOrderBy(filters.sort);
  const page   = filters.page ?? 1;
  const skip   = (page - 1) * 12;

  const [gyms, total] = await Promise.all([
    prisma.gym.findMany({
      where,
      include: {
        images:      { select: { url: true, alt: true }, take: 1 },
        disciplines: { include: { discipline: { select: { name: true } } } },
      },
      orderBy,
      skip,
      take: 12,
    }),
    prisma.gym.count({ where }),
  ]);

  return { gyms, total, page, totalPages: Math.ceil(total / 12) };
}

function buildWhere(filters: GymFiltersType): Prisma.GymWhereInput {
  const where: Prisma.GymWhereInput = {};

  if (filters.search) {
    where.OR = [
      { name:        { contains: filters.search, mode: "insensitive" } },
      { area:        { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.city)        where.city        = { equals: filters.city,        mode: "insensitive" };
  if (filters.area)        where.area        = { equals: filters.area,        mode: "insensitive" };
  if (filters.type)        where.type        = filters.type        as Prisma.EnumGymTypeFilter["equals"];
  if (filters.priceMin !== undefined) where.priceMin = { gte: filters.priceMin };
  if (filters.priceMax !== undefined) where.priceMax = { lte: filters.priceMax };
  if (filters.ladiesStatus) where.ladiesStatus = filters.ladiesStatus as Prisma.EnumLadiesStatusFilter["equals"];
  if (filters.discipline) {
    where.disciplines = {
      some: { discipline: { name: { equals: filters.discipline, mode: "insensitive" } } },
    };
  }

  return where;
}

function buildOrderBy(sort?: string): Prisma.GymOrderByWithRelationInput[] {
  switch (sort) {
    case "price_asc":  return [{ priceMin: "asc"  }, { featured: "desc" }];
    case "price_desc": return [{ priceMax: "desc" }, { featured: "desc" }];
    case "rating":     return [{ rating: { sort: "desc", nulls: "last" } }];
    default:           return [{ featured: "desc" }, { createdAt: "desc" }];
  }
}

export default async function GymsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { gyms, total, page, totalPages } = await getGyms(params);

  const city = params.city as string | undefined;
  const type = params.type as string | undefined;
  const sortLabel = {
    featured:   "Featured",
    price_asc:  "Price: Low → High",
    price_desc: "Price: High → Low",
    rating:     "Top Rated",
  }[(params.sort as string) ?? "featured"] ?? "Featured";

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        {/* Page header */}
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-[var(--text)]">
              {type ? gymTypeLabel(type) : "All Gyms & Fighting Clubs"}
              {city && <span className="text-[var(--text-muted)]"> in {city}</span>}
            </h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">
              <span className="font-mono-nums font-semibold text-[var(--text)]">{total}</span>{" "}
              {total === 1 ? "result" : "results"} · Sorted by {sortLabel}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8 items-start">
            {/* Filters sidebar */}
            <Suspense fallback={null}>
              <GymFilters />
            </Suspense>

            {/* Results section (client — owns Near Me state + grid) */}
            <Suspense
              fallback={
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-[var(--card)] border border-[var(--border)] rounded-2xl overflow-hidden animate-pulse"
                    >
                      <div className="h-48 bg-[var(--bg)]" />
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-[var(--bg)] rounded-lg w-3/4" />
                        <div className="h-3 bg-[var(--bg)] rounded-lg w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              }
            >
              <GymsResultsSection
                initialGyms={gyms}
                total={total}
                page={page}
                totalPages={totalPages}
              />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
