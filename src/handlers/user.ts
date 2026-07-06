import type { Request, Response } from "express";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/error.js";
import {
  createUser,
  deleteAllUsers,
  getUserByEmail,
  getUserById,
  updateUserById,
} from "../db/queries/users.js";
import { respondWithJSON } from "../api/json.js";
import { config } from "../config.js";
import {
  getBearerToken,
  hashPassword,
  makeJWT,
  makeRefreshToken,
  validateJWT,
  verifyPassword,
} from "../api/auth.js";
import { LoggedInUser } from "../types/users.js";

type parameters = {
  email: string;
  password: string;
  expiresInSeconds: number;
};

export async function handlerCreateNewUser(req: Request, res: Response) {
  const { email, password }: parameters = req.body;
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const hashedPassword = await hashPassword(password);

  const user = await createUser({ email, hashedPassword });

  if (!user) {
    throw new BadRequestError("User already exists");
  }

  respondWithJSON(res, 201, user);
}

export async function handlerLoginUser(req: Request, res: Response) {
  const { email, password } = req.body as parameters;
  if (!email || !password) {
    throw new BadRequestError(
      "Email, password & token exparation time are required",
    );
  }

  const user = await getUserByEmail(email);

  if (!user) throw new NotFoundError("User with email not found");

  const isValidPassword = await verifyPassword(password, user.hashedPassword);

  if (!isValidPassword) throw new UnauthorizedError("Unauthorized");

  const jwtSecret = config.api.jwtSecret;
  const jwt = makeJWT(user.id, jwtSecret);
  const refreshToken = await makeRefreshToken(user.id);

  const loggedInUser: LoggedInUser = {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    token: jwt,
    refreshToken: refreshToken,
  };

  respondWithJSON(res, 200, loggedInUser);
}

export async function handlerDeleteAllUsers(req: Request, res: Response) {
  if (config.api.platform !== "dev") {
    throw new ForbiddenError(
      "Deleting all users is only allowed in dev environment",
    );
  }

  await deleteAllUsers();
}

export async function handlerUpdateUser(req: Request, res: Response) {
  const { email, password }: parameters = req.body;
  if (!email || !password) {
    throw new BadRequestError("Email and password are required");
  }

  const hashedPassword = await hashPassword(password);
  const token = getBearerToken(req);
  const userId = validateJWT(token, config.api.jwtSecret);

  if (!userId) {
    throw new BadRequestError("Invalid or missing JWT token");
  }

  const user = await getUserById(userId);

  if (!user) {
    throw new NotFoundError("User not found");
  }

  const updatedUser = await updateUserById(userId, email, hashedPassword);
  respondWithJSON(res, 200, updatedUser);
}
