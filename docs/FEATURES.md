# Hearth — Product & Architecture Spec

**App name:** Hearth  
**Tagline:** Household money, kept together.  
**One-liner:** Multi-member household budget workspaces with monthly income, fixed bills, daily spend (calendar + list), filter-aware print/PDF statements, savings, and smart due-date alerts.

This document is the source of truth for *what* we build.  
See [`COMMIT_PLAN.md`](./COMMIT_PLAN.md) for *how* we ship it (branches, ~45 commits, merge order).

---

## 1. Vision

Hearth is a family household finance app for salaried people who share a home budget.

A user creates a **workspace** (e.g. “Our Home”), invites family members, then for each month tracks:

- Money that came in (salary / other earnings)
- Permanent monthly obligations (rent, EMI, electricity) — paid / unpaid / due soon
- Everyday spending (groceries, food, transport) — **by calendar day and as a list**
- Savings goals / transfers
- One-off charges
- Live totals / counters: spent so far, remaining budget, per-day spend, category rollups

Everything is workspace-scoped and **month-scoped** (Nov 2026 ≠ Oct 2026). Family joins via **emailed invites** (Mailpit locally). Every add is attributed to a person and timestamp — visible in lists, calendar day panels, and printed statements. Notifications keep the household aware of unpaid bills and approaching due dates.

---

## 2. Goals & non-goals

### Goals (v1)

- Auth (email/password) with session cookies
- Workspaces + member roles + **email invites** (Mailpit locally → real provider later)
- **Attribution:** every entry records who added it and when
- Monthly budget periods per workspace (strict calendar-month isolation)
- Income, recurring bills, expenses, savings, miscellaneous charges
- **Month activity: Calendar view + List view** (toggle), add on a day, see what was bought
- Day / month / category **counters** that recalculate automatically
- Category + line-item tracking with automatic totals
- Dashboard: remaining budget, spend by category, bill status
- **Statement export:** preview → print / download (table layout respects active filters)
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
- Official tax / CA-ready statutory invoices (this is a household statement, not GST billing software)

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
| Email (local) | **Mailpit** in Docker (SMTP catcher + web UI) |
| Email (later) | Resend / SES / etc. — same `lib/mail` interface |
| Package manager | pnpm |
| Container | `docker-compose.yml` (Postgres + Mailpit) |

### App identity

- Package / folder: `hearth`
- Docker container names: `hearth-postgres`, `hearth-mailpit`
- Docker volume: `hearth_pgdata`
- DB name: `hearth`
- App URL: `http://localhost:3000`
- Mailpit UI: `http://localhost:8025`

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
2. **MonthlyBudget** — unique `(workspaceId, year, month)`. Opening a month creates the budget shell (and optionally clones unpaid recurring bills). Switching month never mixes entries across months.
3. **Day-dated entries** — every expense/charge/income/savings row has a real date (`spentOn` / `chargedOn` / etc.). Calendar cells group by that date within the selected month.
4. **Budget math (per month)**  
   - `totalIncome` = sum(IncomeEntry.amount)  
   - `totalExpenses` = sum(ExpenseEntry.amount)  
   - `totalSavings` = sum(SavingsEntry.amount)  
   - `totalCharges` = sum(ChargeEntry.amount)  
   - `totalCommittedBills` = sum(RecurringBillInstance.amount) for that month  
   - `totalSpent` = expenses + charges + paid bill amounts + savings (configurable; default: expenses + charges + savings + paid bills)  
   - `remaining` = totalIncome − totalSpent  
   - **Day counters:** `daySpend(date)` = expenses + charges on that date; `dayCount(date)` = number of those entries  
   - **Category counters:** sum + count of entries in that category for the month  
   Exact formulas are centralized in `lib/budget/calculations.ts` so UI never invents math.
