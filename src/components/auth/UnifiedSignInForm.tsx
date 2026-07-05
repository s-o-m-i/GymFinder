"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, Lock, Mail } from "lucide-react";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { GA_EVENTS, trackGAEvent } from "@/lib/google-analytics";

const glassCard =
  "relative w-full max-w-md rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/60 focus:border-[#FF6A3D]/50";

function SignInFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.requiresVerification && data.redirect) {
          router.push(data.redirect);
          return;
        }
        setError(data.error ?? "Sign in failed.");
        return;
      }

      router.push(from || data.redirect || "/");
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
        <h1 className="font-heading mb-1 text-xl font-bold text-white">Sign in</h1>
        <p className="mb-6 text-sm text-white/70">
          One account for members, trainers, and gym owners.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/90">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="you@example.com"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-white/90">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pl-10`}
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF6A3D] text-sm font-semibold text-white hover:bg-[#e85528] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Sign in
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-white/70">
          <p>
            New here?{" "}
            <Link
              href="/user/register"
              onClick={() =>
                trackGAEvent(GA_EVENTS.share_story, {
                  action: "sign_in_page_link",
                })
              }
              className="font-semibold text-[#FF6A3D] hover:underline"
            >
              Share a story
            </Link>
            {" · "}
            <Link href="/owner/register" className="font-semibold text-[#FF6A3D] hover:underline">
              List a gym
            </Link>
            {" · "}
            <Link href="/trainer/register" className="font-semibold text-[#FF6A3D] hover:underline">
              Join as trainer
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function UnifiedSignInForm() {
  return (
    <Suspense fallback={<div className={glassCard}><div className="h-48" /></div>}>
      <SignInFormInner />
    </Suspense>
  );
}
