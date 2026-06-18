import Link from "next/link";
import { Dumbbell, Globe, MessageSquare } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="bg-[#0B2545] text-[#EAF0F6]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#FF6A3D] rounded-lg flex items-center justify-center">
                <Dumbbell className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg">{SITE_NAME}</span>
            </div>
            <p className="text-sm text-[#8ba0b8] leading-relaxed max-w-xs">
              Discover the best gyms and fighting clubs in Rawalpindi & Islamabad.
              Connect directly via WhatsApp.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF6A3D] transition-colors"
                aria-label="Social"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FF6A3D] transition-colors"
                aria-label="Contact"
              >
                <MessageSquare className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Discover */}
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-widest text-[#8ba0b8] mb-4">
              Discover
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/gyms?city=Rawalpindi", label: "Gyms in Rawalpindi" },
                { href: "/gyms?city=Islamabad", label: "Gyms in Islamabad" },
                { href: "/gyms?type=boxing", label: "Boxing Clubs" },
                { href: "/gyms?type=mma", label: "MMA Gyms" },
                { href: "/gyms?type=muay_thai", label: "Muay Thai" },
                { href: "/gyms?ladiesStatus=ladies_only", label: "Ladies Only Gyms" },
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
          <div>
            <h4 className="font-heading font-semibold text-sm uppercase tracking-widest text-[#8ba0b8] mb-4">
              Popular Areas
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                { href: "/gyms?city=Islamabad&area=F-7", label: "F-7 Islamabad" },
                { href: "/gyms?city=Islamabad&area=F-10", label: "F-10 Islamabad" },
                { href: "/gyms?city=Rawalpindi&area=Bahria+Town", label: "Bahria Town" },
                { href: "/gyms?city=Rawalpindi&area=Saddar", label: "Saddar Rawalpindi" },
                { href: "/gyms?city=Islamabad&area=DHA+Phase+2", label: "DHA Islamabad" },
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
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#8ba0b8]">
          <span>© {new Date().getFullYear()} {SITE_NAME}. All rights reserved.</span>
          <span>Built for Rawalpindi & Islamabad 🇵🇰</span>
        </div>
      </div>
    </footer>
  );
}
