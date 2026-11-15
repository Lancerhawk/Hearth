# Hearth — Branch, Commit & Merge Plan

This document is the execution map.  
Product truth lives in [`FEATURES.md`](./FEATURES.md).

**Rules (locked)**

- Work **locally only** — no `git push` until you explicitly ask.
- Feature work happens on **dedicated branches**; merge into `main` with `--no-ff` so history stays readable.
- Target **~45 atomic commits** (range 40–50). Do not squash feature branches into one mega-commit.
- Commit messages: short, imperative, explain _why_ when useful. **Never** add `Co-authored-by:`, Cursor, or AI trailers.
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
├── feature/month-calendar
├── feature/recurring-bills
├── feature/dashboard
├── feature/statements-export
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

| #   | Branch | Commit message                                   |
| --- | ------ | ------------------------------------------------ |
| 01  | `main` | `docs: add Hearth product and architecture spec` |
| 02  | `main` | `docs: add branch and commit delivery plan`      |

---

### Phase 1 — Bootstrap (`chore/bootstrap-stack`)

| #   | Commit message                                         | What lands                                                                                                       |
| --- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| 03  | `chore: scaffold Next.js TypeScript app with Tailwind` | `create-next-app`, base configs, `src/` layout                                                                   |
| 04  | `chore: configure path aliases and project scripts`    | `@/` alias, lint/format scripts, `.gitignore` env                                                                |
| 05  | `chore: initialize shadcn and core UI primitives`      | button, input, label, card, dialog, dropdown, sheet, badge, table, tabs, select, separator, avatar, sonner, form |
| 06  | `chore: add design tokens and base typography`         | CSS variables, fonts, global atmosphere styles                                                                   |

**Merge → `main`**

---

### Phase 2 — Database (`chore/docker-postgres` → `chore/prisma-foundation`)

| #   | Branch                    | Commit message                                        | What lands                                           |
| --- | ------------------------- | ----------------------------------------------------- | ---------------------------------------------------- |
| 07  | `chore/docker-postgres`   | `chore: add Docker Compose Postgres and Mailpit`      | `hearth-postgres` + `hearth-mailpit`                 |
| 08  | `chore/docker-postgres`   | `chore: add env examples for database and SMTP`       | `DATABASE_URL` + Mailpit SMTP vars                   |
| 09  | `chore/prisma-foundation` | `chore: initialize Prisma with PostgreSQL`            | Prisma client singleton, schema stub                 |
| 10  | `chore/prisma-foundation` | `chore: add core domain Prisma models`                | User/workspace/budget/entry/bill/notification models |
| 11  | `chore/prisma-foundation` | `chore: create initial migration and generate client` | first migration applied locally                      |

**Merge each branch → `main` in order**

---

### Phase 3 — Auth (`feature/auth`)

| #   | Commit message                                      | What lands                    |
| --- | --------------------------------------------------- | ----------------------------- |
| 12  | `feat(auth): wire Auth.js with Prisma adapter`      | auth config, session strategy |
| 13  | `feat(auth): add register and login server actions` | bcrypt hash, Zod validation   |
| 14  | `feat(auth): build login and register pages`        | UI forms with shadcn          |
| 15  | `feat(auth): protect app routes with middleware`    | `/app/**` requires session    |

**Merge → `main`**

---

### Phase 4 — Workspaces (`feature/workspaces`)

| #   | Commit message                                                    | What lands                       |
| --- | ----------------------------------------------------------------- | -------------------------------- |
| 16  | `feat(workspaces): add create workspace actions and slug helpers` | create + membership OWNER        |
| 17  | `feat(workspaces): seed default categories on workspace create`   | groceries etc.                   |
| 18  | `feat(workspaces): add workspace switcher and new workspace page` | UI                               |
| 19  | `feat(workspaces): enforce membership access helpers`             | `requireMembership`, role checks |

**Merge → `main`**

---

### Phase 5 — Invites & members (`feature/invites-members`)

| #   | Commit message                                            | What lands                       |
| --- | --------------------------------------------------------- | -------------------------------- |
| 20  | `feat(mail): add SMTP mailer pointed at Mailpit`          | `lib/mail`, invite template      |
| 21  | `feat(members): invite member by email with secure token` | create + send email + revoke     |
| 22  | `feat(members): accept invite signup and join workspace`  | `/invite/[token]` register/login |
| 23  | `feat(members): members list with role change and remove` | members page                     |
| 24  | `feat(members): notify owners when invite is accepted`    | notification rows                |

**Merge → `main`**

---

### Phase 6 — App shell (`feature/app-shell`)

| #   | Commit message                                      | What lands                        |
| --- | --------------------------------------------------- | --------------------------------- |
| 25  | `feat(ui): add authenticated app shell layout`      | sidebar, header, mobile sheet     |
| 26  | `feat(ui): add workspace-scoped navigation routes`  | nav links under `[workspaceSlug]` |
| 27  | `feat(ui): add empty states and shared page header` | reusable layout pieces            |

**Merge → `main`**

---

### Phase 7 — Categories (`feature/categories`)

| #   | Commit message                                          | What lands              |
| --- | ------------------------------------------------------- | ----------------------- |
| 28  | `feat(categories): CRUD categories for a workspace`     | actions + page          |
| 29  | `feat(categories): add category picker for entry forms` | shared select component |

**Merge → `main`**

---

### Phase 8 — Monthly budget engine (`feature/monthly-budget`)

| #   | Commit message                                             | What lands                       |
| --- | ---------------------------------------------------------- | -------------------------------- |
| 30  | `feat(budget): ensure monthly budget period helper`        | create month if missing          |
| 31  | `feat(budget): centralize month day and category counters` | `calculations.ts` + `day-map.ts` |
| 32  | `feat(budget): add month picker and counter strip`         | shared UI                        |

