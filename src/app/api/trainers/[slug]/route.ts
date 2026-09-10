import { NextResponse } from "next/server";
import { getTrainerBySlug } from "@/services/trainer/trainer.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const trainer = await getTrainerBySlug(slug);
    if (!trainer || !trainer.isPublished) {
      return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
    }
    return NextResponse.json({
      data: {
        id: trainer.id,
        fullName: trainer.fullName,
        slug: trainer.slug,
        headline: trainer.headline,
        bio: trainer.bio,
        profileImage: trainer.profileImage,
        city: trainer.city,
        area: trainer.area,
        specialization: trainer.specialization,
        experienceYears: trainer.experienceYears,
        certifications: trainer.certifications,
        achievements: trainer.achievements,
        transformations: trainer.transformations,
        hourlyRate: trainer.hourlyRate,
        whatsappNumber: trainer.whatsappNumber,
        email: trainer.email,
        isVerified: trainer.isVerified,
        isFeatured: trainer.isFeatured,
        rating: trainer.rating,
        totalReviews: trainer.totalReviews,
        gender: trainer.gender,
        availability: trainer.availability,
        gym: trainer.gym,
        reviews: trainer.reviews,
        faqs: trainer.faqs,
      },
    });
  } catch (error) {
    console.error("GET /api/trainers/[slug] error:", error);
    return NextResponse.json({ error: "Failed to fetch trainer." }, { status: 500 });
  }
}
