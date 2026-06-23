import Link from "next/link";
import { MessageCircle, Search, TrendingUp } from "lucide-react";

export function OwnerMonetizationSection() {
  return (
    <section className="bg-[#0B2545] py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading mb-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Own a Gym or Training Center?
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-[#8ba0b8] sm:text-base">
            List on Pakistan&apos;s growing fitness marketplace. Get discovered by customers searching
            for gyms in Lahore, Karachi, Islamabad, and beyond — and receive leads from WhatsApp
            clicks.
          </p>

          <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Get discovered",
                text: "Appear in search results when customers look for gyms near them.",
              },
              {
                icon: TrendingUp,
                title: "Grow visibility",
                text: "Show up in category pages for boxing, MMA, and fitness gyms.",
              },
              {
                icon: MessageCircle,
                title: "WhatsApp leads",
                text: "Receive direct inquiries from motivated customers.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-left"
              >
                <Icon className="mb-3 h-5 w-5 text-[#FF6A3D]" />
                <h3 className="font-heading mb-1 text-sm font-bold text-white">{title}</h3>
                <p className="text-xs leading-relaxed text-[#8ba0b8]">{text}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/owner/register"
              className="inline-flex items-center justify-center rounded-2xl bg-[#FF6A3D] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#FF6A3D]/25 transition-colors hover:bg-[#e85528]"
            >
              Register Your Gym
            </Link>
            <Link
              href="/trainer/auth"
              className="inline-flex items-center justify-center rounded-2xl border-2 border-white/25 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              List as Trainer
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
