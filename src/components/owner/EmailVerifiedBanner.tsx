"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

function BannerInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const verified = searchParams.get("verified") === "1";
  const email = searchParams.get("email");
  const [visible, setVisible] = useState(verified);

  useEffect(() => {
    if (!verified) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("verified");
    url.searchParams.delete("email");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [verified, router]);

  if (!visible) return null;

  return (
    <div className="flex items-start gap-2 p-3 mb-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
      <div>
        <p className="font-semibold">Email verified</p>
        {email && (
          <p className="text-green-700/90 break-all">
            You can sign in anytime with <span className="font-medium">{email}</span>.
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="ml-auto text-green-700/70 hover:text-green-900 text-xs font-semibold shrink-0 cursor-pointer"
      >
        Dismiss
      </button>
    </div>
  );
}

export function EmailVerifiedBanner() {
  return (
    <Suspense fallback={null}>
      <BannerInner />
    </Suspense>
  );
}
