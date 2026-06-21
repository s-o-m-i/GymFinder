import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export function AuthBrandHeader() {
  return (
    <Link
      href="/"
      className="relative z-10 flex flex-col items-center gap-1.5 mb-8 text-white"
    >
      <span className="flex items-center gap-2">
        <span className="w-9 h-9 bg-[#FF6A3D] rounded-lg flex items-center justify-center">
          <Dumbbell className="w-5 h-5" />
        </span>
        <span className="font-heading font-bold">{SITE_NAME}</span>
      </span>
      <span className="text-xs sm:text-sm text-white/60 font-medium tracking-wide">
        {SITE_TAGLINE}
      </span>
    </Link>
  );
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/auth/owner_registration-bg.png)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#0B2545]/60" aria-hidden />
      <AuthBrandHeader />
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </div>
  );
}
