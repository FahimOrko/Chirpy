import { Request, Response } from "express";
import { BadRequestError, NotFoundError } from "../errors/error.js";
import { createChrip, getAllChirps, getChirp } from "../db/queries/chrips.js";
import { respondWithJSON } from "../api/json.js";

type parameters = {
  userId: string;
  body: string;
};

export async function handlerCreateNewChrip(req: Request, res: Response) {
  const { userId, body }: parameters = req.body;
  const notAllowedWords = ["kerfuffle", "sharbert", "fornax"];

  if (!userId || !body) {
    throw new BadRequestError("userId and body are required");
  }

  let result = "";

  if (body.length > 140) {
    let error = "Chirp is too long. Max length is 140";
    throw new BadRequestError(error);
  }

  body.split(" ").forEach((word: string) => {
    if (!notAllowedWords.includes(word.toLowerCase())) {
      result += word + " ";
    } else {
      result += "****" + " ";
    }
  });

  const newChrip = await createChrip({ userId, body: result.trim() });

  if (!newChrip) {
    throw new BadRequestError("Failed to create new chirp");
  }

  respondWithJSON(res, 201, newChrip);
}

export async function handlerGetAllChirps(req: Request, res: Response) {
  const chirps = await getAllChirps();

  if (!chirps) {
    throw new BadRequestError("Failed to retrieve chirps");
  }

  respondWithJSON(res, 200, chirps);
}

export async function handlerGetChirp(req: Request, res: Response) {
  const id = req.params.chirpId;

  if (!id || typeof id !== "string") {
    throw new BadRequestError(
      "Chirp ID is required and has to be a valid string",
    );
  }

  const chirp = await getChirp(id);

  if (!chirp) {
    throw new NotFoundError("Chirp not found.");
  }

  respondWithJSON(res, 200, chirp);
}
