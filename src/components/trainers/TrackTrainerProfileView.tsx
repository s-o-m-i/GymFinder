import { trackTrainerProfileView } from "@/services/trainer-analytics.service";

interface TrackTrainerProfileViewProps {
  trainerId: string;
}

/** Server-side trainer profile view tracking with 24h deduplication */
export async function TrackTrainerProfileView({ trainerId }: TrackTrainerProfileViewProps) {
  try {
    await trackTrainerProfileView(trainerId);
  } catch {
    // Non-blocking — page render must not fail on analytics errors
  }
  return null;
}
