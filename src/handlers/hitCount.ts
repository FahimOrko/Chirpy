import { NextFunction, Request, Response } from "express";
import { config, serverHitCountReset } from "../config.js";
import { handlerDeleteAllUsers } from "./user.js";

export function handlerGetServerHitCount(req: Request, res: Response) {
  const serverHitCount = config.api.fileserverHits;
  res.set("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`
    <html>
        <body>
            <h1>Welcome, Chirpy Admin</h1>
            <p>Chirpy has been visited ${serverHitCount} times!</p>
        </body>
    </html>`);
}

export async function handlerResetServerHitCount(req: Request, res: Response) {
  serverHitCountReset();
  await handlerDeleteAllUsers(req, res);
  res.status(200).send("Server reseted");
}
