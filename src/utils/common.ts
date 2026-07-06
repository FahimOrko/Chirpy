import { Request } from "express";

export function getAuthorIdFromQuery(req: Request): string {
  let authorId = "";
  let authorIdQuery = req.query.authorId;
  if (typeof authorIdQuery === "string") {
    authorId = authorIdQuery;
  }
  return authorId;
}

export function getQueryOrder(req: Request): "asc" | "desc" {
  let order: "asc" | "desc" = "asc";
  let orderQuery = req.query.sort;
  if (typeof orderQuery === "string") {
    if (orderQuery.toLowerCase() === "desc") {
      order = "desc";
    }
  }
  return order;
}
