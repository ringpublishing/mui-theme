# ADR 005 — `ThemeConfigProps` and `GetThemeOptions` as exported types

- **Status:** Proposed
- **Date:** 2026-05-09
- **Supersedes:** —
- **Superseded by:** —

## Summary (TL;DR)

We export `ThemeConfigProps` and `GetThemeOptions` from theme.lib as **public** types. This enables consumer libraries (e.g. ring-ui-components) to write a thin passthrough wrapper — `<ThemeConfig>` from ring-ui-components now acts as "the same interface as core, plus auto-injected Ring MUI X defaults". Without this export, a wrapper would have to duplicate the shape, leading to drift on every core API change.

Plus: internal routing through `themeOverrides.components` (not `externalComponentsTheme`) — `externalComponentsTheme` has been marked `@deprecated` and is slated for removal.

## Context

Theme.lib exposes two entry points for the consumer:

1. **Synchronous** — `getTheme(mode, options)` returns a `Theme` object. Used in utilities, tests, helpers such as `helpers/colors.ts` in ring-ui-components.

2. **React** — `<ThemeConfig mode="light" {...}>` is a component returning JSX with `<ThemeProvider>` + `<CssBaseline>`. Used in the React tree of consumer apps.

Both accept **the same** configuration options (`language`, `version`, `themeOverrides`, `externalLocales`, `typographyMode`, `externalComponentsTheme`).

### Pain points before the change

**Wrapper in ring-ui-components duplicated the shape** — it defined its own `interface ThemeConfigProps` with a narrower set of fields (`mode`, `children`, `language`, `typographyMode`). `themeOverrides`, `externalLocales`, `version` were missing. On every field addition in core, the ring-ui-components wrapper would not notice it — classic drift.

```ts
// Old state in ring-ui-components/src/theme/theme.tsx:
interface ThemeConfigProps {
    mode: PaletteMode;
    children: ReactNode | ReactNode[];
    language?: CommonLanguages;
    typographyMode?: TypographyMode;
    // missing version, themeOverrides, externalLocales — silently cut off
}
```

A ring-ui-components consumer who wanted to use `themeOverrides` (e.g. to add custom `MuiButton` styling) could not — the wrapper did not expose that prop.

**Plus**: inside the wrapper we were using `externalComponentsTheme` (deprecated path) instead of `themeOverrides.components` (supported path) — this was an inadvertent repetition of the old API. The runtime result was the same, but TS showed a deprecation signal in supporting IDEs.

## Decision

### 1. Public export of types

Change in [`src/theme/theme.tsx`](../../src/theme/theme.tsx):

```ts
// BEFORE:
interface ThemeConfigProps { ... }      // internal

// AFTER:
export interface ThemeConfigProps { ... }   // public
export interface GetThemeOptions { ... }    // was already exported, we make it explicit
```

Consumers (ring-ui-components, direct apps, any wrappers) can import and `Omit`/`extend`/`=` on these types.

### 2. Routing through `themeOverrides.components`

