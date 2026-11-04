# Hearth — Product & Architecture Spec

**App name:** Hearth  
**Tagline:** Household money, kept together.  
**One-liner:** Multi-member household budget workspaces with monthly income, fixed bills, daily spend, savings, and smart due-date alerts.

This document is the source of truth for *what* we build.  
See [`COMMIT_PLAN.md`](./COMMIT_PLAN.md) for *how* we ship it (branches, ~45 commits, merge order).

---

## 1. Vision

Hearth is a family household finance app for salaried people who share a home budget.

A user creates a **workspace** (e.g. “Our Home”), invites family members, then for each month tracks:

- Money that came in (salary / other earnings)
- Permanent monthly obligations (rent, EMI, electricity) — paid / unpaid / due soon
- Everyday spending (groceries, food, transport)
- Savings goals / transfers
- One-off charges
- Live totals: spent so far, remaining budget, category rollups

Everything is workspace-scoped. Notifications keep the household aware of unpaid bills and approaching due dates.

---

## 2. Goals & non-goals

### Goals (v1)

- Auth (email/password) with session cookies
- Workspaces + member roles + email invites
- Monthly budget periods per workspace
- Income, recurring bills, expenses, savings, miscellaneous charges
- Category + line-item tracking with automatic totals
- Dashboard: remaining budget, spend by category, bill status
- In-app notification center (due soon, overdue, invites, member activity)
- Docker PostgreSQL locally; Prisma ORM; Next.js App Router
- Reusable shadcn/ui components + clear folder structure

### Non-goals (v1)

- Bank sync / UPI / Plaid / Open Banking
- Mobile native apps
- Multi-currency FX conversion (single currency per workspace is enough)
- Shared public links / guest view without account
- Production cloud deploy (local Docker Postgres only for now)
- AI categorization / receipt OCR

---

## 3. Tech stack (locked)

| Layer | Choice |
|--------|--------|
| Framework | Next.js 15 (App Router) + TypeScript |
| Styling | Tailwind CSS v4 |
| UI kit | shadcn/ui (Radix) — reusable primitives |
| Auth | Auth.js (NextAuth v5) — Credentials + Prisma adapter |
| ORM | Prisma |
| DB | PostgreSQL 16 in Docker (`hearth-postgres`) |
| Validation | Zod |
| Forms | React Hook Form + Zod |
| Dates | date-fns |
| Charts | Recharts (dashboard only) |
| Email (dev) | Console / optional Resend later for invites |
| Package manager | pnpm |
| Container | `docker-compose.yml` with named volume |

### App identity

- Package / folder: `hearth`
- Docker container name: `hearth-postgres`
- Docker volume: `hearth_pgdata`
- DB name: `hearth`
- Local URL: `http://localhost:3000`

---

## 4. Core domain model

### 4.1 Entities (conceptual)

```
User
  └── WorkspaceMembership[]  →  Workspace
                                    ├── Invite[]
                                    ├── MonthlyBudget[]   (one per calendar month)
                                    │     ├── IncomeEntry[]
                                    │     ├── ExpenseEntry[]
                                    │     ├── SavingsEntry[]
                                    │     └── ChargeEntry[]
                                    ├── RecurringBill[]   (templates; generate / link per month)
                                    ├── Category[]        (workspace-level categories)
                                    └── Notification[]
```

### 4.2 Key rules

1. **Workspace isolation** — every query is scoped by `workspaceId` + membership check.
2. **MonthlyBudget** — unique `(workspaceId, year, month)`. Opening a month creates the budget shell (and optionally clones unpaid recurring bills).
3. **Budget math (per month)**  
   - `totalIncome` = sum(IncomeEntry.amount)  
   - `totalExpenses` = sum(ExpenseEntry.amount)  
   - `totalSavings` = sum(SavingsEntry.amount)  
   - `totalCharges` = sum(ChargeEntry.amount)  
   - `totalCommittedBills` = sum(RecurringBillInstance.amount) for that month  
   - `totalSpent` = expenses + charges + paid bill amounts + savings (configurable; default: expenses + charges + savings + paid bills)  
   - `remaining` = totalIncome − totalSpent  
   Exact formula is centralized in `lib/budget/calculations.ts` so UI never invents math.
