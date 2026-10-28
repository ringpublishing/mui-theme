// Activate Ring MUI augmentations on module import.
// Required for setups resolving directly to this entry file.
import './themeAugmentation';

export * from './theme';
export type { ThemeConfigProps } from './theme';
export {
    HANDLE_CONTRACT_VERSION,
    RING_HANDLE_PUBLISHED_EVENT,
    RING_HANDLE_UNPUBLISHED_EVENT,
    type RingHandle,
    type RingHandleStateSnapshot,
    type RingHandleVariantInfo,
    type RingMode,
    type RingHandleLifecycleEventDetail
} from './handleContract';
export { InspectorBridge, type InspectorBridgeProps } from './InspectorBridge';
export {
    ScopedThemeOverrides,
    type ScopedThemeOverridesProps
} from './ScopedThemeOverrides';
export { registerComponentsVersion, type ComponentsVersionInfo } from './registerComponentsVersion';
export {
    DEFAULT_LUCIDE_ICON_SIZE,
    DEFAULT_LUCIDE_STROKE_WIDTH,
    RING_LUCIDE_PALETTE_COLORS,
    RingIconDefaults,
    lucidePaletteRules,
    type RingIconDefaultsProps
} from './RingIconDefaults';
export {
    PACKAGE_VERSION as THEME_VERSION,
    PACKAGE_VERSION_RELEASED as THEME_VERSION_RELEASED
} from '../version.generated';
export type { Theme } from '@mui/material';
export type { FeaturedIconMetrics } from './config/featuredIcon';
export type {
    RingFileUploaderClassKey,
    RingFileUploaderOwnerState,
    RingFileUploaderSize,
    RingFileUploaderFileStatus,
    RingFileUploaderSlotStyle,
    RingFileUploaderStyles
} from './config/fileUploader';

// Helper enum re-export.
export { CommonLanguages } from '../helpers/commonTypes';

// Legacy value exports: the pre-redesign tokens, kept for existing imports.
// `getTheme(mode)` returns the current theme.
export { breakpoints } from './config/reference/breakpoints.generated';
export { palette } from './config/reference/palette.generated';
export { shape } from './config/reference/shape.generated';
export { spacing } from './config/reference/spacing.generated';
export { typographyPx as typography, typographyRem } from './config/reference/typography.generated';
export * from './config/colors';

// Public strict spacing factor type used by `theme.getSpacing()`.
export type { SpacingFactor } from './config/next/spacing.generated';
