"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, AlertCircle, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";
import { DevEmailLinkBox } from "@/components/owner/DevEmailLinkBox";

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
    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-[#0B2545]" />
      <div className="p-8">
        <Link href="/owner/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#0B2545] mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
        <h1 className="font-heading font-bold text-xl text-gray-900 mb-1">Forgot password</h1>
        <p className="text-sm text-gray-500 mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              {message}
            </div>
          )}

          {devResetUrl && (
            <DevEmailLinkBox label="Password reset link" url={devResetUrl} />
          )}

          <button
            type="submit"
            disabled={loading || (!!message && !devResetUrl)}
            className="w-full h-11 bg-[#0B2545] text-white font-semibold text-sm rounded-xl hover:bg-[#071832] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : "Send reset link"}
          </button>
        </form>
      </div>
    </div>
  );
}
