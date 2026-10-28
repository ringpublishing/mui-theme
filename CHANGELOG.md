# CHANGELOG
The format is based on [Keep a Changelog](https://keepachangelog.com/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [5.0.1] - 2026-10-27

### Fixed
- The package's type declarations compile in an application with `skipLibCheck: false`.

## [5.0.0] - 2026-10-27

### Added
- `ThemeConfig` renders its children once the theme's font family (Inter) is loaded in every weight its typography uses, so the app does not flash the fallback font; works with a Google Fonts `<link>` and `@fontsource/inter`. A page rendered on the server hydrates at once, without waiting. Opt out with `waitForFonts={false}`.
- `getThemeFonts(theme)`, `areThemeFontsReady(fonts)` and `waitForThemeFonts(fonts)` for applications that mount their own `ThemeProvider` instead of `ThemeConfig`.
- `RingIconDefaults` — gives plain `lucide-react` icons the design system's 20px size and 1.5px stroke, MUI palette names in `color` and the `SvgIcon` sizes in `fontSize`; `ThemeConfig` mounts it, an application with its own `ThemeProvider` mounts it inside, explicit props win.
- `DEFAULT_LUCIDE_ICON_SIZE`, `DEFAULT_LUCIDE_STROKE_WIDTH`, `RING_LUCIDE_PALETTE_COLORS` and `lucidePaletteRules(theme, scope?)`; `lucidePaletteRules` scopes the palette rules to a subtree on another theme.
- `palette.components.featuredIcon` — the FeaturedIcon plate fills from the design export: `defaultFill`, `primaryFill`, `infoFill`, `successFill`, `warningFill`, `errorFill`.
- `theme.featuredIcon` (type `FeaturedIconMetrics`) — the sizing rule of the featured icon: fixed plates of 40, 60 and 80px; `inherit` takes half of the shorter side of its box, 40–120px; the glyph is 40% of the plate, with a 1px stroke under 24px.
- `theme.ringComponents.RingFileUploader` — the look of the `FileUploader` of `@ringpublishing/mui-components`: the drop area per size and state, the URL row, the files counter and the file rows, one style per slot that receives `ownerState` (types `RingFileUploaderClassKey`, `RingFileUploaderOwnerState`, `RingFileUploaderSize`, `RingFileUploaderFileStatus`, `RingFileUploaderSlotStyle`, `RingFileUploaderStyles`); `theme.components.RingFileUploader.styleOverrides` is left to the application and is layered on top of it. Under 400px of the uploader's own width every part switches to its compact layout.
- `palette.components.fileUploader` — the FileUploader drop-area colours: `enabledBorder`, `hoverBorder`, `dragOverBorder`, `dragOverFill`, `errorBorder`, `errorFill`; a palette without them gets the same colours from `divider`, `primary.main` and `error.main`.
- `Chip` draws the design system's Outlined and Filled surfaces from `palette.components.chip.*`: solid fills, the `#A8B7CC` border on both variants, hover / focus / pressed fills on clickable chips, and a **selected** state keyed on `.Mui-selected`, `aria-pressed="true"` or `aria-selected="true"`.
- `Chip` renders lucide's `x` as its default delete glyph, so a chip with `onDelete` shows the same X as the rest of the design system without passing `deleteIcon`; a `deleteIcon` passed by the consumer still wins.
- `<Chip variant="tag">`: a non-interactive label (small, 4px corners, 1px border) in the ten tag colours (`stone`, `sky`, `azure`, `lavender`, `blush`, `coral`, `peach`, `lemon`, `sage`, `teal`), the four semantic colours and `neutral` (the default); `palette.tag` is typed.
- `<Chip variant="tag" color="ai">` is the AI flag: the AI surface in the tag's box, so a status label and a standalone flag look the same.
- Global scrollbar styling from `MuiCssBaseline`: every scroll container gets a thin thumb on a transparent track through the standard properties, `scrollbar-width: thin` on every element and `scrollbar-color` on `html`, from where it inherits, so a subtree recolours its scrollbars with one `scrollbar-color` on its root. The browser's own scrollbar is only restyled, so macOS overlay scrollbars keep auto-hiding and take no layout space, while classic scrollbars keep taking layout space, only narrower and recoloured; Safari applies the width from 18.2 and the colour from 26.2. The thumb colour is `palette._native.scrollbarBackground`.
- `palette._native.scrollbarBackground` — thumb colour of the native scrollbar, from the design export: `grey/900` at 50% in light, `grey/50` at 55% in dark.
- `palette.components.switch.knobFillDisabled` — corrected spelling of the disabled knob slot; the misspelled `knowFillDisabled` stays typed as deprecated. Both are optional; the theme reads the corrected one.
- `MuiSwitch` renders the redesigned switch: the thumb travels inside a tall pill track, in `medium` and `small` sizes, with all colors from the palette; every plain MUI `Switch` gets this look, no code change needed.
- `color="overlay"` on `IconButton` and `Checkbox` takes its plate and glyph from `palette.components.overlay`.
- `palette.components.media.backgroundFill` fills the frame behind a media asset wherever its ratio does not fill it.

### Changed
- **BREAKING** — `ThemeConfig` and `getTheme` build the redesigned Ring design system instead of the 4.x look: a new palette in light and dark, typography set in Inter, shadows and component styles. Load Inter (`@fontsource/inter`, weights 300–700) or text falls back to the system font, and review your screens.
- **BREAKING** — `MuiTextField`, `MuiSelect` and `MuiFormControl` default to `variant="outlined"` instead of `standard`, so fields gain a border and render `MuiOutlinedInput-*` instead of `MuiInput-*` classes; pass `variant="standard"` where a field must stay standard and update selectors on the old classes.
- **BREAKING** — the `xs` breakpoint starts at 0 instead of 444px; review `xs` values in `sx` and in `theme.breakpoints` queries.
- **BREAKING** — the `label` and `headline1`–`headline3` typography variants are no longer styled, though they still type-check; use a standard variant (`caption`, `subtitle1`, `subtitle2`) with the weight or transform you need.
- **BREAKING** — the `palette`, `typography`, `breakpoints`, `shape` and `spacing` exports keep the 4.x values and no longer match the default theme; read the values from the theme (`useTheme()`, `getTheme()`) instead.
- **BREAKING** — `palette.contrast` comes from the design export: `contrastText` is `primary.main`, and in dark `main`, `dark` and `light` are `common.black`; the `hover`, `selected`, `focus`, `focusVisible`, `outlinedBorder` and `contrast` slots are gone — use `alpha(palette.contrast.main, palette.action.<state>Opacity)`.
- **BREAKING** — `ThemeConfig` mounts `RingIconDefaults`, so a plain `lucide-react` icon renders 20px with a 1.5px stroke at every size instead of 24px with a 2px stroke that scales with the icon; wrap a subtree in `lucide-react`'s `<LucideProvider>` to keep lucide's defaults.
- **BREAKING** — `AccordionSummary` without an `expandIcon` shows lucide's `chevron-down` in a 20px box; pass `expandIcon={null}` to keep a summary without one.
- `Select` opens with lucide's `chevron-down`, the glyph `Autocomplete` uses, in place of MUI's filled triangle; an `IconComponent` passed to the select still wins.
- `Autocomplete` opens with lucide's `chevron-down` and clears with lucide's `x` in place of MUI's triangle and filled close icon, as the Ring `Autocomplete` already did; a `popupIcon` or `clearIcon` passed to it still wins.
- Date and time pickers open with lucide's `calendar-days` / `clock` and clear with `x`, and the calendar header and month arrows use lucide chevrons; `slots` passed to a picker still win.
- `Alert` marks its severities with lucide's `circle-alert`, `info`, `circle-check` and `triangle-alert`; an `icon` passed to it still wins, and an `iconMapping` replaces all four.
- `SimpleTreeView` and `RichTreeView` expand and collapse items with lucide's `chevron-right` / `chevron-down`; icons passed to the tree view or to an item still win.
- The Data Grid sort arrows and column menu button are lucide's `arrow-up`, `arrow-down` and `ellipsis-vertical`; `slots` passed to the grid still win.
- **BREAKING** — `lucide-react` (`^1.42.0`) is a peer dependency: `ThemeConfig` mounts its `LucideProvider`, and the theme takes the default icons of MUI and MUI X components from it. npm 7+ and pnpm 8+ install it automatically; with yarn 1 add it to the application (`npm i lucide-react`).
- **BREAKING** — the `@mui/x-data-grid`, `@mui/x-data-grid-pro`, `@mui/x-date-pickers` and `@mui/x-date-pickers-pro` peer ranges start at 8.17.0 instead of 8.0.0; upgrade the MUI X packages you use before the theme.
- Filled `Chip` without a `color` is a `#E2E8F0` surface with an `#A8B7CC` border instead of an `#E9E9E9` fill without a border.
- **BREAKING** — filled `Chip` with `color="error" | "warning" | "info" | "success"` is the colour's alert surface with a `light` border, primary text and `dark` glyphs instead of a solid fill with contrast text; status labels over imagery lose contrast and need an opaque backing.
- **BREAKING** — disabled `Chip` keeps full opacity and takes its surface, border, text and glyph colours from `action.disabledBackground`, `action.disabled` and `text.disabled`.
- **BREAKING** — `Chip` delete icon is a fixed 16px (small) / 20px (medium) box whatever glyph or `size` is passed, in solid `action.active` on the default colour (`text.primary` on hover); the label is inset 6px from a 4px root padding, so a small chip is 2px wider and a medium one 2px narrower.
- **BREAKING** — `Chip` avatar on the default colour is `secondary.dark` with contrast text (`chip.outlinedSelectedBorder` when selected).
- A `Chip` leading `icon` starts at the label's 6px inset, so the glyph and the first letter of an icon-less chip line up; a chip with an icon is 6px wider.
- The hover halo of a checked or `error` `Switch` is tinted at `palette.action.hoverOpacity`.
- `palette.action.{hover,selected,focus,activated,disabled}Opacity` come from the design export instead of hand-written values; the values are unchanged.
- **BREAKING** — `palette._native['scrollbar-bg']` is withdrawn; read `palette._native.scrollbarBackground`.
- **BREAKING** — global scrollbar styling sets `scrollbar-width` on every element and `scrollbar-color` on `html`, so Chromium 121+ and Safari 18.2+ ignore every `::-webkit-scrollbar*` rule, `display: none` included; style or hide a scrollbar with `scrollbar-width` / `scrollbar-color` instead (`scrollbarWidth: 'none'` on the element that scrolls hides it and keeps it scrollable).
- **BREAKING** — the theme now defines `MuiButton`, `MuiIconButton`, `MuiCheckbox`, `MuiSwitch`, `MuiInputBase`, `MuiInput`, `MuiFilledInput`, `MuiInputAdornment`, `MuiFormHelperText`, the date and time pickers (`MuiDatePicker`, `MuiDesktopDatePicker`, `MuiMobileDatePicker`, `MuiDateTimePicker`, `MuiDesktopDateTimePicker`, `MuiMobileDateTimePicker`, `MuiTimePicker`, `MuiDesktopTimePicker`, `MuiMobileTimePicker`, `MuiPickersCalendarHeader`, `MuiPickersArrowSwitcher`, `MuiPickersInputBase`, `MuiPickersInput`, `MuiPickersFilledInput`, `MuiPickersOutlinedInput`) and `MuiSimpleTreeView` / `MuiRichTreeView`, so an entry for any of them passed through `externalComponentsTheme` is replaced rather than merged; move those overrides to `themeOverrides.components`.
- **BREAKING** — the theme now defines `MuiDataGrid`, so a `MuiDataGrid` entry passed through `externalComponentsTheme` — `ringDataGridOverrides` included — is replaced rather than merged; move it to `themeOverrides.components`.
- **BREAKING** — `MuiButton.root`, `MuiIconButton.root`, `MuiChip.root`, `MuiSwitch.root`, `MuiInputBase.root`, `MuiInput.root` and `.input`, `MuiFilledInput.root` and `.input`, `MuiOutlinedInput.root` and `.input`, `MuiFormHelperText.root`, `MuiAccordionSummary.expandIconWrapper`, `MuiPickersInputBase.root` and `.sectionsContainer`, `MuiPickersInput.root`, `MuiPickersFilledInput.root`, `MuiPickersOutlinedInput.root` and `MuiPickersCalendarHeader.switchViewButton` are styled by functions, so an object passed for one of these slots in `themeOverrides.components` replaces the theme's style instead of adding to it; pass a function that repeats the styles you keep, or style the element with `sx`.
- **BREAKING** — the dark palette sits on the slate ground: `background.default` and `background.paper` are `#0F172A` instead of `#262626` and `#121212`, and `text.primary` is white at 87% opacity.
- **BREAKING** — `palette.components.detail.close` and `palette.components.mediaImage` are withdrawn; controls over imagery use `color="overlay"`, and the media frame reads `palette.components.media.backgroundFill`.
- **BREAKING** — palette keys of the 4.x theme that the redesign does not define read `undefined`, and an `sx` path to one sets no colour: the `hover`, `selected`, `focusVisible`, `outlinedBorder` and `contrast` slots of `primary`, `secondary`, `error`, `warning`, `info` and `success` (and `focus` of `primary` and `secondary`), the `hover`, `selected`, `focus` and `focusVisible` slots of `text`, `background['paper-elevation-0']` to `background['paper-elevation-24']`, `elevation.outlined` and `elevation.Color`, `palette.components.avatar.fill`, `palette.components.switch.slideFill`, `palette.components.chip.defaultCloseFill`, `defaultHoverFill`, `defaultEnabledBorder` and `defaultFocusFill`, and `palette.components.skeleton.border`.
- **BREAKING** — `Autocomplete` opens its list on elevation 8, as `Menu` and `Select` do; `slotProps.paper.elevation` still sets another one, but a `slotProps.paper` passed as a function is ignored — pass an object.
- **BREAKING** — `ringDataGridOverrides` colours the Data Grid lines drawn with `--DataGrid-rowBorderColor` (rows, column headers, vertical cell and header borders, pinned-column edges, header filters) with `palette.divider` instead of `palette.components.datagrid.border`; to keep another colour, set `--DataGrid-rowBorderColor` in `components.MuiDataGrid.styleOverrides.root`.

### Deprecated

- `palette.components.datagrid.border` and `palette.components.dataview.border`; use `palette.divider`.
- `theme.colors`, the `colors` export and the `Colors` type — the raw colour scales are not part of the design system; read the tokens in `theme.palette` instead. They stay in place throughout 5.x.

### Removed

- **BREAKING** — the `basicGrey100` and `basicGrey200` exports; use `palette.divider` for borders and dividers and `palette.text.secondary` for grey icons and text.

### Fixed
- `ringDataGridOverrides` — a Data Grid whose columns exactly fill its width no longer has hidden horizontal overflow from the last column header, so it cannot be shifted sideways; the last header is clipped, which also clips the right half of its resize handle.
- A multiline outlined text field keeps a start or end adornment 14px from the border, as a single-line one does.
- An outlined input with a start adornment starts its text 8px after the adornment instead of 24px.
- `MuiCssBaseline` and `MuiAutocomplete` no longer log Emotion warnings in development (`:first-child` in the text editor reset, kebab-case `align-items` on a `multiple` `Autocomplete`); the generated CSS is unchanged.
- Outlined input helper text is horizontally aligned with the outlined label by using the same 8px (`spacing(1)`) inset.
- Date/time picker fields center their text vertically, with the selection highlight on the field's midline.
- Fixed disabled colors in pickers.
- `MuiOutlinedInput` and `MuiPickersOutlinedInput` height and padding.
- Text in outlined inputs (text fields, multiline, `Select`, `Autocomplete`) and date/time picker fields is 14px / 24px, per the design.
- `IconButton` is a square box matching the `Button` heights: 32 (`small`), 36 (`medium`), 40 (`large`); inside an input (any variant, `Autocomplete` and picker fields included) it is 28px in a medium field and 24px in a small one, with a 20px glyph.
- Filled inputs and standard inputs inside a form control (`TextField`), including `Autocomplete`, `Select` and the matching date/time picker fields, are 32px (`small`) / 40px (`medium`) like outlined; a bare standard `Input` or `Select` keeps the height of its content. A filled field shows its label above the field instead of floating inside it; a standard field keeps the floating label, which rests in the empty field at the 14px of the input text and moves up to a caption above the field on focus, once filled or with a start adornment.

## [4.10.1] - 2026-08-11

### Fixed
- `next` theme — small outlined inputs (text fields and pickers) use the 8px vertical padding from the spacing scale instead of MUI's 8.5px.

## [4.10.0] - 2026-08-11

### Added
- `Palette.action.disabledBackgroundLight` — optional typing for the lighter disabled surface generated for `next`; `undefined` under `reference`.

### Changed
- `next` — `Accordion` v2 restyle scoped to `variant="borderless"`: paper card on the `elevation/4` shadow, 12px/16px summary padding, row divider on the bottom edge, `action.active` chevron, 8px group rounding and a token-based disabled state. `reference` unchanged.
- `next` — MUI X date/time pickers match the redesigned outlined inputs; `MuiPickersOutlinedInput` is a separate stack, so the same overrides are mirrored onto it (type-only augmentation import, no MUI X runtime in the core bundle).

## [4.9.2] - 2026-07-08

### Changed
- [@rsarata]: Changed `next` theme `Button` and `IconButton` styles to match new design.

## [4.9.0] - 2026-08-06

### Added
- `next` theme — `theme.shadows` filled from Figma effect styles `elevation/1..24` (new generated file `shadows.generated.ts`; index 0 stays `'none'`). Components using `elevation`/`boxShadow` now render Ring shadows (`#0F172A`-based) instead of MUI defaults. `reference` keeps MUI default shadows.

### Changed
- `next` generated configs re-synced with the current Figma export (2026-08-06): `palette` — `text.disabled` fixed to `#64748b`, corrected light `secondary`/`action` values, real dark-mode colours for tags/avatars/alerts/switch/input (previously placeholder `rgba(255,255,255,0.38)`), new `components.avatar.contrastText`; `breakpoints.xs` emitted as 0 — MUI breakpoints are lower bounds, so the first range must start at 0 (previously 375, and the raw Figma token is 444: that value is the xs artboard design width, not a CSS threshold). `shape`/`spacing`/`typography` values unchanged (header-only). `reference` untouched.

## [4.8.2] - 2026-08-06

### Changed
- Tests only, no runtime change: DOM snapshots replaced with direct assertions; added a snapshot of the resolved theme tokens for `reference`/`next` × `light`/`dark`.

## [4.8.1] - 2026-07-08

### Changed
- Changed `next` theme `Autocomplete` styles to match new design.

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
