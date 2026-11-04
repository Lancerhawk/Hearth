# Hearth — Branch, Commit & Merge Plan

This document is the execution map.  
Product truth lives in [`FEATURES.md`](./FEATURES.md).

**Rules (locked)**

- Work **locally only** — no `git push` until you explicitly ask.
- Feature work happens on **dedicated branches**; merge into `main` with `--no-ff` so history stays readable.
- Target **~45 atomic commits** (range 40–50). Do not squash feature branches into one mega-commit.
- Commit messages: short, imperative, explain *why* when useful. **Never** add `Co-authored-by:`, Cursor, or AI trailers.
- Author identity stays your machine git user (`ArinJain` / your email). Do not change git config for attribution.
- Merge order below is strict — later features depend on earlier foundations.

---

## 1. Branch naming

```
main
├── chore/bootstrap-stack
├── chore/docker-postgres
├── chore/prisma-foundation
├── feature/auth
├── feature/workspaces
├── feature/invites-members
├── feature/app-shell
├── feature/categories
├── feature/monthly-budget
├── feature/income
├── feature/expenses
├── feature/savings
├── feature/charges
├── feature/recurring-bills
├── feature/dashboard
├── feature/notifications
├── feature/settings-polish
└── chore/seed-readme-qa
```

Each branch starts from latest `main` after the previous merge.

---

## 2. Standard workflow (every feature)

```bash
git checkout main
git checkout -b feature/<name>

# ... implement, commit often ...

git checkout main
git merge --no-ff feature/<name> -m "Merge branch 'feature/<name>'"
```

Optional cleanup after merge (local only):

```bash
git branch -d feature/<name>
```

---

## 3. Commit ledger (~45 commits)

Commit numbers are the intended sequence across the whole project.  
Branch column = where that commit is created before merge.

### Phase 0 — Planning docs (on `main`)

| # | Branch | Commit message |
|---|--------|----------------|
| 01 | `main` | `docs: add Hearth product and architecture spec` |
| 02 | `main` | `docs: add branch and commit delivery plan` |

---

### Phase 1 — Bootstrap (`chore/bootstrap-stack`)

| # | Commit message | What lands |
|---|----------------|------------|
| 03 | `chore: scaffold Next.js TypeScript app with Tailwind` | `create-next-app`, base configs, `src/` layout |
| 04 | `chore: configure path aliases and project scripts` | `@/` alias, lint/format scripts, `.gitignore` env |
| 05 | `chore: initialize shadcn and core UI primitives` | button, input, label, card, dialog, dropdown, sheet, badge, table, tabs, select, separator, avatar, sonner, form |
| 06 | `chore: add design tokens and base typography` | CSS variables, fonts, global atmosphere styles |

**Merge → `main`**

---

### Phase 2 — Database (`chore/docker-postgres` → `chore/prisma-foundation`)

| # | Branch | Commit message | What lands |
|---|--------|----------------|------------|
| 07 | `chore/docker-postgres` | `chore: add Docker Compose Postgres for Hearth` | `docker-compose.yml`, container `hearth-postgres` |
| 08 | `chore/docker-postgres` | `chore: add env examples for local database` | `.env.example`, documented `DATABASE_URL` |
| 09 | `chore/prisma-foundation` | `chore: initialize Prisma with PostgreSQL` | Prisma client singleton, schema stub |
| 10 | `chore/prisma-foundation` | `chore: add core domain Prisma models` | User/workspace/budget/entry/bill/notification models |
| 11 | `chore/prisma-foundation` | `chore: create initial migration and generate client` | first migration applied locally |

**Merge each branch → `main` in order**

---

### Phase 3 — Auth (`feature/auth`)

| # | Commit message | What lands |
|---|----------------|------------|
| 12 | `feat(auth): wire Auth.js with Prisma adapter` | auth config, session strategy |
| 13 | `feat(auth): add register and login server actions` | bcrypt hash, Zod validation |
| 14 | `feat(auth): build login and register pages` | UI forms with shadcn |
| 15 | `feat(auth): protect app routes with middleware` | `/app/**` requires session |

