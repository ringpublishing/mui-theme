# ADR 004 — MUI Module Augmentation: Category A vs Category B

- **Status:** Accepted
- **Date:** 2026-05-09
- **Supersedes:** —
- **Superseded by:** —

## Summary (TL;DR)

In the Ring project, TypeScript augmentations of MUI modules **fall into two categories** that behave **differently** in cross-package consumption:

| Category | What it augments | Cross-package? |
|-----------|------------------|----------------|
| **A** — root module | `Theme`, `Palette`, `CommonColors` in `@mui/material` / `@mui/material/styles` | ✅ propagates |
| **B** — sub-module | `*PropsVariantOverrides`, `*PropsColorOverrides` in `@mui/material/<Component>` (Button, Paper, Typography, IconButton...) | ❌ does not propagate under `node16` |

Category A → declare **only** in theme.lib, consumers inherit automatically.

Category B → declare in theme.lib (canonical, for in-repo usages: tests and `components.custom.ts`) **plus** require a local mirror in consumer libraries (e.g. ring-ui-components). Without the mirror, TypeScript `<Button color="contrast">` in the consumer library ends up with a type error even though theme.lib declares it.

This is a **pragmatic decision** forced by a TypeScript module resolution quirk under `moduleResolution: "node16"` in consumer libraries using the Ring RAS ESM preset (e.g. ring-ui-components). `bundler` resolution solves the problem — but that is a separate organizational decision we are not making today.

## Context

Ring extends MUI interfaces for two reasons:

1. **Ring brand fields in the Theme object** — `theme.palette.contrast`, `theme.palette.components.X`, `theme.colors.red[600]`, `theme.getSpacing(2)` etc. These fields are used everywhere in ring-ui-components and at consumers (via `sx`, `styled()`, `useTheme()`).

2. **Custom JSX prop values for MUI components** — `<Typography variant="label">`, `<Paper variant="borderless">`, `<Button color="contrast">`, `<IconButton color="contrast">`. These variants exist at runtime (defined in `theme.components.MuiX.variants` or `theme.palette.contrast`), but TS does not know about them without augmentation.

Both categories are declared via `declare module '...' { interface X { ... } }`. The syntax is identical. **But they behave differently.**

During a refactor we noticed: identical `declare module` blocks in `src/theme/config/augmentation.core.ts` propagate to ring-ui-components for `theme.palette.contrast`, but **do not** propagate for `<Button color="contrast">`. After empirically testing five strategies (side-effect import, `export *`, triple-slash, value-level marker re-exports, dedicated sub-entry) — none worked for the second category under node16. **Only** a local re-declaration in the consumer library works stably.

This is a **TypeScript quirk** in the combination `moduleResolution: "node16"` + sub-module augmentation of MUI with `OverridableStringUnion`-based registry. Under `moduleResolution: "bundler"` (TS 5.0+) everything works — but this requires changing the RAS ESM preset used by consumer libraries, which is outside the scope of this decision.

## Decision

### Rule for writing augmentations in Ring

**Augmenting `theme.X.Y`** (the runtime Theme object structure) → **declare only in theme.lib** (`src/theme/config/augmentation.core.ts` or `src/theme/config/<version>/augmentation.ts`). Consumers inherit.

**Augmenting `<Component prop="X">`** (JSX prop registry) → **declare in theme.lib** (canonical, for usages within this repo: tests, `components.custom.ts`) **plus** require a local mirror in each consumer library (e.g. ring-ui-components has `src/theme/muiAugmentation.ts`).

### Decision schema — flowchart

```
What are you augmenting?
│
├─ A field in Theme/Palette/CommonColors/TypeAction? (e.g. theme.colors)
│  → Category A
│  → declare module '@mui/material' / '@mui/material/styles' / '@mui/material/esm/styles'
│  → theme.lib ALONE is sufficient
│
├─ theme.spacing() overload hints?
│  → Category A
│  → declare module '@mui/system'
│  → theme.lib ALONE is sufficient
│
└─ A JSX prop value of a Component? (e.g. variant="label", color="contrast")
   → Category B
   → declare module '@mui/material/<Component>'
   → theme.lib (canonical) + LOCAL MIRROR in consumer libraries
```

## Mechanisms explained — new or non-obvious

### 1. What is `declare module` in TypeScript

`declare module 'X' { interface Y { ... } }` is **module augmentation** — a TS pattern that says: "take the existing module X and add something to its type declarations". The augmentation is **merged**, not overwritten.

The MUI source file has:
```ts
// node_modules/@mui/material/Typography/Typography.d.ts
export interface TypographyPropsVariantOverrides {}   // empty placeholder
```

Your `declare module` appends:
```ts
// theme.lib/src/theme/config/reference/augmentation.ts
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
        headline1: true;
        headline2: true;
        headline3: true;
    }
}
```

TS merges both declarations into one interface. After augmentation, `TypographyPropsVariantOverrides` contains the keys `label`, `headline1-3`.

