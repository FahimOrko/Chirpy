import "dotenv/config";
import type { MigrationConfig } from "drizzle-orm/migrator";

type APIConfig = {
  fileserverHits: number;
  platform: string;
  jwtSecret: string;
  polkaSecret: string;
};

type DBConfig = {
  dbUrl: string;
  migrationConfig: MigrationConfig;
};

type Config = {
  api: APIConfig;
  db: DBConfig;
};

function envOrThrow(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`${key} is not set`);
  return value;
}

export const config: Config = {
  api: {
    fileserverHits: 0,
    platform: envOrThrow("PLATFORM"),
    jwtSecret: envOrThrow("JWT_SECRET"),
    polkaSecret: envOrThrow("POLKA_SECRET"),
  },
  db: {
    dbUrl: envOrThrow("DB_URL"),
    migrationConfig: {
      migrationsFolder: "./src/db/migrations",
    },
  },
};

export function serverHitCountAdder() {
  config.api.fileserverHits++;
  return config;
}

export function serverHitCountReset() {
  config.api.fileserverHits = 0;
}
