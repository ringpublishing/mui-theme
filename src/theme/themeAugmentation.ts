export {};

import type { PaletteColor } from '@mui/material';
import type React from 'react';
import type { CommonLanguages } from '../helpers/commonTypes';
import type { Colors } from './config/colors';

declare module '@mui/material' {
    interface CommonColors {
        grey: string;
    }
    interface Palette {
        components: Record<string, any>;
        contrast: PaletteColor;
        common: CommonColors;
    }
    interface PaletteOptions {
        components?: Record<string, any>;
        common?: Partial<CommonColors>;
    }
    interface TypographyVariants {
        label: React.CSSProperties;
        headline1: React.CSSProperties;
        headline2: React.CSSProperties;
        headline3: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        label?: React.CSSProperties;
        headline1?: React.CSSProperties;
        headline2?: React.CSSProperties;
        headline3?: React.CSSProperties;
    }
    interface Theme {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
    }
}

declare module '@mui/material/styles' {
    interface CommonColors {
        grey: string;
    }
    interface Palette {
        components: Record<string, any>;
        contrast: PaletteColor;
        common: CommonColors;
    }
    interface PaletteOptions {
        components?: Record<string, any>;
        common?: Partial<CommonColors>;
    }
    interface TypographyVariants {
        label: React.CSSProperties;
        headline1: React.CSSProperties;
        headline2: React.CSSProperties;
        headline3: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        label?: React.CSSProperties;
        headline1?: React.CSSProperties;
        headline2?: React.CSSProperties;
        headline3?: React.CSSProperties;
    }
    interface Theme {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
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
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
        headline1: true;
        headline2: true;
        headline3: true;
    }
}

// @ts-expect-error ESM module augmentation needed for Ring UI Components
declare module '@mui/material/esm/styles' {
    interface CommonColors {
        grey: string;
    }
    interface Palette {
        components: Record<string, any>;
        contrast: PaletteColor;
        common: CommonColors;
    }
    interface PaletteOptions {
        components?: Record<string, any>;
        common?: Partial<CommonColors>;
    }
    interface TypographyVariants {
        label: React.CSSProperties;
        headline1: React.CSSProperties;
        headline2: React.CSSProperties;
        headline3: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        label?: React.CSSProperties;
        headline1?: React.CSSProperties;
        headline2?: React.CSSProperties;
        headline3?: React.CSSProperties;
    }
    interface Theme {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode: 'deprecated-px' | 'rem';
    }
    interface ThemeOptions {
        locale?: CommonLanguages;
        colors: Colors;
        typographyMode?: 'deprecated-px' | 'rem';
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
declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        label: true;
        headline1: true;
        headline2: true;
        headline3: true;
    }
}
