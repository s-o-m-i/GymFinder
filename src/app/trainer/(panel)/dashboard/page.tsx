export const dynamic = "force-dynamic";

import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";
import { getTrainerAnalytics } from "@/app/actions/trainer/analytics";
import { analyticsPeriodSchema } from "@/lib/validations/analytics";
import { TrainerAnalyticsSection } from "@/components/trainer/TrainerAnalyticsSection";
import {
  OwnerDashboardTabs,
  type DashboardTab,
} from "@/components/owner/OwnerDashboardTabs";
import { specializationLabel } from "@/lib/trainer-constants";
import {
  PlusCircle,
  Edit,
  ExternalLink,
  BadgeCheck,
  Sparkles,
  Star,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ period?: string; tab?: string }>;
}

function parseTab(tab: string | undefined): DashboardTab {
  return tab === "analytics" ? "analytics" : "overview";
}

export default async function TrainerDashboardPage({ searchParams }: PageProps) {
  const session = await getTrainerSession();
  if (!session) redirect("/trainer/auth");

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    include: { trainer: true },
  });

  if (!account) redirect("/trainer/auth");

  const trainer = account.trainer;
  const displayName = trainer?.fullName ?? account.email.split("@")[0];

  const { period: periodParam, tab: tabParam } = await searchParams;
  const periodResult = analyticsPeriodSchema.safeParse(periodParam ?? "30d");
  const period = periodResult.success ? periodResult.data : "30d";
  const activeTab = parseTab(tabParam);

  const analyticsData =
    trainer && trainer.isPublished ? await getTrainerAnalytics(period) : null;

  const overviewContent = !trainer ? (
    <Link
      href="/trainer/dashboard/profile"
      className="group block bg-[var(--card)] border border-[var(--border)] rounded-2xl p-8 text-center transition-all hover:border-[#FF6A3D]/40 hover:shadow-md hover:shadow-[#FF6A3D]/10 cursor-pointer"
    >
      <div className="w-16 h-16 bg-[#FF6A3D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors group-hover:bg-[#FF6A3D]/15">
        <PlusCircle className="w-8 h-8 text-[#FF6A3D]" />
      </div>
      <h2 className="font-heading font-bold text-lg text-[var(--text)] mb-2">
        Create Your Trainer Profile
      </h2>
      <p className="text-[var(--text-muted)] text-sm mb-6 max-w-sm mx-auto">
        Set up your public marketplace profile so clients can find and contact you.
      </p>
      <span className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6A3D] text-white font-semibold text-sm rounded-xl group-hover:bg-[#e85528] transition-colors">
        <PlusCircle className="w-4 h-4" />
        Create Profile
      </span>
    </Link>
  ) : (
    <div className="space-y-6">
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h2 className="font-heading font-bold text-lg text-[var(--text)]">
              {trainer.fullName}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              {trainer.area ? `${trainer.area}, ` : ""}
              {trainer.city}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              trainer.isPublished
                ? "bg-green-50 text-green-700 border-green-200"
                : "bg-amber-50 text-amber-700 border-amber-200"
            }`}
          >
            {trainer.isPublished ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Live on Marketplace
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5" />
                Draft
              </>
            )}
          </span>
        </div>

        {!trainer.isPublished && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            Your profile is saved as a draft. Publish it from My Profile to appear on the
            marketplace.
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Link
            href="/trainer/dashboard/profile"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0B2545] text-white text-sm font-semibold rounded-xl hover:bg-[#071832] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Link>
          {trainer.isPublished && (
            <Link
              href={`/trainer/${trainer.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--bg)] border border-[var(--border)] text-sm font-semibold text-[var(--text)] rounded-xl hover:border-[#FF6A3D]/30 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              View Public Profile
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Verified
              </p>
              <p className="font-heading font-bold text-2xl text-[var(--text)] mt-1">
                {trainer.isVerified ? "Yes" : "Pending"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <BadgeCheck className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Featured
              </p>
              <p className="font-heading font-bold text-2xl text-[var(--text)] mt-1">
                {trainer.isFeatured ? "Yes" : "No"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#FF6A3D]/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-[#FF6A3D]" />
            </div>
          </div>
        </div>
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                Rating
              </p>
              <p className="font-heading font-bold text-2xl text-[var(--text)] mt-1">
                {trainer.rating != null ? trainer.rating.toFixed(1) : "—"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Star className="w-5 h-5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const analyticsContent = analyticsData ? (
    <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Loading analytics…</div>}>
      <TrainerAnalyticsSection data={analyticsData} period={period} />
    </Suspense>
  ) : null;

  return (
    <div className="p-8 max-w-6xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="font-heading font-bold text-2xl text-[var(--text)]">
          Welcome, {displayName}
        </h1>
        <p className="text-[var(--text-muted)] text-sm mt-1">
          {trainer
            ? `${specializationLabel(trainer.specialization)} · ${account.email}`
            : account.email}
        </p>
      </div>

      {trainer && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border mb-6 bg-[#FF6A3D]/10 text-[#FF6A3D] border-[#FF6A3D]/20">
          🏋️ {specializationLabel(trainer.specialization)}
        </div>
      )}

      <Suspense fallback={<div className="text-sm text-[var(--text-muted)]">Loading…</div>}>
        <OwnerDashboardTabs
          activeTab={activeTab}
          showAnalytics={!!trainer?.isPublished}
          basePath="/trainer/dashboard"
          overview={overviewContent}
          analytics={analyticsContent}
        />
      </Suspense>
    </div>
  );
}
