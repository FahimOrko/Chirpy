import { db } from "../index.js";
import { eq } from "drizzle-orm";
import { NewRefreshToken, refreshTokens } from "../schema.js";

export async function createRefreshToken(
  userId: string,
  token: string,
): Promise<NewRefreshToken | null> {
  const expiresAt = new Date(Date.now() + 60 * 60 * 24 * 60); // Expiration 60 days from now
  const refreshToken: NewRefreshToken = {
    userId,
    token,
    expiresAt,
    revokedAt: null,
  };
  const [result] = await db
    .insert(refreshTokens)
    .values(refreshToken)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getRefreshToken(token: string) {
  const [result] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, token));
  return result;
}

export async function revokeRefreshToken(token: string) {
  const [result] = await db
    .update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, token));
  return result;
}
