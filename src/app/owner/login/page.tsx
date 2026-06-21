import type { Metadata } from "next";
import { OwnerLoginForm } from "@/components/owner/OwnerLoginForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Owner Login | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function OwnerLoginPage() {
  return (
    <AuthPageLayout>
      <OwnerLoginForm />
    </AuthPageLayout>
  );
}
