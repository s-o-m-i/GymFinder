export const dynamic = "force-dynamic";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/home/HeroSection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { FeaturedGyms } from "@/components/home/FeaturedGyms";
import { prisma } from "@/lib/prisma";
import { MapPin, Shield, MessageCircle } from "lucide-react";

async function getFeaturedGyms() {
  try {
    return await prisma.gym.findMany({
      where: { featured: true },
      include: {
        images: { select: { url: true, alt: true }, take: 1 },
        disciplines: { include: { discipline: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const featuredGyms = await getFeaturedGyms();

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        <CategoryGrid />

        <FeaturedGyms gyms={featuredGyms} />

        {/* Why use us section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-2xl sm:text-3xl text-[var(--text)] mb-3">
              Why Use GymFinder PK?
            </h2>
            <p className="text-[var(--text-muted)] max-w-lg mx-auto">
              We make it easy to find, compare, and contact the best gyms in your area.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <MapPin className="w-6 h-6 text-[#FF6A3D]" />,
                title: "Hyper-Local Listings",
                desc: "Every gym is manually verified and curated. Real data, real addresses, real information.",
              },
              {
                icon: <Shield className="w-6 h-6 text-[#FF6A3D]" />,
                title: "Compare Everything",
                desc: "Price, timings, facilities, and ladies status — all in one place. Make informed decisions.",
              },
              {
                icon: <MessageCircle className="w-6 h-6 text-[#FF6A3D]" />,
                title: "Direct WhatsApp Contact",
                desc: "No middlemen. Tap a button and get in touch with the gym directly on WhatsApp.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 card-shadow"
              >
                <div className="w-12 h-12 bg-[#FF6A3D]/10 rounded-2xl flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="font-heading font-bold text-[var(--text)] mb-2">{item.title}</h3>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA banner */}
        <section className="bg-[#0B2545] py-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="font-heading font-bold text-3xl text-white mb-4">
              Ready to Start Training?
            </h2>
            <p className="text-[#8ba0b8] mb-8">
              Browse 50+ gyms and fighting clubs in Rawalpindi & Islamabad.
            </p>
            <a
              href="/gyms"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#FF6A3D] text-white font-bold text-base rounded-2xl hover:bg-[#e85528] transition-colors shadow-lg"
            >
              Browse All Gyms
              <MapPin className="w-5 h-5" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
