"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, AlertCircle, Loader2, Dumbbell, Swords, Eye, EyeOff } from "lucide-react";
import type { BusinessCategory } from "@prisma/client";

export function OwnerRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    confirmEmail: "",
    businessCategory: "gym" as BusinessCategory,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/60 focus:border-[#FF6A3D]/50";

  const labelClass = "block text-sm font-semibold text-white/90 mb-1.5";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.email.trim().toLowerCase() !== form.confirmEmail.trim().toLowerCase()) {
      setError("Email addresses do not match. Check for typos.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!form.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone.trim(),
          password: form.password,
          businessCategory: form.businessCategory,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification && data.email) {
          router.push(`/owner/verify-email?email=${encodeURIComponent(data.email)}&pending=1`);
          return;
        }
        setError(data.error ?? "Registration failed.");
        return;
      }

      if (data.requiresVerification || data.success) {
        if (data.devOtpCode) {
          sessionStorage.setItem("owner_dev_otp", data.devOtpCode);
        }
        router.push(
          `/owner/verify-email?email=${encodeURIComponent(data.email ?? form.email)}&pending=1`
        );
        return;
      }

      setError("Registration completed but verification is required. Check your email.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-lg rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]">
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-white/40" />
      <div className="p-8">
        <h1 className="font-heading font-bold text-xl text-white mb-1">Create Owner Account</h1>
        <p className="text-sm text-white/70 mb-6">Register to list your gym or fighting club</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business type */}
          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">I am a… *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, businessCategory: "gym" }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all backdrop-blur-sm ${
                  form.businessCategory === "gym"
                    ? "border-[#FF6A3D] bg-[#FF6A3D]/25 shadow-[0_0_20px_rgba(255,106,61,0.15)]"
                    : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
                }`}
              >
                <Dumbbell className={`w-6 h-6 ${form.businessCategory === "gym" ? "text-[#FF6A3D]" : "text-white/50"}`} />
                <span className="text-sm font-semibold text-white">Gym Owner</span>
                <span className="text-[10px] text-white/60">Fitness centers</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, businessCategory: "fighting_club" }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all backdrop-blur-sm ${
                  form.businessCategory === "fighting_club"
                    ? "border-[#FF6A3D] bg-[#FF6A3D]/25 shadow-[0_0_20px_rgba(255,106,61,0.15)]"
                    : "border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30"
                }`}
              >
                <Swords className={`w-6 h-6 ${form.businessCategory === "fighting_club" ? "text-[#FF6A3D]" : "text-white/50"}`} />
                <span className="text-sm font-semibold text-white">Fighting Club Owner</span>
                <span className="text-[10px] text-white/60">Boxing, MMA, martial arts</span>
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Full Name *</label>
            <div className="relative">
              <User className={iconClass} />
              <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your full name" className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Email *</label>
            <div className="relative">
              <Mail className={iconClass} />
              <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div>
            <label className={labelClass}>Confirm email *</label>
            <div className="relative">
              <Mail className={iconClass} />
              <input
                required
                type="email"
                value={form.confirmEmail}
                onChange={(e) => setForm((f) => ({ ...f, confirmEmail: e.target.value }))}
                placeholder="Repeat your email"
                className={`${inputClass} pl-10`}
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <Phone className={iconClass} />
              <input required type="tel" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="03001234567" className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass}>Password *</label>
              <div className="relative">
                <input
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Min 8 chars"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/80 transition-colors p-0.5"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Confirm *</label>
              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  placeholder="Repeat password"
                  className={`${inputClass} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/80 transition-colors p-0.5"
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A3D]/25">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-white/70 mt-6">
          Already registered?{" "}
          <Link href="/owner/login" className="text-[#FF6A3D] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
