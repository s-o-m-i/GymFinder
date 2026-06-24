"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Key, Link2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ShareListingUrl } from "@/components/owner/ShareListingUrl";
import { businessCategoryLabel } from "@/lib/owner-constants";
import type { BusinessCategory, ListingStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

type TabId = "account" | "security" | "link";

interface OwnerProfileTabsProps {
  initial: {
    name: string;
    email: string;
    phone: string;
    businessCategory: BusinessCategory;
  };
  gym: {
    name: string;
    slug: string;
    listingStatus: ListingStatus;
  } | null;
}

const LISTING_STATUS_LABELS = {
  pending: "Pending approval",
  approved: "Live on site",
  rejected: "Not published",
} as const;

const labelClass =
  "block text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-1.5";

export function OwnerProfileTabs({ initial, gym }: OwnerProfileTabsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>("account");
  const [form, setForm] = useState({
    name: initial.name,
    phone: initial.phone,
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const inputClass =
    "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[#FF6A3D]/30 focus:border-[#FF6A3D]";

  const readOnlyClass =
    "w-full px-3 py-2.5 text-sm bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text-muted)]";

  const tabs: { id: TabId; label: string; icon: typeof User }[] = [
    { id: "account", label: "Account", icon: User },
    { id: "security", label: "Password", icon: Key },
    ...(gym ? [{ id: "link" as const, label: "Public Link", icon: Link2 }] : []),
  ];

  async function handleSave(mode: "account" | "security") {
    setError("");
    setSuccess("");

    if (mode === "security") {
      if (!form.currentPassword || !form.newPassword) {
        setError("Enter your current password and a new password.");
        return;
      }
      if (form.newPassword !== form.confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
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
          ...(mode === "security" && {
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Update failed.");
        return;
      }

      setSuccess(
        mode === "security"
          ? "Password updated successfully."
          : "Account details saved successfully."
      );
      setForm((f) => ({
        ...f,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      router.refresh();
    } catch {
      setError("Network error.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="border-b border-[var(--border)] mb-6">
        <nav
          className="flex gap-1 overflow-x-auto"
          aria-label="Profile sections"
        >
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setError("");
                  setSuccess("");
                }}
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap",
                  isActive
                    ? "border-[#FF6A3D] text-[#FF6A3D]"
                    : "border-transparent text-[var(--text-muted)] hover:text-[var(--text)]"
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6 lg:p-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
            {success}
          </div>
        )}

        {activeTab === "account" && (
          <div>
            <div className="mb-6">
              <h2 className="font-heading font-bold text-lg text-[var(--text)]">
                Account Information
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Update your contact details and review account metadata.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Account Type</label>
                  <div className={readOnlyClass}>
                    {businessCategoryLabel(initial.businessCategory)}
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <div className={readOnlyClass}>{initial.email}</div>
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="03001234567"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {gym && (
              <div className="mt-6 pt-6 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className={labelClass}>Listing</p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {gym.name}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>Status</p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {LISTING_STATUS_LABELS[gym.listingStatus]}
                  </p>
                </div>
                <div>
                  <p className={labelClass}>Portal Role</p>
                  <p className="text-sm font-medium text-[var(--text)]">
                    {businessCategoryLabel(initial.businessCategory)}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                isLoading={saving}
                onClick={() => handleSave("account")}
              >
                Save Account
              </Button>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div>
            <div className="mb-6">
              <h2 className="font-heading font-bold text-lg text-[var(--text)]">
                Password
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Update your sign-in password for this owner account.
              </p>
            </div>

            <div className="max-w-xl space-y-4">
              <div>
                <label className={labelClass}>Current Password</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, currentPassword: e.target.value }))
                  }
                  className={inputClass}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>New Password</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, newPassword: e.target.value }))
                    }
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Confirm New Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        confirmPassword: e.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                isLoading={saving}
                onClick={() => handleSave("security")}
              >
                Update Password
              </Button>
            </div>
          </div>
        )}

        {activeTab === "link" && gym && (
          <div>
            <div className="mb-6">
              <h2 className="font-heading font-bold text-lg text-[var(--text)]">
                Public Listing Link
              </h2>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Copy your FitnessAdda PK profile URL and share it with clients on
                social media.
              </p>
            </div>

            <ShareListingUrl
              slug={gym.slug}
              listingName={gym.name}
              listingStatus={gym.listingStatus}
              embedded
            />
          </div>
        )}
      </div>
    </div>
  );
}
