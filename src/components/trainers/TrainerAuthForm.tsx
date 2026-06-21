"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, Loader2, AlertCircle, KeyRound } from "lucide-react";

type Step = "email" | "otp";

const glassCard =
  "relative w-full max-w-md rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/60 focus:border-[#FF6A3D]/50";

const labelClass = "block text-sm font-semibold text-white/90 mb-1.5";
const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45 pointer-events-none";

export function TrainerAuthForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDevOtpCode(null);

    try {
      const res = await fetch("/api/trainer/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send code.");
        return;
      }
      if (data.devOtpCode) setDevOtpCode(data.devOtpCode);
      setStep("otp");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trainer/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Invalid code.");
        return;
      }
      router.push(data.needsProfile ? "/trainer/dashboard/profile" : "/trainer/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={glassCard}>
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-white/40" />
      <div className="p-8">
        <h1 className="font-heading font-bold text-xl text-white mb-1">
          {step === "email" ? "Trainer sign in" : "Enter login code"}
        </h1>
        <p className="text-sm text-white/70 mb-6">
          {step === "email"
            ? "Sign up or sign in with a one-time code sent to your email."
            : `We sent a 6-digit code to ${email}`}
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {devOtpCode && (
          <div className="p-4 mb-4 bg-amber-500/15 backdrop-blur-sm border border-amber-400/30 rounded-xl text-sm text-amber-50">
            <p className="font-semibold mb-1">Local development mode</p>
            <p className="text-amber-50/90">
              Your OTP code:{" "}
              <span className="font-mono font-bold text-lg tracking-widest text-white">{devOtpCode}</span>
            </p>
          </div>
        )}

        {step === "email" ? (
          <form onSubmit={sendOtp} className="space-y-4">
            <div>
              <label className={labelClass}>Email</label>
              <div className="relative">
                <Mail className={iconClass} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A3D]/25 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                </>
              ) : (
                "Send login code"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyOtp} className="space-y-4">
            <div>
              <label className={labelClass}>6-digit code</label>
              <div className="relative">
                <KeyRound className={iconClass} />
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{6}"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className={`${inputClass} pl-10 font-mono tracking-[0.3em] text-center`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A3D]/25 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                </>
              ) : (
                "Continue"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setCode("");
                setError(null);
              }}
              className="w-full text-sm text-white/60 hover:text-[#FF6A3D] font-semibold cursor-pointer transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="text-center text-sm text-white/70 mt-6">
          Browse trainers{" "}
          <Link href="/trainers" className="text-[#FF6A3D] font-semibold hover:underline">
            marketplace
          </Link>
        </p>
      </div>
    </div>
  );
}
