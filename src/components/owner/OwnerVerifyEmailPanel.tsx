"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, AlertCircle, Loader2, CheckCircle2, KeyRound } from "lucide-react";

const DEV_OTP_KEY = "owner_dev_otp";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") ?? "";
  const isSignupFlow = searchParams.get("pending") === "1";

  const [email, setEmail] = useState(emailParam);
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(Boolean(isSignupFlow && emailParam));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignupFlow) return;
    const stored = sessionStorage.getItem(DEV_OTP_KEY);
    if (stored) {
      setDevOtpCode(stored);
      sessionStorage.removeItem(DEV_OTP_KEY);
    }
  }, [isSignupFlow]);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setMessage(null);
    setDevOtpCode(null);

    try {
      const res = await fetch("/api/owner/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Could not send verification code.");
        return;
      }
      if (data.devOtpCode) setDevOtpCode(data.devOtpCode);
      setOtpSent(true);
      setMessage(data.message ?? "Verification code sent. Check your inbox.");
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/owner/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormError(data.error ?? "Invalid verification code.");
        return;
      }

      router.push(
        `/owner/dashboard?verified=1&email=${encodeURIComponent(data.email ?? email)}`
      );
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-[#0B2545]" />
      <div className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-[#0B2545]/10 flex items-center justify-center mb-4">
          {otpSent ? (
            <KeyRound className="w-6 h-6 text-[#0B2545]" />
          ) : (
            <Mail className="w-6 h-6 text-[#0B2545]" />
          )}
        </div>
        <h1 className="font-heading font-bold text-xl text-gray-900 mb-1">
          {otpSent ? "Enter verification code" : "Verify your email"}
        </h1>
        {otpSent && email && (
          <p className="text-sm font-medium text-gray-800 mb-1 break-all">{email}</p>
        )}
        <p className="text-sm text-gray-500 mb-6">
          {otpSent
            ? isSignupFlow
              ? "We sent a 6-digit code to your email. Paste it below to verify your account."
              : message ?? "Enter the 6-digit code we sent to your email. It expires in 10 minutes."
            : "Enter your email and we will send you a one-time verification code."}
        </p>

        {formError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {formError}
          </div>
        )}

        {message && otpSent && !formError && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </div>
        )}

        {devOtpCode && (
          <div className="p-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
            <p className="font-semibold mb-1">Local development mode</p>
            <p>
              Your verification code:{" "}
              <span className="font-mono font-bold text-lg tracking-widest text-[#0B2545]">
                {devOtpCode}
              </span>
            </p>
          </div>
        )}

        {otpSent ? (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Verification code
              </label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-center font-mono text-lg tracking-[0.35em] focus:outline-none focus:ring-2 focus:ring-[#0B2545]"
              />
            </div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full h-11 bg-[#0B2545] text-white font-semibold text-sm rounded-xl hover:bg-[#071832] disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying…
                </>
              ) : (
                "Verify email"
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setCode("");
                setMessage(null);
                setDevOtpCode(null);
              }}
              className="w-full text-sm text-gray-500 hover:text-[#FF6A3D] font-semibold cursor-pointer"
            >
              Use a different email
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={async () => {
                setLoading(true);
                setFormError(null);
                try {
                  const res = await fetch("/api/owner/resend-verification", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setFormError(data.error ?? "Could not resend code.");
                    return;
                  }
                  if (data.devOtpCode) setDevOtpCode(data.devOtpCode);
                  setMessage(data.message ?? "New code sent. Check your inbox.");
                } catch {
                  setFormError("Network error. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full text-sm text-[#FF6A3D] font-semibold hover:underline cursor-pointer disabled:opacity-60"
            >
              Resend code
            </button>
          </form>
        ) : (
          <form onSubmit={handleSendOtp} className="space-y-4">
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
                "Send verification code"
              )}
            </button>
          </form>
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