4. **Recurring bills** are permanent templates (`dayOfMonth`, amount, name). Each month gets a **BillInstance** with `status: PENDING | PAID | SKIPPED` and `dueDate`.
5. **Categories** are workspace-owned (Groceries, Transport, Utilities, …). Expenses/charges attach to a category; category totals auto-aggregate.
6. **Roles** — `OWNER` | `ADMIN` | `MEMBER`. Owner can delete workspace; Admin can invite/manage; Member can add/edit money entries.
7. **Notifications** are persisted rows, not only toast UI.

### 4.3 Prisma models (target schema)

```prisma
model User {
  id            String   @id @default(cuid())
  name          String?
  email         String   @unique
  emailVerified DateTime?
  image         String?
  passwordHash  String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  accounts      Account[]
  sessions      Session[]
  memberships   WorkspaceMembership[]
  sentInvites   WorkspaceInvite[] @relation("InviteSender")
  notifications Notification[]
}

model Workspace {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  currency    String   @default("INR")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  members     WorkspaceMembership[]
  invites     WorkspaceInvite[]
  categories  Category[]
  budgets     MonthlyBudget[]
  bills       RecurringBill[]
  notifications Notification[]
}

model WorkspaceMembership {
  id          String        @id @default(cuid())
  role        WorkspaceRole @default(MEMBER)
  userId      String
  workspaceId String
  createdAt   DateTime      @default(now())
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace     @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@unique([userId, workspaceId])
}

enum WorkspaceRole {
  OWNER
  ADMIN
  MEMBER
}

model WorkspaceInvite {
  id          String       @id @default(cuid())
  email       String
  token       String       @unique
  role        WorkspaceRole @default(MEMBER)
  status      InviteStatus @default(PENDING)
  expiresAt   DateTime
  workspaceId String
  invitedById String
  createdAt   DateTime     @default(now())
  workspace   Workspace    @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  invitedBy   User         @relation("InviteSender", fields: [invitedById], references: [id])

  @@index([email, status])
}

enum InviteStatus {
  PENDING
  ACCEPTED
  REVOKED
  EXPIRED
}

model Category {
  id          String   @id @default(cuid())
  name        String
  icon        String?
  color       String?
  type        CategoryType
  workspaceId String
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  expenses    ExpenseEntry[]
  charges     ChargeEntry[]

  @@unique([workspaceId, name, type])
}

enum CategoryType {
  EXPENSE
  CHARGE
  SAVINGS
  INCOME
}

model MonthlyBudget {
  id          String   @id @default(cuid())
  year        Int
  month       Int      // 1-12
  note        String?
  workspaceId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  incomes     IncomeEntry[]
  expenses    ExpenseEntry[]
  savings     SavingsEntry[]
  charges     ChargeEntry[]
  billInstances BillInstance[]

  @@unique([workspaceId, year, month])
}

model IncomeEntry {
  id        String   @id @default(cuid())
  title     String   // e.g. Salary, Freelance
  amount    Decimal  @db.Decimal(12, 2)
  earnedOn  DateTime @default(now())
  note      String?
  budgetId  String
  createdBy String?
  createdAt DateTime @default(now())
  budget    MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
}

model ExpenseEntry {
  id         String   @id @default(cuid())
  title      String
  amount     Decimal  @db.Decimal(12, 2)
  spentOn    DateTime @default(now())
  note       String?
  categoryId String?
  budgetId   String
  createdBy  String?
  createdAt  DateTime @default(now())
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  budget     MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
}

model SavingsEntry {
  id        String   @id @default(cuid())
  title     String
  amount    Decimal  @db.Decimal(12, 2)
  savedOn   DateTime @default(now())
  note      String?
  budgetId  String
  createdBy String?
  createdAt DateTime @default(now())
  budget    MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
}

model ChargeEntry {
  id         String   @id @default(cuid())
  title      String
  amount     Decimal  @db.Decimal(12, 2)
  chargedOn  DateTime @default(now())
  note       String?
  categoryId String?
  budgetId   String
  createdBy  String?
  createdAt  DateTime @default(now())
  category   Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  budget     MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
}

model RecurringBill {
  id          String   @id @default(cuid())
  name        String   // Rent, Internet, EMI
  amount      Decimal  @db.Decimal(12, 2)
  dayOfMonth  Int      // 1-28 safe default
  isActive    Boolean  @default(true)
  workspaceId String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  workspace   Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)
  instances   BillInstance[]
}

model BillInstance {
  id             String     @id @default(cuid())
  dueDate        DateTime
  amount         Decimal    @db.Decimal(12, 2)
  status         BillStatus @default(PENDING)
  paidAt         DateTime?
  recurringBillId String
  budgetId       String
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  recurringBill  RecurringBill @relation(fields: [recurringBillId], references: [id], onDelete: Cascade)
  budget         MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)

  @@unique([recurringBillId, budgetId])
}

enum BillStatus {
  PENDING
  PAID
  SKIPPED
}

model Notification {
  id          String           @id @default(cuid())
  type        NotificationType
  title       String
  body        String
  href        String?
  readAt      DateTime?
  userId      String
  workspaceId String?
  createdAt   DateTime         @default(now())
  user        User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  workspace   Workspace?       @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([userId, readAt])
}

enum NotificationType {
  BILL_DUE_SOON
  BILL_OVERDUE
  INVITE_RECEIVED
  INVITE_ACCEPTED
  MEMBER_JOINED
  BUDGET_LOW
  GENERIC
}
```

