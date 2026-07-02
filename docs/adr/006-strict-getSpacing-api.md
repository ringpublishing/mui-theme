# ADR 006 — Strict `theme.getSpacing()` API with arity 1-4 args

- **Status:** Accepted
- **Date:** 2026-05-09 (revised 2026-06-01)
- **Supersedes:** —
- **Superseded by:** —

## Summary (TL;DR)

We expose `theme.getSpacing(...factors)` as a **second**, **strict** spacing API alongside MUI's native `theme.spacing()`. `getSpacing` accepts 1–4 arguments (mirroring MUI/CSS shorthand `top right bottom left`) and accepts **only** `SpacingFactor` — a union of Figma-defined step literals (`0 | 0.5 | 1 | 1.5 | 2 | 3 | ... | 12`). A non-matching argument → `console.warn` + **permissive fallback** (`factor × 8px` on an 8px grid). Bad arity (0 or 5+ args) → `console.error` + `'0px'` (no sensible fallback).

`theme.spacing()` remains (it was not removed — MUI would break internally), but is marked `@deprecated` in the type augmentation. **New code uses `theme.getSpacing()`**, old code migrates gradually.

## Context

MUI's `theme.spacing()` is **permissive** — it accepts any `number` as a multiplier and multiplies by the base (default: 8px). So `theme.spacing(2.7)` gives `21.6px`, `theme.spacing(100)` gives `800px`. No validation.

The Ring Design System has a **strict scale** — Figma defines **concrete** permitted values: `0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12` (renders: 4, 8, 12, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96 px). The value `2.7` does not exist in the design — using it in components is a **magic number bug**.

### Pain points before the strict API

**1. No runtime signal for magic numbers.** `theme.spacing(2.7)` → `21.6px`. Component renders, design QA sometimes catches "this is not on the Figma grid", sometimes not. It made it to production.

**2. No compile-time signal.** `theme.spacing(any number)` accepts everything. TypeScript has no registry of "these values are permitted".

**3. Ad-hoc spacing values in components.** Developers used `theme.spacing(1.7)`, `theme.spacing(0.3)` etc. — each such use case meant drift from the Figma kit. This became visible during the `next` redesign (Figma kit is more strict).

**4. Difficulty of auditing.** To check "are we using only Figma steps", we had to regex-search the codebase (`theme.spacing\([^)]*\)` + manual verification of each match).

### Why we cannot simply tighten `theme.spacing()`

Because it is used internally by MUI. Every MUI component in `styleOverrides` uses `theme.spacing(N)` with arbitrary numbers, e.g. `padding: theme.spacing(0.5)` depending on variant, breakpoint, etc. Tightening the `Spacing` type at the augmentation level would **break** MUI type compilation globally.

Hence two paths: **liberal `theme.spacing()` stays** (MUI internal), **strict `theme.getSpacing()` is added** (Ring consumer-facing). The augmentation overloads `theme.spacing()` with additional signatures that **suggest** Figma steps in autocomplete (but still accept any number).

## Decision

### 1. `theme.getSpacing(...factors: SpacingFactor[])` — new API

Runtime function + type augmentation. Accepts **1–4 arguments**, each must be a valid `SpacingFactor`. Returns CSS string `"Npx Mpx ..."`.

```ts
type SpacingFactor = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

interface GetSpacing {
    (factor: SpacingFactor): string;
    (topBottom: SpacingFactor, rightLeft: SpacingFactor): string;
    (top: SpacingFactor, rightLeft: SpacingFactor, bottom: SpacingFactor): string;
    (top: SpacingFactor, right: SpacingFactor, bottom: SpacingFactor, left: SpacingFactor): string;
}

interface Theme {
    getSpacing: GetSpacing;
}
```

The union of values comes from `next.spacingScale` (Figma-defined steps) + literal `0`. `0` is not a "step" in the Figma kit, but is necessary for CSS shorthand convention (`margin: 8px 0`, `padding: 0 16px`); the resolver short-circuits `0` before scale lookup, making it work identically on both versions (`reference`, `next`) without a warning.

### 2. Arity 1–4 — full parity with MUI `theme.spacing()`

```ts
theme.getSpacing(1)            // "8px"
theme.getSpacing(1, 2)         // "8px 16px"          (top/bottom, left/right)
theme.getSpacing(1, 2, 3)      // "8px 16px 24px"     (top, left/right, bottom)
theme.getSpacing(1, 2, 3, 4)   // "8px 16px 24px 32px" (top, right, bottom, left)
```

This is the CSS shorthand convention (`padding`, `margin` can accept 1–4 values). MUI's `theme.spacing()` covers the same four overloads. **Our `getSpacing` must cover all of them** so that the migration `theme.spacing(0, 1, 0, 1)` → `theme.getSpacing(0, 1, 0, 1)` is a mechanical 1:1 replacement.

