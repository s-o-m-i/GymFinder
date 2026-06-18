"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, Phone, AlertCircle, Loader2, Dumbbell, Swords } from "lucide-react";
import type { BusinessCategory } from "@prisma/client";

export function OwnerRegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    businessCategory: "gym" as BusinessCategory,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inputClass =
    "w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B2545]";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/owner/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          businessCategory: form.businessCategory,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Registration failed.");
        return;
      }

      router.push("/owner/dashboard");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="h-1.5 bg-gradient-to-r from-[#FF6A3D] via-[#ff8a65] to-[#0B2545]" />
      <div className="p-8">
        <h1 className="font-heading font-bold text-xl text-gray-900 mb-1">Create Owner Account</h1>
        <p className="text-sm text-gray-500 mb-6">Register to list your gym or fighting club</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Business type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">I am a… *</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, businessCategory: "gym" }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.businessCategory === "gym"
                    ? "border-[#0B2545] bg-[#0B2545]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Dumbbell className={`w-6 h-6 ${form.businessCategory === "gym" ? "text-[#0B2545]" : "text-gray-400"}`} />
                <span className="text-sm font-semibold text-gray-800">Gym Owner</span>
                <span className="text-[10px] text-gray-500">Fitness centers</span>
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, businessCategory: "fighting_club" }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  form.businessCategory === "fighting_club"
                    ? "border-[#FF6A3D] bg-[#FF6A3D]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Swords className={`w-6 h-6 ${form.businessCategory === "fighting_club" ? "text-[#FF6A3D]" : "text-gray-400"}`} />
                <span className="text-sm font-semibold text-gray-800">Fighting Club Owner</span>
                <span className="text-[10px] text-gray-500">Boxing, MMA, martial arts</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name *</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Your full name" className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email *</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="you@example.com" className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="03001234567" className={`${inputClass} pl-10`} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password *</label>
              <input required type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Min 8 chars" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm *</label>
              <input required type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} placeholder="Repeat password" className={inputClass} />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full h-11 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl hover:bg-[#e85528] disabled:opacity-70 flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{" "}
          <Link href="/owner/login" className="text-[#0B2545] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
