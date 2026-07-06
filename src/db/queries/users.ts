import { eq } from "drizzle-orm";
import { db } from "../index.js";
import { chirps, NewChirp, NewUser, users } from "../schema.js";

export async function createUser(user: NewUser): Promise<NewUser | null> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  const { hashedPassword, ...userWithoutPassword } = result;
  return userWithoutPassword;
}

export async function getUserByEmail(email: string) {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  return user;
}

export async function getUserById(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId));
  return user;
}

export async function updateUserById(
  userId: string,
  email: string,
  hashedPassword: string,
): Promise<UserSafe> {
  const [updated] = await db
    .update(users)
    .set({ email, hashedPassword })
    .where(eq(users.id, userId))
    .returning();

  const { hashedPassword: password, ...userWithoutPassword } = updated;
  return userWithoutPassword;
}

export async function updateChirpyRed(id: string, isChirpyRed: boolean) {
  const [result] = await db
    .update(users)
    .set({ isChirpyRed })
    .where(eq(users.id, id))
    .returning();
  const { hashedPassword, ...userWithoutPassword } = result;
  return userWithoutPassword;
}

export async function deleteAllUsers() {
  await db.delete(users);
}

type UserSafe = Omit<typeof users.$inferSelect, "hashedPassword">;
