"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

export type DashboardTab = "overview" | "analytics";

const TABS: { id: DashboardTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

interface OwnerDashboardTabsProps {
  activeTab: DashboardTab;
  showAnalytics: boolean;
  basePath?: string;
  overview: React.ReactNode;
  analytics: React.ReactNode | null;
}

export function OwnerDashboardTabs({
  activeTab,
  showAnalytics,
  basePath = "/owner/dashboard",
  overview,
  analytics,
}: OwnerDashboardTabsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setTab(tab: DashboardTab) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    if (tab === "overview") {
      params.delete("period");
    }
    router.push(`${basePath}?${params.toString()}`);
  }

  const tabs = showAnalytics ? TABS : TABS.filter((t) => t.id === "overview");
  const currentTab =
    activeTab === "analytics" && showAnalytics ? "analytics" : "overview";

  return (
    <div className="space-y-6">
      {showAnalytics && (
        <div
          className="inline-flex p-1 bg-[var(--bg)] border border-[var(--border)] rounded-xl"
          role="tablist"
          aria-label="Dashboard sections"
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={currentTab === id}
              onClick={() => setTab(id)}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer",
                currentTab === id
                  ? "bg-[#0B2545] text-white shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text)]"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}

      <div role="tabpanel">
        {currentTab === "overview" ? overview : analytics}
      </div>
    </div>
  );
}