5. **Recurring bills** are permanent templates (`dayOfMonth`, amount, name). Each month gets a **BillInstance** with `status: PENDING | PAID | SKIPPED` and `dueDate`. Bills also appear on the calendar on their `dueDate`.
6. **Categories** are workspace-owned (Groceries, Transport, Utilities, …). Expenses/charges attach to a category; category totals auto-aggregate.
7. **Roles** — `OWNER` | `ADMIN` | `MEMBER`. Owner can delete workspace; Admin can invite/manage; Member can add/edit money entries.
8. **Attribution** — every money entry and bill status change stores `createdById` (required) + `createdAt`. UI and print statements always show **who** and **when**. Edits may store `updatedById` / `updatedAt` (optional v1).
9. **Notifications** are persisted rows, not only toast UI.
10. **Invites are emailed** — creating an invite sends a real SMTP message (Mailpit in dev). Invitee opens link → sign up or log in → joins workspace → their adds are attributed to them.

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
  incomesCreated   IncomeEntry[]  @relation("IncomeCreatedBy")
  expensesCreated  ExpenseEntry[] @relation("ExpenseCreatedBy")
  savingsCreated   SavingsEntry[] @relation("SavingsCreatedBy")
  chargesCreated   ChargeEntry[]  @relation("ChargeCreatedBy")
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
  id          String   @id @default(cuid())
  title       String   // e.g. Salary, Freelance
  amount      Decimal  @db.Decimal(12, 2)
  earnedOn    DateTime @default(now())
  note        String?
  budgetId    String
  createdById String   // required — who recorded this
  createdAt   DateTime @default(now())
  budget      MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  createdBy   User     @relation("IncomeCreatedBy", fields: [createdById], references: [id])
}

model ExpenseEntry {
  id          String   @id @default(cuid())
  title       String
  amount      Decimal  @db.Decimal(12, 2)
  spentOn     DateTime @default(now())
  note        String?
  categoryId  String?
  budgetId    String
  createdById String
  createdAt   DateTime @default(now())
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  budget      MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  createdBy   User     @relation("ExpenseCreatedBy", fields: [createdById], references: [id])
}

model SavingsEntry {
  id          String   @id @default(cuid())
  title       String
  amount      Decimal  @db.Decimal(12, 2)
  savedOn     DateTime @default(now())
  note        String?
  budgetId    String
  createdById String
  createdAt   DateTime @default(now())
  budget      MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  createdBy   User     @relation("SavingsCreatedBy", fields: [createdById], references: [id])
}

