# Chirpy

Chirpy is a lightweight TypeScript Express server that implements a small "chirp" (micro-post) service with user authentication (JWT + refresh tokens), Postgres-backed persistence via Drizzle ORM, basic metrics and a small static UI served from the server. It's intended for developers who want a simple, minimal example of auth, CRUD, and webhook handling with a Postgres database.

## Stack

- Language: TypeScript
- Runtime / framework: Node.js + Express (ES modules)
- Database: PostgreSQL (postgres driver) + Drizzle ORM / drizzle-kit (migrations)
- Notable libraries:
  - drizzle-orm, drizzle-kit (DB + migrations)
  - postgres (Postgres client)
  - express (HTTP server)
  - jsonwebtoken (JWT)
  - argon2 (password hashing)
  - dotenv (env management)
  - vitest (tests)

## Project layout (top-level)

```
package.json
tsconfig.json
drizzle.config.ts
env.example.txt
src/
  api/            API helpers (JSON responses, auth helpers)
  app/            Static app files served from /app
  db/             database layer, migrations and query implementations
  errors/         custom error types
  handlers/       Express route handlers (users, chirps, tokens, health, webhooks)
  middlewares/    logging, metrics, and error middleware
  types/          TypeScript types (users, chirps, etc)
  utils/          small helpers (query parsing, validation)
  index.ts        application entrypoint (server + route wiring + migrations)
```

How it fits together:

- index.ts boots the app, runs DB migrations (drizzle-kit + drizzle-orm), installs global middleware, and registers route handlers.
- Handlers (src/handlers/_.ts) implement API endpoints and call into src/db/queries/_ for persistence.
- Auth flow: user registration hashes passwords (argon2), login issues a JWT and a refresh token (stored in DB). JWTs are validated on protected endpoints. Refresh tokens are exchanged for new JWTs and can be revoked.
- The server serves a small static UI from ./src/app at the /app route and exposes admin endpoints for basic metrics.

## Environment variables

Create a file (e.g. `.env`) and set the values shown in env.example.txt. Minimal required variables:

- PLATFORM - environment name, e.g. "dev"
- DB_URL - Postgres connection string (e.g. postgresql://user:pass@host:5432/dbname?sslmode=disable)
- JWT_SECRET - secret used to sign JWTs
- POLKA_SECRET - secret used to validate incoming webhooks/api-key

Example (.env):

```
PLATFORM=dev
DB_URL="postgres://user:pass@localhost:5432/chirpy?sslmode=disable"
JWT_SECRET="a-long-secret"
POLKA_SECRET="a-secret-for-webhooks"
```

## Quick start - Run locally

1. Clone and install dependencies

```bash
git clone https://github.com/FahimOrko/Chirpy.git
cd Chirpy
npm install
```

2. Configure environment

- Copy `env.example.txt` to `.env` (or export environment variables) and set `DB_URL`, `JWT_SECRET`, `POLKA_SECRET`, and `PLATFORM`.

3. Ensure PostgreSQL is running and the connection string in DB_URL is reachable.

4. Generate/migrate DB schema

```bash
# generate migrations (if you've added schema changes)
npm run generate

# run migrations (drizzle-kit migrate)
npm run migrate
```

Note: migrations folder is configured at `./src/db/migrations` (see `src/config.ts`).

5. Build and run

```bash
# build TypeScript to dist/
npm run build

# start production server (runs dist/index.js)
npm start
```

6. Develop (auto-rebuild & restart)

```bash
npm run dev
# runs nodemon watching src/, compiles and restarts the server on changes
```

Server listens on port 8080 by default; visit http://localhost:8080

## Running tests

```bash
npm run test
```

(Uses Vitest; see `package.json`)

## API - endpoints & examples

Note: Protected endpoints expect a JWT in the Authorization header as `Authorization: Bearer <token>`.

- Create user (register)
  POST /api/users
  Request JSON:
  {
  "email": "you@example.com",
  "password": "supersecret"
  }
  Example:

  ```bash
  curl -X POST http://localhost:8080/api/users \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com","password":"supersecret"}'
  ```

- Login
  POST /api/login
  Response includes a `token` (JWT) and `refreshToken`.

  ```bash
  curl -X POST http://localhost:8080/api/login \
    -H "Content-Type: application/json" \
    -d '{"email":"you@example.com","password":"supersecret"}'
  ```

- Create chirp (authenticated)
  POST /api/chirps
  Body: { "body": "Hello from Chirpy!" }

  ```bash
  curl -X POST http://localhost:8080/api/chirps \
    -H "Authorization: Bearer <JWT>" \
    -H "Content-Type: application/json" \
    -d '{"body":"Hello from Chirpy!"}'
  ```

- Get all chirps (supports optional query params for author and ordering)
  GET /api/chirps
  Example:

  ```bash
  curl http://localhost:8080/api/chirps
  ```

  You can filter or order chirps (see src/utils/common.ts for exact query parameter names).

- Get specific chirp
  GET /api/chirps/:chirpId

- Delete chirp (authenticated, owner only)
  DELETE /api/chirps/:chirpId
  Requires the JWT of the chirp owner.

- Refresh token -> new JWT
  POST /api/refresh
  Send refresh token as Bearer token in Authorization header:

  ```bash
  curl -X POST http://localhost:8080/api/refresh \
    -H "Authorization: Bearer <refresh_token>"
  ```

- Revoke refresh token
  POST /api/revoke

  ```bash
  curl -X POST http://localhost:8080/api/revoke \
    -H "Authorization: Bearer <refresh_token>"
  ```

- Webhook endpoint (used for e.g. external upgrade events)
  POST /api/polka/webhooks
  The handler requires an API key matching POLKA_SECRET. Provide the API key in the request headers - many setups use `x-api-key: <POLKA_SECRET>` (the code checks a getAPIKey helper; confirm the expected header name in `src/api/auth.ts`).
  Example payload:

  ```json
  {
    "event": "user.upgraded",
    "data": { "userId": "user-id-guid" }
  }
  ```

- Health and admin
  - GET /api/healthz - readiness/health check
  - GET /admin/metrics - returns server hit count
  - POST /admin/reset - reset server hit count (only allowed in dev environment)

- Static UI
  - The server serves static files from `./src/app` at `/app`. Visit http://localhost:8080/app if files are present.

## Security & behavior notes

- Passwords are hashed (argon2) before being stored.
- JWTs are used for authorization; refresh tokens are stored in the DB and may have expiry or be revoked.
- Chirp text is capped at 140 characters; a small profanity filter redacts certain not-allowed words (see `src/handlers/chirp.ts`).
- Deleting all users is restricted to the development environment (the code checks PLATFORM).

## Common troubleshooting

- Error "XYZ is not set": check your environment variables (JWT_SECRET, DB_URL, POLKA_SECRET, PLATFORM).
- Migration errors: confirm `DB_URL` is correct and reachable; check `drizzle.config.ts` and the migrations folder (`./src/db/migrations`).
- Port already in use: server runs on 8080 - change or free the port.
- If a webhook fails with Unauthorized: ensure the API key header matches POLKA_SECRET.

## Extending the project

- Add more migrations under `src/db/migrations` and run `npm run migrate`.
- Inspect and extend DB queries under `src/db/queries`.
- Add or change middleware in `src/middlewares`.
- For front-end changes, update files in `src/app`.

## Contributing

- Open issues and PRs against the repository. Keep unit tests passing (`npm run test`) and add tests for new behavior.

## License

- ISC (see package.json). Adapt as necessary.
