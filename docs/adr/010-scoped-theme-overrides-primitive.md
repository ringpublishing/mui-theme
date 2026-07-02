# ADR 010 — `ScopedThemeOverrides` primitive

- **Status:** Proposed
- **Date:** 2026-06-02
- **Supersedes:** —
- **Superseded by:** —

## Summary (TL;DR)

We export a new primitive `<ScopedThemeOverrides>` from `@ringpublishing/mui-theme` for nested per-component overrides (`defaultProps` / `styleOverrides`). It reads the parent theme via `useTheme()`, does `createTheme(parent, { components })` (MUI deep-merge), and mounts a thin `<ThemeProvider>` for the subtree. No `CssBaseline`, no `InspectorBridge`, no call to `getTheme()`.

The scoped primitive **does not replace** `<ThemeConfig>` — each has a different use case:

| Primitive | Use-case |
|---|---|
| `getTheme(mode, options)` | Programmatic `Theme` construction (helpers, tests) |
| `<ThemeConfig>` | Top-level application entry point (once, near the React root) — full Ring theme + `CssBaseline` + Inspector bridge |
| `<ScopedThemeOverrides>` | Nested override in a subtree — inherits from parent, appends a `components` slice |

The initial shape is **thin**: the `components` prop accepts `Components<Omit<Theme,'components'>>`. No `palette` / `typography` / `spacing` / `breakpoints` / `shape` in the API — open-closed for extension when a real use case arises (e.g. a follow-up migration of `LightBox` forcing `palette.mode='dark'`).

## Context

An audit of `ring-ui-components` revealed that the library imports `ThemeProvider`/`createTheme`/`useTheme` directly from `@mui/material` in components that need scoped theme overrides:

1. `Organisms/Filters/FiltersWrapper/FiltersWrapper.tsx` — injects `defaultProps` (`size`, `variant`, `fullWidth`) for 9 types of MUI controls (`MuiAutocomplete`, `MuiTextField`, `MuiInputLabel`, `MuiSelect`, `MuiCheckbox`, `MuiSwitch`, `MuiRadio`, `MuiButton`, `MuiSlider`) so the consumer does not have to propagate size/variant to every instance.
2. `Organisms/LightBox/LightBox.tsx` — forces `palette.mode='dark'` on the lightbox subtree (follow-up; out of scope for this ADR).

The pattern "useTheme + createTheme(parent, override) + ThemeProvider" is idiomatic in MUI, but in Ring libraries it breaks the rule "all theme-related code goes through `@ringpublishing/mui-theme`":

- there is no way to enforce an ESLint rule "don't import `ThemeProvider` from `@mui/material`" — because there is no alternative in mui-theme for the scoped use case
- consumer Inspector / future tooling cannot recognize that the library modifies the theme in a subtree (the theme primitive is "anonymous" — a raw MUI ThemeProvider)
- API consistency: `themeOverrides.components` is part of the public shape of `ThemeConfig`/`getTheme`; the scoped use case should use the same shape

`<ThemeConfig>` **does not replace** the scoped use case:

- it builds the theme from scratch via `getTheme(mode, options)` — does not read `useTheme()` from the parent context, so nesting requires manually duplicating `mode` / `version` / `language` / `typographyMode` from the parent (tight coupling, easy to desynchronize)
- it mounts a second `<CssBaseline />` in the subtree (potential regression of resets)
- when the inspector flag is active (`sessionStorage.__ring_ui_inspector__='1'`) it mounts a second `InspectorBridge` — collision on `window.__RING_UI__`
- `themeOverrides` from parent `ThemeConfig` are not inherited (rebuild from scratch via `getTheme`)

## Decision

We add a new public component `<ScopedThemeOverrides>` with the signature:

```ts
interface ScopedThemeOverridesProps {
    components: Components<Omit<Theme, 'components'>>;
    children: React.ReactNode;
}
```

Implementation in `src/theme/ScopedThemeOverrides.tsx`:

```tsx
const parent = useTheme();
const merged = useMemo(
    () => createTheme(parent, { components }),
    [parent, components]
);
return <ThemeProvider theme={merged}>{children}</ThemeProvider>;
```

