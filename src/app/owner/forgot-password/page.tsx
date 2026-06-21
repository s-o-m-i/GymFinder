import type { Metadata } from "next";
import { OwnerForgotPasswordForm } from "@/components/owner/OwnerForgotPasswordForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Forgot Password | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function OwnerForgotPasswordPage() {
  return (
    <AuthPageLayout>
      <OwnerForgotPasswordForm />
    </AuthPageLayout>
  );
}
