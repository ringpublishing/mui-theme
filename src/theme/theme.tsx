import {
    CssBaseline,
    PaletteMode,
    Theme,
    ThemeProvider,
    createTheme,
    PaletteOptions,
    TypographyVariantsOptions,
    Components
} from '@mui/material';
import { palette } from './config/palette';
import { breakpoints } from './config/breakpoints';
import { shape } from './config/shape';
import { typography } from './config/typography';
import { typographyRem } from './config/typographyRem';
import { spacing } from './config/spacing';
import { colors } from './config/colors';
import React from 'react';
import { CommonLanguages } from '../helpers/commonTypes';
import { plPL as corePL, enUS as coreUS } from '@mui/material/locale';

export type TypographyMode = 'deprecated-px' | 'rem';

export interface ThemeOverrides {
    palette?: Partial<PaletteOptions>;
    typography?: Partial<TypographyVariantsOptions>;
    spacing?: number | ((factor: number) => string | number) | number[];
    breakpoints?: Partial<typeof breakpoints>;
    shape?: { borderRadius: number; };
    /**
     * Component overrides use last-wins semantics — function-valued styleOverrides
     * replace library defaults entirely, they are not composed.
     */
    components?: Components<Omit<Theme, 'components'>>;
}

export interface GetThemeOptions {
    language?: CommonLanguages | string;
    /** @deprecated Use themeOverrides.components instead. For backward compatibility only. */
    externalComponentsTheme?: object;
    externalLocales?: object[];
    /** @deprecated Use theme.palette instead. For backward compatibility only. */
    externalColors?: object;
    themeOverrides?: ThemeOverrides;
    /**
     * Use 'rem' (default) for standard rem-based typography (1rem = 16px, no html font-size hack needed).
     * Use 'deprecated-px' for backward compatibility with the px-based typography and html { font-size: 62.5% } setups.
     * @deprecated 'deprecated-px' mode – will be removed in the next major version
     */
    typographyMode?: TypographyMode;
}

/**
 * Creates a MUI theme with Ring Publishing defaults.
 *
 * @param mode The color mode ('light' or 'dark')
 * @param options Optional theme configuration
 * @returns MUI Theme object
 */
export function getTheme(mode: PaletteMode | string, options?: GetThemeOptions): Theme;
/**
 * @deprecated Use getTheme(mode, options) instead. Positional arguments will be removed in the next major version.
 */
export function getTheme(
    mode: PaletteMode | string,
    language: CommonLanguages,
    externalComponentsTheme: object,
    externalLocales?: object[],
    externalColors?: object,
    themeOverrides?: ThemeOverrides,
    typographyMode?: TypographyMode
): Theme;

