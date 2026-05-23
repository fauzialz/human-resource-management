# Human Resource Management

An Nx monorepo containing multiple NestJS backend services, two React frontends, and shared libraries.

## Architecture

| Name                 | Type                                         | Default Port |
| -------------------- | -------------------------------------------- | ------------ |
| `gateway`            | NestJS — API gateway, auth, request proxying | 3000         |
| `employee-service`   | NestJS — employee management, auth           | 3001         |
| `attendance-service` | NestJS — attendance records                  | 3002         |
| `log-consumer`       | NestJS — audit log consumer (no HTTP)        | —            |
| `employee-app`       | React/Vite — employee self-service portal    | 4000         |
| `admin-app`          | React/Vite — admin dashboard                 | 4001         |

All client traffic goes through the **gateway** on port 3000. The React apps communicate exclusively with the gateway.

---

## Option 1 — Full Stack via Docker Compose

The fastest way to run the entire stack locally.

**Prerequisites:** Docker and Docker Compose.

### 1. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in at minimum:

- `POSTGRES_PASSWORD` — any password
- `JWT_SECRET` — any long random string

> `POSTGRES_HOST`, `REDIS_HOST`, `EMPLOYEE_SERVICE_URL`, and `ATTENDANCE_SERVICE_URL`
> are automatically overridden to Docker service names by `docker-compose.yml` —
> leave them as `localhost` values in `.env`.

### 2. Start everything

```bash
docker compose up --build
```

On first run:
- `docker/init-db.sh` creates the required databases automatically.
- Each service runs its TypeORM migrations on startup — no manual step needed.

On subsequent runs, `--build` can be omitted if no code has changed:

```bash
docker compose up
```

| URL                       | Description  |
| ------------------------- | ------------ |
| http://localhost:4000     | Employee App |
| http://localhost:4001     | Admin App    |
| http://localhost:3000/api | Gateway API  |

> Changing `VITE_BASE_API_URL` requires a rebuild (`docker compose up --build`) because Vite bakes it into the JS bundle at build time.

---

## Option 2 — Local Development

Use this when actively developing — services watch for file changes and restart automatically.

**Prerequisites:** Node.js 20, PostgreSQL 16, Redis 7.

### 1. Install dependencies

```bash
npm install
```

### 2. Start infrastructure

The easiest way is to run only the infrastructure containers from docker-compose:

```bash
docker compose up postgres redis
```

Or use your own local Postgres and Redis instances.

### 3. Configure environment variables

All services and both React apps read from the single root `.env`. Copy the example and fill it in:

```bash
cp .env.example .env
```

Fill in at minimum `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET`. For local development keep the host values as `localhost`:

```
POSTGRES_HOST=localhost
REDIS_HOST=localhost
EMPLOYEE_SERVICE_URL=http://localhost:3001
ATTENDANCE_SERVICE_URL=http://localhost:3002
```

> When running via `docker compose`, `POSTGRES_HOST` and `REDIS_HOST` are automatically overridden to the Docker service names — you only need the `localhost` values here for local dev.

> The per-service `.env.example` files in each app folder document which variables each service needs — useful as a reference for individual service deployments (e.g. AWS Parameter Store), but not required for local development.

### 4. Create databases

If you are not using the docker-compose Postgres (which auto-runs `docker/init-db.sh`), create the databases manually using the same names set in your `.env`:

```sql
CREATE DATABASE employee_db;   -- POSTGRES_EMPLOYEE_DB
CREATE DATABASE attendance_db; -- POSTGRES_ATTENDANCE_DB
CREATE DATABASE audit_db;      -- POSTGRES_AUDIT_DB
```

### 5. Run migrations

```bash
npx nx run employee-service:migration:run
npx nx run attendance-service:migration:run
npx nx run log-consumer:migration:run
```

> **Default admin account** — seeded automatically by the employee-service migration.
> Log in to the Admin App with:
>
> - Email: `admin@company.com`
> - Password: `Admin1234!`
>
> Change this password immediately after first login.

### 6. Start backend services

Run each in a separate terminal:

```bash
npx nx serve gateway
npx nx serve employee-service
npx nx serve attendance-service
npx nx serve log-consumer
```

### 7. Start frontend apps

```bash
npx nx serve employee-app   # http://localhost:4000
npx nx serve admin-app      # http://localhost:4001
```

---

## Database Migrations

### Creating a new migration

Run the generate command for the relevant service. TypeORM compares the current
entity definitions against the database and writes a timestamped migration file
(e.g. `1716900000000-AddPhoneColumn.ts`) into `apps/<service>/src/migrations/`:

```bash
npx nx run employee-service:migration:generate --args="--name=<MigrationName>"
npx nx run attendance-service:migration:generate --args="--name=<MigrationName>"
npx nx run log-consumer:migration:generate --args="--name=<MigrationName>"
```

After generating, add the new class to `apps/<service>/src/migrations/index.ts`
(keep them in chronological order — oldest first):

```ts
import { InitialSchema1700000000000 } from './1700000000000-InitialSchema';
import { AddPhoneColumn1716900000000 } from './1716900000000-AddPhoneColumn';

export const migrations = [InitialSchema1700000000000, AddPhoneColumn1716900000000];
```

> The class name is printed at the top of the generated file.
> `app.module.ts` imports the whole array automatically — no changes needed there.

### Running migrations manually (local development)

```bash
npx nx run employee-service:migration:run
npx nx run attendance-service:migration:run
npx nx run log-consumer:migration:run
```

> **Docker:** migrations run automatically on container startup — no manual step
> needed. Re-running `docker compose up` will not re-apply already-applied
> migrations because TypeORM tracks them in the `migrations` table.

### Reverting the last migration

```bash
npx nx run employee-service:migration:revert
npx nx run attendance-service:migration:revert
npx nx run log-consumer:migration:revert
```

---

## Common Commands

```bash
# Serve a specific app in development mode
npx nx serve <app-name>

# Build for production
npx nx build <app-name>
```
