# ADR 008 — Visual Playground Extracted to Standalone Repo

- **Status:** Accepted
- **Date:** 2026-05-28
- **Supersedes:** —
- **Superseded by:** —
- **External:** [`@ringpublishing/mui-theme-playground`](https://github.com/ringpublishing/ring-ui-mui-theme-playground) — new sibling repo

## Summary (TL;DR)

We extract the visual playground from `ring-ui-mui-theme` into a separate private repo: `@ringpublishing/mui-theme-playground`. The playground consumes `@ringpublishing/mui-theme` through the standard npm package path instead of a local source alias. Local iteration uses `npm link`. The runtime API of theme.lib remains unchanged.

## Context

`ring-ui-mui-theme` mixed two responsibilities in one repo:

- **Published theme library** — tokens, `getTheme`, `InspectorBridge`, MUI augmentation, and runtime code consumed by `ring-ui-components` and Ring apps.
- **Dev playground** — Vite app used by DS developers to visually inspect theme changes.

This created avoidable coupling:

- dev-only playground files could leak into the published package surface;
- playground-only changes polluted theme.lib changelog and release scope;
- dev tooling boundaries between runtime, tests, and playground became unclear;
- the repo layout differed from the separate-repo pattern already used by `ring-ui-mui-inspector`.

## Decision

Move the playground into `@ringpublishing/mui-theme-playground` and keep `ring-ui-mui-theme` focused on the published theme package, tests, scripts, and documentation.

The new playground repo is private and consumes the theme package as an npm dependency. Local development uses `npm link` to connect a local theme.lib build to the playground without committing `file:../` aliases.

## Consequences

### Positive

- Cleaner npm package boundary: the theme package no longer carries playground-only files.
- Clearer PR and changelog scope: playground changes do not force theme.lib release notes.
- Better consumer DX: consumers can use any published theme.lib version independently of playground development.
- Consistent ecosystem layout: playground follows the separate-repo precedent set by the inspector.

### Negative

- DS developers need two repos for visual review.
- Playground dependency bumps become a separate maintenance task.
- Playground history before extraction remains in `ring-ui-mui-theme` history.

### Deliberate Non-Effects

- Runtime API `getTheme`, `ThemeConfig`, and `InspectorBridge` remains unchanged.
- Existing consumers require no code changes.
- Theme.lib tests remain in this repo.

## Alternatives

| # | Option | Status |
|---|---|---|
| **A** | Minimal packaging-only fix while keeping playground in this repo. | Partially rejected — reduces package leakage but keeps PR/changelog scope coupling. |
| **B** | Split into an in-repo workspace. | Rejected — adds publish workflow complexity without enough benefit. |
| **C** | Separate repo. | Accepted — clear boundary, consistent with the inspector repo, low CI risk. |

## Validation

- The theme test suite passed at decision time.
- Type-check passed at decision time.
- Package dry-run confirmed the playground was no longer included in the theme package.
- Manual smoke testing confirmed local playground iteration through `npm link`.

## References

- `ring-ui-mui-inspector` as precedent: separate repo, same npm consumption pattern.
- Keep a Changelog: https://keepachangelog.com/en/1.1.0/
