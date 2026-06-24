"use client";

import { useRouter } from "next/navigation";

export function TrainerLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/trainer/auth/logout", { method: "POST", credentials: "include" });
    router.push("/trainer/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[#8ba0b8] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
    >
      Sign out
    </button>
  );
}
