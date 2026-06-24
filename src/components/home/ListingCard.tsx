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
  const image = item.image ? optimizedImageUrl(item.image, { width: 700, quality: 82 }) : null;
  const ratingLabel = item.rating != null ? item.rating.toFixed(1) : "New";

  return (
    <article className="group relative aspect-[4/5] overflow-hidden rounded-[20px] bg-[#1c1c1c] ring-1 ring-white/5 transition-all duration-300 hover:ring-[#FF6A3D]/45 sm:rounded-[22px]">
      <Link href={href} className="absolute inset-0 block">
        {image ? (
          <Image
            src={image}
            alt={item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#0B2545] via-[#122d52] to-[#1a4080]">
            <span className="font-heading text-5xl font-bold text-white/20">
              {item.name.charAt(0)}
            </span>
          </div>
        )}

        <div
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10"
          aria-hidden
        />

        {item.rating != null && (
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-lg bg-black/55 px-2 py-1 text-xs font-semibold text-white backdrop-blur-sm sm:right-4 sm:top-4">
            <Star className="h-3.5 w-3.5 fill-[#FF6A3D] text-[#FF6A3D]" aria-hidden />
            {ratingLabel}
          </span>
        )}

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-5">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading line-clamp-2 text-base font-bold uppercase leading-tight tracking-wide text-white sm:text-lg">
              {item.name}
            </h3>
            <p className="mt-1.5 flex items-center gap-1 text-xs text-white/75 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF6A3D]" aria-hidden />
              <span className="truncate">{item.city}</span>
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#0B2545] transition-colors group-hover:bg-[#FF6A3D] group-hover:text-white sm:px-4 sm:text-sm">
            View Profile
          </span>
        </div>
      </Link>
    </article>
  );
}
