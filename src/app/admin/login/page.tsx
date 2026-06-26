import { LoginForm } from "./LoginForm";
import { SITE_TAGLINE } from "@/lib/constants";
import { SiteLogo } from "@/components/layout/SiteLogo";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0B2545] flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF6A3D]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <SiteLogo size="xl" priority className="mb-3" />
          <p className="text-xs sm:text-sm text-white/60 font-medium tracking-wide mt-1.5">
            {SITE_TAGLINE}
          </p>
          <p className="text-sm text-white/50 mt-1">Admin Panel</p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
