import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { TaleOfTheTape } from "@/components/gym/TaleOfTheTape";
import { WhatsAppButton } from "@/components/gym/WhatsAppButton";
import { ImageGallery } from "@/components/gym/ImageGallery";
import { Badge } from "@/components/ui/Badge";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { LadiesStatusBadge } from "@/components/ui/LadiesStatusBadge";
import { ReviewForm } from "@/components/gym/ReviewForm";
import { prisma } from "@/lib/prisma";
import {
  buildGoogleMapsUrl,
  gymTypeLabel,
  formatPrice,
} from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { getGymsBasePath } from "@/lib/gyms-routes";
import { getGymGalleryImages } from "@/lib/images";
import {
  MapPin,
  ExternalLink,
  Clock,
  ChevronRight,
  User,
  CheckCircle2,
  Star,
} from "lucide-react";

interface GymProfilePageProps {
  slug: string;
}

async function getGym(slug: string) {
  return prisma.gym.findUnique({
    where: { slug },
    include: {
      galleryImages: true,
      disciplines: { include: { discipline: true } },
      amenities: { include: { amenity: true } },
      reviews: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
}

export async function GymProfilePage({ slug }: GymProfilePageProps) {
  const gym = await getGym(slug);
  if (!gym) notFound();
  if (gym.listingStatus !== "approved") notFound();

  const disciplineNames = gym.disciplines.map((d) => d.discipline.name);
  const amenityNames = gym.amenities.map((a) => a.amenity.name);
  const mapsUrl = buildGoogleMapsUrl(
    `${gym.name}, ${gym.address}`,
    gym.latitude,
    gym.longitude
  );

  const avgRating =
    gym.reviews.length > 0
      ? gym.reviews.reduce((sum, r) => sum + r.rating, 0) / gym.reviews.length
      : gym.rating;

  const galleryImages = getGymGalleryImages(gym);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: gym.name,
    description: gym.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: gym.address,
      addressLocality: gym.area,
      addressRegion: gym.city,
      addressCountry: "PK",
    },
    ...(gym.latitude && gym.longitude && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: gym.latitude,
        longitude: gym.longitude,
      },
    }),
    ...(gym.openingHours && { openingHours: gym.openingHours }),
    ...(avgRating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: gym.reviews.length || 1,
      },
    }),
    telephone: gym.whatsappNumber,
    image: galleryImages.map((i) => i.imageUrl),
    priceRange: `PKR ${gym.priceMin}–${gym.priceMax}/month`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-[var(--text)] transition-colors">{SITE_NAME}</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/gyms" className="hover:text-[var(--text)] transition-colors">Gyms</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href={getGymsBasePath({ city: gym.city })} className="hover:text-[var(--text)] transition-colors">{gym.city}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[var(--text)] font-medium">{gym.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ImageGallery images={galleryImages} gymName={gym.name} />

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="default" className="inline-flex items-center gap-1.5">
                        <GymTypeIcon type={gym.type} className="w-3.5 h-3.5" />
                        {gymTypeLabel(gym.type)}
                      </Badge>
                      {gym.featured && (
                        <Badge variant="accent" className="inline-flex items-center gap-1">
                          <Star className="w-3 h-3 fill-white" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)]">
                      {gym.name}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-2 text-[var(--text-muted)] text-sm">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{gym.address}, {gym.area}, {gym.city}</span>
                    </div>
                  </div>

                  {gym.openingHours && (
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] bg-[var(--bg)] px-3 py-2 rounded-xl border border-[var(--border)]">
                      <Clock className="w-4 h-4" />
                      {gym.openingHours}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3">About</h2>
                <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                  {gym.description}
                </p>
              </div>

              {disciplineNames.length > 0 && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
                    Disciplines Offered
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {disciplineNames.map((d) => (
                      <div
                        key={d}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#FF6A3D]" />
                        {d}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {amenityNames.length > 0 && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
                    Facilities & Amenities
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {amenityNames.map((a) => (
                      <div
                        key={a}
                        className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A3D] shrink-0" />
                        {a}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gym.coachInfo && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4 flex items-center gap-2">
                    <User className="w-5 h-5 text-[#FF6A3D]" />
                    Coach & Trainers
                  </h2>
                  <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                    {gym.coachInfo}
                  </p>
                </div>
              )}

              {/* Reviews — always visible with submit form */}
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
                  Reviews
                  {avgRating && (
                    <span className="ml-3 font-mono-nums text-base text-[#FF6A3D]">
                      {avgRating.toFixed(1)} ★
                    </span>
                  )}
                </h2>

                <ReviewForm gymId={gym.id} />

                {gym.reviews.length > 0 ? (
                  <div className="space-y-4 mt-6 pt-6 border-t border-[var(--border)]">
                    {gym.reviews.map((review) => (
                      <div
                        key={review.id}
                        className="pb-4 border-b border-[var(--border)] last:border-0 last:pb-0"
                      >
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3.5 h-3.5 ${
                                  i < review.rating
                                    ? "text-amber-400 fill-amber-400"
                                    : "text-[var(--border)]"
                                }`}
                              />
                            ))}
                          </div>
                          {review.author && (
                            <span className="text-xs font-medium text-[var(--text-muted)]">
                              {review.author}
                            </span>
                          )}
                        </div>
                        {review.text && (
                          <p className="text-sm text-[var(--text-muted)]">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[var(--text-muted)] mt-6 pt-6 border-t border-[var(--border)]">
                    No reviews yet — be the first to share your experience!
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <TaleOfTheTape
                priceMin={gym.priceMin}
                priceMax={gym.priceMax}
                openingHours={gym.openingHours}
                disciplines={disciplineNames}
                sizeCategory={gym.sizeCategory}
                ladiesStatus={gym.ladiesStatus}
                rating={avgRating ?? undefined}
              />

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-bold text-[var(--text)] mb-1">
                  Interested in joining?
                </h3>
                <p className="text-[var(--text-muted)] text-sm mb-4">
                  Contact the gym directly on WhatsApp to ask about membership and availability.
                </p>
                <WhatsAppButton
                  number={gym.whatsappNumber}
                  gymName={gym.name}
                  size="lg"
                  fullWidth
                />
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6A3D]" />
                  Location
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                  {gym.address}<br />
                  {gym.area}, {gym.city}
                </p>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-[var(--navy)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open in Google Maps
                </a>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-semibold text-sm uppercase tracking-widest text-[var(--text-muted)] mb-4">
                  Quick Info
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">City</span>
                    <span className="font-medium text-[var(--text)]">{gym.city}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Area</span>
                    <span className="font-medium text-[var(--text)]">{gym.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Type</span>
                    <span className="font-medium text-[var(--text)]">{gymTypeLabel(gym.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-muted)]">Ladies</span>
                    <LadiesStatusBadge status={gym.ladiesStatus} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
