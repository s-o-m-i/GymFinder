"use client";

import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getBlogBasePath } from "@/lib/blogs-routes";

export default function BlogsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="font-heading text-xl font-bold text-red-900">Something went wrong</h1>
            <p className="mt-2 text-sm text-red-800">
              We couldn&apos;t load the blog right now. Please try again.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="rounded-xl bg-red-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-800 transition-colors"
              >
                Try again
              </button>
              <Link
                href={getBlogBasePath()}
                className="rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-800 hover:bg-red-50 transition-colors"
              >
                Back to blog
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