Export added to `src/theme/index.ts`.

### Key design decisions

1. **Thin shape (`components` only) to start**, not a full `ThemeOverrides`. Open-closed: when the next consumer requires a `palette` flip (LightBox), we will extend the API with optional props without a breaking change. `components` covers all identified use cases in `ring-ui-components` except LightBox.

2. **`createTheme(parent, override)` instead of `getTheme()`**. The scoped use case is the classic MUI deep-merge primitive — we do not want a full Ring theme rebuild (expensive, unnecessary, would lose `themeOverrides` from parent `ThemeConfig`).

3. **No `CssBaseline`**. The parent `ThemeConfig` already mounted one at the top level. Two baselines in a subtree is an anti-pattern.

4. **No `InspectorBridge`**. Single bridge per page. Inspector reports the top-level theme; scoped overrides are intentionally a "local illusion" in the subtree and should not be visible from the DS handle.

5. **Memoization via `useMemo([parent, components])`**. `createTheme` is expensive. A consumer who wants a stable `components` reference must memoize the object prop themselves (typical React idiom).

### Rule in CONTRIBUTING

`ring-ui-components/CONTRIBUTING.md` gets a "Theme primitives" section with the rule: Ring libraries do not use `ThemeProvider`/`createTheme` from `@mui/material` directly. Top-level → `<ThemeConfig>`, scoped → `<ScopedThemeOverrides>`. The raw MUI primitive is reserved for consumer applications that do not use the Ring theme.

## Consequences

### Positive

- Full Ring primitive set: top-level (`ThemeConfig`) + scoped (`ScopedThemeOverrides`) + low-level (`getTheme`)
- Elimination of raw `@mui/material` `ThemeProvider`/`createTheme` from Ring libraries (after consumer migration)
- Consistent shape API: `components` slice in `ScopedThemeOverrides` is the same as `themeOverrides.components` in `ThemeConfig`
- Opens the path for an ESLint rule blocking raw MUI primitives in `ring-ui-components` (out of scope for this ADR)
- Inspector / tooling can in the future report scoped overrides as a first-class citizen (named component in the tree)

### Negative

- New public export → another API surface to maintain
- Consumers must understand the difference between top-level and scoped (mitigation: JSDoc + section in README)
- Thin shape (`components` only) requires extension in the future as real use cases grow — but this is a deliberate open-closed decision

### Consumer migration

- **`ring-ui-components` `FiltersWrapper`** — first intended consumer, migration out of scope for this ADR
- **`ring-ui-components` `LightBox`** — follow-up (forces `palette.mode='dark'`, requires API extension with `palette` slice or a dedicated primitive)
- **Other consumers** — audit `grep "ThemeProvider.*createTheme\|createTheme.*useTheme"` done; only 2 found, both in `ring-ui-components`

## Rejected alternatives

### A. Extend `<ThemeConfig>` with `extendsParent` / `mode='inherit'`

Requires changing the semantics of the existing top-level primitive. Mixes two different use cases in one API. Risk: consumer does not know whether `<ThemeConfig>` starts from scratch or inherits. Rejected — two named primitives is cleaner.

### B. Context-based defaultProps (Ring-only components)

`<FiltersWrapper>` exposes a React Context, Ring's own wrappers (`<RingTextField>`, …) read it and apply props. Requires that the consumer uses only Ring components. Breaking change for existing consumers who mount raw `<TextField>` inside `FiltersWrapper`. Expands the library surface with Ring* wrappers. Rejected.

### C. Render prop / explicit props

`<FiltersWrapper>` returns `children({size, variant, buttonStyle})` — consumer distributes props themselves. Least magic but worse ergonomics, breaking change. Rejected.

### D. Full `themeOverrides` shape from the start

All slots (`palette`, `typography`, `spacing`, `breakpoints`, `shape`, `components`). Unnecessarily wide surface without a real use case (LightBox needs only `palette.mode`, FiltersWrapper needs only `components`). Rejected in favor of thin start + open-closed expansion.
