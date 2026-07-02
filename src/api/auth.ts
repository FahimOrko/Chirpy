import * as argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { UserNotAuthenticatedError } from "../errors/error.js";

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

export function makeJWT(
  userID: string,
  expiresIn: number,
  secret: string,
): string {
  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + expiresIn;
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
