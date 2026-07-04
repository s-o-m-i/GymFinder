import type { Metadata } from "next";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { UnifiedSignInForm } from "@/components/auth/UnifiedSignInForm";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Sign In | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <AuthPageLayout>
      <UnifiedSignInForm />
    </AuthPageLayout>
  );
}
