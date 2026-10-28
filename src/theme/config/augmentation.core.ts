// Core MUI augmentation shared by all theme versions.
// Version-specific additions belong in `config/<version>/augmentation.ts`.

export {};

import type { PaletteColor, PaletteColorOptions } from '@mui/material';
import type { ComponentsOverrides } from '@mui/material/styles';
import type { Gradient } from './gradients';
import type { CommonLanguages } from '../../helpers/commonTypes';
import type { Colors } from './colors';
import type { SpacingFactor as SpacingFactorNext } from './next/spacing.generated';
import type { BorderRadiusFactor as BorderRadiusFactorNext } from './next/shape.generated';
import type { PaletteComponentsMap, PaletteComponentsMapOptions } from './palette.components.types';
import type { FeaturedIconMetrics } from './featuredIcon';
import type { RingFileUploaderClassKey, RingFileUploaderOwnerState, RingFileUploaderStyles } from './fileUploader';
import type { ChipTagColor, ChipTagPalette } from './palette.tag.types';

/** Base styles of Ring's own components, slot by slot; their `styled` slots read them. */
interface RingComponentStyles {
    RingFileUploader: RingFileUploaderStyles;
}

// Strict spacing factors from `next`, plus `0` shorthand.
type SpacingFactor = SpacingFactorNext | 0;

// Strict border-radius factors from `next`, plus `0` shorthand.
type BorderRadiusFactor = BorderRadiusFactorNext | 0;

// Strict spacing API mirroring CSS shorthand (1-4 args).
interface GetSpacing {
    /** Strict spacing API (single value). */
    (factor: SpacingFactor): string;
    /** Strict spacing API (top/bottom + left/right). */
    (topBottom: SpacingFactor, rightLeft: SpacingFactor): string;
    /** Strict spacing API (top + left/right + bottom). */
    (top: SpacingFactor, rightLeft: SpacingFactor, bottom: SpacingFactor): string;
    /** Strict spacing API (top + right + bottom + left). */
    (top: SpacingFactor, right: SpacingFactor, bottom: SpacingFactor, left: SpacingFactor): string;
}

// Strict border-radius API (single value).
interface GetBorderRadius {
    /** Strict border-radius API. */
    (factor: BorderRadiusFactor): string;
}

// Superset schema for `theme.palette.components` across variants.

interface PaletteNative {
    /** Thumb colour of the native browser scrollbar. */
    scrollbarBackground: string;
}

// Input side only. The `reference` config still carries the pre-rename `scrollbar-bg`
// slot and is never regenerated, so `createTheme` has to accept it — while
// `theme.palette._native` exposes the current slot alone.
interface PaletteNativeOptions extends Partial<PaletteNative> {
    'scrollbar-bg'?: string;
}

declare module '@mui/material' {
    interface CommonColors {
        grey: string;
    }
    interface TypeAction {
        focusVisibleOpacity: number;
        outlinedBorderOpacity: number;
        /**
         * Lighter disabled surface (`action/disabledBackgroundLight`). Optional; a palette
         * without it reads `undefined`.
         */
        disabledBackgroundLight?: string;
    }
    interface Palette {
        components: PaletteComponentsMap;
        contrast: PaletteColor;
        common: CommonColors;
        ai: PaletteColor;
        gradients: { ai: Gradient; };
        /** Tag colours: `<colour>Background` / `Border` / `Text` per tag colour. */
        tag?: ChipTagPalette;
        _native?: PaletteNative;
    }
    interface PaletteOptions {
        components?: PaletteComponentsMapOptions;
        common?: Partial<CommonColors>;
        ai?: PaletteColorOptions;
        gradients?: { ai?: Gradient; };
        tag?: Partial<ChipTagPalette>;
        _native?: PaletteNativeOptions;
    }
    interface Theme {
        locale?: CommonLanguages;
        /** @deprecated The raw colour scales are not part of the design system; read the tokens in `theme.palette` instead. */
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
        /** Strict spacing lookup — only Figma-defined steps. Use instead of theme.spacing(). */
        getSpacing: GetSpacing;
        /** Strict border-radius lookup — only Figma-defined steps. Returns px string. */
        getBorderRadius: GetBorderRadius;
        gradientText: (gradient: 'ai') => object;
        /** Sizing rule of the featured icon (glyph on a circular plate). */
        featuredIcon: FeaturedIconMetrics;
        /** Base styles of Ring's own components (`RingFileUploader`), read by their slots. */
        ringComponents: RingComponentStyles;
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        /** @deprecated The raw colour scales are not part of the design system; read the tokens in `theme.palette` instead. */
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
        getSpacing?: GetSpacing;
        getBorderRadius?: GetBorderRadius;
        gradientText?: (gradient: 'ai') => object;
        featuredIcon?: Partial<FeaturedIconMetrics>;
        ringComponents?: Partial<RingComponentStyles>;
    }
}

