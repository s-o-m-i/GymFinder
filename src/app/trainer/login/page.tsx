import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TrainerLoginForm } from "@/components/trainers/TrainerLoginForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Trainer Login | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function TrainerLoginPage() {
  return (
    <AuthPageLayout>
      <TrainerLoginForm />
    </AuthPageLayout>
  );
}
