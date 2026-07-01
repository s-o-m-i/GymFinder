import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

function BlogCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)]">
      <div className="aspect-[16/10] animate-pulse bg-[var(--bg)]" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-24 animate-pulse rounded bg-[var(--bg)]" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-[var(--bg)]" />
        <div className="h-4 w-full animate-pulse rounded bg-[var(--bg)]" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--bg)]" />
      </div>
    </div>
  );
}

export default function BlogsLoading() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8 space-y-3">
            <div className="h-8 w-48 animate-pulse rounded bg-[var(--card)]" />
            <div className="h-4 w-full max-w-xl animate-pulse rounded bg-[var(--card)]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <BlogCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
