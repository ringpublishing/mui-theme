# ADR-001: getTheme Options API — Positional to Object

## Status

Accepted (March 2026)

## Context

The `getTheme()` function is the primary public API of `@ringpublishing/mui-theme`. Through successive feature additions (v4.3.0: `themeOverrides`, v4.4.0: `typographyMode`), the function grew to **7 positional arguments**:

```ts
getTheme(mode, language, externalComponentsTheme, externalLocales, externalColors, themeOverrides, typographyMode)
```

Of these, positions 3 and 5 are deprecated (`externalComponentsTheme`, `externalColors`), but cannot be removed without a breaking change because they occupy fixed positions.

### Problems

1. **Poor DX** — to set `typographyMode` (7th arg), consumers must pad 5 empty arguments: `getTheme('light', 'enUS', {}, [], {}, {}, 'deprecated-px')`
2. **Silent type errors** — `{}` is assignable to multiple parameter types, so swapping argument positions produces no TypeScript error
3. **Deprecated parameters block positions** — positions 3 and 5 cannot be reclaimed
4. **Not extensible** — every new parameter makes the signature worse

### Organizational usage (grep, March 2026)

| Repository | Call pattern | Args |
|---|---|---|
| `ring-ui-components` | `getTheme(mode, language, externalTheme, getLocales(language), externalColors)` | 5 |
| `ring-marten-monorepo` (4 apps) | `getTheme('light', CommonLanguages.plPL, {}, [])` | 4 |
| `ring-usage-reports-allocations-ui` | `getTheme('light')` | 1 |

4 out of 6 call sites pass empty `{}` and `[]` as padding. `ring-ui-components` wraps `getTheme` in a custom `getCreatedTheme` function — an additional layer over a bad API.

No consumer uses `themeOverrides` or `typographyMode` yet. `rcd-poc_proteus` uses `html { font-size: 62.5% }` and needs `typographyMode='deprecated-px'` but cannot reasonably reach the 7th argument.

## Decision

### New options-based API (v4.4.0)

```ts
export interface GetThemeOptions {
    language?: CommonLanguages | string;
    /** @deprecated Use themeOverrides.components instead */
    externalComponentsTheme?: object;
    externalLocales?: object[];
    /** @deprecated Use themeOverrides.palette instead */
    externalColors?: object;
    themeOverrides?: ThemeOverrides;
    /** @deprecated 'deprecated-px' will be removed in v5.0.0 */
    typographyMode?: TypographyMode;
}

// New API
getTheme(mode: PaletteMode | string, options?: GetThemeOptions): Theme
```

### Backward compatibility via overload detection

The 2nd argument type determines which API path is taken at runtime:
- `string` → legacy positional API (logs `console.warn`)
- `object` → new options API
- `undefined` → both work identically

TypeScript function overloads provide correct type checking for both signatures.

### Before / after

```ts
// Before — 7 positional args, padding required
getTheme('light', 'enUS', {}, [], {}, {}, 'deprecated-px')

// After — named options, no padding
getTheme('light', { typographyMode: 'deprecated-px' })
```

```ts
// Before — 5 positional args
getTheme(mode, language, externalTheme, getLocales(language), externalColors)

// After — named options
getTheme(mode, {
    language,
    externalComponentsTheme: externalTheme,
    externalLocales: getLocales(language),
    externalColors
})
```

### ThemeConfig unchanged

`ThemeConfig` component props are already named (not positional), so no consumer-facing change is needed. Internally, `ThemeConfig` now calls the new options API.

## Consequences

### Deprecation warnings

Consumers calling `getTheme` with more than 2 arguments see a `console.warn`:

```
[@ringpublishing/mui-theme] Positional arguments in getTheme() are deprecated.
Use getTheme(mode, { language, themeOverrides, ... }) instead.
Positional arguments will be removed in the next major version.
```

### Deprecation registry

| Element | Replacement | Removal |
|---|---|---|
| Positional args `getTheme(mode, lang, ...)` | `getTheme(mode, { language, ... })` | v5.0.0 |
| `externalComponentsTheme` param/prop | `themeOverrides.components` | v5.0.0 |
| `externalColors` param | `themeOverrides.palette` | v5.0.0 |
| `typographyMode='deprecated-px'` | Default `'rem'` mode | v5.0.0 |
| `basicGrey100` / `basicGrey200` exports | `theme.palette.grey` | v5.0.0 |

### Migration roadmap

**v4.4.0** (this release):
- New `GetThemeOptions` interface exported
- Both old and new API work in parallel
- `console.warn` on legacy calls
- `@deprecated` JSDoc on `basicGrey100/200`

**v4.4.0+ — consumer migration** (separate PRs):

| Repository | Priority | Change |
|---|---|---|
| `ring-ui-components` | High | Refactor `getCreatedTheme` to new API, replace `basicGrey100` |
| `ring-marten-monorepo` (4 apps) | Medium | `getTheme('light', lang, {}, [])` → `getTheme('light', { language: lang })` |
| `ring-usage-reports-allocations-ui` | Low | No change needed (1 arg) |
| `rcd-poc_proteus` | High | Add `typographyMode="deprecated-px"` to `<ThemeConfig>` |

**v5.0.0** (future major):
- Remove positional overload
- Remove `externalComponentsTheme`, `externalColors`
- Remove `basicGrey100`, `basicGrey200`
- Remove `typographyMode='deprecated-px'`

### Semantic difference in `externalComponentsTheme` vs `themeOverrides.components`

`externalComponentsTheme` is spread **before** built-in component overrides, so library defaults win. `themeOverrides.components` uses deep merge via a second `createTheme()` call, so consumer overrides win. This is an intentional improvement — consumers migrating from `externalComponentsTheme` to `themeOverrides.components` gain correct override semantics.

## Affected components

### Modified files
- `src/theme/theme.tsx` — `GetThemeOptions` interface, function overloads, runtime detection, `@deprecated` on exports
- `src/theme/index.ts` — `GetThemeOptions` exported via `export *`

### Test coverage
- `tests/theme/theme.test.tsx` — 31 tests total: 27 using new API, 4 backward compatibility tests (including deprecation warning assertion)
