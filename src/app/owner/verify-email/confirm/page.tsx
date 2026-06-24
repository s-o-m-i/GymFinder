import type { Metadata } from "next";
import { OwnerVerifyEmailConfirmForm } from "@/components/owner/OwnerVerifyEmailConfirmForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Confirm Email | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function OwnerVerifyEmailConfirmPage() {
  return (
    <AuthPageLayout>
      <OwnerVerifyEmailConfirmForm />
    </AuthPageLayout>
  );
}
