"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { OtpBoxInput } from "@/components/ui/OtpBoxInput";

const DEV_RESET_OTP_KEY = "trainer_dev_reset_otp";

const glassCard =
  "relative w-full max-w-md rounded-3xl overflow-hidden border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)]";

const labelClass = "block text-sm font-semibold text-white/90 mb-1.5";

function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  show,
  onToggleShow,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="flex items-center gap-2 h-11 px-3 rounded-xl border border-white/25 bg-white/10 focus-within:ring-2 focus-within:ring-[#FF6A3D]/60 focus-within:border-[#FF6A3D]/50">
        <Lock className="w-4 h-4 shrink-0 text-white/45" aria-hidden />
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="new-password"
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-white/45 focus:outline-none"
        />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={onToggleShow}
          className="shrink-0 text-white/45 hover:text-white/80 transition-colors p-0.5 cursor-pointer"
          aria-label={show ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ResetPasswordInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") ?? "";
  const justSent = searchParams.get("sent") === "1";

  const [email] = useState(emailParam);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(
    emailParam ? null : "Email is missing. Start from the forgot password page."
  );
  const [message, setMessage] = useState<string | null>(
    justSent ? "If a verified account exists, a reset code has been sent to your email." : null
  );
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem(DEV_RESET_OTP_KEY);
    if (stored) {
      setDevOtpCode(stored);
      sessionStorage.removeItem(DEV_RESET_OTP_KEY);
    }
  }, []);

  async function handleResendCode() {
    if (!email) return;
    setResending(true);
    setError(null);
    setMessage(null);
    setDevOtpCode(null);

    try {
      const res = await fetch("/api/trainer/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not send reset code.");
        return;
      }
      if (data.devOtpCode) setDevOtpCode(data.devOtpCode);
      setMessage(data.message ?? "Reset code sent. Check your inbox.");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setResending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (code.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const res = await fetch("/api/trainer/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Password reset failed.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/trainer/login"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!emailParam) {
    return (
      <div className={`${glassCard} p-8`}>
        <div className="flex items-center gap-2 p-3 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Email is missing. Start from the forgot password page.
        </div>
        <p className="text-center text-sm text-white/70 mt-6">
          <Link href="/trainer/forgot-password" className="text-[#FF6A3D] font-semibold hover:underline">
            Request a reset code
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={glassCard}>
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-white/40" />
      <div className="p-8">
        <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-4">
          <KeyRound className="w-6 h-6 text-[#FF6A3D]" />
        </div>
        <h1 className="font-heading font-bold text-xl text-white mb-1">Reset password</h1>
        <p className="text-sm font-medium text-white/90 mb-1 break-all">{email}</p>
        <p className="text-sm text-white/70 mb-6">
          Enter the 6-digit code from your email, then choose a new password.
        </p>

        {success ? (
          <div className="flex items-center gap-2 p-3 bg-green-500/15 backdrop-blur-sm border border-green-400/30 rounded-xl text-sm text-green-100">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Password updated. Redirecting to sign in…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
              <div className="flex items-center gap-2 p-3 bg-emerald-500/15 backdrop-blur-sm border border-emerald-400/30 rounded-xl text-sm text-emerald-100">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                {message}
              </div>
            )}

            {devOtpCode && (
              <div className="p-4 bg-amber-500/15 backdrop-blur-sm border border-amber-400/30 rounded-xl text-sm text-amber-50">
                <p className="font-semibold mb-1">Local development mode</p>
                <p className="text-amber-50/90">
                  Your reset code:{" "}
                  <span className="font-mono font-bold text-lg tracking-widest text-white">
                    {devOtpCode}
                  </span>
                </p>
              </div>
            )}

            <div>
              <label className={`${labelClass} mb-2`}>Reset code</label>
              <OtpBoxInput value={code} onChange={setCode} disabled={loading} autoFocus />
            </div>

            <PasswordField
              id="new-password"
              label="New password"
              value={password}
              onChange={setPassword}
              placeholder="Min 8 characters"
              show={showPw}
              onToggleShow={() => setShowPw((v) => !v)}
            />

            <PasswordField
              id="confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat password"
              show={showConfirmPw}
              onToggleShow={() => setShowConfirmPw((v) => !v)}
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A3D]/25 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Updating…
                </>
              ) : (
                "Update password"
              )}
            </button>

            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending || loading}
              className="w-full text-sm text-white/70 hover:text-white transition-colors disabled:opacity-60 cursor-pointer"
            >
              {resending ? "Sending new code…" : "Didn't get a code? Send again"}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-white/70 mt-6">
          <Link href="/trainer/login" className="text-[#FF6A3D] font-semibold hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export function TrainerResetPasswordForm() {
  return (
    <Suspense fallback={<p className="text-sm text-white/70">Loading…</p>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
