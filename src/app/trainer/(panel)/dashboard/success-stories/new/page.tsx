export const dynamic = "force-dynamic";

import { SuccessStoryWizard } from "@/components/success-stories/SuccessStoryWizard";

export default function TrainerNewSuccessStoryPage() {
  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <h1 className="font-heading mb-6 text-2xl font-bold text-[var(--text)]">Create success story</h1>
      <SuccessStoryWizard dashboardPath="/trainer/dashboard/success-stories" />
    </div>
  );
}
