import Link from "next/link";
import { SITE_NAME, SOCIAL_LINKS, CITIES, cityNameToSlug } from "@/lib/constants";
import { SiteLogo } from "@/components/layout/SiteLogo";
import {
  InstagramIcon,
  FacebookIcon,
  TwitterIcon,
  TikTokIcon,
} from "@/components/ui/SocialIcons";

const socialItems = [
  { label: "Instagram", href: SOCIAL_LINKS.instagram, Icon: InstagramIcon },
  { label: "Facebook",  href: SOCIAL_LINKS.facebook,  Icon: FacebookIcon },
  { label: "Twitter",   href: SOCIAL_LINKS.twitter,   Icon: TwitterIcon },
  { label: "TikTok",    href: SOCIAL_LINKS.tiktok,    Icon: TikTokIcon },
] as const;

const FEATURED_CITIES = ["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Peshawar"] as const;

export function Footer() {
  return (
    <footer data-section="footer" className="bg-[#0B2545] text-[#EAF0F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div data-footer-item>
            <div className="mb-4">
              <SiteLogo size="lg" />
            </div>
            <p className="text-sm text-[#8ba0b8] leading-relaxed max-w-xs">
              Discover the best gyms, fighting clubs, and trainers across Pakistan.
              Connect directly via WhatsApp.
            </p>

            <div className="flex gap-2.5 mt-5">
              {socialItems.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  data-footer-item
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Follow us on ${label}`}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-[#EAF0F6] hover:bg-[#FF6A3D] hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Discover */}
          <div data-footer-item>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-widest text-[#8ba0b8] mb-4">
              Discover
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/gyms", label: "All Gyms" },
                { href: "/trainers", label: "Find Trainers" },
                { href: "/success-stories", label: "Success Stories" },
                { href: "/events", label: "Events" },
                { href: "/blogs", label: "Blog" },
                { href: "/gyms/boxing", label: "Boxing Clubs" },
                { href: "/gyms/mma", label: "MMA Gyms" },
                { href: "/gyms?ladiesStatus=ladies_only", label: "Ladies Only Gyms" },
                { href: "/owner/register", label: "List Your Gym / Club" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-[#8ba0b8] hover:text-[#FF6A3D] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cities */}
          <div data-footer-item>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-widest text-[#8ba0b8] mb-4">
              Browse by City
            </h4>
            <ul className="space-y-3 text-sm">
              {FEATURED_CITIES.map((city) => {
                const slug = cityNameToSlug(city);
                return (
                  <li key={city}>
                    <Link
                      href={slug ? `/gyms/${slug}` : `/gyms?city=${encodeURIComponent(city)}`}
                      className="text-[#8ba0b8] hover:text-[#FF6A3D] transition-colors"
                    >
                      Gyms in {city}
                    </Link>
                  </li>
                );
              })}
              <li>
                <Link
                  href="/gyms"
                  className="text-[#FF6A3D] hover:underline transition-colors"
                >
                  All {CITIES.length}+ cities →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div data-footer-item className="mt-12 pt-6 border-t border-white/10 flex flex-col gap-4 sm:gap-0 sm:flex-row sm:justify-between sm:items-center text-xs text-[#8ba0b8]">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-2" aria-label="Legal">
            <Link href="/legal" className="hover:text-[#FF6A3D] transition-colors">
              Legal
            </Link>
            <Link href="/legal/terms" className="hover:text-[#FF6A3D] transition-colors">
              Terms
            </Link>
            <Link href="/legal/privacy" className="hover:text-[#FF6A3D] transition-colors">
              Privacy
            </Link>
            <Link href="/legal/cookies" className="hover:text-[#FF6A3D] transition-colors">
              Cookies
            </Link>
            <Link href="/legal/disclaimer" className="hover:text-[#FF6A3D] transition-colors">
              Disclaimer
            </Link>
          </nav>
          <span className="hidden sm:inline">Built for Pakistan 🇵🇰</span>
        </div>
      </div>
    </footer>
  );
}
