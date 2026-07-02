# CHANGELOG
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [4.8.0] - 2026-06-30

### Added
- Syncing workflow to automatically sync changes from the private repository to the public repository.

## [4.7.0] - 2026-06-24

### Added
- `Tooltip` styling for `reference` and `next` theme versions.

## [4.6.1] - 2026-06-19

### Changed
- Updated form input defaults to outlined, with consistent label shrink styling for `MuiInputLabel`, `MuiTextField`, `MuiSelect`, and `MuiFormControl`.

## [4.6.0] - 2026-05-27

### Added
- `getTheme` — new `version` option: `'reference'` (default, unchanged behaviour) | `'next'` (MUI 7 Figma kit — updated palette, spacing and border-radius scale).
- `ScopedThemeOverrides` — scoped component style overrides without a nested `ThemeProvider`.
- `PaletteComponentsMap` / `PaletteComponentsMapOptions` — typed interfaces for `theme.palette.components`.
- `registerComponentsVersion` — helper for sibling packages to register their version with Ring UI Inspector.
- `InspectorBridge` — lazy-loaded Inspector bridge, opt-in via `localStorage.__ring_ui_inspector__` (bookmarklet).
- `SpacingFactor` re-exported from public barrel.

### Changed
- Build migrated from `tsc` to `tsup` — dual ESM/CJS output. Fixes theme defaults silently dropped in Storybook/Vite CJS consumers.
- `getSpacing()` / `getBorderRadius()` — factor `0` accepted; invalid factors fall back gracefully; warnings suppressed in production.
- `@emotion/react` added to `peerDependencies`. `typography.pxToRem()` kept as `@deprecated`.
- Palette and typography refreshed for media image handling and responsive design.

## [4.5.0] - 2026-04-24

### Changed
- [@pjarolewski]: Updated Node.js engine support to include v24 and bump eslint-config version.

## [4.4.1] - 2026-03-25

### Changed
- [@dhebda]: Updated `MuiAccordionSummary` and `MuiAccordionDetails` to add horizontal padding for `outlined` and `elevation` variants.

## [4.4.0] - 2026-03-19

### Added
- `typographyMode` prop added to `ThemeConfig` and `getTheme`. Use `typographyMode="deprecated-px"` for backward compatibility with projects using `html { font-size: 62.5% }`. Will be removed in the next major version.
- New options-based API for `getTheme(mode, options?)` — replaces positional arguments with a `GetThemeOptions` object. Old positional signature is deprecated. See [ADR-001](docs/adr/001-getTheme-options-api.md).
- `GetThemeOptions` interface exported from public barrel.

### Changed
- Default typography units changed from `px` to `rem` (1rem = 16px). `html { font-size: 62.5% }` is no longer required. See [README migration guide](./README.md#typography-units--rem-default-vs-deprecated-px).

### Deprecated
- `getTheme` positional arguments (>2 args) — use `getTheme(mode, { language, themeOverrides, ... })` instead.
- `basicGrey100` and `basicGrey200` named exports — use `theme.palette.grey` instead.

## [4.3.0] - 2026-03-12

### Added
- [@dhebda]: `themeOverrides` parameter added to `getTheme()` and `ThemeConfig` for deep theme customization (palette, typography, spacing, breakpoints, shape, components).

### Fixed
- Replaced `lodash/merge` with MUI's native `createTheme` deep merge — removes `lodash` runtime dependency and fixes spacing array corruption.

## [4.2.0] - 2026-01-19

### Changed
- [@rsarata]: Set default chip size to small.

## [4.1.0] - 2025-12-04

### Changed
- [@rsarata]: Changed heading styles for text editor.

## [4.0.1] - 2025-11-20

### Fixed
- [@psulich]: Fixed MUI X package versions.

## [4.0.0] - 2025-11-18

### Changed
- [@psulich]: **BREAKING** Updated MUI X packages to v8.

## [3.1.2] - 2025-11-14

### Fixed
- [@rmusial2]: Fixed labels positions.

## [3.1.1] - 2025-10-17

### Changed
- [@mdulawa]: Added `repository` field to package.json.

## [3.1.0] - 2025-10-17

### Changed
- [@pniewiejski]: Renamed `skeleton` to `dataview` to match component name change.

## [3.0.2] - 2025-10-06

### Fixed
- [@psulich]: Fixed `Autocomplete` label position.

## [3.0.1] - 2025-10-02

### Fixed
- [@psulich]: Fixed colors typing in theme augmentation.

## [3.0.0] - 2025-09-23

### Added
- [@psulich]: Added theme module augmentation for ESM.

### Changed
- [@psulich]: **BREAKING** Added support only for MUI v7.

## [2.3.1] - 2025-09-18

### Added
- [@omaziarz]: Added color extension in theme for backward compatibility.

## [2.3.0] - 2025-08-26

### Added
- [@pniewiejski]: Added styles for `ToggleButton` component.

## [2.2.0] - 2025-08-18

### Added
- [@dhebda]: Added custom colors to theme.

## [2.1.0] - 2025-03-04

### Added
- [@omaziarz]: Added shrink styles to label for all components.

## [2.0.0] - 2025-02-20

### Added
- [@jpalis]: **BREAKING** Added support only for MUI v6. Removed support for MUI v5.
- [@jpalis]: Added support for React 19.

## [1.3.0] - 2025-02-05

### Added
- [@pjarolewski]: Added support for Node v22.

## [1.2.0] - 2025-01-17

### Added
- [@jpalis]: Added GitHub Actions setup.

## [1.1.0] - 2024-01-02

### Added
- [@jpalis]: Added missing `publishConfig`.
- [@jpalis]: Added `.npmignore`.

### Changed
- [@jpalis]: Changed name to `@ringpublishing/mui-theme`.
- [@jpalis]: Updated required libs to match UI-Components (MUI = 5.15.x, MUI X <= 7.x.x).

### Fixed
- [@jpalis]: Fixed dependencies and license in package.json.

## [1.0.0] - 2024-11-27

### Added
- [@jpalis]: Added CONTRIBUTING.md, LICENSE.md and MuiFormLabel styles in `Autocomplete`.

### Changed
- [@jpalis]: Updated typography.

## [0.1.0] - 2024-10-30

### Added
- [@jpalis]: Initial theme config — breakpoints, palette, shape, spacing, typography, `getTheme()` export and `ThemeConfig` component.

## [0.0.0] - 2024-10-21

### Added
- [@jpalis]: Initial commit.