Auth.js `Account` / `Session` / `VerificationToken` models are included via Prisma adapter (standard).

---

## 5. Feature inventory (what users can do)

### A. Authentication

- Sign up (name, email, password)
- Sign in / sign out
- Protected app routes (`/app/**`)
- Password hashed with bcrypt

### B. Workspaces

- Create workspace (name → slug)
- Switch active workspace
- Edit workspace name / currency
- Delete workspace (OWNER only)
- Default seed categories on create (Groceries, Dining, Transport, Utilities, Healthcare, Entertainment, Other)

### C. Members & invites

- Invite by email (role ADMIN or MEMBER)
- Accept invite via token link (must be logged in / sign up first)
- List members + roles
- Change role / remove member (OWNER/ADMIN)
- Revoke pending invite

### D. Monthly budget period

- View current month by default
- Switch month/year
- Auto-create `MonthlyBudget` if missing
- On create: generate `BillInstance` rows from active `RecurringBill`s
- Month summary cards: Income, Spent, Remaining, Bills pending

### E. Income

- Add / edit / delete income (salary, bonus, side income)
- List incomes for the month
- Contributes to total available budget

### F. Recurring / permanent bills

- CRUD recurring bill templates (name, amount, day of month)
- Per-month instances: mark Paid / Skip
- Status badges: Paid, Due soon (≤ 3 days), Overdue, Upcoming
- Paid amount counts toward spent

### G. Daily / ad-hoc expenses

- Add expense with date, category, amount, optional note
- Edit / delete
- Filters: by category, by date range within month
- Category subtotals on list + dashboard

### H. Savings

- Log savings transfers / deposits for the month
- Track total saved this month
- Counts against remaining (money set aside)

### I. Random charges / other

- One-off charges not fitting groceries-style expenses
- Same category pattern as expenses (`CategoryType.CHARGE`)

### J. Dashboard (workspace home)

- Remaining budget (hero number)
- Income vs spent progress
- Category breakdown chart
- Bills due this month (quick actions)
- Recent activity feed (last N entries)
- Unread notification count

