import type { Metadata } from "next";
import { TrainerForgotPasswordForm } from "@/components/trainers/TrainerForgotPasswordForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Forgot Password | Trainer | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function TrainerForgotPasswordPage() {
  return (
    <AuthPageLayout>
      <TrainerForgotPasswordForm />
    </AuthPageLayout>
  );
}
