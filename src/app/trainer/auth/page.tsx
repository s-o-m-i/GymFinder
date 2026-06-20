import type { Metadata } from "next";
import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { TrainerAuthForm } from "@/components/trainers/TrainerAuthForm";

export const metadata: Metadata = {
  title: "Trainer Sign In | GymFinder PK",
  robots: { index: false, follow: false },
};

export default function TrainerAuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B2545] via-[#0f3060] to-[#1a4080] flex flex-col items-center justify-center p-4">
      <Link href="/" className="flex items-center gap-2 mb-8 text-white">
        <div className="w-9 h-9 bg-[#FF6A3D] rounded-lg flex items-center justify-center">
          <Dumbbell className="w-5 h-5" />
        </div>
        <span className="font-heading font-bold">GymFinder PK</span>
      </Link>
      <TrainerAuthForm />
    </div>
  );
}