**Merge → `main`**

---

### Phase 4 — Workspaces (`feature/workspaces`)

| # | Commit message | What lands |
|---|----------------|------------|
| 16 | `feat(workspaces): add create workspace actions and slug helpers` | create + membership OWNER |
| 17 | `feat(workspaces): seed default categories on workspace create` | groceries etc. |
| 18 | `feat(workspaces): add workspace switcher and new workspace page` | UI |
| 19 | `feat(workspaces): enforce membership access helpers` | `requireMembership`, role checks |

**Merge → `main`**

---

### Phase 5 — Invites & members (`feature/invites-members`)

| # | Commit message | What lands |
|---|----------------|------------|
| 20 | `feat(members): invite member by email with secure token` | invite create + revoke |
| 21 | `feat(members): accept invite flow and join workspace` | `/invite/[token]` |
| 22 | `feat(members): members list with role change and remove` | members page |
| 23 | `feat(members): notify owners when invite is accepted` | notification rows |

**Merge → `main`**

---

### Phase 6 — App shell (`feature/app-shell`)

| # | Commit message | What lands |
|---|----------------|------------|
| 24 | `feat(ui): add authenticated app shell layout` | sidebar, header, mobile sheet |
| 25 | `feat(ui): add workspace-scoped navigation routes` | nav links under `[workspaceSlug]` |
| 26 | `feat(ui): add empty states and shared page header` | reusable layout pieces |

**Merge → `main`**

---

### Phase 7 — Categories (`feature/categories`)

| # | Commit message | What lands |
|---|----------------|------------|
| 27 | `feat(categories): CRUD categories for a workspace` | actions + page |
| 28 | `feat(categories): add category picker for entry forms` | shared select component |

**Merge → `main`**

---

### Phase 8 — Monthly budget engine (`feature/monthly-budget`)

| # | Commit message | What lands |
|---|----------------|------------|
| 29 | `feat(budget): ensure monthly budget period helper` | create month if missing |
| 30 | `feat(budget): centralize remaining-budget calculations` | `lib/budget/calculations.ts` |
| 31 | `feat(budget): add month picker and summary cards` | shared UI |

**Merge → `main`**

---

### Phase 9 — Money entry domains

#### `feature/income`

| # | Commit message |
|---|----------------|
| 32 | `feat(income): add income entry CRUD actions` |
| 33 | `feat(income): build income list and form UI` |

#### `feature/expenses`

| # | Commit message |
|---|----------------|
| 34 | `feat(expenses): add expense entry CRUD with categories` |
| 35 | `feat(expenses): build expenses page with category totals` |

#### `feature/savings`

| # | Commit message |
|---|----------------|
| 36 | `feat(savings): add savings entry CRUD and page` |

#### `feature/charges`

| # | Commit message |
|---|----------------|
| 37 | `feat(charges): add miscellaneous charge CRUD and page` |

**Merge each → `main` after its commits**

---

### Phase 10 — Recurring bills (`feature/recurring-bills`)

| # | Commit message | What lands |
|---|----------------|------------|
| 38 | `feat(bills): manage recurring bill templates` | CRUD templates |
| 39 | `feat(bills): generate monthly bill instances` | on month ensure |
| 40 | `feat(bills): mark bills paid skipped with status UI` | badges, actions |
| 41 | `feat(bills): include paid bills in spent calculations` | wire into calc helper |

**Merge → `main`**

---

### Phase 11 — Dashboard (`feature/dashboard`)

| # | Commit message | What lands |
|---|----------------|------------|
| 42 | `feat(dashboard): remaining budget hero and progress` | core KPIs |
| 43 | `feat(dashboard): category breakdown chart and bills widget` | Recharts + due list |
| 44 | `feat(dashboard): recent activity feed` | last entries across types |

**Merge → `main`**

---

### Phase 12 — Notifications (`feature/notifications`)

