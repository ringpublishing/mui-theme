# ADR 007 — Strict `theme.getBorderRadius()` API

- **Status:** Proposed
- **Date:** 2026-05-25
- **Supersedes:** —
- **Superseded by:** —

## Summary (TL;DR)

We expose `theme.getBorderRadius(factor)` as a strict border-radius API — analogous to `theme.getSpacing()` from [ADR-006](006-strict-getSpacing-api.md), but **single-arg only**. The factor is a key from `borderRadiusScale` (`next`: `1 | 2 | 3 | 4 | 5` → `4 | 8 | 12 | 16 | 24` px). Returns a CSS px string (`'8px'`). Non-matching factor → `console.error` + `'0px'` (not a throw — identical semantics to `getSpacing`).

`reference` does not have a scale (only flat `shape.borderRadius = 4`, master parity). The runtime handles the fallback: `getBorderRadius(1)` returns the flat value, other factors log an error.

## Context

The Figma Ring/new kit (`v7.2` Material kit) defines a **scale** for border-radius in the `shape` collection:

```
shape/borderRadius/1 = 4px
shape/borderRadius/2 = 8px
shape/borderRadius/3 = 12px
shape/borderRadius/4 = 16px
shape/borderRadius/5 = 24px
shape/none           = 0px
```

The plugin emits this to `next/shape.generated.ts` as:

```ts
export const shape = { borderRadius: 4, none: 0 };
export const borderRadiusScale = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 24 } as const;
export type BorderRadiusFactor = keyof typeof borderRadiusScale;
```

The default `shape.borderRadius` in MUI sense is the value at factor 1 (compatible with `theme.shape.borderRadius` from the MUI core API).

### Pain points before the strict API

Identical problems as with spacing (see [ADR-006](006-strict-getSpacing-api.md)), addressed analogously:
1. **Magic numbers** — `borderRadius: 5` (px), `borderRadius: 10` in sx callbacks. These do not exist in the design.
2. **No compile-time signal** — MUI's `theme.shape.borderRadius * N` accepts arbitrary multipliers.
3. **Ad-hoc values in components** — drift from the Figma kit visible during the `next` redesign.

### Why we don't use `borderRadiusScale[N]` directly

Two reasons:
1. **No runtime validation** — `borderRadiusScale[99]` in TS is `undefined`, but in the expression `${borderRadiusScale[99]}px` gives the string `'undefinedpx'`. Silent failure.
2. **No unified semantics cross-version**. `reference` has no scale; the consumer should not have to care about the difference between versions — the runtime fallback (`reference` factor=1 → flat) hides this behind one API.

## Decision

### 1. `theme.getBorderRadius(factor: BorderRadiusFactor): string` — new API

```ts
type BorderRadiusFactor = 1 | 2 | 3 | 4 | 5;  // from next/shape.generated.ts

interface GetBorderRadius {
    (factor: BorderRadiusFactor): string;
}

interface Theme {
    getBorderRadius: GetBorderRadius;
}
```

Runtime + `Theme` interface augmentation in MUI modules (Category A per [ADR-004](004-mui-module-augmentation-categories.md)).

### 2. Single-arg only (NOT 1-4 like getSpacing)

CSS `border-radius` shorthand technically accepts 1–4 values (per-corner: top-left, top-right, bottom-right, bottom-left). **Deliberate decision: NOT supporting multi-arg.**

Reasons:
- In the real Ring codebase, per-corner border-radius is **very rare** (audit at decision time found no active cases in ring-ui-components).
- When needed — the consumer writes manually: `borderRadius: \`${theme.getBorderRadius(1)} ${theme.getBorderRadius(2)}\``. Explicit is better than implicit.
- Strict API stays focused — single-arg signature is trivial to learn.

If per-corner turns out to be frequent → easy to add 2/3/4-arg overloads in the future (backward compatible).

### 3. Permissive MUI `theme.shape.borderRadius` remains

We do not augment the `Shape` interface in `@mui/system` (analogous to `theme.spacing()` which stays available for MUI internals). `theme.shape.borderRadius` is used internally by MUI components (Paper, Card, etc.). We only **add** Ring's `getBorderRadius` as a sibling API.