### 2. Why MUI has "Overrides" interfaces — the `OverridableStringUnion` pattern

MUI defines `<Typography variant>` as:

```ts
// @mui/material/Typography/Typography.d.ts (simplified)
type TypographyVariant = 'h1' | 'h2' | 'body1' | 'body2' | /* ... */;

interface TypographyProps {
    variant?: OverridableStringUnion<
        'inherit' | TypographyVariant,
        TypographyPropsVariantOverrides     // ← custom variants registry
    >;
}
```

`OverridableStringUnion<Default, Overrides>` is a MUI utility:
- takes union `Default` (`'h1' | 'h2' | ...`)
- merges it with `Overrides` (your registry)
- **keeps keys whose value type is compatible with `true`**

When you add `interface TypographyPropsVariantOverrides { label: true }`, MUI expands the union to `'h1' | 'h2' | ... | 'label'`. Hence `<Typography variant="label">` passes the type check.

**Why `: true`** — MUI includes override keys whose value type satisfies `true extends T[Key]`. Use `label: true` for "marker present". Values such as `label: false`, `label: 42` or `label: 'whatever'` are not equivalent; `false` can remove defaults and arbitrary values are ignored by the generated string union.

### 3. Late binding (Category A) vs eager binding (Category B)

This is **key** to understanding the difference in propagation.

**Category A** (Theme/Palette properties) — late binding:

```ts
const theme: Theme = ...;
theme.palette.contrast.main;     // ← TS resolves the "contrast" property HERE
```

At this moment TS looks at the **full augmentation state** in the program. If `augmentation.core.d.ts` was loaded at any point earlier (e.g. because the consumer imports a `Theme` value-level from theme.lib), the augmentation applied to the `Palette` interface. Property access works.

**Category B** (JSX prop registry) — eager binding:

```tsx
<Typography variant="label" />   // ← TS resolves the type of prop "variant" HERE
```

The type of prop `variant` is defined in `@mui/material/Typography/Typography.d.ts`:

```ts
variant?: OverridableStringUnion<TypographyVariant, TypographyPropsVariantOverrides>;
```

`OverridableStringUnion` is a **conditional type** — it expands **at the point of use**. When a consumer in an external library writes `<Typography>`, TS resolves `TypographyProps` from `@mui/material/Typography`. The **sub-module augmentation** from theme.lib contained in `node_modules/@ringpublishing/mui-theme/dist/.../augmentation.core.d.ts` should be in the consumer's program through the side-effect import chain — but **is not always** under node16.

### 4. Second dimension — which module we augment

Regardless of the binding mechanism, the **target module** also matters:

| Augmentation target module | Does the consumer import the target | Cross-package |
|---|---|---|
| `@mui/material` (root) | ✅ Yes — via `import { Theme } from '@mui/material'` | ✅ |
| `@mui/material/styles` (sub-module) | ⚠️ Sometimes — via `import { ThemeProvider } from '@mui/material/styles'` | ✅ when the matching shared interface is augmented |
| `@mui/material/Button` (sub-module) | ❌ No — `<Button>` comes through re-export from `@mui/material` | ❌ |
| `@mui/material/Typography` | ❌ | ❌ |
| `@mui/material/Paper` | ❌ | ❌ |
| `@mui/material/IconButton` | ❌ | ❌ |

When a consumer imports `<Button>`, it goes through root `@mui/material`. The sub-module `@mui/material/Button` containing `ButtonPropsColorOverrides` is not **directly** touched by consumer code — TS pulls it indirectly. Augmentation of that sub-module from theme.lib pulled via the side-effect chain **does not** reach the consumer's program stably under node16.

**Key question**: why does MUI not declare `ButtonPropsColorOverrides` also in `@mui/material` (root)? Because they adopted a per-module pattern. `Theme`, `Palette`, `CommonColors` are exposed through multiple MUI entry points (`@mui/material`, `@mui/material/styles`, and the ESM styles path). Ring declares the same shared interfaces in every entry point used by consumers; do not rely on augmenting only one module. `ButtonPropsColorOverrides` is not covered by that shared-type pattern.

## Before/after examples — concrete, working snippets

### Category A — works cross-package

**Theme.lib declaration**:

```ts
// theme.lib/src/theme/config/augmentation.core.ts
declare module '@mui/material' {
    interface Palette {
        contrast: PaletteColor;          // adding property
        components: PaletteComponentsMap;
    }
    interface Theme {
        colors: Colors;
        getSpacing: GetSpacing;
    }
}
```

**Consumer in an external library** (e.g. ring-ui-components):

```ts
import { useTheme } from '@mui/material/styles';

const Component = () => {
    const theme = useTheme();
    const color = theme.palette.contrast.main;       // ✅ TS sees the field
    const space = theme.getSpacing(2);                // ✅ TS sees the method
    return <Box sx={{ bg: theme.colors.red[600] }} />; // ✅ TS sees colors
};
```

**Everything works** without a local re-declaration.

