# ADR 009 — InspectorBridge as Single-Source Bridge to Ring UI Inspector

- **Status:** Accepted
- **Date:** 2026-05-28
- **Supersedes:** —
- **Superseded by:** —
- **External:** `ring-ui-mui-inspector` (internal) — overlay consuming the handle

## Summary (TL;DR)

We choose **`InspectorBridge` as the only supported mechanism** publishing `window.__RING_UI__` from `@ringpublishing/mui-theme`. The bridge is lazy-loaded inside `ThemeConfig` and activated by the `sessionStorage.__ring_ui_inspector__` flag. We do not publish parallel public APIs for the same contract.

The `RingHandle` contract (`window.__RING_UI__` shape) is not the subject of this decision. This ADR only chooses the producer mechanism on the theme.lib side. The current contract version and shape remain defined in code.

## Context

### Why One Mechanism

| Mechanism | Assumption | Problem |
|---|---|---|
| Separate stateful provider | The consumer replaces `ThemeConfig` with a new provider in the top-level React tree. | Requires migrating every Ring app. Violates the "zero migration for apps using `ThemeConfig`" constraint. |
| Adapter-based helper | The host provides `{ getState, setVariant, setMode }`; the library wraps it in a handle and publishes it on `window.__RING_UI__`. | Duplicates publish/unpublish/lifecycle logic and requires the consumer to own state management. |
| **`InspectorBridge`** lazy-loaded inside `ThemeConfig` | `ThemeConfig` stays a thin wrapper. A gated effect dynamically imports `InspectorBridge` and renders it next to the theme provider. The bookmarklet sets the flag, refreshes, and the handle appears on `window.__RING_UI__`. | Satisfies the DS constraints: every Ring app can expose the handle without migration, existing `ThemeConfig` consumers do not change code, and there is one bridge, one gate, one diagnostic path. |

### External Consumer Audit

The audit performed at decision time found no external call sites for alternative handle producers. The inspector keeps its own type copy and synchronizes it with the theme.lib contract when the contract changes.

### Consequence Of Shipping Multiple Proposals

- Multiple public APIs would publish the same handle with different assumptions.
- DS developers choosing a bridge would not have a clear recommendation.
- Test coverage would duplicate lifecycle, publish, and unpublish scenarios.
- Every `RingHandle` contract change would require updating multiple producers.

## Decision

### Kept

- **`InspectorBridge`** — the only producer of `window.__RING_UI__` on the theme.lib side.
- **`ThemeConfig`** with a lazy gate based on `sessionStorage.__ring_ui_inspector__`.
- **`handleContract.ts`** — the single source of truth for `RingHandle`, `RingHandleStateSnapshot`, `HANDLE_CONTRACT_VERSION`, and the handle publish/unpublish event names.
- **`global.d.ts`** — `window.__RING_UI__` augmentation.

### Abandoned Before Merge

- Alternative stateful provider for the runtime inspector.
- Adapter-based helper for hosts that own theme state externally.
- Planned exports for the above mechanisms.

### Unchanged Inspector Contract

- The handle wire format does not change as part of this decision.
- Event names remain unchanged.
- The `RingHandle` shape remains unchanged.

The inspector does not require code changes. The bookmarklet workflow stays the same.

## Consequences

### Positive

- **Single bridge mechanism** — one API, one test surface, one diagnostic path when the handle is not published.
- **Zero migration for consumers** — Ring apps using `ThemeConfig` can expose the handle after the bookmarklet sets the sessionStorage flag.
- **Minimal package surface** — the package ships only the supported bridge; alternative mechanisms do not enter the public API.
- **Single test suite** — only `InspectorBridge` tests need to be maintained.
- **Clear documentation story** — DS developers get one answer for enabling the inspector: bookmarklet, sessionStorage, refresh.

### Negative

- **No public API for bring-your-own-state hosts** — Storybook toolbar or Redux integrations must either use `ThemeConfig` as the mount point or implement their own publisher compatible with `window.__RING_UI__`.
- **Lazy activation requires a page refresh** — the bookmarklet flow is `set flag -> reload`. This is intentional isolation between the host app and inspector code paths, but the bookmarklet must handle the UX.
- **Handle contract synchronization remains manual** — contract bumps still require a coordinated update in `ring-ui-mui-inspector`.

### Deliberate Non-Effects

- Runtime API `getTheme`, `ThemeConfig`, and `InspectorBridge` stays unchanged.
- The inspector overlay repo requires no change.
- The bookmarklet requires no change.

## Alternatives

| # | Option | Status |
|---|---|---|
| **A** | Keep all bridge mechanisms and document when to use each. | Rejected — documentation would not fix overlapping producer logic and unclear ownership. |
| **B** | Ship the alternative provider as a deprecated alias immediately. | Rejected — no external call sites; publishing a warning path creates maintenance cost without benefit. |
| **C** | `InspectorBridge` wins; other proposals are dropped. | Accepted — domain audit confirmed no external impact. |
| **D** | Remove all bridge mechanisms and leave theme.lib without any inspector bridge. | Rejected — violates the requirement that the DS inspector can run on every Ring app without per-app setup. |

## Validation

- The test suite passed at decision time.
- Type-check passed at decision time.
- Manual smoke testing confirmed `window.__RING_UI__` publication after activating the inspector flag.

## References

- Abandoned alternative mechanisms remain only in feature branch history.
- `handleContract.ts` is the module that must stay synchronized cross-repo with `ring-ui-mui-inspector`.
