// Core MUI augmentation shared by all theme versions.
// Version-specific additions belong in `config/<version>/augmentation.ts`.

export {};

import type { PaletteColor } from '@mui/material';
import type { CommonLanguages } from '../../helpers/commonTypes';
import type { Colors } from './colors';
import type { SpacingFactor as SpacingFactorNext } from './next/spacing.generated';
import type { BorderRadiusFactor as BorderRadiusFactorNext } from './next/shape.generated';
import type { PaletteComponentsMap, PaletteComponentsMapOptions } from './palette.components.types';

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
    'scrollbar-bg': string;
}

declare module '@mui/material' {
    interface CommonColors {
        grey: string;
    }
    interface TypeAction {
        focusVisibleOpacity: number;
        outlinedBorderOpacity: number;
    }
    interface Palette {
        components: PaletteComponentsMap;
        contrast: PaletteColor;
        common: CommonColors;
        _native?: PaletteNative;
    }
    interface PaletteOptions {
        components?: PaletteComponentsMapOptions;
        common?: Partial<CommonColors>;
        _native?: Partial<PaletteNative>;
    }
    interface Theme {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
        /** Strict spacing lookup — only Figma-defined steps. Use instead of theme.spacing(). */
        getSpacing: GetSpacing;
        /** Strict border-radius lookup — only Figma-defined steps. Returns px string. */
        getBorderRadius: GetBorderRadius;
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
        getSpacing?: GetSpacing;
        getBorderRadius?: GetBorderRadius;
    }
}

declare module '@mui/material/styles' {
    interface CommonColors {
        grey: string;
    }
    interface TypeAction {
        focusVisibleOpacity: number;
        outlinedBorderOpacity: number;
    }
    interface Palette {
        components: PaletteComponentsMap;
        contrast: PaletteColor;
        common: CommonColors;
        _native?: PaletteNative;
    }
    interface PaletteOptions {
        components?: PaletteComponentsMapOptions;
        common?: Partial<CommonColors>;
        _native?: Partial<PaletteNative>;
    }
    interface Theme {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
        getSpacing: GetSpacing;
        getBorderRadius: GetBorderRadius;
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
        getSpacing?: GetSpacing;
        getBorderRadius?: GetBorderRadius;
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
    }
    interface Palette {
        components: PaletteComponentsMap;
        contrast: PaletteColor;
        common: CommonColors;
        _native?: PaletteNative;
    }
    interface PaletteOptions {
        components?: PaletteComponentsMapOptions;
        common?: Partial<CommonColors>;
        _native?: Partial<PaletteNative>;
    }
    interface Theme {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
        getSpacing: GetSpacing;
        getBorderRadius: GetBorderRadius;
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
        getSpacing?: GetSpacing;
        getBorderRadius?: GetBorderRadius;
    }
}

declare module '@mui/material/Button' {
    interface ButtonPropsColorOverrides {
        contrast: true;
    }
}
declare module '@mui/material/IconButton' {
    interface IconButtonPropsColorOverrides {
        contrast: true;
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
