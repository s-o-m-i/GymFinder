import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateTrainerProfileMetadata } from "@/lib/trainers-routes";
import { TrainerProfilePage } from "@/components/trainers/TrainerProfilePage";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trainer = await prisma.trainer.findUnique({
    where: { slug },
    select: {
      fullName: true,
      slug: true,
      city: true,
      specialization: true,
      headline: true,
      bio: true,
      profileImage: true,
      isPublished: true,
    },
  });

  if (!trainer || !trainer.isPublished) {
    return { title: "Trainer Not Found" };
  }

  return generateTrainerProfileMetadata(trainer);
}

export default async function TrainerSlugPage({ params }: PageProps) {
  const { slug } = await params;
  return <TrainerProfilePage slug={slug} />;
}