declare module '@mui/material/styles' {
    interface CommonColors {
        grey: string;
    }
    interface TypeAction {
        focusVisibleOpacity: number;
        outlinedBorderOpacity: number;
        /**
         * Lighter disabled surface (`action/disabledBackgroundLight`). Optional; a palette
         * without it reads `undefined`.
         */
        disabledBackgroundLight?: string;
    }
    interface Palette {
        components: PaletteComponentsMap;
        contrast: PaletteColor;
        common: CommonColors;
        ai: PaletteColor;
        gradients: { ai: Gradient; };
        /** Tag colours: `<colour>Background` / `Border` / `Text` per tag colour. */
        tag?: ChipTagPalette;
        _native?: PaletteNative;
    }
    interface PaletteOptions {
        components?: PaletteComponentsMapOptions;
        common?: Partial<CommonColors>;
        ai?: PaletteColorOptions;
        gradients?: { ai?: Gradient; };
        tag?: Partial<ChipTagPalette>;
        _native?: PaletteNativeOptions;
    }
    interface Theme {
        locale?: CommonLanguages;
        /** @deprecated The raw colour scales are not part of the design system; read the tokens in `theme.palette` instead. */
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
        getSpacing: GetSpacing;
        getBorderRadius: GetBorderRadius;
        gradientText: (gradient: 'ai') => object;
        /** Sizing rule of the featured icon (glyph on a circular plate). */
        featuredIcon: FeaturedIconMetrics;
        /** Base styles of Ring's own components (`RingFileUploader`), read by their slots. */
        ringComponents: RingComponentStyles;
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        /** @deprecated The raw colour scales are not part of the design system; read the tokens in `theme.palette` instead. */
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
        getSpacing?: GetSpacing;
        getBorderRadius?: GetBorderRadius;
        gradientText?: (gradient: 'ai') => object;
        featuredIcon?: Partial<FeaturedIconMetrics>;
        ringComponents?: Partial<RingComponentStyles>;
    }
    // Ring components: `styled(…, { name: 'Ring…', slot })` in mui-components takes its base style from
    // `theme.ringComponents`; what an application sets in `components.Ring….styleOverrides[slot]` goes on top.
    interface ComponentNameToClassKey {
        RingFileUploader: RingFileUploaderClassKey;
    }
    interface ComponentsPropsList {
        RingFileUploader: RingFileUploaderOwnerState;
    }
    interface Components<Theme = unknown> {
        RingFileUploader?: {
            styleOverrides?: ComponentsOverrides<Theme>['RingFileUploader'];
        };
    }
}

