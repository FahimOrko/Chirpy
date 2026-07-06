import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import express from "express";
import postgres from "postgres";
import { config } from "./config.js";
import {
  handlerCreateNewChrip,
  handlerDeleteChirp,
  handlerGetAllChirps,
  handlerGetChirp,
} from "./handlers/chirp.js";
import { handlerReadiness } from "./handlers/health.js";
import {
  handlerGetServerHitCount,
  handlerResetServerHitCount,
} from "./handlers/hitCount.js";
import {
  handlerCreateNewUser,
  handlerLoginUser,
  handlerUpdateUser,
  handlerChipyWeebhook,
} from "./handlers/user.js";
import { errorHandler } from "./middlewares/middlewareErrorHandler.js";
import { middlewareLogging } from "./middlewares/middlewareLogging.js";
import { middlewareMetricsInc } from "./middlewares/middlewareMetricsLogger.js";
import {
  handlerGetNewJwtFromRefreshToken,
  handlerRevokeRefreshToken,
} from "./handlers/token.js";

const ENVIRONMENT = "dev";
const PORT = 8080;
const app = express();

// Database connection and migration
const migrationClient = postgres(config.db.dbUrl, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

// middlewares
app.use(express.json());
app.use(middlewareLogging);

// Routes
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use("/admin/metrics", handlerGetServerHitCount);
app.post("/admin/reset", handlerResetServerHitCount);
// User routes
app.post("/api/users", handlerCreateNewUser);
app.post("/api/login", handlerLoginUser);
app.post("/api/polka/webhooks", handlerChipyWeebhook);
app.put("/api/users", handlerUpdateUser);
// Chirp routes
app.get("/api/chirps", handlerGetAllChirps);
app.get("/api/chirps/:chirpId", handlerGetChirp);
app.post("/api/chirps", handlerCreateNewChrip);
app.delete("/api/chirps/:chirpId", handlerDeleteChirp);
// Refresh Token Routes
app.post("/api/refresh", handlerGetNewJwtFromRefreshToken);
app.post("/api/revoke", handlerRevokeRefreshToken);

// Health check
app.get("/api/healthz", handlerReadiness);

// Error Middleware
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on: http://localhost:${PORT}`);
});
