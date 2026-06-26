import Link from "next/link";
import { SITE_TAGLINE } from "@/lib/constants";
import { SiteLogo } from "@/components/layout/SiteLogo";

interface AuthPageLayoutProps {
  children: React.ReactNode;
}

export function AuthBrandHeader() {
  return (
    <Link
      href="/"
      className="relative z-10 mb-8 flex flex-col items-center gap-2 text-white"
    >
      <SiteLogo href={undefined} size="lg" priority />
      <span className="text-xs font-medium tracking-wide text-white/60 sm:text-sm">
        {SITE_TAGLINE}
      </span>
    </Link>
  );
}

export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 py-12">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url(/auth/owner_registration-bg.png)" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-[#0B2545]/60" aria-hidden />
      <AuthBrandHeader />
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
}
