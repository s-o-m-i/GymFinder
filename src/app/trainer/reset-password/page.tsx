import type { Metadata } from "next";
import { TrainerResetPasswordForm } from "@/components/trainers/TrainerResetPasswordForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Reset Password | Trainer | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function TrainerResetPasswordPage() {
  return (
    <AuthPageLayout>
      <TrainerResetPasswordForm />
    </AuthPageLayout>
  );
}
