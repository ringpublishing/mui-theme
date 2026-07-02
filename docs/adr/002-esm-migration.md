# ADR-002 (rev. 2): Migration of `@ringpublishing/mui-theme` to dual package (ESM + CJS)

## Status

Accepted (2026-04-15), Revised (2026-06-11)

## Context

`@ringpublishing/mui-theme` historically shipped as a **CommonJS** package. Verified empirically at the time:

| Signal | Value |
|---|---|
| `package.json.type` | absent (default `"commonjs"`) |
| `package.json.exports` | absent (only `main`, `types`) |
| Compiled `dist/index.js` | `require(...)` + `Object.defineProperty(exports, "__esModule", ...)` |

`@ringpublishing/ui-components` — the strongest consumer of the theme — is ESM-native. Currently, consumers import the theme via the `exports` map using the ESM entry, while Node interop still allows CJS in some flows. A consistent story for both module systems reduces friction.

The shared tsconfig package provides presets that work for both CJS and ESM builds; we no longer rely on a specific `tsconfig.esm` file path here.

### Tensions in the previous state

1. **MUI 8** (expected 2026–2027) is trending towards ESM-first — preparing the theme for ESM is prudent.
2. **Asymmetry for developers** moving between repos that are ESM-first vs. a CJS-only theme.

### How others do it

- MUI 7 — **dual package** (ESM + CJS via `exports` map). Safe and broadly compatible.
- emotion — ESM-first with CJS fallback.
- `@mui/x-*` packages — ESM-first.
- ring-ui-components (our ecosystem) — ESM-native.

Pure ESM is more common for packages consumed strictly inside an ESM ecosystem; Dual package remains the most compatible option for libraries with mixed consumers or tooling.

## Decision

We ship `@ringpublishing/mui-theme` as a **dual package (ESM + CJS)** with a proper `exports` map. This aligns with MUI 7 and maximizes compatibility for internal apps and tools while enabling ESM-native consumption.

## Concrete Changes

1. `package.json`:

   - Keep CJS (`main`) and ESM (`module`) artifacts.
   - Define an `exports` map exposing both `import` and `require` targets with matching `types` entries.

   Example (illustrative; see repo for the authoritative config):

   ```json
   {
     "main": "./dist/index.js",
     "module": "./dist/index.mjs",
     "types": "./dist/index.d.ts",
     "exports": {
       ".": {
         "import": {
           "types": "./dist/index.d.mts",
           "default": "./dist/index.mjs"
         },
         "require": {
           "types": "./dist/index.d.ts",
           "default": "./dist/index.js"
         }
       }
     }
   }
   ```

2. TypeScript config:

   - Continue extending the shared `@ringieraxelspringer/tsconfig` base.
   - Build outputs for both module systems are produced by the bundler (tsup) and typings are emitted accordingly — no need to switch to `NodeNext` resolution across the codebase.

3. Source imports:

   - No mechanical rewrite of relative imports to add `.js` extensions is required in this dual-package setup (the bundler handles resolution).

4. Tests and CI/CD:

   - Vitest remains compatible without changes.
   - `engines.node` set to `^18||^20||^22||^24` is sufficient for both ESM and CJS consumers.

## What We Do NOT Change

- **Public theme API** — `getTheme`, `ThemeConfig`, `CommonLanguages`, `TypographyMode`, and types remain identical.
- **Runtime behavior** — unchanged; we only adjust packaging/exports.
- **Peer deps / deps** — unchanged.

## Consequences

### Positive

- **Compatibility** with both ESM and CJS consumers, matching MUI’s recommended pattern.
- **Smooth interop** with ring-ui-components (ESM) and any legacy flows still expecting CJS.
- **Predictable tree-shaking** for ESM consumers via the ESM entry.

### Negative

- **Slightly larger npm artifact** and build complexity versus a pure-ESM package.

## Alternatives Considered

### A. Pure ESM only

Rejected — would require all consumers/tooling to be ESM-ready immediately, while our internal landscape still has places where CJS interop is convenient or expected. The marginal gains do not justify breaking compatibility now.

### B. Status quo (CJS only)

Rejected — blocks ESM-native consumption benefits and goes against the direction of the broader ecosystem.

## Migration Plan (executed)

1. Update `package.json` with `module` field and `exports` map providing both `import` and `require` targets (and their `types`).
2. Ensure tsup build produces both ESM (`.mjs`, `.d.mts`) and CJS (`.js`, `.d.ts`) outputs.
3. Verify CI:
   - `npm run build` emits both formats.
   - `npm test` passes.
4. Validate consumption in key internal projects (ring-ui-components and selected apps) without code changes — only lockfile bumps.

## Files Affected

- `package.json` — `module`, `exports`, and types wiring.
- `tsconfig.*.json` — continue extending the shared base; no sweeping change required.
- `dist/` — contains both CJS and ESM outputs plus matching type files.

## Notes

- Earlier mentions of a Style Dictionary-based pipeline and `.mjs` workarounds were removed from this ADR revision as they no longer reflect the repository’s current structure.
- Wording updated to avoid implying that the entire Ring organisation migrated; we specifically reference relevant repositories/packages in the ecosystem.

## References

- [Node.js ESM Documentation](https://nodejs.org/api/esm.html)
- [TypeScript — Module Resolution (NodeNext)](https://www.typescriptlang.org/docs/handbook/modules/reference.html#node16-nodenext)
- [MUI 7 — dual-package `exports` map](https://github.com/mui/material-ui/blob/v7.0.0/packages/mui-material/package.json)
