import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const TRAINER_COOKIE_NAME = "trainer_session";
export const TRAINER_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export interface TrainerSession {
  accountId: string;
  email: string;
  trainerId: string | null;
}

function getSecret() {
  const raw = process.env.JWT_SECRET;
  if (!raw) throw new Error("JWT_SECRET environment variable is not set");
  return new TextEncoder().encode(raw);
}

export async function signTrainerToken(session: TrainerSession): Promise<string> {
  return new SignJWT({
    trainer: true,
    accountId: session.accountId,
    email: session.email,
    trainerId: session.trainerId,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${TRAINER_COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifyTrainerToken(token: string): Promise<TrainerSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (payload.trainer !== true || typeof payload.accountId !== "string") return null;
    return {
      accountId: payload.accountId,
      email: String(payload.email ?? ""),
      trainerId: typeof payload.trainerId === "string" ? payload.trainerId : null,
    };
  } catch {
    return null;
  }
}

export async function getTrainerSession(): Promise<TrainerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TRAINER_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyTrainerToken(token);
}
