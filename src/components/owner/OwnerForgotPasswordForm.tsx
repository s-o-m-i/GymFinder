"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { DevEmailLinkBox } from "@/components/owner/DevEmailLinkBox";

const glassCard =
  "relative w-full max-w-md rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

const inputClass =
  "w-full h-11 px-4 rounded-xl border border-white/25 bg-white/10 backdrop-blur-sm text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/60 focus:border-[#FF6A3D]/50";

const labelClass = "block text-sm font-semibold text-white/90 mb-1.5";
const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45";

export function OwnerForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/owner/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Request failed.");
        return;
      }
      setMessage(data.message ?? "If an account exists, a reset link has been sent.");
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
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
        <Link
          href="/owner/login"
          className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h1 className="font-heading font-bold text-xl text-white mb-1">Forgot password</h1>
        <p className="text-sm text-white/70 mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-500/15 backdrop-blur-sm border border-green-400/30 rounded-xl text-sm text-green-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {message}
            </div>
          )}

          {devResetUrl && (
            <DevEmailLinkBox label="Password reset link" url={devResetUrl} variant="glass" />
          )}

          <button
            type="submit"
            disabled={loading || (!!message && !devResetUrl)}
            className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A3D]/25 cursor-pointer"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
