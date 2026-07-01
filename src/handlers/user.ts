import type { Request, Response } from "express";
import { BadRequestError, ForbiddenError } from "../errors/error.js";
import { createUser, deleteAllUsers } from "../db/queries/users.js";
import { respondWithJSON } from "../api/json.js";
import { config } from "../config.js";

type parameters = {
  email: string;
};

export async function handlerCreateNewUser(req: Request, res: Response) {
  const { email }: parameters = req.body;
  if (!email) {
    throw new BadRequestError("Email is required");
  }

  const user = await createUser({ email });
  if (!user) {
    throw new BadRequestError("User already exists");
  }

  respondWithJSON(res, 201, user);
}

export async function handlerDeleteAllUsers(req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError(
      "Deleting all users is only allowed in dev environment",
    );
  }

  await deleteAllUsers();
}
