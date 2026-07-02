// `reference`-specific augmentation for legacy typography variants.
// Import together with `augmentation.core` when using `reference` themes.

export {};

import type React from 'react';

declare module '@mui/material' {
    interface TypographyVariants {
        /** @deprecated Ring `reference` only — removed in `next`. */
        label?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline1?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline2?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline3?: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        /** @deprecated Ring `reference` only — removed in `next`. */
        label?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline1?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline2?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline3?: React.CSSProperties;
    }
}

declare module '@mui/material/styles' {
    interface TypographyVariants {
        /** @deprecated Ring `reference` only — removed in `next`. */
        label?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline1?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline2?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline3?: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        /** @deprecated Ring `reference` only — removed in `next`. */
        label?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline1?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline2?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline3?: React.CSSProperties;
    }
}

// @ts-expect-error Required for internal MUI ESM path augmentation.
declare module '@mui/material/esm/styles' {
    interface TypographyVariants {
        /** @deprecated Ring `reference` only — removed in `next`. */
        label?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline1?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline2?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline3?: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        /** @deprecated Ring `reference` only — removed in `next`. */
        label?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline1?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline2?: React.CSSProperties;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline3?: React.CSSProperties;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        /** @deprecated Ring `reference` only — removed in `next`. */
        label: true;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline1: true;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline2: true;
        /** @deprecated Ring `reference` only — removed in `next`. */
        headline3: true;
    }
}
