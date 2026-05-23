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

### 2. Start everything

```bash
docker compose up --build
```

On first run, `docker/init-db.sql` creates the required databases automatically.

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

Fill in at minimum `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `JWT_SECRET`. When running locally, keep the service URLs pointing to `localhost`:

```
EMPLOYEE_SERVICE_URL=http://localhost:3001
ATTENDANCE_SERVICE_URL=http://localhost:3002
```

> The per-service `.env.example` files in each app folder document which variables each service needs — useful as a reference for individual service deployments (e.g. AWS Parameter Store), but not required for local development.

### 4. Create databases

If you are not using the docker-compose Postgres (which auto-runs `docker/init-db.sql`), create the databases manually:

```sql
CREATE DATABASE employee_db;
CREATE DATABASE attendance_db;
CREATE DATABASE audit_db;
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

## Common Commands

```bash
# Serve a specific app in development mode
npx nx serve <app-name>

# Build for production
npx nx build <app-name>

# Run migrations
npx nx run employee-service:migration:run
npx nx run attendance-service:migration:run
npx nx run log-consumer:migration:run

# Generate a new migration
npx nx run employee-service:migration:generate --args="--name=<MigrationName>"
npx nx run attendance-service:migration:generate --args="--name=<MigrationName>"
npx nx run log-consumer:migration:generate --args="--name=<MigrationName>"

# Revert the last migration
npx nx run employee-service:migration:revert
npx nx run attendance-service:migration:revert
npx nx run log-consumer:migration:revert
```