**Merge → `main`**

---

### Phase 9 — Money entry domains (always store createdById)

#### `feature/income`

| #   | Commit message                                           |
| --- | -------------------------------------------------------- |
| 33  | `feat(income): add income CRUD with creator attribution` |
| 34  | `feat(income): build income list showing who added when` |

#### `feature/expenses`

| #   | Commit message                                              |
| --- | ----------------------------------------------------------- |
| 35  | `feat(expenses): add expense CRUD with creator attribution` |
| 36  | `feat(expenses): build expenses list with member filter`    |

#### `feature/savings`

| #   | Commit message                                             |
| --- | ---------------------------------------------------------- |
| 37  | `feat(savings): add savings CRUD with creator attribution` |

#### `feature/charges`

| #   | Commit message                                            |
| --- | --------------------------------------------------------- |
| 38  | `feat(charges): add charge CRUD with creator attribution` |

**Merge each → `main` after its commits**

---

### Phase 10 — Month calendar + list activity (`feature/month-calendar`)

| #   | Commit message                                             | What lands                  |
| --- | ---------------------------------------------------------- | --------------------------- |
| 39  | `feat(month): build calendar grid with day spend counters` | MonthCalendar, DayCell      |
| 40  | `feat(month): add day panel with who-added details`        | click day → list + add      |
| 41  | `feat(month): add list view with attribution columns`      | Calendar \| List + added by |
| 42  | `feat(month): wire filters including member and URL state` | year/month/day/view/member  |

**Merge → `main`**

---

### Phase 11 — Recurring bills (`feature/recurring-bills`)

| #   | Commit message                                          | What lands               |
| --- | ------------------------------------------------------- | ------------------------ |
| 43  | `feat(bills): manage recurring bill templates`          | CRUD templates           |
| 44  | `feat(bills): generate monthly bill instances`          | on month ensure          |
| 45  | `feat(bills): mark bills paid skipped with status UI`   | badges, calendar markers |
| 46  | `feat(bills): include paid bills in spent calculations` | wire into calc helper    |

**Merge → `main`**

---

### Phase 12 — Dashboard (`feature/dashboard`)

| #   | Commit message                                             | What lands                    |
| --- | ---------------------------------------------------------- | ----------------------------- |
| 47  | `feat(dashboard): remaining budget hero and progress`      | core KPIs                     |
| 48  | `feat(dashboard): category breakdown and today week strip` | Recharts + mini calendar link |
| 49  | `feat(dashboard): recent activity feed with actors`        | who added what recently       |

**Merge → `main`**

---

### Phase 13 — Statements export (`feature/statements-export`)

| #   | Commit message                                                  | What lands                   |
| --- | --------------------------------------------------------------- | ---------------------------- |
| 50  | `feat(statements): build filtered rows including attribution`   | who + when columns           |
| 51  | `feat(statements): design printable statement table document`   | preview canvas + print CSS   |
| 52  | `feat(statements): add preview page with print and PDF actions` | `/statements/preview`        |
| 53  | `feat(statements): add CSV download and export entry points`    | Export menu; CSV has addedBy |

**Merge → `main`**

---

### Phase 14 — Notifications (`feature/notifications`)

| #   | Commit message                                                | What lands        |
| --- | ------------------------------------------------------------- | ----------------- |
| 54  | `feat(notifications): create notification helpers and types`  | create/mark-read  |
| 55  | `feat(notifications): sync due-soon and overdue bill alerts`  | lazy sync on load |
| 56  | `feat(notifications): add notification center UI`             | bell, panel, page |
| 57  | `feat(notifications): emit budget-low alerts after mutations` | 15% rule          |

**Merge → `main`**

---

### Phase 15 — Polish (`feature/settings-polish` → `chore/seed-readme-qa`)

| #   | Branch                    | Commit message                                         | What lands                  |
| --- | ------------------------- | ------------------------------------------------------ | --------------------------- |
| 58  | `feature/settings-polish` | `feat(settings): workspace and profile settings pages` | name, currency, profile     |
| 59  | `chore/seed-readme-qa`    | `chore: add Prisma seed for multi-member household`    | two users + attributed buys |
| 60  | `chore/seed-readme-qa`    | `docs: add README with local setup instructions`       | Postgres + Mailpit runbook  |

> Subject commits land around **~50–60**. Prefer keeping invites+mail, calendar, and statements atomic. If trimming toward **40–50**, fold settings into seed/README — do **not** drop Mailpit invites, attribution, or statement preview/print.

Merge commits (`Merge branch 'feature/…'`) are **additional** history nodes.

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
- [ ] merge `feature/month-calendar`
- [ ] merge `feature/recurring-bills`
- [ ] merge `feature/dashboard`
- [ ] merge `feature/statements-export`
- [ ] merge `feature/notifications`
- [ ] merge `feature/settings-polish`
- [ ] merge `chore/seed-readme-qa`
- [ ] Local smoke test (register → Mailpit invite → second user signup/join → each adds expense → filter by member → statement shows who/when → print/CSV → bills → notifications)
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
pnpm add @prisma/client next-auth@beta @auth/prisma-adapter bcryptjs zod react-hook-form @hookform/resolvers date-fns recharts nodemailer
pnpm add -D prisma tsx @types/bcryptjs @types/nodemailer

# Docker DB + Mailpit
docker compose up -d
# Mailpit UI: http://localhost:8025

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

_When you say “start building”, execution begins at Phase 1 using this ledger in order._
