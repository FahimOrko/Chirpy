import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { Request, Response } from "express";
import { UserNotAuthenticatedError } from "../errors/error.js";
import crypto from "node:crypto";
import { createRefreshToken } from "../db/queries/refreshTokens.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export async function hashPassword(password: string): Promise<string> {
  const hash = await argon2.hash(password);
  return hash;
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const isValid = await argon2.verify(hashedPassword, password);
  return isValid;
}

export function makeJWT(userID: string, secret: string): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 60 * 60;
  const iss = "chirpy";
  return jwt.sign({ sub: userID, iat, exp, iss }, secret);
}

export function validateJWT(tokenString: string, secret: string): string {
  let decoded: payload;

  try {
    decoded = jwt.verify(tokenString, secret) as payload;
  } catch (e) {
    throw new UserNotAuthenticatedError("Invalid token");
  }

  if (decoded.iss !== "chirpy") {
    throw new UserNotAuthenticatedError("Invalid issuer");
  }

  if (!decoded.sub) {
    throw new UserNotAuthenticatedError("No user ID in token");
  }

  return decoded.sub;
}

export function getBearerToken(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("No authorization header");
  }
  return extractedHeader(authHeader);
}

export function extractedHeader(header: string) {
  if (header.split(" ")[0] !== "Bearer") {
    throw new UserNotAuthenticatedError("Invalid authorization header");
  }
  return header.split(" ")[1];
}

export function getAPIKey(req: Request): string {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    throw new UserNotAuthenticatedError("No authorization header");
  }
  if (authHeader.split(" ")[0] !== "ApiKey") {
    throw new UserNotAuthenticatedError("Invalid authorization header");
  }
  return authHeader.split(" ")[1];
}

export async function makeRefreshToken(userID: string): Promise<string> {
  if (!userID) {
    throw new UserNotAuthenticatedError("No user ID provided");
  }
  const buf = crypto.randomBytes(32);
  const token = buf.toString("hex");

  const result = await createRefreshToken(userID, token);

  return token;
}
