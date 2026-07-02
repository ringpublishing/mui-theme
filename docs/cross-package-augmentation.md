# Cross-package augmentation — where to declare and why

## TL;DR

In the Ring project there are **two locations** where we declare MUI module augmentations:

1. **theme.lib** (`@ringpublishing/mui-theme`) — the canonical source of truth
2. **ring-ui-components** (`@ringpublishing/ui-components`) — a local mirror for selected declarations

A developer needs to know **which location is sufficient in a given case**, because TypeScript behaves **differently** depending on **what is being augmented**.

## Two augmentation categories

### Category A — "Theme object" augmentations

These extend interfaces from the **root module** `@mui/material` (or `@mui/material/styles`):

```ts
declare module '@mui/material' {
    interface Palette {
        components: PaletteComponentsMap;
        contrast: PaletteColor;
    }
    interface Theme {
        colors: Colors;
        getSpacing: GetSpacing;
    }
    interface CommonColors {
        grey: string;
    }
}
```

Goal: add a field to a type that consumers use **via property access**:

```ts
theme.palette.contrast.main
theme.colors.red[600]
theme.getSpacing(2)
```

These **do propagate across package boundaries** ✅. A single declaration in theme.lib serves **all consumers** (ring-ui-components and apps that use theme.lib directly).

### Category B — "JSX prop registry" augmentations

These extend interfaces from **sub-modules** `@mui/material/<Component>`:

```ts
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
        headline1: true;
    }
}
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;
    }
}
declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        borderless: true;
    }
}
```

Goal: extend the union of strings allowed as **a JSX prop value**:

```tsx
<Typography variant="label">
<Button color="contrast">
<Paper variant="borderless">
```

These **do not propagate across package boundaries** under `moduleResolution: "node16"` ❌. Every consumer **must ship its own local declaration** in its compilation unit.

## Where the difference comes from

### TypeScript mechanics

| Aspect | Category A | Category B |
|---|---|---|
| Augmented module | `@mui/material` (root) | `@mui/material/Button` (sub-module) |
| Augmented interface | `Theme`, `Palette` (declared by MUI in both root and styles) | `ButtonPropsColorOverrides` (declared **only** in the sub-module) |
| Expansion mechanism | Late binding during property access | Eager binding inside `OverridableStringUnion<...>` when resolving a JSX prop |
| Cross-package side-effect import in `.d.ts` | TypeScript pulls the file early enough | TypeScript pulls the file too late or never |

When a consumer executes `theme.palette.contrast.main`, TypeScript resolves `Palette` at the moment of the property access — all augmentations are already in the program. It works.

When the consumer writes `<Button color="contrast">`, TypeScript expands `OverridableStringUnion<DefaultColors, ButtonPropsColorOverrides>` while resolving the JSX prop. That happens immediately when `@mui/material/Button.d.ts` is loaded. The augmentation from theme.lib (`node_modules/@ringpublishing/mui-theme/dist/...`) is **not yet** part of the consumer program — TypeScript has not pulled it in via the side-effect import chain. The union expands **without** the Ring additions, yielding a type-check error.

### Why MUI does not help

MUI exposes shared theme interfaces through multiple entry points (`@mui/material`, `@mui/material/styles`, and the ESM styles path). Ring declares the same shared interfaces in every entry point used by consumers; we do not assume augmenting a single module is enough.

`ButtonPropsColorOverrides` is declared by MUI **only** in the sub-module `@mui/material/Button`. There is no duplicate in the root entry, which means the augmentation must target **exactly** that sub-module to work.

## Rule of thumb for writing augmentations in Ring

### Augmenting `theme.X.Y` (the runtime shape of the Theme object)

Declare it in **theme.lib** (`src/theme/config/augmentation.core.ts` or `src/theme/config/<version>/augmentation.ts`).

Consumers inherit it automatically. **No duplication.**

Examples:
- `theme.palette.contrast` (PaletteColor)
- `theme.palette.components.X` (custom component palettes)
- `theme.colors.red[600]` (full Ring color scale)
- `theme.getSpacing(2)` (strict Ring spacing API)
- `theme.typography.headline1` (Ring-specific typography variants as CSS objects — root module augmentation `TypographyVariants`)

### Augmenting `<Component prop="X">` (custom variant/color in JSX)

Declare it in **two places**:

1. **theme.lib** (`src/theme/config/<file>.ts`) — the canonical declaration used by:
   - theme.lib tests
   - `components.custom.ts` (e.g. `MuiPaper.variants[].props: { variant: 'borderless' }`)

2. **ring-ui-components** (`src/theme/muiAugmentation.ts`) — the local mirror needed for TypeScript propagation to ring-ui-components consumers.

