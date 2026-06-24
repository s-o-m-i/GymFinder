"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

function ConfirmInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "Verification link is missing or invalid."
  );
  const [verified, setVerified] = useState(false);

  async function handleVerify() {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "This verification link is invalid or has expired.");
        return;
      }

      setVerified(true);
      router.push(
        `/owner/dashboard?verified=1&email=${encodeURIComponent(data.email ?? "")}`
      );
      router.refresh();
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
        <div className="w-12 h-12 rounded-2xl bg-[#0B2545]/10 flex items-center justify-center mb-4">
          <Mail className="w-6 h-6 text-[#0B2545]" />
        </div>
        <h1 className="font-heading font-bold text-xl text-gray-900 mb-1">
          Confirm your email
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          Click the button below to verify your owner account. This step is required before you
          can sign in.
        </p>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {verified ? (
          <div className="flex items-center gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Email verified. Redirecting to your dashboard…
          </div>
        ) : (
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !token}
            className="w-full h-11 bg-[#0B2545] text-white font-semibold text-sm rounded-xl hover:bg-[#071832] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Verifying…
              </>
            ) : (
              "Verify my email"
            )}
          </button>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Need a new link?{" "}
          <Link href="/owner/verify-email" className="text-[#FF6A3D] font-semibold hover:underline">
            Resend verification
          </Link>
        </p>
      </div>
    </div>
  );
}

export function OwnerVerifyEmailConfirmForm() {
  return (
    <Suspense fallback={<div className="text-sm text-gray-500">Loading…</div>}>
      <ConfirmInner />
    </Suspense>
  );
}
