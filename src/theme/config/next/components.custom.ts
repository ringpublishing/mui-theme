// Hand-crafted Ring component overrides for the `next` theme version.
// Kept separate from generated tokens because this is runtime component behavior.

// Type-only augmentation enabling the `MuiPickers*` slot keys so the picker fields
// inherit the same outlined redesign as `MuiOutlinedInput`. MUST stay `import type {}`:
// `@mui/x-date-pickers` is an OPTIONAL peer dependency, so a bare side-effect import
// would emit a real `require`/`import` into the core bundle and break every consumer
// that does not install MUI X.
import type {} from '@mui/x-date-pickers/themeAugmentation';

import type { Components, Theme } from '@mui/material';

export interface ComponentsFactoryOptions {
    pxTo: (px: number) => string;
}

// The design has no `variant` axis, so the v2 card is scoped to `borderless` and MUI's
// `outlined` / `elevation` keep their pre-v2 spacing through this selector.
const NON_BORDERLESS_ACCORDION
    = '.MuiAccordion-root.MuiPaper-outlined &, .MuiAccordion-root.MuiPaper-elevation &';

const BORDERLESS_ACCORDION = '.MuiAccordion-root.MuiPaper-borderless &';

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
            },
            // v2: the Accordion renders as a paper card, scoped to `borderless` so the
            // other variants keep their own border/elevation. `reference` is unchanged.
            variants: [
                {
                    props: { variant: 'borderless' },
                    style: ({ theme }: { theme: Theme; }) => ({
                        'backgroundColor': theme.palette.background.paper,
                        // Card shadow: the generated ladder is indexed by elevation level.
                        'boxShadow': theme.shadows[4],
                        // Clips the square summary/details to the rounded edges; the shadow sits
                        // outside the border box, so it survives.
                        'overflow': 'hidden',
                        // Row separator sits on the row's own bottom edge — Figma puts the
                        // `Divider Container` at y=48 when collapsed and y=112 when expanded,
                        // i.e. below the whole row, not between summary and details. The
                        // `Last-of-type=True` variant hides it.
                        '&:not(:last-of-type)': {
                            borderBottom: `1px solid ${theme.palette.divider}`
                        },
                        // Rounded group edges — `borderRadius/2` (8px) on first/last row only.
                        '&:first-of-type': {
                            borderTopLeftRadius: theme.getBorderRadius(2),
                            borderTopRightRadius: theme.getBorderRadius(2)
                        },
                        '&:last-of-type': {
                            borderBottomLeftRadius: theme.getBorderRadius(2),
                            borderBottomRightRadius: theme.getBorderRadius(2)
                        },
                        // The disabled tint belongs to the whole row, so it is painted here
                        // and nowhere else. MUI's own root rule uses `disabledBackground`
                        // (alpha 0.3); the design asks for `disabledBackgroundLight` (0.2).
                        // Tinting the summary as well would stack two translucent layers and
                        // land on neither value.
                        '&.Mui-disabled': {
                            backgroundColor: theme.palette.action.disabledBackgroundLight
                        }
                    })
                }
            ]
        },
        MuiAccordionSummary: {
            styleOverrides: {
                // v2 summary: 12px/16px padding, `action.active` expand icon and a
                // colour-token disabled state. The card
                // surface and the row divider live on the Accordion root above.
                root: ({ theme }: { theme: Theme; }) => {
                    const variantPadding = {
                        [NON_BORDERLESS_ACCORDION]: {
                            paddingTop: 0,
                            paddingBottom: 0,
                            paddingLeft: theme.getSpacing(2),
                            paddingRight: theme.getSpacing(1)
                        }
                    };

                    return {
                        'padding': theme.getSpacing(1.5, 2),
                        ...variantPadding,
                        'minHeight': theme.getSpacing(4),
                        '& .MuiAccordionSummary-expandIconWrapper': {
                            color: theme.palette.action.active
                        },
                        // Disabled: use disabled tokens instead of MUI's flat opacity fade.
                        // The surface tint is painted once, on the Accordion root — see the
                        // note there. `text.disabled` is currently lighter than the Figma node
                        // (palette pending a regen); using the token keeps it correct on sync
                        // instead of hardcoding today's hex.
                        '&.Mui-disabled': {
                            'opacity': 1,
                            '& .MuiTypography-root': {
                                color: theme.palette.text.disabled
                            },
                            '& .MuiAccordionSummary-expandIconWrapper': {
                                color: theme.palette.action.disabled
                            }
                        },
                        '&.Mui-expanded': {
                            padding: theme.getSpacing(1.5, 2),
                            ...variantPadding,
                            minHeight: theme.getSpacing(4)
                        }
                    };
                },
                content: ({ theme }: { theme: Theme; }) => {
                    const variantMargin = {
                        [NON_BORDERLESS_ACCORDION]: {
                            margin: theme.getSpacing(1, 0)
                        }
                    };

                    return {
                        'margin': theme.getSpacing(0, 0),
                        ...variantMargin,
                        '&.Mui-expanded': {
                            margin: theme.getSpacing(0, 0),
                            ...variantMargin
                        }
                    };
                }
            }
        },
        MuiAccordionDetails: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => {
                    const variantPadding = {
                        [NON_BORDERLESS_ACCORDION]: {
                            paddingLeft: theme.getSpacing(2),
                            paddingRight: theme.getSpacing(2)
                        }
                    };

                    // Kept here rather than as an `sx` on the component so a consumer can
                    // scope it away — `sx` outranks `styleOverrides`.
                    const borderlessPadding = {
                        [BORDERLESS_ACCORDION]: {
                            padding: theme.getSpacing(1, 2, 2, 2)
                        }
                    };

                    return {
                        'padding': theme.getSpacing(1, 0),
                        ...variantPadding,
                        ...borderlessPadding,
                        '&.Mui-expanded': {
                            padding: theme.getSpacing(1, 0),
                            ...variantPadding,
                            ...borderlessPadding
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
                // An outlined input has no fixed height — it comes entirely from this
                // padding, and MUI implements `size="small"` as a padding variant on this
                // very slot. The override must therefore branch on the size itself, or it
                // would flatten both sizes into one. Small mirrors MUI's own variant:
                // vertical shrinks to MUI's 8.5px (off the spacing grid, hence literal),
                // horizontal keeps the redesign rhythm.
                input: ({ theme, ownerState }: { theme: Theme; ownerState: { size?: string; }; }) => ({
                    'padding': ownerState.size === 'small'
                        ? `8.5px ${theme.getSpacing(1)} 8.5px ${theme.getSpacing(2)}`
                        : theme.getSpacing(1.5, 1, 1.5, 2),
                    '&::placeholder': {
                        color: theme.palette.text.disabled,
                        opacity: 1
                    }
                })
            }
        },
        // MUI X date/time pickers render their own outlined-input stack
        // (`MuiPickersOutlinedInput`) separate from `MuiOutlinedInput`, so the
        // redesign above does not reach them. Mirror it here — same palette
        // tokens, continuous border (no notch) — so picker fields match inputs.
        MuiPickersOutlinedInput: {
            defaultProps: {
                notched: false
            },
            styleOverrides: {
                notchedOutline: {
                    legend: { width: 0 }
                },
                // Pickers split the padding across two slots: horizontal lives on the
                // root, vertical on `sectionsContainer` (the visible date sections).
                // The `input` slot is a visually hidden a11y element, so styling it has
                // no visual effect — the mirror has to target these two slots instead.
                root: ({ theme }: { theme: Theme; }) => ({
                    backgroundColor: theme.palette.components.input.filled.enabledFill,
                    borderRadius: theme.getBorderRadius(2),
                    padding: theme.getSpacing(0, 1, 0, 2)
                }),
                // `inputSize` is the pickers' ownerState key for the field size; the
                // small vertical mirrors MUI's own 8.5px variant, same as MuiOutlinedInput.
                sectionsContainer: ({ theme, ownerState }: { theme: Theme; ownerState: { inputSize?: string; }; }) => ({
                    padding: ownerState.inputSize === 'small'
                        ? '8.5px 0'
                        : theme.getSpacing(1.5, 0)
                })
            }
        },
        MuiBadge: {
            defaultProps: {
                variant: 'standard'
            }
        },
        MuiIconButton: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }): object => {
                    return {
                        'borderRadius': theme.getBorderRadius(2),
                        '& .MuiTouchRipple-child': {
                            transform: 'scale(1.3)'
                        },
                        '&.Mui-focusVisible .MuiTouchRipple-child': {
                            borderRadius: 0
                        }
                    };
                },
                sizeSmall: () => ({
                    padding: '3px'
                }),
                sizeMedium: ({ theme }: { theme: Theme; }) => ({
                    padding: theme.getSpacing(1)
                }),
                sizeLarge: ({ theme }: { theme: Theme; }) => ({
                    padding: theme.getSpacing(1.5)
                })
            }
        },
        MuiButton: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => ({
                    borderRadius: theme.getBorderRadius(2),
                    fontWeight: 600,
                    lineHeight: '24px',
                    letterSpacing: '0.46px',
                    textTransform: 'none'
                }),
                sizeSmall: {
                    fontSize: '0.8125rem',
                    lineHeight: '22px',
                    padding: '4px 12px'
                },
                sizeMedium: {
                    fontSize: '0.875rem',
                    letterSpacing: '0.4px',
                    padding: '6px 16px'
                },
                sizeLarge: {
                    fontSize: '1rem',
                    padding: '8px 16px'
                },
                contained: {
                    'boxShadow': 'none',
                    '&:hover': {
                        boxShadow: 'none'
                    }
                }
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
