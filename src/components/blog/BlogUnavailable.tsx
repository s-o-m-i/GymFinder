import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getBlogBasePath } from "@/lib/blogs-routes";

interface BlogUnavailableProps {
  message?: string;
}

export function BlogUnavailable({
  message = "Our blog is temporarily unavailable. Please try again in a few minutes.",
}: BlogUnavailableProps) {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <AlertCircle className="h-6 w-6 text-amber-700" />
      </div>
      <h2 className="font-heading text-lg font-bold text-amber-900">Blog unavailable</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-amber-800">{message}</p>
      <Link
        href={getBlogBasePath()}
        className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-950 transition-colors"
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </Link>
    </div>
  );
}
