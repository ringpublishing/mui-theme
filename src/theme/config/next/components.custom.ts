// Hand-crafted Ring component overrides for the `next` theme version.
// Kept separate from generated tokens because this is runtime component behavior.

import type { Components, Theme } from '@mui/material';

export interface ComponentsFactoryOptions {
    pxTo: (px: number) => string;
}

// Returns Ring `components` overrides consumed by `createTheme`.
export function buildRingComponents({ pxTo }: ComponentsFactoryOptions): Components<Theme> {
    return {
        MuiCssBaseline: {
            styleOverrides: (theme) => ({
                '.ring-text-editor .tiptap': {
                    'padding': theme.getSpacing(2),

                    '& :first-child': {
                        marginBlockStart: 0
                    },

                    '& h1': {
                        fontSize: pxTo(34),
                        fontWeight: 700,
                        lineHeight: pxTo(42),
                        letterSpacing: pxTo(-0.5),
                        marginBlockStart: theme.getSpacing(5),
                        marginBlockEnd: theme.getSpacing(2)
                    },
                    '& h2': {
                        fontSize: pxTo(30),
                        fontWeight: 700,
                        lineHeight: pxTo(38),
                        letterSpacing: pxTo(-0.25),
                        marginBlockStart: theme.getSpacing(5),
                        marginBlockEnd: theme.getSpacing(2)
                    },
                    '& h3': {
                        fontSize: pxTo(26),
                        fontWeight: 700,
                        lineHeight: pxTo(34),
                        letterSpacing: 0,
                        marginBlockStart: theme.getSpacing(4),
                        marginBlockEnd: theme.getSpacing(2)
                    },
                    '& h4': {
                        fontSize: pxTo(22),
                        fontWeight: 700,
                        lineHeight: pxTo(28),
                        letterSpacing: 0,
                        marginBlockStart: theme.getSpacing(3),
                        marginBlockEnd: theme.getSpacing(2)
                    },
                    '& h5': {
                        fontSize: pxTo(20),
                        fontWeight: 700,
                        lineHeight: pxTo(28),
                        letterSpacing: 0,
                        marginBlockStart: theme.getSpacing(2),
                        marginBlockEnd: theme.getSpacing(2)
                    },
                    '& h6': {
                        fontSize: pxTo(18),
                        fontWeight: 700,
                        lineHeight: pxTo(22),
                        letterSpacing: 0,
                        marginBlockStart: theme.getSpacing(2),
                        marginBlockEnd: theme.getSpacing(2)
                    },
                    '& > p': {
                        fontSize: pxTo(16),
                        lineHeight: pxTo(24),
                        fontWeight: 400,
                        letterSpacing: 0,
                        marginBlockStart: 0,
                        marginBlockEnd: theme.getSpacing(2)
                    },
                    '& ul, & ol': {
                        paddingInlineStart: theme.getSpacing(4)
                    },
                    '& li *': {
                        fontSize: pxTo(16),
                        lineHeight: pxTo(24),
                        fontWeight: 400,
                        letterSpacing: 0,
                        marginBlock: 0
                    }
                }
            })
        },
        MuiAutocomplete: {
            styleOverrides: {
                root: ({ ownerState, theme }: { ownerState: { multiple?: boolean; }; theme: Theme; }) => ({
                    ...(ownerState.multiple && {
                        '.MuiAutocomplete-endAdornment': {
                            'height': `calc(100% - ${theme.getSpacing(1)})`,
                            'display': 'flex',
                            'align-items': 'end'
                        }
                    })
                })
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: ({ theme }: { theme: Theme; }) => ({
                    fontSize: pxTo(12),
                    fontStyle: 'normal',
                    fontWeight: '400',
                    lineHeight: pxTo(16),
                    backgroundColor: theme.palette.components.tooltip.fill
                }),
                arrow: ({ theme }: { theme: Theme; }) => ({
                    color: theme.palette.components.tooltip.fill
                })
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
        MuiAccordion: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => ({
                    'backgroundColor': 'transparent',
                    'minHeight': theme.getSpacing(4),
                    'margin': 0,
                    '&.Mui-expanded': {
                        margin: 0,
                        minHeight: theme.getSpacing(4)
                    }
                })
            }
        },
        MuiAccordionSummary: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => {
                    const variantPadding = {
                        '.MuiAccordion-root.MuiPaper-outlined &, .MuiAccordion-root.MuiPaper-elevation &': {
                            paddingLeft: theme.getSpacing(2),
                            paddingRight: theme.getSpacing(1)
                        }
                    };

                    return {
                        'padding': 0,
                        ...variantPadding,
                        'minHeight': theme.getSpacing(4),
                        '&.Mui-expanded': {
                            padding: 0,
                            ...variantPadding,
                            minHeight: theme.getSpacing(4)
                        }
                    };
                },
                content: ({ theme }: { theme: Theme; }) => ({
                    'margin': theme.getSpacing(1, 0),
                    '&.Mui-expanded': {
                        margin: theme.getSpacing(1, 0)
                    }
                })
            }
        },
        MuiAccordionDetails: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => {
                    const variantPadding = {
                        '.MuiAccordion-root.MuiPaper-outlined &, .MuiAccordion-root.MuiPaper-elevation &': {
                            paddingLeft: theme.getSpacing(2),
                            paddingRight: theme.getSpacing(2)
                        }
                    };

                    return {
                        'padding': theme.getSpacing(1, 0),
                        ...variantPadding,
                        '&.Mui-expanded': {
                            padding: theme.getSpacing(1, 0),
                            ...variantPadding
                        }
                    };
                }
            }
        },
        MuiAlert: {
            defaultProps: {
                variant: 'standard'
            }
        },
        MuiInputLabel: {
            variants: [
                {
                    props: { variant: 'outlined' },
                    style: ({ theme }: { theme: Theme; }) => ({
                        ...theme.typography.caption,
                        'padding': theme.getSpacing(0, 1, 0.5),
                        'position': 'relative',
                        'transform': 'none',
                        '&.MuiInputLabel-shrink': {
                            transform: 'none'
                        }
                    })
                }
            ]
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined'
            }
        },
        MuiSelect: {
            defaultProps: {
                variant: 'outlined'
            }
        },
        MuiFormControl: {
            defaultProps: {
                variant: 'outlined'
            }
        },
        MuiOutlinedInput: {
            defaultProps: {
                notched: false
            },
            styleOverrides: {
                notchedOutline: {
                    legend: { width: 0 }
                },
                root: ({ theme }: { theme: Theme; }) => ({
                    'backgroundColor': theme.palette.components.input.filled.enabledFill,
                    'borderRadius': theme.getBorderRadius(2),
                    '&.MuiInputBase-multiline': {
                        padding: 0
                    }
                }),
                input: ({ theme }: { theme: Theme; }) => ({
                    'padding': theme.getSpacing(1.5, 1, 1.5, 2),
                    '&::placeholder': {
                        color: theme.palette.text.disabled,
                        opacity: 1
                    }
                })
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
                    fontSize: pxTo(32)
                }
            }
        },
        MuiAppBar: {
            styleOverrides: {
                colorPrimary: ({ theme }: { theme: Theme; }) => ({
                    backgroundColor: theme.palette.background.default
                })
            }
        },
        MuiToggleButton: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => ({
                    width: theme.getSpacing(6),
                    height: theme.getSpacing(6),
                    borderRadius: theme.shape.borderRadius,
                    // Keep permissive spacing here for cross-version 1.5 support.
                    padding: theme.spacing(1.5),
                    borderRightWidth: '1px'
                })
            }
        }
    };
}