Apps that use theme.lib **directly** (without ring-ui-components) must add **their own** local declaration in a `.d.ts` file or a source file.

## Alternative: `moduleResolution: "bundler"`

Empirically we verified that under `moduleResolution: "bundler"` (TS 5.0+) augmentations of **both** categories propagate across packages. Bundler resolution is less restrictive when pulling files from `node_modules`.

| Resolution | Category A propagation | Category B propagation |
|---|---|---|
| `node16` / `nodenext` | ✅ | ❌ |
| `bundler` (TS 5.0+) | ✅ | ✅ |

**Why we do not switch to bundler resolution today:**

1. Consumer libraries such as ring-ui-components use the RAS ESM preset with `node16` resolution.
2. Ring repositories compile to packages distributed via npm — `node16` resolution better matches how consumers run the package in Node environments.
3. Switching the resolution requires auditing the impact on other aspects (extension requirements, exports field gating).
4. The regression risk is not offset by the benefit (we would only save ~20 lines of local mirror code in a single file).

**When a switch could be justified:**
- You add a new Category B augmentation and maintaining the mirror becomes painful.
- The RAS preset gets updated to `bundler` (organizational decision).
- There is a need for "zero mirror" cross-package propagation (e.g. for apps consuming theme.lib directly).

## Where things live today

### In theme.lib

[`src/theme/config/augmentation.core.ts`](../src/theme/config/augmentation.core.ts):

**Category A (propagate cross-package, declared only here):**
- `Palette { components, contrast, common, _native }`
- `PaletteOptions { ... }`
- `Theme { locale, colors, typographyMode, getSpacing, getBorderRadius }`
- `ThemeOptions { ... }`
- `CommonColors { grey }`
- `TypeAction { focusVisibleOpacity, outlinedBorderOpacity }`
- `Spacing` overloads (only `@mui/system`)
- `Theme`/`Palette`/`CommonColors`/`TypeAction` are duplicated in `@mui/material`, `@mui/material/styles`, and `@mui/material/esm/styles` following the MUI entry points we rely on.

**Category B (canonical declarations, also mirrored in ring-ui-components):**
- `ButtonPropsColorOverrides { contrast }`
- `IconButtonPropsColorOverrides { contrast }`
- `PaperPropsVariantOverrides { borderless }`

[`src/theme/config/reference/augmentation.ts`](../src/theme/config/reference/augmentation.ts):

**Category A:**
- `TypographyVariants { label, headline1-3 }` (as `CSSProperties`)
- `TypographyVariantsOptions { ... }`
- (repeated in all three modules)

**Category B:**
- `TypographyPropsVariantOverrides { label, headline1-3 }` (canonical)

### In ring-ui-components

[`src/theme/muiAugmentation.ts`](../../ring-ui-components/src/theme/muiAugmentation.ts):

**Category B mirror (needed for TypeScript propagation to ring-ui-components consumers):**
- `TypographyPropsVariantOverrides { label, headline1-3 }`
- `PaperPropsVariantOverrides { borderless }`
- `ButtonPropsColorOverrides { contrast }`
- `IconButtonPropsColorOverrides { contrast }`

All four declarations keep **the same keys/signatures** as theme.lib; comments/JSDoc can differ. Every change requires updates in **both places** (theme.lib canonical + ring-ui-components mirror).

## Workflow for adding a new augmentation

### Scenario 1: a new field in Theme/Palette (e.g. `theme.palette.brand`)

1. Edit `theme.lib/src/theme/config/augmentation.core.ts`.
2. Add the field to `interface Palette { ... }` in **all three** declare-module blocks (`@mui/material`, `@mui/material/styles`, `@mui/material/esm/styles`).
3. Build and publish the theme package.
4. Consumers automatically see `theme.palette.brand` after updating the package.

**Number of touch points:** one file, three blocks inside.

### Scenario 2: a new custom JSX variant/color (e.g. `<Chip variant="ringFlat">`)

1. Edit `theme.lib/src/theme/config/augmentation.core.ts` (or the version-specific file):
   ```ts
   declare module '@mui/material/Chip' {
       interface ChipPropsVariantOverrides {
           ringFlat: true;
       }
   }
   ```
2. Add runtime styling in `theme.lib/src/theme/config/components.custom.ts`:
   ```ts
   MuiChip: {
       variants: [
           { props: { variant: 'ringFlat' }, style: { ... } }
       ]
   }
   ```
3. Build and publish the theme package.

4. **Edit `ring-ui-components/src/theme/muiAugmentation.ts`** — add a `declare module` block with the same keys/signatures beneath the existing mirrors:
   ```ts
   declare module '@mui/material/Chip' {
       interface ChipPropsVariantOverrides {
           ringFlat: true;
       }
   }
   ```