model ChargeEntry {
  id          String   @id @default(cuid())
  title       String
  amount      Decimal  @db.Decimal(12, 2)
  chargedOn   DateTime @default(now())
  note        String?
  categoryId  String?
  budgetId    String
  createdById String
  createdAt   DateTime @default(now())
  category    Category? @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  budget      MonthlyBudget @relation(fields: [budgetId], references: [id], onDelete: Cascade)
  createdBy   User     @relation("ChargeCreatedBy", fields: [createdById], references: [id])
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

### C. Members & invites (email via Mailpit → join → attributed activity)

**Invite flow (end-to-end)**

1. Owner/Admin enters family member email + role → creates invite token  
2. App **sends invite email over SMTP** (Mailpit locally; swap provider later without changing call sites)  
3. Email contains workspace name, inviter name, and link: `/invite/[token]`  
4. Invitee opens link:
   - **No account** → register form (email prefilled from invite) → account created → membership attached → redirect into workspace  
   - **Already logged in / has account** → accept → join workspace  
5. Inviter gets in-app notification; invite status → `ACCEPTED`  
6. New member can add income/expenses/etc. — every row is tagged with **their user id + timestamp**

**Also**

- List members + roles  
- Change role / remove member (OWNER/ADMIN)  
- Revoke pending invite (email link then fails with clear message)  
- Resend invite email  
- Mailpit UI at `http://localhost:8025` to inspect invite emails during local dev  

**Attribution everywhere after join**

- Lists show **Added by** (display name) + **Recorded at**  
- Day panel / calendar detail shows who logged each purchase  
- Filter by member (“only Arin’s entries”)  
- Statements / print / CSV include the same columns (see M)

### D. Monthly budget period (month is the unit of truth)

- View **current calendar month** by default
- Month/year switcher (prev / next / jump) — all pages respect `?year=&month=`
- Auto-create `MonthlyBudget` if missing when you open a month
- On create: generate `BillInstance` rows from active `RecurringBill`s
- **Sticky month counters strip** (visible on month pages):
  - Income total
  - Spent total
  - Remaining
  - Entry count (how many spend items this month)
  - Bills pending count
- Changing month reloads only that month’s data — no bleed from other months

### E. Month activity — Calendar + List (core daily UX)

This is how the household sees “what we bought here and there” for the selected month.

**Shared chrome (both views)**

- Month picker + counter strip (from D)
- View toggle: **Calendar | List**
- Primary CTA: **Add entry** (expense by default; can switch type)
- **Export statement** — opens preview of current filters as a printable table (see M)
- Filters: category, entry type (expense / charge / bill / income / savings), **member who added**
- Every row in list/day panel shows **who added it** and **when**

**Calendar view**

- Full month grid (Sun–Sat or Mon–Sun; locale-aware)
- Each day cell shows:
  - **Day spend counter** (amount spent that day — expenses + charges)
  - **Item count badge** (e.g. `3` purchases)
  - Soft markers for bill due dates / paid bills
  - Today highlighted; other-month padding days muted / non-interactive for add
- Click a day → **Day drawer / panel**:
  - List everything that happened that day (title, category, amount, type)
  - Running day total + count
  - **Add** button pre-filled with that date
  - Edit / delete from the same panel
- Empty days still clickable → add first purchase for that date
- Navigate months from calendar header (same month state as rest of app)

**List view**

- Chronological table/list of all month entries (newest or oldest toggle)
- Columns: date, title, category, type, amount, **added by**, **recorded at**
- Group-by option: **By day** (day headers with day total + count) or flat
- Same add / edit / delete actions
- Category subtotals footer: e.g. Groceries ₹4,200 (12 items)
- Optional group-by **member** to see household contribution split

**Counters that always stay in sync**

| Counter | Meaning |
|---------|---------|
| Month remaining | Income − spent (authoritative) |
| Month spent | Expenses + charges + savings + paid bills |
| Month entry count | Number of expense+charge rows this month |
| Day spend | Sum for that calendar date |
| Day count | Number of purchases that date |
| Category total + count | Per category for the month |

All counters recompute after every add/edit/delete (server calculation → UI refresh). No client-only fake math.

### F. Income

- Add / edit / delete income (salary, bonus, side income)
- List incomes for the month
- Also visible on calendar on `earnedOn` date (income marker, not counted in day *spend*)
- Contributes to total available budget

### G. Recurring / permanent bills

- CRUD recurring bill templates (name, amount, day of month)
- Per-month instances: mark Paid / Skip
- Status badges: Paid, Due soon (≤ 3 days), Overdue, Upcoming
- Paid amount counts toward spent
- Show on calendar on due date; marking paid updates counters

### H. Daily / ad-hoc expenses (groceries & everyday)

- Add expense with **date**, category, amount, optional note
- Add from: List CTA, Calendar day click, Dashboard quick-add
- Edit / delete
- Filters: by category, by date within month
- Category subtotals on list + calendar day panel + dashboard
- Typical flow: open calendar → click 12th → add “Vegetables” under Groceries → day counter + month remaining update immediately

### I. Savings

- Log savings transfers / deposits for the month
- Track total saved this month + count of savings entries
- Counts against remaining (money set aside)
- Optional marker on calendar on `savedOn`

### J. Random charges / other

- One-off charges not fitting groceries-style expenses
- Same category pattern as expenses (`CategoryType.CHARGE`)
- Included in day spend counters alongside expenses

### K. Dashboard (workspace home)

- Remaining budget (hero number) for selected month
- Income vs spent progress
- Category breakdown chart + category counters
- **This week / today** mini strip (from calendar data)
- Bills due this month (quick actions)
- Recent activity feed (last N entries)
- Shortcut into Calendar / List month activity
- Unread notification count

### L. Notifications

- Center in header (bell + panel/page)
- Mark one / mark all read
- Generated when:
  - Invite received
  - Member accepts invite
  - Bill due in 3 days (cron or on-session check)
  - Bill overdue
  - Remaining budget drops below 15% of income (optional rule)
- Job approach for v1: **lazy evaluation on app load / dashboard** + API route that upserts due/overdue notifications (simple, no separate worker yet)

### M. Statement export — preview, print & download

Household “bill / check / statement” for whatever you’re looking at — **always matches the active filters**.

**Where it lives**

- Primary: `/month` (Calendar & List) toolbar → **Export statement**
- Also on: Expenses, Charges, Income, Savings, Bills list pages
- Optional: Dashboard → “Export this month”

**Filter fidelity (critical)**

Whatever filters are on screen are what the statement contains, for example:

- Month / year
- View scope: all types, or expenses only, charges only, etc.
- Category (e.g. Groceries only)
- Date range inside the month (e.g. 1–15)
- Day focus (single day from calendar)
- **Member who added** (one person or all)
- Bill status (pending / paid) when exporting bills
- Search text (title contains…)

The preview header shows a human-readable **Filter summary** chip row so you know exactly what printed (including “Added by: everyone / Arin”).

**Flow**

1. Set filters on the list/month page  
2. Click **Export / Print**  
3. Open **Preview** (full-screen dialog or `/statements/preview` route)  
4. Review designed table + totals  
5. Actions:
   - **Print** — browser print dialog (print CSS, no app chrome)
   - **Download PDF** — same layout, saved as PDF
   - **Download CSV** — raw filtered rows for Excel/Sheets
   - Close / adjust filters and regenerate

**Statement design (print + preview)**

Print-first layout, calm and premium (matches Hearth brand — not generic invoice spam):

- Letter / A4 page, clean margins
- Header: Hearth mark + **workspace name** + “Household statement”
- Meta row: period (November 2026), generated date, generated by (user name)
- Filter summary line
- **Summary strip:** Income | Spent | Remaining | Row count | (optional) category breakdown mini totals
- **Main table** (dense, readable) — attribution is required on every printable row:

  | # | Date | Title | Category | Type | Amount | Added by | Recorded at |

- Section option: group by day, category, or **member** (toggle in preview toolbar; default flat chronological)
- Footer: page totals, “Paid bills included: …”, optional per-member spend subtotal block, workspace currency
- Subtle rules / typography hierarchy; hide sidebar/nav in `@media print`
- Watermark-free; page numbers via print CSS (`Page X`)

**Preview UI (on screen)**

- Paper-like canvas centered on muted backdrop (WYSIWYG of print)
- Toolbar: Group by · Include income · Include bills · Show attribution columns (on by default) · Print · PDF · CSV · Close
- Live re-render when toggles change (still constrained to the original filter query)
- Empty state if filters return zero rows: “Nothing matches these filters”
- CSV columns mirror the table, including `addedBy` + `recordedAt`

**Technical approach (v1)**

- Shared `StatementDocument` React component used by preview + print
- `lib/statements/build-rows.ts` — takes filter DTO + entries → normalized table rows + totals
- Print: `window.print()` + dedicated `statements.css` print stylesheet
- PDF: print-to-PDF path first (reliable); optional client `html2pdf`/similar only if needed
- CSV: client-side blob download from same row builder (UTF-8, currency formatted as plain numbers)
- No server PDF worker in v1

### N. Settings

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
/app/[workspaceSlug]/month              ← Month activity (Calendar | List toggle)
/app/[workspaceSlug]/income
/app/[workspaceSlug]/expenses           ← can deep-link/filter; primary UX is /month
/app/[workspaceSlug]/savings
/app/[workspaceSlug]/charges
/app/[workspaceSlug]/bills
/app/[workspaceSlug]/members
/app/[workspaceSlug]/categories
/app/[workspaceSlug]/notifications
/app/[workspaceSlug]/settings
/app/[workspaceSlug]/statements/preview   ← print/PDF preview (filter query in URL)
/app/workspaces/new
```

Month selection via search params on all month-scoped pages:

`?year=2026&month=11`

Optional day focus (opens day panel on calendar):

`?year=2026&month=11&day=12&view=calendar|list`

Statement preview carries the same filters (+ export options):

`/statements/preview?year=2026&month=11&types=expense,charge&categoryId=…&from=2026-11-01&to=2026-11-15&groupBy=day`

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
│   │   │       ├── month/page.tsx      # Calendar | List activity
│   │   │       ├── income/page.tsx
│   │   │       ├── expenses/page.tsx
│   │   │       ├── savings/page.tsx
│   │   │       ├── charges/page.tsx
│   │   │       ├── bills/page.tsx
│   │   │       ├── members/page.tsx
│   │   │       ├── categories/page.tsx
│   │   │       ├── notifications/page.tsx
│   │   │       ├── settings/page.tsx
│   │   │       └── statements/
│   │   │           └── preview/page.tsx   # print/PDF canvas
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
│   │   ├── budget/             # SummaryCards, MonthPicker, CounterStrip, RemainingHero
│   │   ├── month/              # MonthActivity, ViewToggle, MonthCalendar, DayCell, DayPanel
│   │   ├── entries/            # shared EntryTable, EntryFormDialog, EntryListGrouped
│   │   ├── bills/
│   │   ├── categories/
│   │   ├── members/
│   │   ├── notifications/
│   │   ├── statements/         # StatementDocument, StatementToolbar, StatementTable, ExportMenu
│   │   └── charts/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   ├── money.ts            # Decimal helpers, formatCurrency
│   │   ├── mail/
│   │   │   ├── send.ts         # SMTP via nodemailer → Mailpit / prod
│   │   │   └── templates/      # invite email HTML
│   │   ├── budget/
│   │   │   ├── calculations.ts # month + day + category counters
│   │   │   ├── period.ts       # ensureMonthlyBudget, generateBillInstances
│   │   │   ├── day-map.ts      # group entries by YYYY-MM-DD for calendar
│   │   │   └── access.ts       # requireMembership
│   │   ├── notifications/
│   │   │   ├── create.ts
│   │   │   └── sync-bills.ts   # due soon / overdue upsert
│   │   ├── statements/
│   │   │   ├── build-rows.ts   # filter DTO → table rows + totals
│   │   │   ├── csv.ts          # CSV blob helpers
│   │   │   └── filters.ts      # parse/serialize statement query params
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
│   │   ├── notifications.ts
│   │   └── statements.ts       # fetch filtered rows for preview
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

daySpend(date) = sum(expenses on date) + sum(charges on date)
dayCount(date) = count(expenses on date) + count(charges on date)
monthEntryCount = count(expenses) + count(charges)
```

Category total for Groceries = sum of expense (and optionally charge) rows with that `categoryId` in the selected month, plus item count for the badge/counter.

`day-map.ts` builds `Record<YYYY-MM-DD, DayBucket>` used by the calendar grid so each cell is O(1) to render.

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

## 11. Docker (local Postgres + Mailpit)

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

  mailpit:
    image: axllent/mailpit:latest
    container_name: hearth-mailpit
    restart: unless-stopped
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI — open to see invite emails
```

```env
DATABASE_URL="postgresql://hearth:hearth@localhost:5432/hearth?schema=public"
AUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"
# Mail (Mailpit locally; later swap host/user/pass for Resend SMTP or API)
SMTP_HOST="localhost"
SMTP_PORT="1025"
SMTP_FROM="Hearth <noreply@hearth.local>"
SMTP_SECURE="false"
```

Mail abstraction: `lib/mail/send.ts` + `lib/mail/templates/invite.tsx` (or HTML string).  
Production later = change env / provider adapter only — invite feature code stays the same.

Commands:

```bash
docker compose up -d
# Postgres: localhost:5432 | Mailpit UI: http://localhost:8025
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
- [ ] Invite email appears in Mailpit; link works for signup + join
- [ ] Second user adds an expense; lists/statements show their name + timestamp
- [ ] Filter by member isolates that person’s rows in UI and print
- [ ] Month switch preserves isolation of data
- [ ] Calendar shows correct day spend + count; empty day can add
- [ ] List view group-by-day totals match calendar day cells
- [ ] Add/edit/delete updates month counters + day counters
- [ ] Statement preview table matches active filters + shows Added by / Recorded at
- [ ] Print stylesheet hides app chrome; PDF/CSV download includes attribution columns
- [ ] Mark bill paid updates remaining correctly
- [ ] Due-soon / overdue notifications appear after sync
- [ ] Membership checks block cross-workspace access
- [ ] No Cursor / AI co-author trailers in any commit message
- [ ] All work local; push only when you explicitly ask

---

## 14. Later (not in v1 build)

- Production DB (Neon / RDS / etc.)
- Production email provider (Resend / SES) behind the same `lib/mail` interface
- Recurring income templates
- Mobile PWA polish
- Multi-currency
- Edit-history audit log (beyond createdBy)

---

*Hearth v1 — planned for local-first delivery via feature branches documented in COMMIT_PLAN.md.*
