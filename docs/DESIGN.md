# Hearth — Design System

Visual truth for the product UI.  
Product behavior stays in [`FEATURES.md`](./FEATURES.md).  
Delivery map for this design pass: [`DESIGN_COMMIT_PLAN.md`](./DESIGN_COMMIT_PLAN.md).

---

## 1. Intent

Hearth should feel like a calm household desk: warm paper, clear ink type, one living green for action.  
Not a SaaS dashboard, not a fintech neon, not purple AI defaults.

Every page shares the same building blocks so money screens, auth, and marketing read as one product.

---

## 2. Three brand colors (locked)

| Token            | Name      | Hex       | Role                                           |
| ---------------- | --------- | --------- | ---------------------------------------------- |
| `--hearth-ink`   | **Ink**   | `#1C1917` | Text, headings, strong borders, icons          |
| `--hearth-moss`  | **Moss**  | `#3F5E4A` | Primary buttons, links, active nav, focus ring |
| `--hearth-paper` | **Paper** | `#F3EFE6` | Page atmosphere / canvas                       |

Everything else is derived from these three (tints, washes, muted text). Do not introduce a fourth brand hue.

```
Ink  ████  #1C1917   type + structure
Moss ████  #3F5E4A   action + focus
Paper ████ #F3EFE6   room / background
```

### Mapping into shadcn tokens

| Semantic               | Source                                  |
| ---------------------- | --------------------------------------- |
| `--background`         | Paper (slightly lifted for readability) |
| `--foreground`         | Ink                                     |
| `--primary`            | Moss                                    |
| `--primary-foreground` | near-white paper                        |
| `--accent`             | Moss wash on Paper                      |
| `--muted-foreground`   | Ink at ~55%                             |
| `--border`             | Ink at ~12% on Paper                    |
| `--card`               | Paper lifted toward white               |
| `--ring`               | Moss                                    |

Destructive stays a restrained clay red for errors only — not a brand color.

---

## 3. Typography

| Role            | Face              | Notes                                         |
| --------------- | ----------------- | --------------------------------------------- |
| Display / brand | **Fraunces**      | Hero “Hearth”, page titles, big money figures |
| Body / UI       | **Source Sans 3** | Forms, nav, lists, labels                     |
| Mono            | Geist Mono        | Rare — codes, CSV hints                       |

Rules:

- Brand name is the loudest word on marketing/auth first viewport.
- Page title = one Fraunces line; supporting sentence = muted body.
- Money figures use Fraunces; labels use uppercase/small sans.

---

## 4. Atmosphere

- Light-first. No dark mode as default.
- Background: Paper canvas + soft moss radial at top-left + faint warm wash bottom — not flat gray, not purple gradient.
- Surfaces: hairline Ink borders, soft Paper lift — **not** heavy multi-shadow cards.
- Cards only when they wrap an interaction (form, list action). Prefer open sections otherwise.

---

## 5. Reusable primitives

| Component      | Path                                  | Job                                                               |
| -------------- | ------------------------------------- | ----------------------------------------------------------------- |
| `PageHeader`   | `components/design/page-header.tsx`   | Title + optional description + trailing slot (month picker, CTAs) |
| `Surface`      | `components/design/surface.tsx`       | Bordered paper panel for forms/lists                              |
| `StatTile`     | `components/design/stat-tile.tsx`     | Counter strip cell                                                |
| `FilterChip`   | `components/design/filter-chip.tsx`   | Calendar / Everyone / member filters                              |
| `FormPanel`    | `components/design/form-banner.tsx`   | Success / error inline messages                                   |
| `MoneyList`    | `components/design/money-list.tsx`    | Attributed entry rows + delete                                    |
| `SectionTitle` | `components/design/section-title.tsx` | In-page h2                                                        |
| `BrandMark`    | `components/design/brand-mark.tsx`    | Linked “Hearth” wordmark                                          |
| `EmptyHint`    | `components/design/empty-hint.tsx`    | Soft empty state                                                  |

Shell pieces (`WorkspaceShell`) consume these; pages prefer primitives over one-off class soup.

---

## 6. Motion (2–3 intentional)

1. **Enter** — `hearth-fade-up` on main page content (~280ms, ease-out).
2. **Nav active** — moss underline / wash, no bounce.
3. **Primary button** — soft brightness on hover; 1px press on active.

No continuous glow, no emoji reactions, no staggered chaos.

---

## 7. Layout rhythm

- App content max width: `max-w-5xl` (dashboard/month/statement), `max-w-3xl` (CRUD pages).
- Vertical gap: `gap-8` between page sections; `gap-3` inside surfaces.
- Sidebar: Paper-tinted, Ink wordmark, Moss active link.
- Mobile: brand header + horizontal moss-accent chips for primary routes.

---

## 8. Page recipes

### Marketing / auth

- Brand first (Fraunces hero).
- One headline or one supporting line — never overpower “Hearth”.
- Moss primary CTA, Ink outline secondary.
- Full-bleed paper atmosphere; no inset hero cards.

### Dashboard

- Hero remaining figure (Fraunces) on Surface.
- StatTile strip.
- Two-column category + bills; recent activity list.

### Money CRUD (income / expenses / …)

- PageHeader + MonthPicker.
- FilterChip row when filtering.
- Entry form in Surface.
- MoneyList below.

### Month

- CounterStrip of StatTiles.
- FilterChips for view + members.
- Calendar grid with moss-selected day; day panel Surface.

### Statement

- Print chrome hidden via `.no-print`.
- Table on white/paper Surface; Ink rules.

---

## 9. Do / Don’t

**Do**

- Stay in Ink / Moss / Paper
- Reuse primitives
- Keep Fraunces for brand + big numbers

**Don’t**

- Purple / indigo gradients
- Cream + terracotta “AI brochure” look
- Default Inter/Roboto stacks
- Dashboard clutter in the marketing hero
- Rounded-full pill spam outside filter chips
- Glow / multi-layer shadows

---

## 10. Definition of done (design pass)

1. CSS variables expose `--hearth-ink|moss|paper` and map into semantic tokens.
2. Primitives live under `src/components/design/`.
3. Shell, landing, auth, and all workspace pages use PageHeader / Surface / StatTile / FilterChip where applicable.
4. Lint + typecheck clean; visual smoke on `/`, `/login`, `/app/demo-home/dashboard`, `/month`, `/expenses`.
5. Commits follow [`DESIGN_COMMIT_PLAN.md`](./DESIGN_COMMIT_PLAN.md); no Cursor co-author trailers; no push until asked.