5. Build/publish ring-ui-components.

**Number of touch points:** two files in theme.lib + one file in ring-ui-components.

### Scenario 3: an app wants `<Button color="ringPro">` (custom outside Ring branding)

This is **app-specific**, not Ring branding. The consumer declares it locally:

```ts
// app/src/types/mui-augmentation.d.ts
declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        ringPro: true;
    }
}
```

Add runtime styling — for example via `themeOverrides` in `<ThemeConfig>`:

```tsx
<ThemeConfig
    themeOverrides={{
        components: {
            MuiButton: {
                variants: [
                    { props: { color: 'ringPro' }, style: { ... } }
                ]
            }
        }
    }}
>
```

theme.lib and ring-ui-components remain untouched.

## Anti-patterns / gotchas

### ❌ Do not declare `*PropsXOverrides` in `declare module '@mui/material'`

```ts
// This will NOT work:
declare module '@mui/material' {
    interface ButtonPropsColorOverrides {     // ← different interface than in the sub-module
        contrast: true;
    }
}
```

MUI declares `ButtonPropsColorOverrides` inside `@mui/material/Button`. Augmenting `@mui/material` creates a **new** interface in a different module — TypeScript does not merge across module boundaries. `<Button color="contrast">` still fails.

It has to be **exactly** `declare module '@mui/material/Button'`.

### ❌ Do not rely on `import '@ringpublishing/mui-theme/...'` side effects for JSX prop augmentation

Side-effect imports of augmentation barrels inside theme.lib **do not pull** the sub-module augmentations into the consumer when using `node16`. We tried five variants (side-effect import, `export *`, triple-slash, marker exports, dedicated sub-entry) — none worked.

Under the current setup a local mirror in the consumer is the only stable approach.

### ❌ Do not remove the canonical declarations from theme.lib

It might be tempting to say “if we need to mirror in ring-ui-components anyway, we can keep them only there”. **Do not do that:**

- theme.lib tests and `components.custom.ts` rely on some augmentations internally (for example `MuiPaper.variants[].props: { variant: 'borderless' }` requires the declaration to type-check).
- Apps consuming theme.lib directly (without ring-ui-components) use the canonical declarations as documentation of “what Ring offers”.
- If we ever switch to `bundler` resolution, the mirror becomes unnecessary — the single source of truth in theme.lib is already in place.

### ⚠️ Always keep the mirror in sync

The mirror inside ring-ui-components **must** stay identical to the canonical declarations in theme.lib. Any change in theme.lib (`augmentation.core.ts` or `<version>/augmentation.ts`) means you need to verify that the corresponding Category B augmentation is updated in ring-ui-components as well.

If we start seeing drift (e.g. theme.lib provides `<Chip variant="X">` but ring-ui-components is unaware of it), ring-ui-components consumers will get false negative type errors.

Future idea: a `lint:augmentation-sync` script comparing the four sub-module declare blocks in theme.lib (`config/augmentation.core.ts` + `config/reference/augmentation.ts`) with the mirror in `ring-ui-components/src/theme/muiAugmentation.ts`. The value grows with the number of Category B augmentations (four today, maybe eight tomorrow).

## Diagnostics: spotting a "missing mirror"

### Symptom

```
src/SomeComponent.tsx:42:13 - error TS2769: No overload matches this call.
  Type '"borderless"' is not assignable to type
    'OverridableStringUnion<"elevation" | "outlined", PaperPropsVariantOverrides>'.
```

Observed in ring-ui-components or in a consuming app.

### Checklist

1. Is the augmentation present in **theme.lib**? Grep:
   ```bash
   grep -r "PaperPropsVariantOverrides" ring-ui-mui-theme/src/
   ```
   If it is missing → add the canonical declaration there.

2. Is the augmentation present in the **ring-ui-components mirror**? Grep:
   ```bash
   grep "PaperPropsVariantOverrides" ring-ui-components/src/theme/muiAugmentation.ts
   ```
   If it is missing → add the mirror there (1:1 copy from theme.lib).

3. Does the ring-ui-components `node_modules` contain the fresh theme.lib build?
   ```bash
   ls -la ring-ui-components/node_modules/@ringpublishing/mui-theme/dist/theme/config/augmentation.core.d.ts
   ```
   If it is outdated → `npm install` or sync manually.

### What will NOT help in this category

- Restarting the TS server in the IDE
- `tsc --build --force`
- Clearing the tsBuildInfo cache
- Adding `import '@ringpublishing/mui-theme'` in the consumer code

None of these influence the quirk related to how the module graph pulls in sub-module augmentations across package boundaries.
