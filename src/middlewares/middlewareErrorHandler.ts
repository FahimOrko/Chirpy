import { Request, Response, NextFunction } from "express";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/error.js";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof BadRequestError) {
    res.status(400).json({ error: err.message });
  }

  if (err instanceof UnauthorizedError) {
    res.status(401).json({ error: err.message });
  }

  if (err instanceof ForbiddenError) {
    res.status(403).json({ error: err.message });
  }

  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
  }

  console.error(err.message);

  res.status(500).json({
    error: "Something went wrong on our end",
  });
}
