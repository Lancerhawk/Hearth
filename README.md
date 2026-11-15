# Hearth

Household budget app for families — shared workspaces, attributed spending, month calendar, recurring bills, printable statements, and Mailpit-backed invites.

## Stack

- Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- Auth.js (credentials) + Prisma + PostgreSQL
- Docker Compose: Postgres + Mailpit
- pnpm

## Local setup

```bash
# 1. Install
pnpm install

# 2. Env
cp .env.example .env
# Ensure DATABASE_URL, AUTH_SECRET, AUTH_URL, SMTP_* point at local Docker

# 3. Infra
docker compose up -d
# Postgres: localhost:5432
# Mailpit UI: http://localhost:8025

# 4. Schema
pnpm exec prisma migrate dev
pnpm db:seed   # optional demo household

# 5. App
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Demo seed accounts

| Email               | Password      | Role   |
| ------------------- | ------------- | ------ |
| `arin@hearth.local` | `password123` | Owner  |
| `sam@hearth.local`  | `password123` | Member |

Workspace: `/app/demo-home/dashboard`

## Smoke path

1. Register or use seed users
2. Create a workspace (or open Demo Home)
3. Invite a second email → check Mailpit at `:8025`
4. Accept invite as that user
5. Each member adds expenses → filter by member on Expenses / Month
6. Open Statement → Print / CSV (includes Added by)
7. Add a recurring bill → mark paid → check Alerts for due/overdue

## Scripts

| Script                      | Purpose        |
| --------------------------- | -------------- |
| `pnpm dev`                  | Dev server     |
| `pnpm build` / `pnpm start` | Production     |
| `pnpm typecheck`            | TypeScript     |
| `pnpm lint`                 | ESLint         |
| `pnpm db:migrate`           | Prisma migrate |
| `pnpm db:seed`              | Seed demo data |
| `pnpm db:studio`            | Prisma Studio  |

## Docs

- [`docs/FEATURES.md`](./docs/FEATURES.md) — product + architecture
- [`docs/COMMIT_PLAN.md`](./docs/COMMIT_PLAN.md) — branch/commit delivery map

## Notes

- Work is local-only until you ask to push a remote.
- Invites use SMTP → Mailpit in development (`SMTP_HOST` / `SMTP_PORT`).
- Money rows always store `createdById` for attribution on lists and statements.
