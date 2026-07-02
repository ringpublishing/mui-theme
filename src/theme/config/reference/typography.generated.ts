const HTML_FONT_SIZE = 16;

export const typographyPx = {
    htmlFontSize: HTML_FONT_SIZE,
    fontFamily: 'Arial, sans-serif',
    button: {
        textTransform: 'uppercase',
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    h1: {
        fontSize: '96px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '112px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    h2: {
        fontSize: '60px',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '-0.5px',
        lineHeight: '72px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    h3: {
        fontSize: '48px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '56px'
    },
    h4: {
        fontSize: '34px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '42px'
    },
    h5: {
        fontSize: '22px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '32px'
    },
    h6: {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '24px',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    body1: {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.15px',
        lineHeight: '24px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    body2: {
        fontSize: '13px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '20px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    subtitle1: {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.15px',
        lineHeight: '28px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    subtitle2: {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '22px',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    overline: {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '1px',
        lineHeight: '36px',
        textTransform: 'uppercase',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    caption: {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '18px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    label: {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '20px',
        textTransform: 'uppercase',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    headline1: {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '28px',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    headline2: {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '24px',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    headline3: {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '22px',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    /** @deprecated Use CSS `rem` units directly or `theme.typography.pxToRem` from MUI theme instance. Will be removed in a future major version. */
    pxToRem(size: number): string {
        return `${size / HTML_FONT_SIZE}rem`;
    }
};

export const typographyRem = {
    htmlFontSize: HTML_FONT_SIZE,
    fontFamily: 'Arial, sans-serif',
    button: {
        textTransform: 'uppercase',
        fontSize: '0.875rem',
        fontFamily: 'Arial, sans-serif',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    h1: {
        fontSize: '6rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '7rem',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    h2: {
        fontSize: '3.75rem',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '-0.5px',
        lineHeight: '4.5rem',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    h3: {
        fontSize: '3rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '3.5rem'
    },
    h4: {
        fontSize: '2.125rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '2.625rem'
    },
    h5: {
        fontSize: '1.375rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '2rem'
    },
    h6: {
        fontSize: '1.125rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5rem',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    body1: {
        fontSize: '0.875rem',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.009375rem',
        lineHeight: '1.5rem',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    body2: {
        fontSize: '0.8125rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.25rem',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    subtitle1: {
        fontSize: '1rem',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.009375rem',
        lineHeight: '1.75rem',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    subtitle2: {
        fontSize: '0.875rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.375rem',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    overline: {
        fontSize: '0.75rem',
        fontFamily: 'Arial, sans-serif',
        letterSpacing: '0.0625rem',
        lineHeight: '2.25rem',
        textTransform: 'uppercase',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    caption: {
        fontSize: '0.75rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.125rem',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    label: {
        fontSize: '0.75rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.25rem',
        textTransform: 'uppercase',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    headline1: {
        fontSize: '1rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.75rem',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    headline2: {
        fontSize: '0.875rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.5rem',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    headline3: {
        fontSize: '0.75rem',
        fontFamily: 'Arial, sans-serif',
        lineHeight: '1.375rem',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    /** @deprecated Use CSS `rem` units directly or `theme.typography.pxToRem` from MUI theme instance. Will be removed in a future major version. */
    pxToRem(size: number): string {
        return `${size / HTML_FONT_SIZE}rem`;
    }
};
