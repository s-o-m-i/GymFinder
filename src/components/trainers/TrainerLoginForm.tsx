"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

const glassCard =
  "relative w-full max-w-md rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/60 focus:border-[#FF6A3D]/50";

const labelClass = "block text-sm font-semibold text-white/90";
const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45";

function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? "/trainer/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/trainer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification && data.email) {
          setUnverifiedEmail(data.email);
          setError(
            `The account for ${data.email} is not verified yet. Enter the code from your email, or request a new one.`
          );
          return;
        }
        setUnverifiedEmail(null);
        setError(data.error ?? "Login failed.");
        return;
      }

      setUnverifiedEmail(null);
      router.push(data.needsProfile ? "/trainer/dashboard/profile" : from);
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
        <h1 className="font-heading font-bold text-xl text-white mb-1">Trainer Login</h1>
        <p className="text-sm text-white/70 mb-6">Sign in to manage your trainer profile</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`${labelClass} mb-1.5`}>Email</label>
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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelClass}>Password</label>
              <Link href="/trainer/forgot-password" className="text-xs font-semibold text-[#FF6A3D] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className={iconClass} />
              <input
                type={showPw ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className={`${inputClass} pl-10 pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/45 hover:text-white/80 transition-colors p-0.5 cursor-pointer"
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
              {unverifiedEmail && (
                <p className="text-xs pl-6 text-red-100/90">
                  Need to verify?{" "}
                  <Link
                    href={`/trainer/verify-email?email=${encodeURIComponent(unverifiedEmail)}&pending=1`}
                    className="font-semibold text-[#FF6A3D] hover:underline"
                  >
                    Enter verification code
                  </Link>
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A3D]/25 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-white/70 mt-6">
          New trainer?{" "}
          <Link href="/trainer/register" className="text-[#FF6A3D] font-semibold hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export function TrainerLoginForm() {
  return (
    <Suspense fallback={<div className="text-sm text-white/70">Loading…</div>}>
      <LoginFormInner />
    </Suspense>
  );
}
