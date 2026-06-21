import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { JsonLd } from "@/components/seo/JsonLd";
import { getEventBySlug } from "@/services/events/event.service";
import { getEventStatus } from "@/lib/event-status";
import {
  eventTypeLabel,
  EVENT_STATUS_LABELS,
  EVENT_STATUS_STYLES,
} from "@/lib/event-constants";
import { formatEventDateRange, formatEventPrice } from "@/components/events/EventCard";
import { getEventsBasePath, getEventDetailPath } from "@/lib/events-routes";
import { isKnownCity } from "@/lib/constants";
import { SITE_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Calendar,
  MapPin,
  Building2,
  ExternalLink,
  MessageCircle,
  Sparkles,
} from "lucide-react";

interface EventDetailPageProps {
  slug: string;
}

function buildWhatsAppUrl(number: string, message: string) {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export async function EventDetailPage({ slug }: EventDetailPageProps) {
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const status = getEventStatus(event.startDate, event.endDate);
  const location = event.address ?? event.gym?.address;
  const areaCity = [event.area ?? event.gym?.area, event.city].filter(Boolean).join(", ");
  const whatsappNumber = event.gym?.whatsappNumber;
  const contactMessage = `Hi, I'm interested in "${event.title}" on ${SITE_NAME}. Can you share more details?`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const eventUrl = `${baseUrl}${getEventDetailPath(event.slug)}`;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description ?? undefined,
    startDate: event.startDate.toISOString(),
    endDate: (event.endDate ?? event.startDate).toISOString(),
    eventStatus:
      status === "past"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.gym?.name ?? areaCity,
      address: {
        "@type": "PostalAddress",
        streetAddress: location ?? undefined,
        addressLocality: event.area ?? event.gym?.area,
        addressRegion: event.city,
      },
    },
    image: event.image ?? undefined,
    offers:
      event.price != null
        ? {
            "@type": "Offer",
            price: event.price,
            priceCurrency: "PKR",
            availability: "https://schema.org/InStock",
          }
        : undefined,
    organizer: event.gym
      ? { "@type": "Organization", name: event.gym.name, url: `${baseUrl}/gyms/${event.gym.slug}` }
      : { "@type": "Organization", name: SITE_NAME },
    url: eventUrl,
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="bg-[var(--card)] border-b border-[var(--border)]">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4">
              <Link href="/" className="hover:text-[var(--text)]">Home</Link>
              <span>/</span>
              <Link href="/events" className="hover:text-[var(--text)]">Events</Link>
              <span>/</span>
              <span className="text-[var(--text)] line-clamp-1">{event.title}</span>
            </nav>

            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold bg-[#0B2545]/10 text-[#0B2545]">
                {eventTypeLabel(event.type)}
              </span>
              <span
                className={cn(
                  "inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border",
                  EVENT_STATUS_STYLES[status]
                )}
              >
                {EVENT_STATUS_LABELS[status]}
              </span>
              {event.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FF6A3D]/10 text-[#FF6A3D]">
                  <Sparkles className="w-3 h-3" />
                  Featured
                </span>
              )}
            </div>

            <h1 className="font-heading font-bold text-2xl sm:text-4xl text-[var(--text)] mb-3">
              {event.title}
            </h1>
            <p className="text-[var(--text-muted)] flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[#FF6A3D]" />
              {formatEventDateRange(event.startDate, event.endDate)}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {event.image && (
                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-[var(--border)]">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                </div>
              )}

              {event.description && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3">About this event</h2>
                  <p className="text-[var(--text-muted)] leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              )}

              {event.gym && event.gym.listingStatus === "approved" && (
                <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
                  <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-3 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#FF6A3D]" />
                    Hosted by {event.gym.name}
                  </h2>
                  <p className="text-sm text-[var(--text-muted)] mb-4">
                    This event is organized by a verified gym on {SITE_NAME}.
                  </p>
                  <Link
                    href={`/gyms/${event.gym.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6A3D] hover:underline"
                  >
                    View gym profile
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-5">
              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 card-shadow">
                <p className="text-2xl font-heading font-bold text-[var(--text)] mb-4">
                  {formatEventPrice(event.price)}
                </p>

                {whatsappNumber ? (
                  <a
                    href={buildWhatsAppUrl(whatsappNumber, contactMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#25D366] text-white font-semibold text-sm rounded-xl hover:bg-[#1da851] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contact on WhatsApp
                  </a>
                ) : (
                  <p className="text-sm text-[var(--text-muted)]">
                    Contact details will be shared by the organizer.
                  </p>
                )}
              </div>

              <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
                <h3 className="font-heading font-bold text-[var(--text)] mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#FF6A3D]" />
                  Location
                </h3>
                {location && (
                  <p className="text-sm text-[var(--text-muted)] mb-1">{location}</p>
                )}
                <p className="text-sm font-medium text-[var(--text)]">{areaCity}</p>
                <Link
                  href={
                    isKnownCity(event.city)
                      ? getEventsBasePath({ city: event.city })
                      : `/events?city=${encodeURIComponent(event.city)}`
                  }
                  className="inline-block mt-4 text-sm font-semibold text-[#FF6A3D] hover:underline"
                >
                  More events in {event.city}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
