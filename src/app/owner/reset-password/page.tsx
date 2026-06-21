import type { Metadata } from "next";
import { OwnerResetPasswordForm } from "@/components/owner/OwnerResetPasswordForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Reset Password | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function OwnerResetPasswordPage() {
  return (
    <AuthPageLayout>
      <OwnerResetPasswordForm />
    </AuthPageLayout>
  );
}