### 3. Permissive `theme.spacing()` stays, but marked `@deprecated`

The `@mui/system` augmentation rewrites the `Spacing` interface, adding `@deprecated` JSDoc for all 4 overloads. IDE shows strikethrough — signal "use `theme.getSpacing()`". Runtime still works (MUI uses `theme.spacing()` internally).

Further plan:
- **Phase 1** (now): `@deprecated` JSDoc, IDE strikethrough
- **Phase 2** (later): ESLint plugin `eslint-plugin-deprecation` with `error` rule in ring-ui-components — enforces migration
- **Phase 3** (next major): consider final removal from augmentation if MUI's internal usage allows (likely not — in that case leave the permissive version for MUI internal and enforce via ESLint rule in consumer code)

### 4. Error handling — `console.warn` + permissive fallback (invalid factor); `console.error` + `'0px'` (bad arity)

**Invalid factor** (e.g. `0.2`, `13`) → `console.warn` + **permissive fallback** = `factor × 8px`. Pixel value consistent with `theme.spacing(factor)` (MUI native, 8px grid). Component renders with a sensible padding/margin, layout does not break, developer gets a clear warning with a list of available factors and a fix instruction.

**Bad arity** (0 args or 5+ args) → `console.error` + `'0px'`. Here fallback makes no sense — we do not know *which* values the developer wanted, or which ones are missing/extra. Hard `0px` is an escape hatch that will visibly break the layout (and a stack trace points to the location).

Choice of `warn` vs `error` semantically:
- `warn` — something is wrong, but the app continues with a sensible render (degraded mode)
- `error` — something is wrong and we cannot continue sensibly (`'0px'` is a placeholder)

The warning message is **universal** — **does not mention the theme variant** (`reference`/`next`). Rationale: for the consumer, the variant is an implementation detail during a transitional period; saying "factor 0.5 does not exist in `reference`" implies knowing two variants to write correct code. Instead the message says: *"Available factors: <list>. Use one of them."* — flat mental model, code portable between variants.

**Throw rejected** — crashing the entire React tree on a typo `getSpacing(0.2)` is a bad trade-off. Error boundary catches it, but UX = white screen. Warn + permissive render = developer sees the signal, prod continues.

## Mechanisms explained — non-obvious

### 1. `SpacingFactor` as a TypeScript literal union

`SpacingFactor` is a **union of numeric literals** — TS validates the argument value at compile time:

```ts
// src/theme/config/next/spacing.generated.ts
export const spacingScale = {
    0.5: 4, 1: 8, 1.5: 12, 2: 16, 3: 24, 4: 32, 5: 40,
    6: 48, 7: 56, 8: 64, 9: 72, 10: 80, 11: 88, 12: 96
} as const;

export type SpacingFactor = keyof typeof spacingScale;
//          ↑ 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
```

`as const` is key — without it TS widens the keys to `number`, losing literalness. `keyof` on a const-asserted object gives a union of exact values.

In the consumer:
```ts
theme.getSpacing(1);      // ✅ TS OK
theme.getSpacing(2.5);    // ❌ TS error: Argument of type '2.5' is not assignable to 'SpacingFactor'
theme.getSpacing(13);     // ❌ TS error
```

Compile-time blocker. The developer sees the error before deploy.

### 2. Function overload signatures in TypeScript

```ts
interface GetSpacing {
    (factor: SpacingFactor): string;
    (topBottom: SpacingFactor, rightLeft: SpacingFactor): string;
    (top: SpacingFactor, rightLeft: SpacingFactor, bottom: SpacingFactor): string;
    (top: SpacingFactor, right: SpacingFactor, bottom: SpacingFactor, left: SpacingFactor): string;
}
```

These are **4 separate declarations** of the same function. TypeScript allows overloading — the runtime is **one** function (variadic `...factors: SpacingFactor[]`), but the type system sees 4 signatures.

Benefits for the consumer:
- IDE autocomplete shows parameter names per arity (`top`, `rightLeft`, `bottom`...)
- Type checker validates that only 1, 2, 3, or 4 args are permitted
- Hovering over `getSpacing(1, 2)` shows the signature matching `topBottom + rightLeft`

Without overloads (with a simple `(...factors: SpacingFactor[])`) — runtime works, but the consumer does not see semantics in the IDE.

### 3. Runtime → augmentation → 3× duplication

`getSpacing` as runtime lives on the `theme` object:
```ts
// theme.tsx
const theme = createTheme({
    // ...
    getSpacing: (...factors) => { /* impl */ }
});
```