export function getTheme(
    mode: PaletteMode | string,
    languageOrOptions?: CommonLanguages | GetThemeOptions,
    externalComponentsTheme = {},
    externalLocales: object[] = [],
    externalColors: object = {},
    themeOverrides: ThemeOverrides = {},
    typographyMode: TypographyMode = 'rem'
): Theme {
    let language: CommonLanguages | string = CommonLanguages.enUS;

    if (typeof languageOrOptions === 'object' && languageOrOptions !== null) {
        // New API: getTheme(mode, options)
        const opts = languageOrOptions as GetThemeOptions;
        language = opts.language ?? CommonLanguages.enUS;
        externalComponentsTheme = opts.externalComponentsTheme ?? {};
        externalLocales = opts.externalLocales ?? [];
        externalColors = opts.externalColors ?? {};
        themeOverrides = opts.themeOverrides ?? {};
        typographyMode = opts.typographyMode ?? 'rem';
    } else if (typeof languageOrOptions === 'string') {
        // Legacy API: getTheme(mode, language, ...)
        language = languageOrOptions as CommonLanguages;

        if (arguments.length > 2) {
            console.warn(
                '[@ringpublishing/mui-theme] Positional arguments in getTheme() are deprecated. '
                + 'Use getTheme(mode, { language, themeOverrides, ... }) instead. '
                + 'Positional arguments will be removed in the next major version.'
            );
        }
    }

    const coreLocale = language === CommonLanguages.plPL ? corePL : coreUS;
    const isLegacyPx = typographyMode === 'deprecated-px';

    if (Object.keys(externalColors).length > 0) {
        console.warn('The "externalColors" parameter is deprecated and should be used only for backward compatibility. Please use theme.palette instead.');
    }

    const baseTheme = createTheme(
        {
            locale: language as CommonLanguages,
            palette: palette[mode as PaletteMode] as PaletteOptions,
            breakpoints: {
                keys: ['xs', 'sm', 'md', 'lg', 'xl'],
                values: { ...breakpoints, ...themeOverrides?.breakpoints }
            },
            spacing: themeOverrides?.spacing ?? spacing,
            shape: themeOverrides?.shape ?? shape,
            typography: isLegacyPx ? typography : typographyRem,
            typographyMode,
            colors: { ...colors, ...externalColors } as typeof colors & Record<string, string>,
            components: {
                ...externalComponentsTheme,
                MuiCssBaseline: {
                    styleOverrides: (theme: Theme) => ({
                        '.ring-text-editor .tiptap': {
                            'padding': theme.spacing(2),

                            '& :first-child': {
                                marginBlockStart: 0
                            },

                            '& h1': {
                                fontSize: isLegacyPx ? '3.4rem' : '2.125rem',
                                fontWeight: 700,
                                lineHeight: isLegacyPx ? '42px' : '2.625rem',
                                letterSpacing: isLegacyPx ? '-0.5px' : '-0.03125rem',
                                marginBlockStart: theme.spacing(5),
                                marginBlockEnd: theme.spacing(2)
                            },
                            '& h2': {
                                fontSize: isLegacyPx ? '3.0rem' : '1.875rem',
                                fontWeight: 700,
                                lineHeight: isLegacyPx ? '38px' : '2.375rem',
                                letterSpacing: isLegacyPx ? '-0.25px' : '-0.015625rem',
                                marginBlockStart: theme.spacing(5),
                                marginBlockEnd: theme.spacing(2)
                            },
                            '& h3': {
                                fontSize: isLegacyPx ? '2.6rem' : '1.625rem',
                                fontWeight: 700,
                                lineHeight: isLegacyPx ? '34px' : '2.125rem',
                                letterSpacing: 0,
                                marginBlockStart: theme.spacing(4),
                                marginBlockEnd: theme.spacing(2)
                            },
                            '& h4': {
                                fontSize: isLegacyPx ? '2.2rem' : '1.375rem',
                                fontWeight: 700,
                                lineHeight: isLegacyPx ? '28px' : '1.75rem',
                                letterSpacing: 0,
                                marginBlockStart: theme.spacing(3),
                                marginBlockEnd: theme.spacing(2)
                            },
                            '& h5': {
                                fontSize: isLegacyPx ? '2.0rem' : '1.25rem',
                                fontWeight: 700,
                                lineHeight: isLegacyPx ? '28px' : '1.75rem',
                                letterSpacing: 0,
                                marginBlockStart: theme.spacing(2),
                                marginBlockEnd: theme.spacing(2)
                            },
                            '& h6': {
                                fontSize: isLegacyPx ? '1.8rem' : '1.125rem',
                                fontWeight: 700,
                                lineHeight: isLegacyPx ? '22px' : '1.375rem',
                                letterSpacing: 0,
                                marginBlockStart: theme.spacing(2),
                                marginBlockEnd: theme.spacing(2)
                            },
                            '& > p': {
                                fontSize: isLegacyPx ? '1.6rem' : '1rem',
                                lineHeight: isLegacyPx ? '24px' : '1.5rem',
                                fontWeight: 400,
                                letterSpacing: 0,
                                marginBlockStart: 0,
                                marginBlockEnd: theme.spacing(2)
                            },
                            '& ul, & ol': {
                                paddingInlineStart: theme.spacing(4)
                            },
                            '& li *': {
                                fontSize: isLegacyPx ? '1.6rem' : '1rem',
                                lineHeight: isLegacyPx ? '24px' : '1.5rem',
                                fontWeight: 400,
                                letterSpacing: 0,
                                marginBlock: 0
                            }
                        }
                    })
                },
                MuiAutocomplete: {
                    styleOverrides: {
                        root: ({ ownerState, theme }: { ownerState: { multiple?: boolean; }; theme: Theme; }) => {
                            return {
                                ...(ownerState.multiple && {
                                    '.MuiAutocomplete-endAdornment': {
                                        'height': `calc(100% - ${theme.spacing(1)})`,
                                        'display': 'flex',
                                        'align-items': 'end'
                                    }
                                }),
                                '.MuiAutocomplete-clearIndicator': {
                                    visibility: 'visible'
                                }
                            };
                        }
                    }
                },
                MuiTooltip: {
                    styleOverrides: {
                        tooltip: {
                            fontSize: isLegacyPx ? '10px' : '0.625rem',
                            fontStyle: 'normal',
                            fontWeight: '400',
                            lineHeight: isLegacyPx ? '14px' : '0.875rem'
                        }
                    }
                },
                MuiPaper: {
                    variants: [
                        {
                            props: { variant: 'borderless' },
                            style: {
                                '&.MuiPaper-borderless::before': {
                                    height: 0
                                }
                            }
                        }
                    ]
                },
                // Changes to the Accordion component to remove padding and margin and lower minHeight,
                // so that the component can be used in a more compact way
                MuiAccordion: {
                    styleOverrides: {
                        root: ({ theme }: { theme: Theme; }) => ({
                            'backgroundColor': 'transparent',
                            'minHeight': theme.spacing(4),
                            'margin': 0,
                            '&.Mui-expanded': {
                                margin: 0,
                                minHeight: theme.spacing(4)
                            }
                        })
                    }
                },
                MuiAccordionSummary: {
                    styleOverrides: {
                        root: ({ theme }: { theme: Theme; }) => {
                            const variantPadding = {
                                '.MuiAccordion-root.MuiPaper-outlined &, .MuiAccordion-root.MuiPaper-elevation &': {
                                    paddingLeft: theme.spacing(2),
                                    paddingRight: theme.spacing(1)
                                }
                            };

                            return {
                                'padding': 0,
                                ...variantPadding,
                                'minHeight': theme.spacing(4),
                                '&.Mui-expanded': {
                                    padding: 0,
                                    ...variantPadding,
                                    minHeight: theme.spacing(4)
                                }
                            };
                        },
                        content: ({ theme }: { theme: Theme; }) => ({
                            'margin': theme.spacing(1, 0),
                            '&.Mui-expanded': {
                                margin: theme.spacing(1, 0)
                            }
                        })
                    }
                },
                MuiAccordionDetails: {
                    styleOverrides: {
                        root: ({ theme }: { theme: Theme; }) => {
                            const variantPadding = {
                                '.MuiAccordion-root.MuiPaper-outlined &, .MuiAccordion-root.MuiPaper-elevation &': {
                                    paddingLeft: theme.spacing(2),
                                    paddingRight: theme.spacing(2)
                                }
                            };

                            return {
                                'padding': theme.spacing(1, 0),
                                ...variantPadding,
                                '&.Mui-expanded': {
                                    padding: theme.spacing(1, 0),
                                    ...variantPadding
                                }
                            };
                        }
                    }
                },
                /**
                 * Set the default variant for all possible components 'standard'.
                 * Components `MuiInputAdornment` and `MuiInputLabel` are not changed because they break components using variants other than 'standard'
                 * they inherit the variant from the parent component.
                 */
                MuiAlert: {
                    defaultProps: {
                        variant: 'standard'
                    }
                },
                MuiTextField: {
                    defaultProps: {
                        variant: 'standard'
                    },
                    variants: [
                        {
                            props: { variant: 'standard' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(0, 1.5px) !important'
                                }
                            }
                        },
                        {
                            props: { variant: 'outlined' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(17px, -9px) !important'
                                }
                            }
                        },
                        {
                            props: { variant: 'filled' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(12px, 5px) !important'
                                }
                            }
                        }
                    ]
                },
                MuiNativeSelect: {
                    defaultProps: {
                        variant: 'standard'
                    }
                },
                MuiFormControl: {
                    defaultProps: {
                        variant: 'standard'
                    },
                    variants: [
                        {
                            props: { variant: 'standard' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(0, 1.5px) !important'
                                }
                            }
                        },
                        {
                            props: { variant: 'outlined' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(17px, -9px) !important'
                                }
                            }
                        },
                        {
                            props: { variant: 'filled' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(12px, 5px) !important'
                                }
                            }
                        }
                    ]
                },
                MuiSelect: {
                    defaultProps: {
                        variant: 'standard'
                    },
                    variants: [
                        {
                            props: { variant: 'standard' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(0, 1.5px) !important'
                                }
                            }
                        },
                        {
                            props: { variant: 'outlined' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(17px, -9px) !important'
                                }
                            }
                        },
                        {
                            props: { variant: 'filled' },
                            style: {
                                '& .MuiInputLabel-root.MuiInputLabel-shrink': {
                                    transform: 'scale(0.9) translate(12px, 5px) !important'
                                }
                            }
                        }
                    ]
                },
                MuiOutlinedInput: {
                    styleOverrides: {
                        notchedOutline: {
                            '& legend': {
                                fontSize: '0.9em'
                            }
                        }
                    }
                },
                MuiInputLabel: {
                    defaultProps: {
                        variant: 'standard'
                    }
                },
                MuiBadge: {
                    defaultProps: {
                        variant: 'standard'
                    }
                },
                MuiChip: {
                    defaultProps: {
                        size: 'small'
                    }
                },
                MuiSvgIcon: {
                    styleOverrides: {
                        fontSizeLarge: {
                            fontSize: isLegacyPx ? '3.25rem' : '2rem'
                        }
                    }
                },
                MuiAppBar: {
                    styleOverrides: {
                        colorPrimary: ({ theme }: { theme: Theme; }) => {
                            return {
                                backgroundColor: theme.palette.background.default
                            };
                        }
                    }
                },
                MuiToggleButton: {
                    styleOverrides: {
                        root: ({ theme }: { theme: Theme; }) => ({
                            width: theme.spacing(6),
                            height: theme.spacing(6),
                            borderRadius: theme.shape.borderRadius,
                            padding: theme.spacing(1.5),
                            borderRightWidth: '1px'
                        })
                    }
                }
            }
        },
        coreLocale,
        ...externalLocales
    );

    const deepOverrides = {
        ...(themeOverrides?.palette && { palette: themeOverrides.palette }),
        ...(themeOverrides?.typography && { typography: themeOverrides.typography }),
        ...(themeOverrides?.components && { components: themeOverrides.components })
    };

    if (Object.keys(deepOverrides).length > 0) {
        return createTheme(baseTheme, deepOverrides);
    }

    return baseTheme;
}

interface ThemeConfigProps {
    mode: PaletteMode;
    children: React.ReactNode[] | React.ReactNode;
    language?: CommonLanguages;
    externalLocales?: object[];
    themeOverrides?: ThemeOverrides;
    /**
     * @deprecated Use themeOverrides.components instead. For backward compatibility only
     */
    externalComponentsTheme?: object;
    /** @deprecated 'deprecated-px' will be removed in the next major version. Migrate to rem-based typography. */
    typographyMode?: TypographyMode;
}

export const ThemeConfig = ({
    mode,
    children,
    language,
    externalLocales,
    themeOverrides,
    externalComponentsTheme,
    typographyMode
}: ThemeConfigProps): React.ReactNode[] | React.ReactNode => {
    return (
        <ThemeProvider
            theme={getTheme(mode, {
                language,
                externalComponentsTheme,
                externalLocales,
                themeOverrides,
                typographyMode
            })}
        >
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

/** @deprecated Use theme.palette.grey instead */
export const basicGrey100 = '#D9D9D9';
/** @deprecated Use theme.palette.grey instead */
export const basicGrey200 = '#7b7b7b';
