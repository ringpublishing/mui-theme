export { palette } from './palette.generated';
// `theme.palette.grey` in `next` falls back to MUI defaults.
// Ring primitive scales remain in `theme.colors.*`, deprecated in favour of the palette.
export { breakpoints } from './breakpoints.generated';
// No type re-exports in this file: `theme.tsx` imports it as a namespace, and the declaration
// bundle emits every namespace member as a `const`, which fails a consumer's `skipLibCheck: false`.
// Import types from the generated module itself.
export { shape, borderRadiusScale } from './shape.generated';
export { spacing, spacingBase, spacingScale } from './spacing.generated';
export { typographyRem, typographyPx } from './typography.generated';
export { shadows } from './shadows.generated';
export { actionOpacities } from './opacity.generated';
export { buildRingComponents } from './components.custom';
