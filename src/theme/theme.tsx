import {
    CssBaseline,
    PaletteMode,
    Theme,
    ThemeProvider,
    createTheme,
    PaletteOptions
} from '@mui/material';
import { palette } from './config/palette';
import { breakpoints } from './config/breakpoints';
import { shape } from './config/shape';
import { typography } from './config/typography';
import { spacing } from './config/spacing';
import { colors } from './config/colors';
import React from 'react';
import { CommonLanguages } from '../helpers/commonTypes';
import { plPL as corePL, enUS as coreUS } from '@mui/material/locale';

/**
 *
 * @param externalColors Depracated: You shouldn't overwrite the colors. For backward compatibility only, use theme.palette colors instead
 * @returns
 */
export const getTheme = (
    mode: PaletteMode | string,
    language: CommonLanguages = CommonLanguages.enUS,
    externalComponentsTheme = {},
    externalLocales: object[] = [],
    externalColors: object = {}
): Theme => {
    const coreLocale = language === CommonLanguages.plPL ? corePL : coreUS;

    if (Object.keys(externalColors).length > 0) {
        console.warn('The "externalColors" parameter is deprecated and should be used only for backward compatibility. Please use theme.palette instead.');
    }

    return createTheme(
    {
        locale: language,
        palette: {
            ...(palette[mode as PaletteMode] as PaletteOptions)
        },
        breakpoints: {
            keys: ['xs', 'sm', 'md', 'lg', 'xl'],
            values: breakpoints
        },
        spacing,
        shape,
        typography,
        colors: { ...colors, ...externalColors } as typeof colors & Record<string, string>,
        components: {
            ...externalComponentsTheme,
            MuiCssBaseline: {
                styleOverrides: (theme) => ({
                    '.ring-text-editor .tiptap': {
                        'padding': theme.spacing(2),

                        '& :first-child': {
                            marginBlockStart: 0
                        },

                        '& h1': {
                            fontSize: '3.4rem',
                            fontWeight: 700,
                            lineHeight: '42px',
                            letterSpacing: '-0.5px',
                            marginBlockStart: theme.spacing(5),
                            marginBlockEnd: theme.spacing(2)
                        },
                        '& h2': {
                            fontSize: '3.0rem',
                            fontWeight: 700,
                            lineHeight: '38px',
                            letterSpacing: '-0.25px',
                            marginBlockStart: theme.spacing(5),
                            marginBlockEnd: theme.spacing(2)
                        },
                        '& h3': {
                            fontSize: '2.6rem',
                            fontWeight: 700,
                            lineHeight: '34px',
                            letterSpacing: 0,
                            marginBlockStart: theme.spacing(4),
                            marginBlockEnd: theme.spacing(2)
                        },
                        '& h4': {
                            fontSize: '2.2rem',
                            fontWeight: 700,
                            lineHeight: '28px',
                            letterSpacing: 0,
                            marginBlockStart: theme.spacing(3),
                            marginBlockEnd: theme.spacing(2)
                        },
                        '& h5': {
                            fontSize: '2.0rem',
                            fontWeight: 700,
                            lineHeight: '28px',
                            letterSpacing: 0,
                            marginBlockStart: theme.spacing(2),
                            marginBlockEnd: theme.spacing(2)
                        },
                        '& h6': {
                            fontSize: '1.8rem',
                            fontWeight: 700,
                            lineHeight: '22px',
                            letterSpacing: 0,
                            marginBlockStart: theme.spacing(2),
                            marginBlockEnd: theme.spacing(2)
                        },
                        '& > p': {
                            fontSize: '1.6rem',
                            lineHeight: '24px',
                            fontWeight: 400,
                            letterSpacing: 0,
                            marginBlockStart: 0,
                            marginBlockEnd: theme.spacing(2)
                        },
                        '& ul, & ol': {
                            paddingInlineStart: theme.spacing(4)
                        },
                        '& li *': {
                            fontSize: '1.6rem',
                            lineHeight: '24px',
                            fontWeight: 400,
                            letterSpacing: 0,
                            marginBlock: 0
                        }
                    }
                })
            },
            MuiAutocomplete: {
                styleOverrides: {
                    root: ({ ownerState, theme }) => {
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
                            },
                            '.MuiInputBase-root': {
                                borderColor: 'red!important'
                            }
                        };
                    }
                }
            },
            MuiTooltip: {
                styleOverrides: {
                    tooltip: {
                        fontSize: '10px',
                        fontStyle: 'normal',
                        fontWeight: '400',
                        lineHeight: '14px'
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
            // Changes to the Accordion component to remove padding and margin and lower minHeight, so that the component can be used in a more compact way
            MuiAccordion: {
                styleOverrides: {
                    root: ({ theme }) => ({
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
                    root: ({ theme }) => ({
                        'padding': 0,
                        'minHeight': theme.spacing(4),
                        '&.Mui-expanded': {
                            padding: 0,
                            minHeight: theme.spacing(4)
                        }
                    }),
                    content: ({ theme }) => ({
                        'margin': theme.spacing(1, 0),
                        '&.Mui-expanded': {
                            margin: theme.spacing(1, 0)
                        }
                    })
                }
            },
            MuiAccordionDetails: {
                styleOverrides: {
                    root: ({ theme }) => ({
                        'padding': theme.spacing(1, 0),
                        '&.Mui-expanded': {
                            padding: theme.spacing(1, 0)
                        }
                    })
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
                        fontSize: '3.25rem'
                    }
                }
            },
            MuiAppBar: {
                styleOverrides: {
                    colorPrimary: ({ theme }) => {
                        return {
                            backgroundColor: theme.palette.background.default
                        };
                    }
                }
            },
            MuiToggleButton: {
                styleOverrides: {
                    root: ({ theme }) => ({
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
};

interface ThemeConfigProps {
    mode: PaletteMode;
    children: React.ReactNode[] | React.ReactNode;
    language?: CommonLanguages;
    externalLocales?: object[];
    externalComponentsTheme?: object;
}

export const ThemeConfig = ({
    mode,
    children,
    language,
    externalLocales,
    externalComponentsTheme
}: ThemeConfigProps): React.ReactNode[] | React.ReactNode => {
    return (
        <ThemeProvider
            theme={getTheme(mode, language, externalComponentsTheme, externalLocales)}
        >
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export const basicGrey100 = '#D9D9D9';
export const basicGrey200 = '#7b7b7b';
