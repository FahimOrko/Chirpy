import type { Request, Response } from "express";
import { getBearerToken, makeJWT } from "../api/auth.js";
import {
  getRefreshToken,
  revokeRefreshToken,
} from "../db/queries/refreshTokens.js";
import { UserNotAuthenticatedError } from "../errors/error.js";
import { config } from "../config.js";
import { respondWithJSON } from "../api/json.js";

export async function handlerGetNewJwtFromRefreshToken(
  req: Request,
  res: Response,
) {
  const refreshToken = getBearerToken(req);
  const tokenFromDb = await getRefreshToken(refreshToken);

  if (
    !tokenFromDb ||
    tokenFromDb.revokedAt !== null ||
    (tokenFromDb.expiresAt !== null && tokenFromDb.expiresAt < new Date())
  ) {
    throw new UserNotAuthenticatedError("Invalid refresh token");
  }

  const jwtSecret = config.api.jwtSecret;
  const jwt = makeJWT(tokenFromDb.userId, jwtSecret);

  respondWithJSON(res, 200, { token: jwt });
}

export async function handlerRevokeRefreshToken(req: Request, res: Response) {
  const refreshToken = getBearerToken(req);
  const tokenFromDb = await getRefreshToken(refreshToken);

  if (
    !tokenFromDb ||
    tokenFromDb.revokedAt !== null ||
    (tokenFromDb.expiresAt !== null && tokenFromDb.expiresAt < new Date())
  ) {
    throw new UserNotAuthenticatedError("Invalid refresh token");
  }

  await revokeRefreshToken(refreshToken);
  respondWithJSON(res, 204, { message: "Refresh token revoked" });
}