But TS must **know** that `theme.getSpacing` exists. We augment the `Theme` interface in `@mui/material`:
```ts
// augmentation.core.ts
declare module '@mui/material' {
    interface Theme {
        getSpacing: GetSpacing;
    }
}
```

And repeat it in `@mui/material/styles` + `@mui/material/esm/styles` (per MUI pattern, see [ADR-004](004-mui-module-augmentation-categories.md) — Category A). Three declare blocks, identical declaration. That is why we extracted `GetSpacing` as a separate type alias — DRY.

### 4. `console.warn` + permissive fallback — design choice

```ts
if (factors.length === 0 || factors.length > 4) {
    console.error('[@ringpublishing/mui-theme] getSpacing accepts 1-4 arguments, got X');
    return '0px';
}

// invalid factor:
console.warn(/* universal message: "Available factors: <list>" */);
return `${factor * 8}px`; // permissive fallback, 8px grid parity with MUI native
```

Throwing on invalid factor would crash the entire React tree (error boundary catches, but UX = "white screen"). Permissive fallback + warn is better:

- Dev environment: warning in console, developer sees the list of valid factors
- Test environment: can spy on `console.warn`, verify in tests
- Prod environment: layout renders sensibly (8px grid), QA may notice drift from Figma

Universal message (without theme variant name `reference`/`next`) — the consumer operates on a flat mental model "list of available factors in the current config". The theme variant does not leak into error UX.

Convention consistent with the rest of Ring theme — `getTheme` also logs warnings, not throws (e.g. for deprecated `externalColors`).

## Mechanism Requirements

- Runtime validates arity and factors before returning CSS spacing values.
- Valid factors resolve through the active theme config.
- Unsupported factors log a warning and use the documented fallback behavior.
- Type augmentation exposes the same public API in supported MUI style module entry points.
- Tests cover valid factors, unsupported factors, arity handling, and cross-version behavior.

## Full parity with `theme.spacing()` — verification

| Signature | MUI `theme.spacing()` | Ring `theme.getSpacing()` | Difference |
|---|---|---|---|
| `(n)` | any `number` | only `SpacingFactor` | strictness |
| `(n, m)` | any | only factors | strictness |
| `(n, m, k)` | any | only factors | strictness |
| `(n, m, k, l)` | any | only factors | strictness |
| `()` | runtime error | log + 0px | semantics |
| `(n, m, k, l, ...more)` | absent (TS error in MUI) | log + 0px | runtime safety |

All 4 CSS shorthand use cases covered. A consumer migrating `theme.spacing(0, 1, 0, 1)` → `theme.getSpacing(0, 1, 0, 1)` loses nothing but permissiveness (which was a problem, not a feature).

**Not covered**: `theme.spacing()` also uses `boxSizing` callbacks and custom spacing functions (`spacing: number | (factor: number) => string | number | number[]`). These are **MUI internal** — not used directly by Ring DS consumers. They remain in `theme.spacing()`.

## Consequences

### Positive

- **Compile-time validation** of Figma steps. Magic number → TS error.
- **Consistency with design.** `theme.getSpacing(2.5)` does not exist — Figma has no 20px step.
- **API parity with MUI** — 1:1 migration for 1–4 args use cases.
- **Self-documenting** — `getSpacing(top, right, bottom, left)` overload signatures in IDE show semantics.

### Neutral

- **A second spacing API appears.** Consumer must choose. Convention: new code → `getSpacing`, existing → gradual migration (see migration doc in ring-ui-components).
- **Strict factor list is per-version.** `next` has `0.5 | 1 | 1.5 | 2 | 3 | ... | 12`. If v7.3 adds a step (e.g. `0.25`), `spacing.generated.ts` needs to be regenerated by the plugin.

### Negative

- **`theme.spacing()` still exists** — we cannot remove it (MUI internal use). So old code still works, magic numbers pass through. Mitigation: ESLint rule enforcing `theme.getSpacing` in new consumer code.
- **`reference` backward compat** — `reference` spacing scale is `[0, 8, 16, ..., 96]` (array without fractional). Multi-arg works for integers; `getSpacing(0.5)` on `reference` → permissive fallback `4px` + warn. Layout renders, but developer sees a signal that the factor does not exist in the active config.
- **`getBorderRadius` drift on `next`** — permissive fallback uses `cfg.shape.borderRadius` (4px) as the base, but `next.borderRadiusScale` has non-linear values (`5 → 24px`, not `20px`). Deliberate trade-off: simple, predictable fallback more important than perfect scale parity; warn signals the issue.
- **Drift risk with MUI** — if MUI in the future adds new arity (e.g. 5+ args for CSS logical properties), our `getSpacing` will not have it. Need to monitor MUI changelog.
