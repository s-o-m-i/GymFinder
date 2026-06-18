"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { businessCategoryLabel } from "@/lib/owner-constants";
import type { BusinessCategory } from "@prisma/client";

interface OwnerProfileFormProps {
  initial: {
    name:  string;
    email: string;
    phone: string;
    businessCategory: BusinessCategory;
  };
}

export function OwnerProfileForm({ initial }: OwnerProfileFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    name:            initial.name,
    phone:           initial.phone,
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/owner/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
        return;
      }
      setSuccess("Profile updated successfully.");
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{success}</div>}

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <h3 className="font-heading font-bold text-[var(--text)]">Account Info</h3>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">Account Type</label>
          <div className="px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text-muted)]">
            {businessCategoryLabel(initial.businessCategory)}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">Email</label>
          <div className="px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text-muted)]">
            {initial.email}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">Full Name</label>
          <input required type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">Phone</label>
          <input type="text" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="03001234567" className={inputClass} />
        </div>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 space-y-4">
        <h3 className="font-heading font-bold text-[var(--text)]">Change Password</h3>
        <div>
          <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">Current Password</label>
          <input type="password" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} className={inputClass} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">New Password</label>
            <input type="password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] uppercase mb-1.5">Confirm New</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))} className={inputClass} />
          </div>
        </div>
      </div>

      <Button type="submit" variant="secondary" isLoading={saving}>Save Profile</Button>
    </form>
  );
}
