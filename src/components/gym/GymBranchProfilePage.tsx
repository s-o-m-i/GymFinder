import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ImageGallery } from "@/components/gym/ImageGallery";
import { Badge } from "@/components/ui/Badge";
import { GymTypeIcon } from "@/components/ui/GymTypeIcon";
import { TrackProfileView } from "@/components/gym/TrackProfileView";
import { WhatsAppButton } from "@/components/gym/WhatsAppButton";
import { prisma } from "@/lib/prisma";
import {
  buildGoogleMapsUrl,
  buildWhatsAppUrl,
  gymTypeLabel,
} from "@/lib/utils";
import { SITE_NAME } from "@/lib/constants";
import { getGymGalleryImages } from "@/lib/images";
import { isListingSlug } from "@/lib/gyms-routes";
import { isReservedBranchSlug } from "@/lib/gym-branch-rules";
import {
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

interface GymBranchProfilePageProps {
  gymSlug: string;
  branchSlug: string;
}

export async function GymBranchProfilePage({
  gymSlug,
  branchSlug,
}: GymBranchProfilePageProps) {
  if (isListingSlug(gymSlug) || isReservedBranchSlug(branchSlug)) {
    notFound();
  }

  const gym = await prisma.gym.findUnique({
    where: { slug: gymSlug },
    include: {
      galleryImages: true,
      disciplines: { include: { discipline: true } },
      amenities: { include: { amenity: true } },
    },
  });

  if (!gym || gym.listingStatus !== "approved") notFound();

  const branch = await prisma.gymBranch.findFirst({
    where: {
      gymId: gym.id,
      slug: branchSlug,
      status: "ACTIVE",
    },
  });

  if (!branch) notFound();

  const galleryImages = getGymGalleryImages(gym);
  const disciplineNames = gym.disciplines.map((item) => item.discipline.name);
  const amenityNames = gym.amenities.map((item) => item.amenity.name);
  const whatsapp = branch.whatsappNumber || gym.whatsappNumber;
  const phone = branch.phone || whatsapp;
  const directionsUrl = buildGoogleMapsUrl(
    `${branch.name}, ${branch.address}, ${branch.area}, ${branch.city}`,
    branch.latitude,
    branch.longitude
  );

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: branch.name,
    parentOrganization: gym.name,
    description: gym.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: branch.address,
      addressLocality: branch.area,
      addressRegion: branch.city,
      addressCountry: "PK",
    },
    ...(branch.latitude &&
      branch.longitude && {
        geo: {
          "@type": "GeoCoordinates",
          latitude: branch.latitude,
          longitude: branch.longitude,
        },
      }),
    ...(branch.openingHours && { openingHours: branch.openingHours }),
    telephone: phone,
    image: galleryImages.map((image) => image.imageUrl),
  };

  return (
    <>
      <TrackProfileView gymId={gym.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center gap-1 text-xs text-[var(--text-muted)]">
              <Link href="/" className="hover:text-[var(--text)] transition-colors">
                {SITE_NAME}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/gyms" className="hover:text-[var(--text)] transition-colors">
                Gyms
              </Link>
              <ChevronRight className="w-3 h-3" />
              <Link
                href={`/gyms/${gym.slug}`}
                className="hover:text-[var(--text)] transition-colors"
              >
                {gym.name}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-[var(--text)] font-medium">{branch.name}</span>
            </nav>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6 min-w-0">
              <ImageGallery images={galleryImages} gymName={branch.name} />

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="default" className="inline-flex items-center gap-1.5">
                    <GymTypeIcon type={gym.type} className="w-3.5 h-3.5" />
                    {gymTypeLabel(gym.type, gym.customTypeLabel)}
                  </Badge>
                </div>
                <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)]">
                  {branch.name}
                </h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  A location of{" "}
                  <Link href={`/gyms/${gym.slug}`} className="text-[#FF6A3D] font-semibold">
                    {gym.name}
                  </Link>
                </p>
                <div className="flex items-start gap-1.5 mt-3 text-[var(--text-muted)] text-sm">
                  <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    {branch.address}, {branch.area}, {branch.city}
                  </span>
                </div>
                {branch.openingHours && (
                  <div className="flex items-center gap-2 mt-3 text-sm text-[var(--text-muted)]">
                    <Clock className="w-4 h-4" />
                    {branch.openingHours}
                  </div>
                )}
                {branch.ladiesHours && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-purple-700">
                    <Clock className="w-4 h-4" />
                    Ladies-only hours: {branch.ladiesHours}
                  </div>
                )}
              </div>

              {disciplineNames.length > 0 && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-4">
                    Disciplines Offered
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {disciplineNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 px-4 py-2 bg-[var(--bg)] border border-[var(--border)] rounded-xl text-sm font-medium text-[var(--text)]"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#FF6A3D]" />
                        {name}
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
                    {amenityNames.map((name) => (
                      <div
                        key={name}
                        className="flex items-center gap-2 text-sm text-[var(--text-muted)]"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A3D] shrink-0" />
                        {name}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-bold text-[var(--text)] mb-1">
                  Contact this location
                </h3>
                <p className="text-[var(--text-muted)] text-sm mb-4">
                  Ask about membership, timings, and trial sessions.
                </p>
                <div className="space-y-2">
                  {branch.whatsappNumber ? (
                    <a
                      href={buildWhatsAppUrl(whatsapp, branch.name)}
                      className="flex items-center justify-center w-full h-12 px-6 text-sm font-bold rounded-xl bg-[#25D366] text-white hover:bg-[#1da851]"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <WhatsAppButton
                      gymId={gym.id}
                      gymName={branch.name}
                      size="lg"
                      fullWidth
                      label="WhatsApp Gym"
                    />
                  )}
                  {phone && (
                    <a
                      href={`tel:${phone}`}
                      className="inline-flex items-center justify-center gap-2 w-full h-12 px-6 text-sm font-bold rounded-xl bg-[#0B2545] text-white hover:bg-[#071832]"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  )}
                  {branch.email && (
                    <a
                      href={`mailto:${branch.email}`}
                      className="inline-flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold border border-[var(--border)] rounded-xl text-[var(--text)] hover:bg-[var(--bg)]"
                    >
                      <Mail className="w-4 h-4" />
                      {branch.email}
                    </a>
                  )}
                </div>
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6A3D]" />
                  Location
                </h3>
                <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                  {branch.address}
                  <br />
                  {branch.area}, {branch.city}
                </p>
                <a
                  href={directionsUrl}
                  className="flex items-center justify-center gap-2 w-full py-2.5 text-sm font-semibold text-[var(--navy)] border border-[var(--border)] rounded-xl hover:bg-[var(--bg)] transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
              </div>

              <Link
                href={`/gyms/${gym.slug}`}
                className="block text-center text-sm font-semibold text-[#FF6A3D] hover:underline"
              >
                View full {gym.name} profile
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
