# ADR 003 — Sub-entry `/mui-x` as opt-in MUI X integration

- **Status:** Accepted
- **Date:** 2026-05-09
- **Supersedes:** —
- **Superseded by:** —

## Summary (TL;DR)

`@ringpublishing/mui-theme` no longer forces a dependency on MUI X. Apps without DataGrid / DatePickers import from the root entry (`@ringpublishing/mui-theme`) and have **zero** MUI X code in their bundle. Apps using MUI X add a **second import** (`@ringpublishing/mui-theme/mui-x`) — explicit opt-in. MUI X in `peerDependencies` is marked as `optional`, so `npm install` does not force installation for consumers who do not need it.

## Context

Before this change, `@ringpublishing/mui-theme` internally imported MUI X (`@mui/x-data-grid-pro/locales`, `@mui/x-date-pickers/locales`) for the purposes of `getTheme()` — especially for:

- **MUI X locales** — Polish/English translations of DataGrid and DatePickers injected via `createTheme(theme, ...locales)`
- **`ringDataGridOverrides`** — Ring branding for `<DataGrid>` (border:none, hover cursor, hidden footer by default, header color from Ring palette)

The result: every theme consumer — **regardless of whether they used MUI X** — pulled this data into their bundle. `peerDependencies` contained `@mui/x-data-grid-pro` and `@mui/x-date-pickers` as required, so `npm install` fetched MUI X packages for everyone, even apps that only rendered `<Button>` and `<Typography>`.

### Pain points

**1. Bundle bloat for apps without MUI X.** ~100 KB gzip overhead from MUI X packages despite zero real use. For small apps (dashboard prototypes, embedded widgets) this was 20–40% of the initial bundle.

**2. MUI X Pro license requirement.** `@mui/x-data-grid-pro` and `@mui/x-date-pickers-pro` are **commercial** packages. A theme consumer (even without DataGrid) needed a license key — which was unnecessary bureaucracy for internal tools and simple apps.

**3. Tight coupling.** "Ring brand colors + typography" was coupled to "Ring DataGrid styling" — two orthogonal responsibilities in a single package.

**4. Inconsistency with MUI convention.** MUI core (`@mui/material`) does **not** import MUI X — the relationship is the other way around. MUI X builds on core. Our theme broke this dependency direction.

## Decision

**We introduce sub-entry `@ringpublishing/mui-theme/mui-x`** for MUI X helpers. The core entry (`@ringpublishing/mui-theme`) becomes **MUI-X-agnostic** — no MUI X code is imported there.

MUI X `peerDependencies` are marked `peerDependenciesMeta: { optional: true }` — npm only shows a warning on absence, installation proceeds. The app decides on its own whether it needs MUI X.

## Mechanisms explained — new to Ring

### 1. `package.json` `exports` map

Until now Ring used only one entry per package (`main` + `types`). A sub-entry is a new technique. It works via the **`exports` field** in `package.json`:

```json
{
    "main": "dist/index.js",
    "types": "dist/index.d.ts",
    "exports": {
        ".": {
            "types": "./dist/index.d.ts",
            "default": "./dist/index.js"
        },
        "./mui-x": {
            "types": "./dist/theme-mui-x/index.d.ts",
            "default": "./dist/theme-mui-x/index.js"
        }
    }
}
```

`"."` is the root entry (`@ringpublishing/mui-theme`). `"./mui-x"` is the sub-entry (`@ringpublishing/mui-theme/mui-x`). Each points to a **different** file on disk. The consumer decides via the path literal — the bundler/Node resolves according to the `exports` map.

**Why `main` is not enough** — because then everything goes through one file. Every import from the package, regardless of what the consumer takes, loads all contained code (modulo tree-shaking, but tree-shaking is not enough when there are side effects).

**What we gain** — Node 16+ resolution honors the `exports` map **strictly**: a deep import such as `@ringpublishing/mui-theme/dist/internal/x` is **blocked** unless we declare it in `exports`. This both encapsulates internals and allows exposing a controlled sub-entry.

### 2. `peerDependenciesMeta: { optional: true }`

Classically a peer dep is **required** — `npm install` warns and treats the absence as an error. `optional: true` changes the contract: "this peer may be uninstalled, npm warns informatively only, does not block".

```json
"peerDependencies": {
    "@mui/material": "^7.0.0",                  // ← required (theme is based on MUI core)
    "@mui/x-data-grid-pro": "^8.0.0",           // ← optional
    "@mui/x-date-pickers": "^8.0.0",            // ← optional
    "@mui/x-date-pickers-pro": "^8.0.0"         // ← optional
},
"peerDependenciesMeta": {
    "@mui/x-data-grid-pro": { "optional": true },
    "@mui/x-date-pickers": { "optional": true },
    "@mui/x-date-pickers-pro": { "optional": true }
}
```

An app that imports **only** `@ringpublishing/mui-theme` (root entry) can have MUI X uninstalled — no theme code reaches MUI X. An app that imports `@ringpublishing/mui-theme/mui-x` must have MUI X — without it the import fails with `Cannot find module '@mui/x-data-grid-pro/locales'`. Fail loudly, intentionally.

### 3. Compile-time requirements in theme.lib

