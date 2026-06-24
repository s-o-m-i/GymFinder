import { redirect } from "next/navigation";

export default function TrainerAuthRedirectPage() {
  redirect("/trainer/login");
}
