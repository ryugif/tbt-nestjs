# TBT NestJS

Backend service built with NestJS, TypeORM, and PostgreSQL.

## Prerequisites

- Node.js 22+ and npm
- Docker (for local PostgreSQL)
- Git

## Quick Start

1. Clone and enter the project

```bash
git clone <repo-url> tbt-nestjs
cd tbt-nestjs
```

2. Copy environment template

```bash
cp .env.example .env
```

3. Install dependencies (npm)

```bash
npm install
```

4. Start PostgreSQL in Docker

```bash
docker run \
  --name local-postgres-nestjs \
  -e POSTGRES_PASSWORD=mysecretpassword \
  -e POSTGRES_DB=tbt_db_nestjs \
  -p 5431:5432 \
  -d postgres
```

5. Run migrations

```bash
npm run migration:run
```

6. Run the app

```bash
npm run start:dev
```

## Environment

Fill in `.env` with your connection details (see `.env.example`).

## Scripts

- `npm run start:dev` – start the API in watch mode
- `npm run start` – start without watch
- `npm run build` – compile to `dist` folder

## Running Application

The application will be available at `http://localhost:3000`.

### Public Routes

- `POST /api/register` – register a new user
- `POST /api/login` – login and receive a JWT token

### Protected Routes

Authentication is required for protected routes. Include the JWT token in the `Authorization` header as `Bearer <token>`.

- `GET /api/projects` – list all user projects
- `POST /api/projects` – create a new project
- `GET /api/projects/:id` – get project details
- `PATCH /api/projects/:id` – update a project
- `DELETE /api/projects/:id` – delete a project

- `GET /api/tasks` – list all user tasks
- `POST /api/tasks` – create a new task
- `GET /api/tasks/:id` – get task details
- `PATCH /api/tasks/:id` – update a task
- `DELETE /api/tasks/:id` – delete a task

## Run in Postman

You can import the Postman collection to test the API endpoints easily. Click the button below to open the collection in Postman:

[<img src="https://run.pstmn.io/button.svg" alt="Run In Postman" style="width: 128px; height: 32px;">](https://app.getpostman.com/run-collection/2350753-8ca217a8-0f3a-4943-9a37-a420cce94f19?action=collection%2Ffork&source=rip_markdown&collection-url=entityId%3D2350753-8ca217a8-0f3a-4943-9a37-a420cce94f19%26entityType%3Dcollection%26workspaceId%3Df685df81-ab57-4b72-bcd5-988517e47955#?env%5BTBT%20Test%20-%20NestJS%5D=W3sia2V5IjoiYmFzZV91cmwiLCJ2YWx1ZSI6IiIsImVuYWJsZWQiOnRydWUsInR5cGUiOiJkZWZhdWx0Iiwic2Vzc2lvblZhbHVlIjoiaHR0cDovL2xvY2FsaG9zdDozMDAiLCJjb21wbGV0ZVNlc3Npb25WYWx1ZSI6Imh0dHA6Ly9sb2NhbGhvc3Q6MzAwIiwic2Vzc2lvbkluZGV4IjowfSx7ImtleSI6InRva2VuIiwidmFsdWUiOiIiLCJlbmFibGVkIjp0cnVlLCJ0eXBlIjoiZGVmYXVsdCIsInNlc3Npb25WYWx1ZSI6IiIsImNvbXBsZXRlU2Vzc2lvblZhbHVlIjoiIiwic2Vzc2lvbkluZGV4IjoxfV0=)

## Database Migrations

- `npm run migration:generate` – generate a new migration
- `npm run migration:run` – run pending migrations
- `npm run migration:revert` – revert the last migration

## Troubleshooting

### Migration File Preventing Application Startup

If you encounter issues with migrations files when starting the application, ensure that your migration files import TypeORM types as type-only imports.

Change this part in your migration files

```
import { MigrationInterface, QueryRunner } from 'typeorm';
```

to

```
import type { MigrationInterface, QueryRunner } from 'typeorm';
```
