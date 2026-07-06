import { asc, desc, eq } from "drizzle-orm";
import { db } from "../index.js";
import { NewChirp, chirps } from "../schema.js";

export async function createChrip(chirp: NewChirp): Promise<NewChirp | null> {
  const [result] = await db
    .insert(chirps)
    .values(chirp)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function getAllChirps(
  order: "asc" | "desc",
): Promise<NewChirp[] | null> {
  return db
    .select()
    .from(chirps)
    .orderBy(order === "desc" ? desc(chirps.createdAt) : asc(chirps.createdAt));
}

export async function getAllChirpsByUserId(
  userId: string,
  order: "asc" | "desc",
): Promise<NewChirp[] | null> {
  return db
    .select()
    .from(chirps)
    .where(eq(chirps.userId, userId))
    .orderBy(order === "desc" ? desc(chirps.createdAt) : asc(chirps.createdAt));
}

export async function getChirp(id: string): Promise<NewChirp | null> {
  const [result] = await db.select().from(chirps).where(eq(chirps.id, id));
  return result;
}

export async function deleteChirp(id: string): Promise<NewChirp | null> {
  const [result] = await db.delete(chirps).where(eq(chirps.id, id)).returning();
  return result;
}
