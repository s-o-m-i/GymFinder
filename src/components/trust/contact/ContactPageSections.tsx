"use client";

import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
} from "lucide-react";
import { FaqAccordionSection } from "@/components/faq/FaqAccordionSection";
import { FadeInView, StaggerChildren, StaggerItem } from "@/components/trust/FadeInView";
import { ContactForm } from "@/components/trust/contact/ContactForm";
import {
  CONTACT_EMAILS,
  CONTACT_FAQS,
  CONTACT_HOURS,
  CONTACT_WHATSAPP,
  QUICK_CONTACT_CARDS,
  SOCIAL_PLATFORMS,
} from "@/lib/trust-pages/contact-data";
import type { ContactSubject } from "@/lib/validations/contact-form";
import { buildWhatsAppUrl } from "@/lib/utils";
import { useCallback, useState } from "react";

export function ContactPageSections() {
  const [selectedSubject, setSelectedSubject] = useState<ContactSubject>("general");

  const scrollToForm = useCallback((subject: ContactSubject) => {
    setSelectedSubject(subject);
    const el = document.getElementById("contact-form");
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--card)]">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
          <FadeInView>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#FF6A3D]">
              Get in touch
            </p>
            <h1 className="font-heading text-4xl font-bold text-[var(--text)] sm:text-5xl">
              Contact Us
            </h1>
            <p className="mt-3 max-w-xl text-base text-[var(--text-muted)]">
              We&apos;re here to help.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Main layout */}
      <section className="py-12 sm:py-16" aria-labelledby="contact-main-heading">
        <h2 id="contact-main-heading" className="sr-only">
          Contact form and information
        </h2>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-5 lg:gap-12 lg:px-8">
          <FadeInView className="lg:col-span-3">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 card-shadow">
              <h3 className="font-heading mb-1 text-xl font-bold text-[var(--text)]">
                Send us a message
              </h3>
              <p className="mb-6 text-sm text-[var(--text-muted)]">
                Fill out the form and our team will respond within 1–2 business days.
              </p>
              <ContactForm
                key={selectedSubject}
                defaultSubject={selectedSubject}
                formId="contact-form"
              />
            </div>
          </FadeInView>

          <FadeInView delay={0.1} className="lg:col-span-2">
            <aside className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8 card-shadow">
              <h3 className="font-heading mb-6 text-xl font-bold text-[var(--text)]">
                Contact Information
              </h3>
              <ul className="space-y-5">
                <ContactInfoItem
                  icon={Mail}
                  label="Email"
                  href={`mailto:${CONTACT_EMAILS.support}`}
                >
                  {CONTACT_EMAILS.support}
                </ContactInfoItem>
                <ContactInfoItem
                  icon={Mail}
                  label="Business Email"
                  href={`mailto:${CONTACT_EMAILS.business}`}
                >
                  {CONTACT_EMAILS.business}
                </ContactInfoItem>
                <ContactInfoItem
                  icon={MessageCircle}
                  label="WhatsApp"
                  href={buildWhatsAppUrl(CONTACT_WHATSAPP, undefined, "Hi FitnessAdda PK, I have a question.")}
                >
                  {CONTACT_WHATSAPP}
                </ContactInfoItem>
                <ContactInfoItem icon={MapPin} label="Location">
                  Pakistan
                </ContactInfoItem>
                <ContactInfoItem icon={Clock} label="Working Hours">
                  {CONTACT_HOURS}
                </ContactInfoItem>
              </ul>
            </aside>
          </FadeInView>
        </div>
      </section>

      {/* Quick contact cards */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] py-12 sm:py-16" aria-labelledby="quick-contact-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mb-8">
            <h2 id="quick-contact-heading" className="font-heading text-2xl font-bold text-[var(--text)]">
              Quick Contact
            </h2>
          </FadeInView>
          <StaggerChildren className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {QUICK_CONTACT_CARDS.map((card) => {
              const Icon = card.icon;
              return (
                <StaggerItem key={card.title}>
                  <button
                    type="button"
                    onClick={() => scrollToForm(card.subject)}
                    className="group flex h-full w-full flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 text-left transition-all hover:border-[#FF6A3D]/30 hover:shadow-md"
                  >
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6A3D]/10 text-[#FF6A3D]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-heading font-bold text-[var(--text)]">{card.title}</h3>
                    <p className="mt-1 flex-1 text-xs leading-relaxed text-[var(--text-muted)]">
                      {card.description}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#FF6A3D]">
                      Contact us <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </button>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16" aria-labelledby="contact-faq-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <FaqAccordionSection faqs={CONTACT_FAQS} title="Frequently Asked Questions" />
          </FadeInView>
        </div>
      </section>

      {/* Map placeholder */}
      <section className="border-y border-[var(--border)] bg-[var(--card)] py-12 sm:py-16" aria-labelledby="map-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView>
            <h2 id="map-heading" className="font-heading mb-6 text-2xl font-bold text-[var(--text)]">
              Find Us
            </h2>
            <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)]">
              <div className="flex aspect-[21/9] min-h-[200px] flex-col items-center justify-center bg-gradient-to-br from-[#0B2545]/5 via-[var(--bg)] to-[#FF6A3D]/5 p-8 text-center">
                <MapPin className="mb-3 h-10 w-10 text-[#FF6A3D]/60" />
                <p className="font-heading text-lg font-semibold text-[var(--text)]">
                  Pakistan
                </p>
                <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">
                  Interactive Google Maps integration coming soon. We serve fitness communities
                  across all major cities in Pakistan.
                </p>
              </div>
            </div>
          </FadeInView>
        </div>
      </section>

      {/* Social media */}
      <section className="py-12 sm:py-16" aria-labelledby="social-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeInView className="mb-8 text-center">
            <h2 id="social-heading" className="font-heading text-2xl font-bold text-[var(--text)]">
              Follow Us
            </h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">
              Stay connected with Pakistan&apos;s fitness community.
            </p>
          </FadeInView>
          <StaggerChildren className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {SOCIAL_PLATFORMS.map((platform) => (
              <StaggerItem key={platform.name}>
                <a
                  href={platform.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition-all hover:border-transparent hover:shadow-lg"
                >
                  <div
                    className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${platform.color} text-white shadow-md transition-transform group-hover:scale-105`}
                  >
                    <span className="text-xs font-bold">{platform.name.slice(0, 2).toUpperCase()}</span>
                  </div>
                  <span className="font-heading text-sm font-semibold text-[var(--text)]">
                    {platform.name}
                  </span>
                </a>
              </StaggerItem>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[var(--border)] bg-[#0B2545] py-14 sm:py-16" aria-labelledby="contact-cta-heading">
        <FadeInView className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 id="contact-cta-heading" className="font-heading text-2xl font-bold text-white sm:text-3xl">
            Ready to Join Pakistan&apos;s Fitness Community?
          </h2>
          <p className="mt-3 text-sm text-white/60">
            Explore listings, share your story, or grow your fitness business with FitnessAdda PK.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/gyms"
              className="inline-flex items-center justify-center rounded-full bg-[#FF6A3D] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#e85528]"
            >
              Explore Platform
            </Link>
            <Link
              href="/owner/register"
              className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
            >
              List Your Gym
            </Link>
          </div>
        </FadeInView>
      </section>
    </>
  );
}

function ContactInfoItem({
  icon: Icon,
  label,
  href,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  children: React.ReactNode;
}) {
  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FF6A3D]/10 text-[#FF6A3D]">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium text-[var(--text)]">{children}</p>
      </div>
    </>
  );

  if (href) {
    return (
      <li>
        <a
          href={href}
          target={href.startsWith("http") ? "_blank" : undefined}
          rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
          className="flex items-start gap-3 transition-colors hover:text-[#FF6A3D]"
        >
          {content}
        </a>
      </li>
    );
  }

  return (
    <li className="flex items-start gap-3">
      {content}
    </li>
  );
}
