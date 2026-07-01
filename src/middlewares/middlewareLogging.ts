import { NextFunction, Request, Response } from "express";

type Middleware = (req: Request, res: Response, next: NextFunction) => void;

export function middlewareLogging(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  res.on("finish", () => {
    if (res.statusCode > 299) {
      console.log(
        `[NON-OK] ${req.method} ${req.url} - Status: ${res.statusCode}`,
      );
    }
  });

  next();
}