### Category B — does NOT work cross-package

**Theme.lib declaration**:

```ts
// theme.lib/src/theme/config/augmentation.core.ts
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;                  // adding key to registry
    }
}
```

**Consumer in an external library** — without a local mirror:

```tsx
import { Button } from '@mui/material';

<Button color="contrast">CTA</Button>
// ❌ TS error TS2769:
//    Type '"contrast"' is not assignable to type
//    'OverridableStringUnion<"primary" | "secondary" | ...,
//                            ButtonPropsColorOverrides>'.
```

**The consumer MUST add a local mirror**:

```ts
// ring-ui-components/src/theme/muiAugmentation.ts
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;
    }
}
```

After adding the mirror — it works. This mirrors the **same declaration keys/signatures** from theme.lib.

## What we tested empirically (and what did not work)

Five strategies for attempting cross-package propagation of Category B under `moduleResolution: "node16"`:

| Strategy | Description | Result |
|---|---|---|
| Historical side-effect import of built barrel | `import '@ringpublishing/mui-theme/dist/theme/themeAugmentation'` in consumer (not a public export) | ❌ |
| `export *` from augmentation | Change `import './x'` to `export * from './x'` in `themeAugmentation.ts` | ❌ |
| Triple-slash directive | `/// <reference types="@ringpublishing/mui-theme/themeAugmentation" />` in consumer (no public sub-entry today) | ❌ |
| Value-level marker re-exports | `export const __marker = true` in augmentation + value import in consumer | ❌ |
| Dedicated sub-entry `/themeAugmentation` | Exposing augmentation as a separate entry in `package.json exports` | ❌ |

All returned the same ~23 type errors `Type '"contrast"' is not assignable to ...PropsColorOverrides`. **Only** a local re-declaration in the consumer library solved the problem.

Under `moduleResolution: "bundler"` (TS 5.0+) — propagation **works** for both categories. But switching consumer libraries from the RAS ESM preset's `node16` resolution to bundler resolution requires an audit of the impact on other aspects (extension requirements in imports, exports field gating) and is an organizational decision at Ring.

## Map: where things live today

### In theme.lib (canonical declarations)

`src/theme/config/augmentation.core.ts`:

**Category A**:
- `Palette { components, contrast, common, _native }`
- `PaletteOptions { ... }`
- `Theme { locale, colors, typographyMode, getSpacing, getBorderRadius }`
- `ThemeOptions { ... }`
- `CommonColors { grey }`
- `TypeAction { focusVisibleOpacity, outlinedBorderOpacity }`
- `Spacing` overloads (`@mui/system` only)
- `Theme`/`Palette`/`CommonColors`/`TypeAction` are repeated in `@mui/material`, `@mui/material/styles`, `@mui/material/esm/styles` per MUI entry-point usage

**Category B**:
- `ButtonPropsColorOverrides { contrast }`
- `IconButtonPropsColorOverrides { contrast }`
- `PaperPropsVariantOverrides { borderless }`

`src/theme/config/reference/augmentation.ts`:

**Category A**:
- `TypographyVariants { label, headline1-3 }` (as CSSProperties — types runtime style definitions)
- `TypographyVariantsOptions { ... }`

**Category B**:
- `TypographyPropsVariantOverrides { label, headline1-3 }`

### In ring-ui-components (Category B mirror)

`src/theme/muiAugmentation.ts` (separate dedicated file):

```ts
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
        headline1: true;
        headline2: true;
        headline3: true;
    }
}

declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        borderless: true;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;
    }
}

declare module '@mui/material/IconButton' {
    interface IconButtonPropsColorOverrides {
        contrast: true;
    }
}
```

All 4 declarations keep the **same keys/signatures** as the theme.lib canonical ones; comments/JSDoc may differ. Every change in theme.lib (Category B) requires an update in **two places** — see "Synchronization rule" in ring-ui-components ADR-007.

## Consequences

- **Drift risk** for Category B — augmentation in theme.lib and mirror in ring-ui-components can diverge. Mitigation: explicit comment in both files + rule in PR review. Plus: the Category B list is short (4 augmentations today), drift is easy to notice.
- **Scaling** — when a new Category B arrives (e.g. `<Chip variant="ringFlat">` in the future), it requires an update in both places. Workflow: theme.lib (canonical) + ring-ui-components mirror — one commit per repo, two PRs, but logically one change.
- **Apps using theme.lib directly (without ring-ui-components)** — must add local `declare module` for Category B in their source. Inconvenient, but: a) we have few such apps, b) consistent with "consumer opt-in" model for MUI X (per ADR-003), c) the alternative is TS bundler resolution which defers the decision.
- **Future direction** — when/if Ring decides to switch consumer libraries from the RAS ESM preset's `node16` resolution to `moduleResolution: "bundler"`, Category B will propagate cross-package and mirrors will become unnecessary. Removing the mirror augmentation from consumers is sufficient. A migration path exists — awaiting an organizational decision.
