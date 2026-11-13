# Hearth — Design Delivery Plan

Execution map for the visual system in [`DESIGN.md`](./DESIGN.md).

**Rules (same as product delivery)**

- Local only — no push until asked.
- Work on dedicated branches; merge into `main` with `--no-ff`.
- Atomic commits; no Cursor / AI co-author trailers.
- Author stays ArinJain machine identity.

---

## 1. Branches

```
main
├── docs/design-system          # DESIGN.md + this plan
├── design/tokens               # 3 colors → CSS variables
├── design/primitives           # reusable components
├── design/motion               # fade-up + button/nav motion
├── design/shell                # WorkspaceShell restyle
├── design/marketing-auth       # landing + login/register
├── design/app-surfaces         # dashboard, month, money pages
└── design/polish-pass          # statement/settings/alerts/members consistency
```

---

## 2. Commit ledger

### Docs (`docs/design-system`)

| # | Message |
|---|---------|
| D01 | `docs: add Hearth visual design system` |
| D02 | `docs: add design branch and commit plan` |

### Tokens (`design/tokens`)

| # | Message |
|---|---------|
| D03 | `style: lock Ink Moss Paper brand colors into CSS tokens` |
| D04 | `style: map brand trio into semantic theme variables` |

### Primitives (`design/primitives`)

| # | Message |
|---|---------|
| D05 | `feat(ui): add PageHeader BrandMark and SectionTitle` |
| D06 | `feat(ui): add Surface FormBanner and EmptyHint` |
| D07 | `feat(ui): add StatTile FilterChip and MoneyList` |

### Motion (`design/motion`)

| # | Message |
|---|---------|
| D08 | `style: add hearth fade-up and soft interaction motion` |

### Shell (`design/shell`)

| # | Message |
|---|---------|
| D09 | `feat(ui): restyle workspace shell with Moss active nav` |

### Marketing / auth (`design/marketing-auth`)

| # | Message |
|---|---------|
| D10 | `feat(ui): redesign landing hero on Paper atmosphere` |
| D11 | `feat(ui): restyle auth layout and forms` |

### App surfaces (`design/app-surfaces`)

| # | Message |
|---|---------|
| D12 | `feat(ui): apply design primitives to dashboard and counters` |
| D13 | `feat(ui): restyle month calendar and money CRUD pages` |

### Polish (`design/polish-pass`)

| # | Message |
|---|---------|
| D14 | `feat(ui): align statements members settings and alerts` |
| D15 | `chore: wire EntryForm and bills forms onto Surface` |

Merge each branch → `main` in order after its commits.

---

## 3. Checklist

- [ ] merge `docs/design-system`
- [ ] merge `design/tokens`
- [ ] merge `design/primitives`
- [ ] merge `design/motion`
- [ ] merge `design/shell`
- [ ] merge `design/marketing-auth`
- [ ] merge `design/app-surfaces`
- [ ] merge `design/polish-pass`
- [ ] Local visual smoke
- [ ] Push only when asked
