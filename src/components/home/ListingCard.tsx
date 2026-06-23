import Link from "next/link";
import Image from "next/image";
import { MapPin, Star } from "lucide-react";
import { listingProfileHref, type HomeListingItem } from "@/lib/home-data";
import { optimizedImageUrl } from "@/lib/images";

interface ListingCardProps {
  item: HomeListingItem;
}

export function ListingCard({ item }: ListingCardProps) {
  const href = listingProfileHref(item);
  const image = item.image ? optimizedImageUrl(item.image, { width: 600, quality: 80 }) : null;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] card-shadow transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FF6A3D]/30 hover:shadow-lg">
      <Link href={href} className="relative block aspect-[4/3] overflow-hidden bg-[#0B2545]">
        {image ? (
          <Image
            src={image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B2545] via-[#0f3060] to-[#1a4080] flex items-center justify-center">
            <span className="font-heading text-4xl font-bold text-white/25">
              {item.name.charAt(0)}
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#0B2545]">
          {item.type === "gym" ? "Gym" : "Trainer"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading mb-1 line-clamp-1 text-lg font-bold text-[var(--text)]">
          {item.name}
        </h3>

        <p className="mb-3 flex items-center gap-1.5 text-sm text-[var(--text-muted)]">
          <MapPin className="h-4 w-4 shrink-0 text-[#FF6A3D]" />
          {item.city}
        </p>

        <div className="mb-4 flex items-center gap-1 text-sm text-[var(--text-muted)]">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>{item.rating != null ? item.rating.toFixed(1) : "New"}</span>
        </div>

        <Link
          href={href}
          className="mt-auto inline-flex items-center justify-center rounded-xl bg-[#0B2545] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#FF6A3D]"
        >
          View Profile
        </Link>
      </div>
    </article>
  );
}