### K. Notifications

- Center in header (bell + panel/page)
- Mark one / mark all read
- Generated when:
  - Invite received
  - Member accepts invite
  - Bill due in 3 days (cron or on-session check)
  - Bill overdue
  - Remaining budget drops below 15% of income (optional rule)
- Job approach for v1: **lazy evaluation on app load / dashboard** + API route that upserts due/overdue notifications (simple, no separate worker yet)

### L. Settings

- Profile (name)
- Workspace settings
- Category management (add/rename/archive)

---

## 6. UX map (routes)

```
/                       Marketing / landing (simple)
/login
/register
/invite/[token]         Accept invite flow

/app                    → redirect to last/default workspace
/app/[workspaceSlug]
/app/[workspaceSlug]/dashboard
/app/[workspaceSlug]/income
/app/[workspaceSlug]/expenses
/app/[workspaceSlug]/savings
/app/[workspaceSlug]/charges
/app/[workspaceSlug]/bills
/app/[workspaceSlug]/members
/app/[workspaceSlug]/categories
/app/[workspaceSlug]/notifications
/app/[workspaceSlug]/settings
/app/workspaces/new
```

Month selection via search params: `?year=2026&month=11`

---

## 7. Folder structure (target)

```
hearth/   (repo root = this project)
├── docker-compose.yml
├── .env.example
├── .env
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── public/
├── docs/
│   ├── FEATURES.md
│   └── COMMIT_PLAN.md
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (marketing)/
│   │   │   └── page.tsx
│   │   ├── invite/[token]/page.tsx
│   │   ├── app/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── workspaces/new/page.tsx
│   │   │   └── [workspaceSlug]/
│   │   │       ├── layout.tsx
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── income/page.tsx
│   │   │       ├── expenses/page.tsx
│   │   │       ├── savings/page.tsx
│   │   │       ├── charges/page.tsx
│   │   │       ├── bills/page.tsx
│   │   │       ├── members/page.tsx
│   │   │       ├── categories/page.tsx
│   │   │       ├── notifications/page.tsx
│   │   │       └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # shadcn primitives
│   │   ├── layout/             # AppShell, Sidebar, Header, WorkspaceSwitcher
│   │   ├── auth/
│   │   ├── workspace/
│   │   ├── budget/             # SummaryCards, MonthPicker, RemainingHero
│   │   ├── entries/            # shared EntryTable, EntryFormDialog
│   │   ├── bills/
│   │   ├── categories/
│   │   ├── members/
│   │   ├── notifications/
│   │   └── charts/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   ├── money.ts            # Decimal helpers, formatCurrency
│   │   ├── budget/
│   │   │   ├── calculations.ts
│   │   │   ├── period.ts       # ensureMonthlyBudget, generateBillInstances
│   │   │   └── access.ts       # requireMembership
│   │   ├── notifications/
│   │   │   ├── create.ts
│   │   │   └── sync-bills.ts   # due soon / overdue upsert
│   │   └── validators/         # Zod schemas
│   ├── actions/                # Server Actions by domain
│   │   ├── auth.ts
│   │   ├── workspaces.ts
│   │   ├── invites.ts
│   │   ├── income.ts
│   │   ├── expenses.ts
│   │   ├── savings.ts
│   │   ├── charges.ts
│   │   ├── bills.ts
│   │   ├── categories.ts
│   │   └── notifications.ts
│   └── types/
│       └── index.ts
├── package.json
├── components.json             # shadcn
├── tailwind / postcss / tsconfig / next.config
└── README.md
```

### Reusable component rules

- Prefer one shared `EntryFormDialog` + `EntryTable` parameterized by entry type.
- Money display always goes through `formatCurrency(amount, currency)`.
- All mutations via Server Actions with Zod validation + membership checks.
- UI primitives only from `components/ui` (shadcn); feature components compose them.

