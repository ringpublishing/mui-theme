# Theme config — maintainer cheatsheet

## Two layers

| Layer | Location | Who generates |
|---|---|---|
| Per-version tokens | `config/reference/` · `config/next/` | Figma plugin (`ring-ui-mui-figma-plugin`) — export manually from `VersionedExportTab` |
| Shared / manual | `actionOpacities.ts` · `augmentation.core.ts` · `colors.ts` · `components.custom.ts` | Edit by hand |

---

## Where to change what

| What | File |
|---|---|
| `palette.primary.main` | Figma → regen `config/<version>/palette.generated.ts` |
| `palette.action.*Opacity` | `actionOpacities.ts` |
| `shape.borderRadius` | `config/<version>/shape.generated.ts` |
| `breakpoints.values.*` | `config/<version>/breakpoints.generated.ts` |
| `typography.h1.*` | `config/<version>/typography.generated.ts` |
| `spacing` / `getSpacing()` | `config/<version>/spacing.generated.ts` |
| `theme.colors.*` (Ring brand) | `colors.ts` |
| `MuiButton.styleOverrides` etc. | `components.custom.ts` (factory `buildRingComponents`) |
| New TS field on `Theme` (both versions) | `augmentation.core.ts` |
| New TS field only in `next` | `config/next/augmentation.ts` |

---

## Adding a new field — required triple

1. **TS augmentation** — `augmentation.core.ts` (both versions) or `config/<version>/augmentation.ts`
2. **Value source** — shared file or `*.generated.ts` from the plugin
3. **Consumption** — register in `theme.tsx`

---

## Key differences: `reference` vs `next`

| | `reference` | `next` |
|---|---|---|
| `primary.main` | `#00A7EE` (Ring brand) | `#1976D2` (MUI default) |
| `palette.grey` | none | full MD scale |
| `spacing` | flat array | function + `spacingBase`/`spacingScale`/`SpacingFactor` |
| `shape` | `{ borderRadius: 4 }` | `+ none: 0` |
| `typography` | Arial, Ring legacy | Roboto + Ring custom |

`reference` = backwards-compatibility mode. `next` = current.
