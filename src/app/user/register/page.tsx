import type { Metadata } from "next";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { CommunityRegisterForm } from "@/components/community/CommunityRegisterForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Create Account | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function CommunityRegisterPage() {
  return (
    <AuthPageLayout>
      <CommunityRegisterForm />
    </AuthPageLayout>
  );
}
