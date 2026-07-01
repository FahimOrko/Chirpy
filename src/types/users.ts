import { NewUser } from "../db/schema.js";

export type LoggedInUser = Omit<NewUser, "hashedPassword">;