Further plan analogous to spacing:
- **Phase 1** (now): new strict API, documentation.
- **Phase 2** (later): ESLint rule enforcing `getBorderRadius` in new ring-ui-components code.

### 4. Error handling — identical to `getSpacing`

```ts
if (value === undefined) {
    console.error(`[@ringpublishing/mui-theme] Invalid borderRadius factor: ${factor}. Valid factors: ${...}`);
    return '0px';
}
```

`console.error` instead of throw — the app works, missing radius is visually apparent (square corners), QA can notice.

### 5. `reference` fallback — factor=1 = flat, others error

`reference` (Ring legacy) has only `shape.borderRadius = 4` (single number, master parity). No `borderRadiusScale`.

```ts
if ('borderRadiusScale' in cfg) {
    // next path — strict scale lookup
} else {
    // reference path
    if (Number(factor) === 1) return `${cfg.shape.borderRadius}px`;  // '4px'
    console.error('Reference theme exposes only factor 1...');
    return '0px';
}
```

Reason: the consumer should NOT have to care about "which version" — `getBorderRadius(1)` works everywhere. For `factor !== 1` the consumer gets a signal (console.error) that this specific call only makes sense on `next`. This mirrors `getSpacing`'s handling of unsupported factors on `reference` from [ADR-006](006-strict-getSpacing-api.md).

## Mechanisms explained — non-obvious

### 1. `BorderRadiusFactor` as a literal union (analogous to SpacingFactor)

See [ADR-006](006-strict-getSpacing-api.md) — identical pattern. `as const` + `keyof typeof` on `borderRadiusScale` gives union `1 | 2 | 3 | 4 | 5`.

Compile-time check:
```ts
theme.getBorderRadius(2);   // ✅ '8px'
theme.getBorderRadius(6);   // ❌ TS error: '6' is not assignable to BorderRadiusFactor
```

### 2. Cross-version `BorderRadiusFactor` sourced from `next` only

Identical pattern to `SpacingFactor` from [ADR-006](006-strict-getSpacing-api.md): `BorderRadiusFactor` in the augmentation comes from `next/shape.generated.ts`. `reference` does not define its own type (no scale). The runtime handles both versions behind the same API.

Consequence: on `reference` theme, `theme.getBorderRadius(3)` will pass the TS check (because TS sees type `1 | 2 | 3 | 4 | 5`), but runtime will log an error and return `'0px'`. This is a **deliberate trade-off** — gain: cross-version uniform API; cost: runtime divergence for some factors on `reference`.

### 3. Default `shape.borderRadius` (MUI core API) — what about it?

MUI core has `theme.shape.borderRadius: number` (default `4`). Ring leaves this unchanged — `next/shape.generated.ts` emits `shape = { borderRadius: 4, none: 0 }` (factor 1 as MUI default). MUI components (Paper, Card) still read `theme.shape.borderRadius` and render with 4px radius. Our `getBorderRadius` is an **additional** API for Ring code paths where we want strict factor lookup.

## Mechanism Requirements

- Runtime validates factors before returning CSS border-radius values.
- Valid factors resolve through the active theme config.
- `reference` supports factor `1`; unsupported factors log an error and return `'0px'`.
- Type augmentation exposes the same public API in supported MUI style module entry points.
- Tests cover valid factors, unsupported factors, and cross-version behavior.

## Consequences

### Positive

- **Compile-time validation** of the Figma scale (analogous to getSpacing).
- **Cross-version uniform API** — consumer does not think about the version.
- **Low learning overhead** — sibling to the familiar `getSpacing`.

### Neutral

- **Single-arg only** — if per-corner border-radius becomes frequent, refactoring requires adding overloads (backward-compat).
- **`reference` divergence for factor != 1** — deliberate trade-off (see §2 mechanism).

### Negative

- **`theme.shape.borderRadius` still exists** (MUI core). We cannot tighten it without breaking MUI internal. Mitigation: ESLint rule in consumer code (Phase 2).
- **`borderRadiusScale` must be in sync with Figma** — when a designer changes the scale, the plugin re-emits `shape.generated.ts`. The `BorderRadiusFactor` union changes automatically, but consumers using a removed factor get a TS error (good signal).
