import { Request, Response, NextFunction } from "express";
import { config, serverHitCountAdder } from "../config.js";

export function middlewareMetricsInc(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  serverHitCountAdder();
  const serverHitCount = config.api.fileserverHits;
  console.log(`Hits: ${serverHitCount}`);
  next();
}
