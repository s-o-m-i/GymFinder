"use client";

import { useRouter } from "next/navigation";

export function OwnerLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/owner/logout", { method: "POST", credentials: "include" });
    router.push("/owner/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#8ba0b8] hover:text-white hover:bg-white/10 transition-colors"
    >
      Sign out
    </button>
  );
}
