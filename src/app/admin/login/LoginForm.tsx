"use client";

import { useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

function LoginFormInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const from         = searchParams.get("from") ?? "/admin";

  const [password,  setPassword]  = useState("");
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [shake,     setShake]     = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) {
      setError("Please enter your password.");
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res  = await fetch("/api/admin/login", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Login failed.");
        setShake(true);
        setTimeout(() => setShake(false), 600);
        setPassword("");
        inputRef.current?.focus();
        return;
      }

      router.push(from);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden`}
      style={shake ? { animation: "shake 0.5s ease-in-out" } : {}}
    >
      {/* Top accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-[#0B2545]" />

      <div className="p-8">
        {/* Divider */}
        <div className="flex items-center gap-3 mb-6 mt-2">
          <div className="flex-1 h-px bg-gray-100" />
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
            <Lock className="w-3 h-3" />
            Secure Login
          </div>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-5">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              Admin Password
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="password"
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                autoFocus
                disabled={loading}
                className={`w-full h-12 pl-4 pr-12 rounded-xl border text-sm text-gray-900 placeholder:text-gray-400
                  focus:outline-none focus:ring-2 focus:ring-[#0B2545] focus:border-transparent
                  disabled:opacity-60 transition-all
                  ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50 hover:border-gray-300"}`}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                tabIndex={-1}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-[#0B2545] text-white font-semibold text-sm rounded-xl
              hover:bg-[#071832] active:scale-[0.98]
              disabled:opacity-70 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 transition-all shadow-md"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Signing in…
              </>
            ) : (
              "Sign in to Admin Panel"
            )}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Session expires after 8 hours &nbsp;·&nbsp; GymFinder PK &copy; 2024
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-8px); }
          30%       { transform: translateX(8px); }
          45%       { transform: translateX(-6px); }
          60%       { transform: translateX(6px); }
          75%       { transform: translateX(-4px); }
          90%       { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}

export function LoginForm() {
  return (
    <Suspense>
      <LoginFormInner />
    </Suspense>
  );
}