In wrappers (both theme.lib's `<ThemeConfig>` and ring-ui-components' wrapper) we retire `externalComponentsTheme` (deprecated) in favor of `themeOverrides.components` (supported, deep-merged by MUI's `createTheme(base, overrides)`).

Runtime equivalent for our use case (`ringDataGridOverrides` on `MuiDataGrid` — a key not existing in `buildRingComponents`). But **the path forward** — `externalComponentsTheme` will be removed in the next major release.

## Mechanisms explained

### 1. Single source of truth pattern for wrappers

A classic problem when building a wrapper: how to expose **the same** props as the underlying component, without duplication.

Three strategies:

```ts
// Strategy A — duplication (bad)
interface MyWrapperProps {
    mode: PaletteMode;
    language?: CommonLanguages;
    /* repeat 6 fields from core */
}

// Strategy B — full passthrough (good for "thin wrapper")
import { ThemeConfigProps as CoreProps } from '@ringpublishing/mui-theme';
type MyWrapperProps = CoreProps;
// → wrapper has identical API to core, plus its own logic inside

// Strategy C — selective exclusion (good for "narrowed wrapper")
type MyWrapperProps = Omit<CoreProps, 'externalComponentsTheme' | 'externalLocales'>;
// → wrapper hides fields it manages internally
```

Chosen for ring-ui-components: **Strategy B** (full passthrough). The wrapper accepts all core props, but **internally** merges Ring defaults with consumer-provided values. The consumer sees an identical interface, has full flexibility.

### 2. `Omit` as a deprecation mechanism

If someone wants Strategy C for their own wrapper (e.g. an external app that wants to expose a simplified API):

```ts
import { ThemeConfigProps } from '@ringpublishing/mui-theme';

type AppThemeProps = Omit<ThemeConfigProps, 'externalComponentsTheme' | 'externalLocales' | 'themeOverrides'>;
// → only mode, children, language, typographyMode, version
//   the rest is managed internally by the app
```

`Omit<T, K>` is a TS utility — takes type `T`, removes keys `K`. The pattern is standard, but useful here as a special case of "I'm wrapping but hiding part".

### 3. `themeOverrides.components` vs `externalComponentsTheme` — internal mechanics

Both lead to the same final field: `theme.components`. But the **merge mechanism** is different.

**`externalComponentsTheme`** goes into the **first** `createTheme` call inside `getTheme`:

```ts
// theme.lib/src/theme/theme.tsx (simplified):
const baseTheme = createTheme({
    components: {
        ...externalComponentsTheme,           // ← shallow spread, FIRST
        ...buildRingComponents({ pxTo })       // ← Ring built-ins, OVERWRITES
    }
});
```

Shallow spread at the top-level component key. Ring built-ins **win** on collision.

**`themeOverrides.components`** goes into the **second** `createTheme(base, overrides)` call:

```ts
// theme.lib/src/theme/theme.tsx (simplified):
return createTheme(baseTheme, {
    components: themeOverrides?.components    // ← deep merge by MUI
});
```

MUI's `createTheme(base, deltas)` does a **deep merge** of components. Per-leaf granularity. The consumer **wins** per-leaf on collision.

So:

| Aspect | `externalComponentsTheme` | `themeOverrides.components` |
|---|---|---|
| When applied | First `createTheme` | Second `createTheme(base, deltas)` |
| Merge | Shallow (per top-level key) | Deep (per leaf) |
| Who wins on collision | Ring built-ins | Consumer |
| Target | `theme.components` | `theme.components` |
| Status | `@deprecated` | Supported |

For our use case (`ringDataGridOverrides` on `MuiDataGrid` — a key not present in `buildRingComponents`) — the runtime result is the same. But for **any** custom override of Ring built-ins, `themeOverrides.components` gives the consumer real control. Example:

```tsx
// Consumer wants to change only the default size for MuiButton (Ring has its own styling)

// With externalComponentsTheme — Ring overwrites everything
<ThemeConfig externalComponentsTheme={{
    MuiButton: { defaultProps: { size: 'small' } }
}} />
// Result: size: 'small' disappears, Ring built-in MuiButton overwrites the whole thing

// With themeOverrides.components — deep merge, consumer wins per-leaf
<ThemeConfig themeOverrides={{
    components: { MuiButton: { defaultProps: { size: 'small' } } }
}} />
// Result: size: 'small' is applied, Ring styleOverrides are preserved
```

This is why `themeOverrides.components` is the better path. Hence the preference in the new API.

### 4. Why JSDoc `@deprecated` on `externalComponentsTheme`

Classically marked `@deprecated`:

```ts
// theme.lib/src/theme/theme.tsx
export interface ThemeConfigProps {
    /** @deprecated Use themeOverrides.components instead. For backward compatibility only. */
    externalComponentsTheme?: object;
    themeOverrides?: ThemeOverrides;
}
```

TypeScript:
- ✅ shows **strikethrough** in IDE (VS Code, JetBrains) on the property in autocomplete and when used
- ✅ shows hover hint `(deprecated)` with the tag text
- ❌ **does not generate an error** during `tsc --noEmit`
- ❌ **does not generate a warning** during `tsc`

So old apps using `externalComponentsTheme` still compile (no breaking change). But the IDE signals "wrong path". The full path forward:

1. Phase 1 (now): JSDoc `@deprecated`
2. Phase 2 (next minor): ESLint plugin `eslint-plugin-deprecation` with rule `deprecation/deprecation: error`
3. Phase 3 (next major): removal of `externalComponentsTheme` from the type + breaking change in changelog

**Important**: the `@deprecated` JSDoc tag must survive in generated declaration files for consumers to see IDE deprecation hints. Declaration emit settings should be checked whenever build configuration changes.

## Before/after examples

### Before — wrapper duplicates, drift possible

```ts
// ring-ui-components/src/theme/theme.tsx:
import { CommonLanguages, ThemeVersion, TypographyMode, getTheme } from '@ringpublishing/mui-theme';

interface ThemeConfigProps {
    mode: PaletteMode;
    children: React.ReactNode | React.ReactNode[];
    language?: CommonLanguages;
    typographyMode?: TypographyMode;
    version?: ThemeVersion;
    // ← missing themeOverrides
    // ← missing externalLocales
    // ← missing new fields that will be added to core in the future
}

export const ThemeConfig = ({ mode, children, language, ... }: ThemeConfigProps) => (
    <ThemeProvider theme={getTheme(mode, { language, /* hardcoded subset */ })}>
        {children}
    </ThemeProvider>
);
```

Consumer:
```tsx
// Wrapper does not expose themeOverrides — consumer CANNOT provide their own MuiButton
<ThemeConfig mode="light" themeOverrides={...} />
//                        ^^^^^^^^^^^^^^^^^^ TS error: no such prop
```

### After — single source of truth

```ts
// theme.lib/src/theme/theme.tsx (export):
export interface ThemeConfigProps {
    mode: PaletteMode;
    children: React.ReactNode | React.ReactNode[];
    language?: CommonLanguages;
    externalLocales?: object[];
    themeOverrides?: ThemeOverrides;
    /** @deprecated Use themeOverrides.components instead. */
    externalComponentsTheme?: object;
    typographyMode?: TypographyMode;
    version?: ThemeVersion;
}

// ring-ui-components/src/theme/theme.tsx:
import { ThemeConfigProps as CoreThemeConfigProps } from '@ringpublishing/mui-theme';
export type ThemeConfigProps = CoreThemeConfigProps;
// ← wrapper has identical API to core, automatically

export const ThemeConfig = ({ children, ...rest }: ThemeConfigProps) => {
    // internally: merge Ring defaults under consumer values
    // see ring-ui-components ADR-007
};
```

Consumer:
```tsx
<ThemeConfig
    mode="light"
    language="plPL"
    version="next"
    themeOverrides={{                  // ← now available
        components: {
            MuiButton: { defaultProps: { size: 'small' } }
        }
    }}
    externalLocales={[customLocale]}    // ← now available
/>
```

When theme.lib adds a new field to `ThemeConfigProps` (e.g. a hypothetical `colorMode: 'auto'`), ring-ui-components' wrapper sees it automatically — without a touchpoint in the wrapper.

### Concrete migration in ring-ui-components

```ts
// ring-ui-components/src/theme/theme.tsx (after change):

import {
    CommonLanguages,
    GetThemeOptions,
    Theme,
    ThemeConfig as CoreThemeConfig,
    ThemeConfigProps as CoreThemeConfigProps,    // ← new import
    getTheme,
} from '@ringpublishing/mui-theme';

export type ThemeConfigProps = CoreThemeConfigProps;
export type GetCreatedThemeOptions = GetThemeOptions;
//          ^^^^^^^^^^^^^^^^^^^^^^^^   ^^^^^^^^^^^^^^^^^
//          custom alias for backward compat
//                                     core type

export function getCreatedTheme(mode, options?: GetCreatedThemeOptions): Theme {
    return getTheme(mode, options);   // full passthrough
}

export const ThemeConfig = (props: ThemeConfigProps) => (
    <CoreThemeConfig {...mergedProps} />   // merge inside
);
```

Three lines of code instead of thirty. Zero drift.

## Consequences

- **Theme.lib consumers** can import `ThemeConfigProps` / `GetThemeOptions` in their wrappers — explicit public contract.
- **Drift between wrapper and core eliminated** — adding a field to core automatically propagates to every wrapper using `Type = CoreType`.
- **Backward compatibility** — no consumer using the previous API is affected. Old syntax works, deprecated path still functions.
- **Migration path for `externalComponentsTheme`** — typed as `@deprecated`, IDE signals it, but TS does not error. Real removal (dropping from the type) at the next major release.
- **Declaration output must preserve deprecation JSDoc** so consumers get IDE hints. This is a build-contract concern, not a runtime behavior change.