---

## 8. Budget calculation logic (authoritative)

```ts
// Pseudocode — implemented in lib/budget/calculations.ts
remaining =
  sum(incomes)
  - sum(expenses)
  - sum(charges)
  - sum(savings)
  - sum(billInstances where status === PAID)

pendingBillsTotal = sum(billInstances where status === PENDING)
projectedRemaining = remaining - pendingBillsTotal  // optional insight card
```

Category total for Groceries = sum of expense (and optionally charge) rows with that `categoryId` in the selected month.

---

## 9. Notification logic (authoritative)

| Event | When created | Audience |
|--------|----------------|----------|
| `INVITE_RECEIVED` | Invite created (if user email exists) | Invitee |
| `INVITE_ACCEPTED` / `MEMBER_JOINED` | Invite accepted | OWNER + ADMIN |
| `BILL_DUE_SOON` | Sync: dueDate within next 3 days, PENDING, not already notified for that instance+type | All workspace members |
| `BILL_OVERDUE` | Sync: dueDate < today, PENDING | All workspace members |
| `BUDGET_LOW` | After mutation: remaining < 15% of income (and income > 0) | All workspace members |

Unread = `readAt IS NULL`. Bell badge = unread count for current user (optionally filtered to active workspace).

---

## 10. AuthZ matrix

| Action | OWNER | ADMIN | MEMBER |
|--------|-------|-------|--------|
| View data | ✓ | ✓ | ✓ |
| Add/edit own-style money entries | ✓ | ✓ | ✓ |
| Manage categories | ✓ | ✓ | ✗ |
| Manage recurring bills | ✓ | ✓ | ✗ |
| Invite / remove members | ✓ | ✓ | ✗ |
| Change roles | ✓ | ✗* | ✗ |
| Delete workspace | ✓ | ✗ | ✗ |
| Leave workspace | ✓** | ✓ | ✓ |

\* ADMIN cannot change OWNER.  
\*\* OWNER must transfer ownership before leave (v1: block leave if sole owner).

---

## 11. Docker (local Postgres)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16-alpine
    container_name: hearth-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: hearth
      POSTGRES_PASSWORD: hearth
      POSTGRES_DB: hearth
    ports:
      - "5432:5432"
    volumes:
      - hearth_pgdata:/var/lib/postgresql/data

volumes:
  hearth_pgdata:
```

```env
DATABASE_URL="postgresql://hearth:hearth@localhost:5432/hearth?schema=public"
AUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"
```

Commands:

```bash
docker compose up -d
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

---

## 12. Design direction (shadcn)

- Clean, calm finance UI — not dark-by-default, not purple gradient cliché.
- CSS variables for brand: warm charcoal text, soft sage/teal accent, paper-like surfaces with subtle grain/gradient atmosphere.
- Typography: distinctive pair via `next/font` (e.g. **Fraunces** for display + **Source Sans 3** for UI) — not Inter.
- Dense-but-readable tables for entries; large remaining figure on dashboard.
- Motion: subtle sidebar active indicator, month switch fade, notification panel slide — 2–3 intentional motions only.

---

## 13. Quality bar before “done”

- [ ] Fresh clone → `docker compose up` → migrate → seed → register → full happy path
- [ ] Second user accepts invite and sees same workspace numbers
- [ ] Month switch preserves isolation of data
- [ ] Mark bill paid updates remaining correctly
- [ ] Due-soon / overdue notifications appear after sync
- [ ] Membership checks block cross-workspace access
- [ ] No Cursor / AI co-author trailers in any commit message
- [ ] All work local; push only when you explicitly ask

---

## 14. Later (not in v1 build)

- Production DB (Neon / RDS / etc.)
- Real email provider for invites
- Recurring income templates
- Export CSV
- Mobile PWA polish
- Multi-currency

---

*Hearth v1 — planned for local-first delivery via feature branches documented in COMMIT_PLAN.md.*
