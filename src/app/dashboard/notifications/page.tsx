import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { NavbarWithSuspense } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { NotificationsPageClient } from "@/components/notifications/NotificationsPageClient";
import { getNotificationRecipient } from "@/lib/notifications/recipient";

export const metadata: Metadata = {
  title: "Notifications",
  robots: { index: false, follow: false },
};

export default async function NotificationsPage() {
  const recipient = await getNotificationRecipient();
  if (!recipient) redirect("/auth/sign-in");

  return (
    <>
      <NavbarWithSuspense />
      <main className="min-h-[60vh] bg-[var(--bg)]">
        <NotificationsPageClient />
      </main>
      <Footer />
    </>
  );
}
