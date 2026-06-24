import type { Metadata } from "next";
import { TrainerRegisterForm } from "@/components/trainers/TrainerRegisterForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Trainer Registration | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function TrainerRegisterPage() {
  return (
    <AuthPageLayout>
      <TrainerRegisterForm />
    </AuthPageLayout>
  );
}
