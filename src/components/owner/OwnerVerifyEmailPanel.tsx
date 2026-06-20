"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { DevEmailLinkBox } from "@/components/owner/DevEmailLinkBox";

const DEV_VERIFY_LINK_KEY = "owner_dev_verification_url";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const error = searchParams.get("error");
  /** Set only after signup — this page is not part of the login flow */
  const isSignupFlow = searchParams.get("pending") === "1";

  const [email, setEmail] = useState(emailParam);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(
    error === "invalid"
      ? "This verification link is invalid or has expired. Request a new one below."
      : error === "missing"
        ? "Verification link is missing."
        : null
  );

  useEffect(() => {
    if (!isSignupFlow) return;
    const stored = sessionStorage.getItem(DEV_VERIFY_LINK_KEY);
    if (stored) {
      setDevVerificationUrl(stored);
      sessionStorage.removeItem(DEV_VERIFY_LINK_KEY);
    }
  }, [isSignupFlow]);

  async function handleResend(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setMessage(null);
    setDevVerificationUrl(null);

    try {
      const res = await fetch("/api/owner/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Could not resend verification email.");
        return;
      }
      if (data.devVerificationUrl) {
        setDevVerificationUrl(data.devVerificationUrl);
        setMessage("Use the new verification link below.");
      } else {
        setMessage(data.message ?? "Verification email sent. Check your inbox.");
      }
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const showDevLink = Boolean(devVerificationUrl);
  const subtitle = showDevLink
    ? "Click the link below once to activate your account. You won't need to verify again when signing in."
    : isSignupFlow
      ? "Check your inbox for the verification link. After you verify once, you can sign in anytime."
      : "Enter your email to request a new verification link.";

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-[#0B2545]" />
      <div className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-[#0B2545]/10 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-[#0B2545]" />
        </div>
        <h1 className="font-heading font-bold text-xl text-gray-900 mb-1">
          {isSignupFlow ? "Verify your email" : "Resend verification"}
        </h1>
        {isSignupFlow && emailParam && (
          <p className="text-sm font-medium text-gray-800 mb-1 break-all">{emailParam}</p>
        )}
        <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

        {formError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        {message && !showDevLink && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        {showDevLink && (
          <DevEmailLinkBox label="Verification link (click once)" url={devVerificationUrl!} />
        )}

        {!isSignupFlow || !showDevLink ? (
          <form onSubmit={handleResend} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#0B2545] text-white font-semibold text-sm rounded-xl hover:bg-[#071832] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                </>
              ) : (
                "Send verification link"
              )}
            </button>
          </form>
        ) : (
          <p className="text-xs text-gray-500 text-center">
            Lost the link?{" "}
            <button
              type="button"
              onClick={() => setDevVerificationUrl(null)}
              className="text-[#FF6A3D] font-semibold hover:underline cursor-pointer"
            >
              Request another
            </button>
          </p>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Already verified?{" "}
          <Link href="/owner/login" className="text-[#FF6A3D] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export function OwnerVerifyEmailPanel() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
      <VerifyEmailInner />
    </Suspense>
  );
}
