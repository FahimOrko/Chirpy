import { db } from "../index.js";
import { NewUser, users } from "../schema.js";

export async function createUser(user: NewUser): Promise<NewUser | null> {
  const [result] = await db
    .insert(users)
    .values(user)
    .onConflictDoNothing()
    .returning();
  return result;
}

export async function deleteAllUsers() {
  await db.delete(users);
}
