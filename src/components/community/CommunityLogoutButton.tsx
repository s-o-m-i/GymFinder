"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export function CommunityLogoutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await fetch("/api/community/auth", { method: "DELETE", credentials: "include" });
          router.push("/user/login");
          router.refresh();
        });
      }}
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#8ba0b8] transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
