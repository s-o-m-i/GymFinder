import { NextResponse } from "next/server";
import { getTrainerSession } from "@/lib/trainer-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getTrainerSession();
  if (!session) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const account = await prisma.trainerAccount.findUnique({
    where: { id: session.accountId },
    include: {
      trainer: {
        select: {
          id: true,
          fullName: true,
          slug: true,
          isPublished: true,
          city: true,
          specialization: true,
        },
      },
    },
  });

  if (!account) {
    return NextResponse.json({ error: "Account not found." }, { status: 404 });
  }

  return NextResponse.json({
    email: account.email,
    emailVerified: account.emailVerified,
    trainer: account.trainer,
  });
}