// @ts-expect-error Required for internal MUI ESM path augmentation.
declare module '@mui/material/esm/styles' {
    interface CommonColors {
        grey: string;
    }
    interface TypeAction {
        focusVisibleOpacity: number;
        outlinedBorderOpacity: number;
        /**
         * Lighter disabled surface (`action/disabledBackgroundLight`). Optional; a palette
         * without it reads `undefined`.
         */
        disabledBackgroundLight?: string;
    }
    interface Palette {
        components: PaletteComponentsMap;
        contrast: PaletteColor;
        common: CommonColors;
        ai: PaletteColor;
        gradients: { ai: Gradient; };
        /** Tag colours: `<colour>Background` / `Border` / `Text` per tag colour. */
        tag?: ChipTagPalette;
        _native?: PaletteNative;
    }
    interface PaletteOptions {
        components?: PaletteComponentsMapOptions;
        common?: Partial<CommonColors>;
        ai?: PaletteColorOptions;
        gradients?: { ai?: Gradient; };
        tag?: Partial<ChipTagPalette>;
        _native?: PaletteNativeOptions;
    }
    interface Theme {
        locale?: CommonLanguages;
        /** @deprecated The raw colour scales are not part of the design system; read the tokens in `theme.palette` instead. */
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
        getSpacing: GetSpacing;
        getBorderRadius: GetBorderRadius;
        gradientText: (gradient: 'ai') => object;
        /** Sizing rule of the featured icon (glyph on a circular plate). */
        featuredIcon: FeaturedIconMetrics;
        /** Base styles of Ring's own components (`RingFileUploader`), read by their slots. */
        ringComponents: RingComponentStyles;
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        /** @deprecated The raw colour scales are not part of the design system; read the tokens in `theme.palette` instead. */
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
        getSpacing?: GetSpacing;
        getBorderRadius?: GetBorderRadius;
        gradientText?: (gradient: 'ai') => object;
        featuredIcon?: Partial<FeaturedIconMetrics>;
        ringComponents?: Partial<RingComponentStyles>;
    }
    // Ring components: `styled(…, { name: 'Ring…', slot })` in mui-components takes its base style from
    // `theme.ringComponents`; what an application sets in `components.Ring….styleOverrides[slot]` goes on top.
    interface ComponentNameToClassKey {
        RingFileUploader: RingFileUploaderClassKey;
    }
    interface ComponentsPropsList {
        RingFileUploader: RingFileUploaderOwnerState;
    }
    interface Components<Theme = unknown> {
        RingFileUploader?: {
            styleOverrides?: ComponentsOverrides<Theme>['RingFileUploader'];
        };
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;
        ai: true;
    }
}
declare module '@mui/material/IconButton' {
    interface IconButtonPropsColorOverrides {
        contrast: true;
        ai: true;
        overlay: true;
    }
}
declare module '@mui/material/Checkbox' {
    interface CheckboxPropsColorOverrides {
        overlay: true;
    }
}
declare module '@mui/material/Chip' {
    interface ChipPropsVariantOverrides {
        /** A label, not a control: small, 4px corners, no interactive states. */
        tag: true;
    }
    interface ChipPropsColorOverrides extends Record<ChipTagColor, true> {
        ai: true;
        /** Tag colour with no fill: outline border and secondary text. */
        neutral: true;
    }
}
declare module '@mui/material/Paper' {
    interface PaperPropsVariantOverrides {
        borderless: true;
    }
}

// Hint overloads for `theme.spacing()` with strict factors.

declare module '@mui/system' {
    interface Spacing {
        /** @deprecated Use theme.getSpacing() for strict spacing. */
        (value: SpacingFactor): string;
        /** @deprecated Use theme.getSpacing() for strict spacing. */
        (topBottom: SpacingFactor, rightLeft: SpacingFactor): string;
        /** @deprecated Use theme.getSpacing() for strict spacing. */
        (top: SpacingFactor, rightLeft: SpacingFactor, bottom: SpacingFactor): string;
        /** @deprecated Use theme.getSpacing() for strict spacing. */
        (top: SpacingFactor, right: SpacingFactor, bottom: SpacingFactor, left: SpacingFactor): string;
    }
}
