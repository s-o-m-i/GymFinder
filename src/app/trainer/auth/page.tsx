import type { Metadata } from "next";
import { TrainerAuthForm } from "@/components/trainers/TrainerAuthForm";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: `Trainer Sign In | ${SITE_NAME}`,
  robots: { index: false, follow: false },
};

export default function TrainerAuthPage() {
  return (
    <AuthPageLayout>
      <TrainerAuthForm />
    </AuthPageLayout>
  );
}
