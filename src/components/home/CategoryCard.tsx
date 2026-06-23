import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { HomeCategory } from "@/lib/home-data";
import { cn } from "@/lib/utils";

interface CategoryCardProps {
  category: HomeCategory;
}

export function CategoryCard({ category }: CategoryCardProps) {
  const Icon = category.icon;
  const isOrange = category.accent === "orange";

  return (
    <Link
      href={category.href}
      className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 card-shadow transition-all duration-200 hover:-translate-y-1 hover:border-[#FF6A3D]/35 hover:shadow-lg"
    >
      <div
        className={cn(
          "mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
          isOrange ? "bg-[#FF6A3D]/10 text-[#FF6A3D]" : "bg-[#0B2545]/8 text-[#0B2545]"
        )}
      >
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="font-heading mb-2 text-lg font-bold text-[var(--text)] group-hover:text-[#FF6A3D] transition-colors">
        {category.title}
      </h3>
      <p className="mb-6 flex-1 text-sm leading-relaxed text-[var(--text-muted)]">
        {category.description}
      </p>

      <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#FF6A3D]">
        Explore
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
