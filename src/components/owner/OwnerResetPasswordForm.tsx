"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";

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
  autoComplete,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  autoComplete?: string;
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
          autoComplete={autoComplete}
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
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    token ? null : "Reset link is missing or invalid."
  );
  const [success, setSuccess] = useState(false);

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

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Password reset failed.");
        return;
      }
      setSuccess(true);
      setTimeout(() => router.push("/owner/login"), 2000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className={`${glassCard} p-8`}>
        <div className="flex items-center gap-2 p-3 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Reset link is missing or invalid.
        </div>
        <p className="text-center text-sm text-white/70 mt-6">
          <Link href="/owner/forgot-password" className="text-[#FF6A3D] font-semibold hover:underline">
            Request a new reset link
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={glassCard}>
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-white/40" />
      <div className="p-8">
        <h1 className="font-heading font-bold text-xl text-white mb-1">Reset password</h1>
        <p className="text-sm text-white/70 mb-6">Choose a new password for your owner account.</p>

        {success ? (
          <div className="flex items-center gap-2 p-3 bg-green-500/15 backdrop-blur-sm border border-green-400/30 rounded-xl text-sm text-green-100">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Password updated. Redirecting to sign in…
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <PasswordField
              id="new-password"
              label="New password"
              value={password}
              onChange={setPassword}
              placeholder="Min 8 characters"
              show={showPw}
              onToggleShow={() => setShowPw((v) => !v)}
              autoComplete="new-password"
            />

            <PasswordField
              id="confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Repeat password"
              show={showConfirmPw}
              onToggleShow={() => setShowConfirmPw((v) => !v)}
              autoComplete="new-password"
            />

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-500/15 backdrop-blur-sm border border-red-400/30 rounded-xl text-sm text-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2 shadow-lg shadow-[#FF6A3D]/25 cursor-pointer"
            >
              {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : "Update password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function OwnerResetPasswordForm() {
  return (
    <Suspense fallback={<p className="text-sm text-white/70">Loading…</p>}>
      <ResetPasswordInner />
    </Suspense>
  );
}
