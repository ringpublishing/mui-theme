import { TypographyVariantsOptions } from '@mui/material/styles';

const HTML_FONT_SIZE = 16;
const FONT_FAMILY = 'Arial, sans-serif';

type ExtendedTypographyVariantsOptions = TypographyVariantsOptions
    & {pxToRem: (size: number) => string;};

export const typography: ExtendedTypographyVariantsOptions = {
    htmlFontSize: HTML_FONT_SIZE,
    fontFamily: FONT_FAMILY,
    button: {
        textTransform: 'uppercase',
        fontSize: '14px',
        fontFamily: FONT_FAMILY,
        fontWeight: 600,
        fontStyle: 'normal'
    },
    h1: {
        fontSize: '96px',
        fontFamily: FONT_FAMILY,
        lineHeight: '112px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    h2: {
        fontSize: '60px',
        fontFamily: FONT_FAMILY,
        letterSpacing: '-0.5px',
        lineHeight: '72px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    h3: {
        fontSize: '48px',
        fontFamily: FONT_FAMILY,
        lineHeight: '56px'
    },
    h4: {
        fontSize: '34px',
        fontFamily: FONT_FAMILY,
        lineHeight: '42px'
    },
    h5: {
        fontSize: '22px',
        fontFamily: FONT_FAMILY,
        lineHeight: '32px'
    },
    h6: {
        fontSize: '18px',
        fontFamily: FONT_FAMILY,
        lineHeight: '24px',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    body1: {
        fontSize: '14px',
        fontFamily: FONT_FAMILY,
        letterSpacing: '0.15px',
        lineHeight: '24px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    body2: {
        fontSize: '13px',
        fontFamily: FONT_FAMILY,
        lineHeight: '20px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    subtitle1: {
        fontSize: '16px',
        fontFamily: FONT_FAMILY,
        letterSpacing: '0.15px',
        lineHeight: '28px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    subtitle2: {
        fontSize: '14px',
        fontFamily: FONT_FAMILY,
        lineHeight: '22px',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    overline: {
        fontSize: '12px',
        fontFamily: FONT_FAMILY,
        letterSpacing: '1px',
        lineHeight: '36px',
        textTransform: 'uppercase',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    caption: {
        fontSize: '12px',
        fontFamily: FONT_FAMILY,
        lineHeight: '18px',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    label: {
        fontSize: '12px',
        fontFamily: FONT_FAMILY,
        lineHeight: '20px',
        textTransform: 'uppercase',
        fontWeight: 400,
        fontStyle: 'normal'
    },
    headline1: {
        fontSize: '16px',
        fontFamily: FONT_FAMILY,
        lineHeight: '28px',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    headline2: {
        fontSize: '14px',
        fontFamily: FONT_FAMILY,
        lineHeight: '24px',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    headline3: {
        fontSize: '12px',
        fontFamily: FONT_FAMILY,
        lineHeight: '22px',
        textTransform: 'uppercase',
        fontWeight: 600,
        fontStyle: 'normal'
    },
    pxToRem(size: number): string {
        return `${(size / HTML_FONT_SIZE) * 1.5}rem`;
    }
};
