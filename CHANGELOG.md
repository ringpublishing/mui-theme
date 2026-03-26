# CHANGELOG
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [4.4.1] - 2026-03-25

### Changed
- [@dhebda]: Updated `MuiAccordionSummary` and `MuiAccordionDetails` to add horizontal padding for `outlined` and `elevation` variants while maintaining compact default padding (zero/vertical-only) for all variants.

## [4.4.0] - 2026-03-19

### Changed
- [@wniemiec]: Changed default font sizes in typography from `px` to `rem` (1rem = 16px). `html { font-size: 62.5% }` is no longer required. Use `typographyMode="deprecated-px"` for backward compatibility. See [README migration guide](./README.md#typography-units--rem-default-vs-deprecated-px).

### Added
- [@wniemiec]: Added `typographyMode` prop to `ThemeConfig` and `getTheme`. Use `typographyMode="deprecated-px"` for backward compatibility with projects using `html { font-size: 62.5% }`. Will be removed in the next major version.
- [@wniemiec]: Added new options-based API for `getTheme(mode, options?)` — replaces positional arguments with a `GetThemeOptions` object. Old positional signature is deprecated and logs a console warning. See [ADR-001](docs/adr/001-getTheme-options-api.md).
- [@wniemiec]: Added `GetThemeOptions` interface export for consumers using `getTheme` directly.
- [@wniemiec]: Added `docs/adr/` with Architecture Decision Records.

### Deprecated
- [@wniemiec]: `getTheme` positional arguments (>2 args) — use `getTheme(mode, { language, themeOverrides, ... })` instead.
- [@wniemiec]: `basicGrey100` and `basicGrey200` named exports — use `theme.palette.grey` instead.

## [4.3.0] - 2026-03-12

### Added
- [@dhebda]: Added `themeOverrides` parameter to `getTheme()` and `ThemeConfig` for deep theme customization (palette, typography, spacing, breakpoints, shape, components).
### Fixed
- Fixed spacing array corruption caused by incorrect `lodash/merge` on non-object values.
- Replaced `lodash/merge` with MUI's native `createTheme` deep merge — removed `lodash` runtime dependency.
- Fixed `getTheme` parameter order: `themeOverrides` is now the last (6th) parameter, preserving backward compatibility for existing callers.
- Added `@deprecated` JSDoc to `externalComponentsTheme` and `externalColors` in `getTheme`.
- Fixed `ownerState: any` typing in MuiAutocomplete style override.
- Added comprehensive test coverage for `themeOverrides` functionality.

## 4.2.0 - 2026-01-19
### Changed
- [@rsarata]: Set default chip size to small.

## 4.1.0 - 2025-12-04
### Changed
- [@rsarata]: Changed heading styles for text editor.

## 4.0.1 - 2025-11-20
### Fixed
- [@psulich]: Fixed MUI X package versions.

## 4.0.0 - 2025-11-18
### Changed
- [@psulich]: **BREAKING** Updated MUI X packages to v8.

## 3.1.2 - 2025-11-14
### Fixed
- [@rmusial2]: Fixed labels positions.

## 3.1.1 - 2025-10-17
### Changed
- [@mdulawa]: Added `repository` field to package.json.

## 3.1.0 - 2025-10-17
### Changed
- [@pniewiejski]: Rename `skeleton` to `dataview` to match component name change.

## 3.0.2 - 2025-10-06
### Fixed
- [@psulich]: Fixed `Autocomplete` label position.

## 3.0.1 - 2025-10-02
### Fixed
- [@psulich]: Fixed colors typing in theme augmentation.

## 3.0.0 - 2025-09-23
### Added
- [@psulich]: Added theme module augmentation for ESM.

### Changed
- [@psulich]: **BREAKING**: Added support only for MUI v7.

## 2.3.1 - 2025-09-18
### Added
- [@omaziarz]: Added color extension in them for backward compatibility.

## 2.3.0 - 2025-08-26
### Added
- [@pniewiejski]: Added styles for `ToggleButton` component.

## 2.2.0 - 2025-08-18
### Added
- [@dhebda]: Added custom colors to theme.

## 2.1.0 - 2025-03-04
### Added
- [@omaziarz]: Added shrink styles to label for all components.

## 2.0.0 - 2025-02-20
### Added
- [@jpalis]: **BREAKING**: Added support only for MUI v6.
- [@jpalis]: Added support for React 19.

### Removed
- [@jpalis]: **BREAKING**: Removed support for MUI v5.

## 1.3.0 - 2025-02-05
### Added
- [@pjarolewski]: Added support for Node v22

## 1.2.0 - 2025-01-17
### Added
- [@jpalis]: Added github actions set up.

## 1.1.0 - 2024-01-02
### Added
- [@jpalis]: Added missing `publishConfig`.
- [@jpalis]: Added .npmignore.

### Changed
- [@jpalis]: Changed name to `@ringpublishing/mui-theme`.
- [@jpalis]: Changed required libs to match UI-Components (Mui = 5.15.x, mui-x libs <= 7.x.x)

### Fixed
- [@jpalis]: Fixed dependencies.
- [@jpalis]: Fixed license in package.json.

## 1.0.0 - 2024-11-27
### Changed
- [@jpalis]: Changed typography.

### Added
- [@jpalis]: Added CONTRIBUTING.md file.
- [@jpalis]: Added LICENSE.md file.
- [@jpalis]: Added MuiFormLabel styles in `Autocomplete`.

## 0.1.0 - 2024-10-30
### Added
- [@jpalis]: Added config files for theme creation (breakpoints, palette, shape, spacing, typography).
- [@jpalis]: Added getTheme() export with mui theme.
- [@jpalis]: Added `ThemeConfig` component with MUI `ThemeProvider` inside.
- [@jpalis]: Added test for getTheme() and `ThemeConfig`.

## 0.0.0 - 2024-10-21
### Added
- [@jpalis]: Initial commit.