| # | Commit message | What lands |
|---|----------------|------------|
| 45 | `feat(notifications): create notification helpers and types` | create/mark-read |
| 46 | `feat(notifications): sync due-soon and overdue bill alerts` | lazy sync on load |
| 47 | `feat(notifications): add notification center UI` | bell, panel, page |
| 48 | `feat(notifications): emit budget-low alerts after mutations` | 15% rule |

**Merge → `main`**

---

### Phase 13 — Polish (`feature/settings-polish` → `chore/seed-readme-qa`)

| # | Branch | Commit message | What lands |
|---|--------|----------------|------------|
| 49 | `feature/settings-polish` | `feat(settings): workspace and profile settings pages` | name, currency, profile |
| 50 | `feature/settings-polish` | `feat(ui): refine empty states loading and toasts` | polish pass |
| 51 | `chore/seed-readme-qa` | `chore: add Prisma seed for demo household` | optional demo data |
| 52 | `chore/seed-readme-qa` | `docs: add README with local setup instructions` | runbook |

> Note: commits 01–52 can be trimmed to land in the **40–50** band by combining small polish commits if needed. Prefer keeping domain commits atomic; squash only pure typo/fix commits if over 50.

**Recommended keep list if trimming:** drop or fold #04 into #03, fold #26 into #24, fold #50 into #49 → lands ~**49** meaningful commits including docs, or ~**47** without double-counting merges.

Merge commits (`Merge branch 'feature/…'`) are **additional** history nodes and do **not** count toward the 40–50 feature commits unless you want them included. Plan assumes **~45 subject commits** + ~15 `--no-ff` merge commits on `main`.

---

## 4. Merge sequence checklist

Use this as the execution checklist while building:

- [ ] `main`: docs 01–02
- [ ] merge `chore/bootstrap-stack`
- [ ] merge `chore/docker-postgres`
- [ ] merge `chore/prisma-foundation`
- [ ] merge `feature/auth`
- [ ] merge `feature/workspaces`
- [ ] merge `feature/invites-members`
- [ ] merge `feature/app-shell`
- [ ] merge `feature/categories`
- [ ] merge `feature/monthly-budget`
- [ ] merge `feature/income`
- [ ] merge `feature/expenses`
- [ ] merge `feature/savings`
- [ ] merge `feature/charges`
- [ ] merge `feature/recurring-bills`
- [ ] merge `feature/dashboard`
- [ ] merge `feature/notifications`
- [ ] merge `feature/settings-polish`
- [ ] merge `chore/seed-readme-qa`
- [ ] Local smoke test (register → invite → month entries → bills → notifications)
- [ ] Push / create remote **only when you say so**

---

## 5. Bootstrap commands (download everything)

Run in repo root when Phase 1 starts (Docker already running on the machine):

```bash
# Node app
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack --use-pnpm

# UI
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label card dialog dropdown-menu sheet badge table tabs select separator avatar sonner form textarea checkbox popover calendar command scroll-area skeleton

# Data / auth / forms
pnpm add @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs zod react-hook-form @hookform/resolvers date-fns recharts
pnpm add -D prisma tsx @types/bcryptjs

# Docker DB
docker compose up -d

# Prisma
pnpm exec prisma init
# (paste schema from FEATURES.md, then)
pnpm exec prisma migrate dev --name init
pnpm exec prisma generate
```

---

## 6. Definition of done per feature branch

Before merging any `feature/*` branch:

1. Typecheck / lint clean for touched files
2. Happy-path manual check for that feature
3. No secrets committed (`.env` ignored; `.env.example` only)
4. Commit messages match this plan’s style (or better, still no AI trailers)
5. `main` remains runnable after merge (migrations included)

---

## 7. What we will not do during delivery

- No force-push, no history rewrite on `main`
- No remote until you request it
- No Cursor / Copilot co-author lines on commits or merges
- No production host yet — Docker Postgres locally only

---

*When you say “start building”, execution begins at Phase 1 using this ledger in order.*