For `tsc` in theme.lib to **compile** the file `src/theme-mui-x/index.ts` (which imports from `@mui/x-data-grid-pro/locales`), we added MUI X to `devDependencies` of theme.lib:

```json
"devDependencies": {
    "@mui/x-data-grid-pro": "^8.0.0",
    "@mui/x-date-pickers": "^8.0.0",
    "@mui/x-date-pickers-pro": "^8.0.0",
    ...
}
```

The theme.lib build has MUI X available (resolve types during dist emit). The **consumer** only sees `peerDependencies` — theme.lib devDeps do not affect the consumer.

## Before/after examples

### Before — everyone pays

```ts
// In ANY APP — regardless of whether it uses MUI X:
import { ThemeConfig } from '@ringpublishing/mui-theme';

<ThemeConfig mode="light" language="plPL">
    <App />
</ThemeConfig>
```

**Bundle**: contains `@mui/x-data-grid-pro/locales` + `@mui/x-date-pickers/locales` + `ringDataGridOverrides` runtime. ~100 KB gzip overhead.

**`npm install`**: requires `@mui/x-data-grid-pro`, `@mui/x-date-pickers` installed (required peer dep).

### After — opt-in

**App without MUI X** (e.g. dashboard using only Buttons + forms):

```ts
import { ThemeConfig } from '@ringpublishing/mui-theme';

<ThemeConfig mode="light" language="plPL">
    <App />
</ThemeConfig>
```

**Bundle**: core only (palette, typography, breakpoints, shape, spacing, Ring component overrides without DataGrid). ~30 KB gzip.

**`npm install`**: warning "missing peer @mui/x-data-grid-pro" (informational, does not block). The app does not install MUI X at all.

**App with MUI X** — opt-in via a second import:

```ts
import { ThemeConfig } from '@ringpublishing/mui-theme';
import { ringDataGridOverrides, getMuiXLocales } from '@ringpublishing/mui-theme/mui-x';

<ThemeConfig
    mode="light"
    language="plPL"
    externalLocales={getMuiXLocales('plPL')}
    themeOverrides={{ components: ringDataGridOverrides }}
>
    <App />
</ThemeConfig>
```

**Bundle**: core + MUI X helpers. ~130 KB gzip.

**`npm install`**: standard, MUI X peer deps must be installed (because of the direct import).

## What the sub-entry contains

`src/theme-mui-x/index.ts` exports **two** things:

```ts
// 1. Ring DataGrid styling (border:none, hover cursor, etc.)
export const ringDataGridOverrides = {
    MuiDataGrid: {
        defaultProps: { hideFooter: true },
        styleOverrides: {
            root: ({ theme }) => ({
                '& .MuiDataGrid-row:hover': { cursor: 'pointer' },
                'border': 'none',
                // ...
            })
        }
    }
};

// 2. Locale stack — core + DataGrid + DatePickers (order required by createTheme)
export function getMuiXLocales(language) {
    return [
        coreLocale,           // @mui/material/locale
        xDataGridLocale,      // @mui/x-data-grid-pro/locales
        xDatePickersLocale    // @mui/x-date-pickers/locales
    ];
}
```

Plus it activates MUI X type augmentations (`@mui/x-data-grid/themeAugmentation`, `@mui/x-date-pickers/themeAugmentation`) — without these, TS does not know the key `MuiDataGrid` in `theme.components`, meaning `themeOverrides.components.MuiDataGrid` would be a type error.

## Why not a separate package

We considered `@ringpublishing/mui-theme-mui-x` as a separate npm package. Rejected:

| Aspect | Sub-entry (chosen) | Separate package |
|---|---|---|
| Version synchronisation | Trivial — one package, one release | Two packages — version bump in both, risk of skew |
| CI/CD setup | Unchanged | Additional `package.json`, release pipeline, npm publish |
| Discoverability for consumer | One npm search → sees sub-entry in docs | Two npm searches, easy to miss the connection |
| Coupling | Tight (sub-entry knows theme internals) | Loose (separate packages, clear API contract) |
| Migration path | Adding sub-entry — non-breaking | Requires refactor at consumers (import changes) |

Loose coupling of a separate package is overkill for our use case (both pieces evolve together, we would never change them independently). Sub-entry gives 90% of the benefits (opt-in bundle separation) at 10% of the cost.

## Consequences

- **Smaller bundle for apps without MUI X** — ~100 KB gzip savings.
- **MUI X apps explicitly opt in** — a second import. Some boilerplate, but acceptable (one-time in theme setup).
- **ring-ui-components automatically includes the sub-entry** — because it already uses MUI X internally (DataGridToolbar, date pickers). ring-ui-components consumers see no difference — the `<ThemeConfig>` wrapper from ring-ui-components plugs in `ringDataGridOverrides` + `getMuiXLocales` automatically. See ring-ui-components ADR-007 (themeconfig passthrough and MUI X integration).
- **Apps using theme.lib directly (without ring-ui-components) need to know about the sub-entry** — requires an update to their code if they want Ring DataGrid styling. Migration guide in README.
- **MUI X versioning is the consumer's responsibility** — theme.lib declares a range in `peerDependencies` (`^8.0.0`), the consumer decides on the specific version. This is the standard MUI pattern.
- **`devDependencies` of theme.lib contains MUI X** (for the build). Does not affect the consumer.
