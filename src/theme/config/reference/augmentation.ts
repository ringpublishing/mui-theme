// `reference`-specific augmentation for legacy typography variants.
// Import together with `augmentation.core` when using `reference` themes.

export {};

import type React from 'react';

declare module '@mui/material' {
    interface TypographyVariants {
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        label?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline1?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline2?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline3?: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        label?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline1?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline2?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline3?: React.CSSProperties;
    }
}

declare module '@mui/material/styles' {
    interface TypographyVariants {
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        label?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline1?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline2?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline3?: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        label?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline1?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline2?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline3?: React.CSSProperties;
    }
}

// @ts-expect-error Required for internal MUI ESM path augmentation.
declare module '@mui/material/esm/styles' {
    interface TypographyVariants {
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        label?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline1?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline2?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline3?: React.CSSProperties;
    }
    interface TypographyVariantsOptions {
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        label?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline1?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline2?: React.CSSProperties;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline3?: React.CSSProperties;
    }
}

declare module '@mui/material/Typography' {
    interface TypographyPropsVariantOverrides {
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        label: true;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline1: true;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline2: true;
        /** @deprecated The theme does not style this variant; use a standard one such as `subtitle1`, `subtitle2` or `caption`. */
        headline3: true;
    }
}
