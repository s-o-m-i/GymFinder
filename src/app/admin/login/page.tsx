import { Dumbbell } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#0B2545] flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF6A3D]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo above card */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 bg-[#0B2545] border-2 border-white/20 rounded-2xl flex items-center justify-center shadow-xl mb-3">
            <Dumbbell className="w-8 h-8 text-[#FF6A3D]" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-white">{SITE_NAME}</h1>
          <p className="text-xs sm:text-sm text-white/60 font-medium tracking-wide mt-1.5">
            {SITE_TAGLINE}
          </p>
          <p className="text-sm text-white/50 mt-1">Admin Panel</p>
        </div>

        {/* Login form (client component) */}
        <LoginForm />
      </div>
    </div>
  );
}
