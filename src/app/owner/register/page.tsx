import type { Metadata } from "next";
import { OwnerRegisterForm } from "@/components/owner/OwnerRegisterForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Owner Registration | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function OwnerRegisterPage() {
  return (
    <AuthPageLayout>
      <OwnerRegisterForm />
    </AuthPageLayout>
  );
}
