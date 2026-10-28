// Hand-crafted Ring component overrides for the `next` theme version.
// Kept separate from generated tokens because this is runtime component behavior.

// Type-only augmentation enabling the `MuiPickers*` slot keys so the picker fields
// inherit the same outlined redesign as `MuiOutlinedInput`. MUST stay `import type {}`:
// `@mui/x-date-pickers` is an OPTIONAL peer dependency, so a bare side-effect import
// would emit a real `require`/`import` into the core bundle and break every consumer
// that does not install MUI X.
import type {} from '@mui/x-date-pickers/themeAugmentation';
// Same for `MuiDataGrid`: `@mui/x-data-grid` is an optional peer too.
import type {} from '@mui/x-data-grid/themeAugmentation';

import { alpha, type Components, type Theme } from '@mui/material';
import type { ElementType } from 'react';
import { ChevronDown } from 'lucide-react';
import {
    aiGradientRing,
    aiInteractionStates,
    aiOutlinedSurface,
    aiTextFill,
    aiOutlineKeyframes
} from './aiColor';

import { chipLabel, chipRoot, chipSizeSmall, chipVariants, tagGeometry } from './chip';
import {
    accordionExpandIcon,
    alertIconMapping,
    autocompleteClearIcon,
    autocompletePopupIcon,
    calendarLeftArrowIcon,
    calendarRightArrowIcon,
    calendarSwitchViewIcon,
    chipDeleteIcon,
    dataGridIcons,
    pickerClearIcon,
    pickerDateIcon,
    pickerTimeIcon,
    treeCollapseIcon,
    treeExpandIcon
} from './lucideIcons';

/** Resting opacity of a chip's delete icon, as MUI does for its own chips. */
const DELETE_ICON_OPACITY = 0.7;

/** Box of the Accordion expand chevron; the glyph is drawn at `1em` of it. */
const ACCORDION_CHEVRON_PX = 20;

// A date or date-time picker opens with the calendar, a time picker with the clock; both clear with
// the X every field uses. The responsive pickers pass their slots down to the desktop and mobile
// variants they render, but those variants rendered on their own read only their own key.
const datePickerIcons = { defaultProps: { slots: { openPickerIcon: pickerDateIcon, clearIcon: pickerClearIcon } } };
const timePickerIcons = { defaultProps: { slots: { openPickerIcon: pickerTimeIcon, clearIcon: pickerClearIcon } } };

// The theme entry of a MUI X tree view, with the icon slot names of `@mui/x-tree-view` 8.29, which is not a
// dependency of this package. A slot renamed on the MUI X side is not caught here; the tree tests of the component
// library, which render the trees, catch it.
interface TreeViewThemeEntry {
    defaultProps: { slots: { expandIcon: ElementType; collapseIcon: ElementType; }; };
}

// The tree views take the chevrons at tree level, where MUI X looks after the item's own slots, so an
// icon a consumer passes to either a tree or an item still wins. `Components<Theme>` does not know
// these keys, so they are cast where they join it.
const TREE_VIEW_ICONS = {
    MuiSimpleTreeView: { defaultProps: { slots: { expandIcon: treeExpandIcon, collapseIcon: treeCollapseIcon } } },
    MuiRichTreeView: { defaultProps: { slots: { expandIcon: treeExpandIcon, collapseIcon: treeCollapseIcon } } }
} satisfies Record<'MuiSimpleTreeView' | 'MuiRichTreeView', TreeViewThemeEntry>;

export interface ComponentsFactoryOptions {
    pxTo: (px: number) => string;
}

// The design has no `variant` axis, so the v2 card is scoped to `borderless` and MUI's
// `outlined` / `elevation` keep their pre-v2 spacing through this selector.
const NON_BORDERLESS_ACCORDION
    = '.MuiAccordion-root.MuiPaper-outlined &, .MuiAccordion-root.MuiPaper-elevation &';

const BORDERLESS_ACCORDION = '.MuiAccordion-root.MuiPaper-borderless &';

// An IconButton inside an input — any variant, outlined, filled or standard — is sized by
// the field, not by its own `size`, so it never changes the field height: 28px in a medium
// field (40px outlined), 24px in a small one (32px outlined), with a 20px glyph. Covers a
// button passed straight as the end adornment, one wrapped in `InputAdornment`, and
// Autocomplete's indicators and actions. Nested under the field root, so it outranks the
// IconButton size slots.
const FIELD_ICON_BUTTON = [
    '& > .MuiIconButton-root',
    '& .MuiInputAdornment-root .MuiIconButton-root',
    '& .MuiAutocomplete-endAdornment .MuiIconButton-root'
].join(', ');

// Every field variant — outlined, filled, standard, and the matching picker fields — has the
// same box: a height floor of 32px (small) / 40px (medium) with no vertical padding, and the
// design's 14/24 input text (no typography variant carries that pair: `body2` is 14/20,
// `body1` 16/24). Being a floor, content that needs more room still grows it: a multiline
// textarea, or an Autocomplete's chips wrapping onto new rows. Button and IconButton
// `small` (32) and `large` (40) line up with these.
function fieldBox(theme: Theme, pxTo: (px: number) => string, small: boolean): object {
    return {
        boxSizing: 'border-box',
        minHeight: small ? theme.getSpacing(4) : theme.getSpacing(5),
        fontSize: pxTo(14),
        lineHeight: pxTo(24)
    };
}

// Picker fields are sized by the class MUI X always puts on the root, not by `ownerState`:
// a picker field's slots do not all receive an `ownerState` in their theme overrides.
const PICKER_SMALL = '&.MuiPickersInputBase-inputSizeSmall';

function pickerFieldBox(theme: Theme, pxTo: (px: number) => string): object {
    return {
        ...fieldBox(theme, pxTo, false),
        [PICKER_SMALL]: { minHeight: theme.getSpacing(4) }
    };
}

// The single-line input box follows the 24px line height (MUI sizes it `1.4375em`) with no
// vertical padding, so the root's floor alone sets the field height. Horizontal padding is
// left to each variant. A textarea keeps vertical padding and grows with its content.
function fieldInput(theme: Theme, pxTo: (px: number) => string): object {
    return {
        'boxSizing': 'border-box',
        'height': pxTo(24),
        'paddingTop': 0,
        'paddingBottom': 0,
        '&::placeholder': {
            color: theme.palette.text.disabled,
            opacity: 1
        },
        '&.MuiInputBase-inputMultiline': {
            display: 'block',
            height: 'auto',
            paddingTop: theme.getSpacing(1.5),
            paddingBottom: theme.getSpacing(1.5)
        }
    };
}

// A 32/40px field has no room for a label inside it, so the label sits above the field, in the
// flow, as a caption: always in an outlined or filled field, and once shrunk in a standard one,
// whose label otherwise rests on the input line (`standardLabelRest`). It is inset 8px like the
// helper text, except over a standard field, whose text starts flush with the underline.
function fieldLabel(theme: Theme, variant: 'outlined' | 'filled' | 'standard'): object {
    const standard = variant === 'standard';

    return {
        ...theme.typography.caption,
        'padding': theme.getSpacing(0, standard ? 0 : 1, 0.5),
        'position': 'relative',
        'transform': 'none',
        'maxWidth': '100%',
        'pointerEvents': 'auto',
        ...(standard ? standardLabelRest() : {}),
        // Last, so it wins over the rest positions, which carry the same specificity.
        '&.MuiInputLabel-shrink': {
            transform: 'none',
            maxWidth: '100%'
        }
    };
}

// The 14px input text (`fieldBox`) over the 12px caption of the label.
const STANDARD_LABEL_REST_SCALE = 14 / 12;

// Until it shrinks (empty, unfocused, no start adornment), a standard label rests on the input
// line at the size of the input text, and MUI's transition carries it up to the caption. The field
// starts below the caption's 16px line and 4px gap; its input line is centred 20px into a medium
// field, 16px into a small one and 24px into a textarea, below the textarea's 12px padding.
function standardLabelRest(): object {
    // Moves the centre of the caption line, scaled from the label's top left, onto the input line.
    const rest = (lineCentre: number): string => {
        const y = 16 + 4 + lineCentre - ((16 / 2) * STANDARD_LABEL_REST_SCALE);

        return `translate(0, ${Number(y.toFixed(3))}px) scale(${Number(STANDARD_LABEL_REST_SCALE.toFixed(4))})`;
    };

    return {
        'transform': rest(20),
        'maxWidth': `${Number((100 / STANDARD_LABEL_REST_SCALE).toFixed(3))}%`,
        '&.MuiInputLabel-sizeSmall': {
            transform: rest(16)
        },
        '&:has(+ .MuiInputBase-multiline)': {
            transform: rest(24)
        }
    };
}

const FIELD_ICON_BUTTON_SIZE = { small: 24, medium: 28 } as const;

function fieldIconButton(small: boolean, pxTo: (px: number) => string): object {
    const box = small ? FIELD_ICON_BUTTON_SIZE.small : FIELD_ICON_BUTTON_SIZE.medium;

    return {
        [FIELD_ICON_BUTTON]: {
            'width': box,
            'height': box,
            'padding': 0,
            // MUI's own SvgIcon defaults to 24px (`fontSizeMedium`); in a field button it takes the
            // 20px of every other glyph. An explicit `small` / `large` / `inherit` still wins.
            '& .MuiSvgIcon-fontSizeMedium': {
                fontSize: pxTo(20)
            }
        }
    };
}

// MUI positions the Autocomplete end adornment absolutely and reserves room for it with a
// fixed padding-right sized for its own two indicators (26 + 4 + 9 per icon). It does not know
// about further buttons in the same adornment (a loader, actions), which would otherwise sit
// over the text. The root reserves the adornment's actual button count — counted with `:has()`
// and `:nth-of-type` on the adornment's children, which are all buttons; a hidden clear button
// still takes its place — times the in-field IconButton size, plus the adornment's offset from
// the edge (9px, 0 in standard, as MUI places it) and a 4px gap before the text. `:has()` lifts
// the rule to the specificity of MUI's two-indicator rule, and being emitted later it wins on
// source order. `:nth-of-type` rather than `:nth-child`, which Emotion flags as unsafe for SSR.
const AUTOCOMPLETE_MAX_END_ADORNMENT_BUTTONS = 4;

function autocompleteEndAdornmentReserve(): Record<string, { paddingRight: number; }> {
    const roots = [
        { root: '.MuiOutlinedInput-root', offset: 9 },
        { root: '.MuiFilledInput-root', offset: 9 },
        { root: '.MuiInput-root', offset: 0 }
    ];

    return Object.fromEntries(
        Array.from(Array(AUTOCOMPLETE_MAX_END_ADORNMENT_BUTTONS).keys()).flatMap((index) => {
            const buttons = index + 1;
            const has = `&:has(.MuiAutocomplete-endAdornment > :nth-of-type(${buttons}))`;

            return roots.flatMap(({ root, offset }) => [
                [`${has} ${root}`, { paddingRight: offset + (buttons * FIELD_ICON_BUTTON_SIZE.medium) + 4 }],
                [`${has} ${root}.MuiInputBase-sizeSmall`, { paddingRight: offset + (buttons * FIELD_ICON_BUTTON_SIZE.small) + 4 }]
            ]);
        })
    );
}

// The redesigned switch keeps the thumb fully inside a tall pill track, unlike the stock MUI
// switch where the thumb overlaps a low track. Outer boxes match the stock component
// (medium 58x38, small 40x24), so the switch keeps its footprint in existing layouts.
const SWITCH_GEOMETRY = {
    medium: { width: 58, height: 38, trackWidth: 40, trackHeight: 24, thumbSize: 20 },
    small: { width: 40, height: 24, trackWidth: 26, trackHeight: 16, thumbSize: 12 }
} as const;

// Gap between the thumb and the track edge, at BOTH ends of the travel.
const SWITCH_THUMB_INSET = 2;

interface SwitchGeometryStyles {
    root: Record<string, unknown>;
    track: Record<string, unknown>;
    thumb: Record<string, unknown>;
    switchBase: Record<string, unknown>;
    checkedTransform: Record<string, unknown>;
}

function switchGeometryStyles(size: keyof typeof SWITCH_GEOMETRY): SwitchGeometryStyles {
    const { width, height, trackWidth, trackHeight, thumbSize } = SWITCH_GEOMETRY[size];
    const trackStart = (width - trackWidth) / 2;
    // The switch base is the square ripple area: its padding is what centres the thumb
    // vertically, and `left` then parks the thumb one inset inside the track. Travel and both
    // resting positions come from the same inset, so the two ends cannot drift apart.
    const basePadding = (height - thumbSize) / 2;
    const baseOffset = trackStart + SWITCH_THUMB_INSET - basePadding;
    const travel = trackWidth - thumbSize - SWITCH_THUMB_INSET * 2;

    return {
        root: { width, height, padding: `${(height - trackHeight) / 2}px ${trackStart}px` },
        track: { borderRadius: trackHeight / 2 },
        thumb: { width: thumbSize, height: thumbSize },
        switchBase: { left: baseOffset, padding: basePadding },
        checkedTransform: { transform: `translateX(${travel}px)` }
    };
}

// Geometry reads nothing but the constants above, so it is built once per module instead of
// on every resolve of the `MuiSwitch` style overrides.
const SWITCH_MEDIUM = switchGeometryStyles('medium');
const SWITCH_SMALL = switchGeometryStyles('small');

// A coloured switch tints its halo with the action opacities, as MUI's own Switch does: the same
// numbers compose the neutral hover/focus, so coloured and neutral states move together.
function switchColorHalo(color: string, action: Theme['palette']['action']): Record<string, unknown> {
    return {
        '&:hover': { backgroundColor: alpha(color, action.hoverOpacity) },
        '&.Mui-focusVisible': { backgroundColor: alpha(color, action.focusOpacity) }
    };
}

// Anything resting on imagery cannot borrow contrast from the page, so it carries its own
// opaque plate. Plate and glyph both follow the colour mode, which is what separates this from
// a translucent tint. Geometry is not set here: the plate shape belongs to the component.
// The thumb colour comes from `_native.scrollbarBackground`. A palette without it (an override
// that drops `_native`) keeps the browser's own colour instead of `undefined transparent`.
function nativeScrollbarColor(theme: Theme): object {
    const thumb = theme.palette._native?.scrollbarBackground;

    if (!thumb) {
        return {};
    }

    return {
        ':where(html)': {
            scrollbarColor: `${thumb} transparent`
        }
    };
}

function overlayPlate(theme: Theme, options?: { checkable?: boolean; }): object {
    const overlay = theme.palette.components.overlay;

    // The role is not part of every variant, so the key is optional and the rules below have
    // to be skipped rather than emitted against `undefined`.
    if (!overlay) {
        return {};
    }

    // MUI pairs these two for every colour it generates itself. Keeping the pair is what makes
    // a partially selected control read as touched instead of as untouched.
    const SELECTED = '&.Mui-checked, &.MuiCheckbox-indeterminate';
    const SELECTED_HOVER = '&.Mui-checked:hover, &.MuiCheckbox-indeterminate:hover';

    return {
        'backgroundColor': overlay.background,
        'color': overlay.foreground,
        '&:hover': {
            'backgroundColor': overlay.hover,
            // MUI resets `:hover` to `transparent` under `@media (hover: none)` so a tap does
            // not strand a hover tint on a touch device. That reset is emitted before this rule
            // and loses to it at equal specificity, which would take the plate down with it —
            // so restate it here, on the plate colour rather than on transparent.
            '@media (hover: none)': { backgroundColor: overlay.background }
        },
        ...(options?.checkable === true
            ? {
                [SELECTED]: {
                    backgroundColor: overlay.selected,
                    color: overlay.selectedForeground
                },
                // Selected and hover carry the same specificity, so without this rule the
                // result depends on which one is written last. The cluster has no separate
                // selected-hover colour, so the selected plate is what holds.
                [SELECTED_HOVER]: {
                    backgroundColor: overlay.selected
                }
            }
            : {}),
        // Emitted last: it shares specificity with the selected rule, so only source order
        // stops a disabled selected control from reading as an active one. Neither component
        // supplies a usable rule of its own — IconButton clears the plate to transparent for
        // every colour, and Checkbox derives one per palette key, which `overlay` is not.
        '&.Mui-disabled': {
            backgroundColor: overlay.background,
            color: theme.palette.action.disabled
        }
    };
}

// Returns Ring `components` overrides consumed by `createTheme`.
export function buildRingComponents({ pxTo }: ComponentsFactoryOptions): Components<Theme> {
    return {
        ...(TREE_VIEW_ICONS as Components<Theme>),
        MuiDatePicker: datePickerIcons,
        MuiDesktopDatePicker: datePickerIcons,
        MuiMobileDatePicker: datePickerIcons,
        MuiDateTimePicker: datePickerIcons,
        MuiDesktopDateTimePicker: datePickerIcons,
        MuiMobileDateTimePicker: datePickerIcons,
        MuiTimePicker: timePickerIcons,
        MuiDesktopTimePicker: timePickerIcons,
        MuiMobileTimePicker: timePickerIcons,
        MuiPickersCalendarHeader: {
            defaultProps: {
                slots: { switchViewIcon: calendarSwitchViewIcon }
            },
            styleOverrides: {
                // MUI X animates the year-view flip on its own icon only; a slot icon gets the class
                // the flip keys on, so the transition goes on the class too.
                switchViewButton: ({ theme }: { theme: Theme; }) => ({
                    '& .MuiPickersCalendarHeader-switchViewIcon': {
                        willChange: 'transform',
                        transition: theme.transitions.create('transform')
                    }
                })
            }
        },
        MuiPickersArrowSwitcher: {
            defaultProps: {
                slots: { leftArrowIcon: calendarLeftArrowIcon, rightArrowIcon: calendarRightArrowIcon }
            }
        },
        // Sort arrows and the column menu button; the column separator stays MUI's.
        MuiDataGrid: {
            defaultProps: {
                slots: dataGridIcons
            }
        },
        MuiCssBaseline: {
            styleOverrides: (theme) => ({
                ...aiOutlineKeyframes,
                // Standard properties only: `::-webkit-scrollbar-*` would make macOS overlay scrollbars
                // classic. The colour on `:where(html)` inherits at zero specificity; the width goes on `*`
                // because it does not inherit. Chromium 121+ / Safari 18.2+ then ignore `::-webkit-scrollbar*`.
                ...nativeScrollbarColor(theme),
                '*': {
                    scrollbarWidth: 'thin'
                },
                '.ring-text-editor .tiptap': {
                    'padding': theme.getSpacing(2),

                    // Children are ProseMirror nodes, so SSR never puts an Emotion <style> among them.
                    // `:first-of-type` and `:not(* + *)` would change what this reset matches.
                    '& :first-child /* emotion-disable-server-rendering-unsafe-selector-warning-please-do-not-use-this-the-warning-exists-for-a-reason */': {
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
            // Theme `slotProps` merge per slot: a consumer's `elevation` wins, and a custom `slots.paper`
            // that spreads its props gets it too. On MUI 7 that merge drops a consumer's function-form `slotProps.paper`.
            // The indicators are the lucide icons the Ring Autocomplete draws, at the 20px every field glyph takes.
            defaultProps: {
                popupIcon: autocompletePopupIcon,
                clearIcon: autocompleteClearIcon,
                slotProps: {
                    paper: { elevation: 8 }
                }
            },
            styleOverrides: {
                // Autocomplete adds its own vertical padding to the field root and input, per
                // variant (outlined 9/7.5px, filled 19/7px, standard 0/4px, with small and
                // `hiddenLabel` variations). These rules mirror MUI's selectors — including
                // the `hiddenLabel` ones, which carry an extra class — and theme overrides are
                // emitted after MUI's base styles in the same class, so they win on source
                // order. The 24px row (input or chips) plus this inset lands on the field
                // floor of every variant: 8 + 24 + 8 = 40, 4 + 24 + 4 = 32.
                // Wrapped chip rows are spaced by `rowGap` instead of the chips' own
                // vertical margin, so every row keeps the same inset from the border.
                root: ({ ownerState, theme }: { ownerState: { multiple?: boolean; }; theme: Theme; }) => {
                    const fieldRoots = ['.MuiOutlinedInput-root', '.MuiFilledInput-root', '.MuiInput-root'];
                    const medium = fieldRoots.flatMap((root) => [`& ${root}`, `& ${root}.MuiInputBase-hiddenLabel`]);
                    const small = fieldRoots.flatMap((root) => [
                        `& ${root}.MuiInputBase-sizeSmall`,
                        `& ${root}.MuiInputBase-hiddenLabel.MuiInputBase-sizeSmall`
                    ]);
                    const inset = (padding: string): object => ({
                        'paddingTop': padding,
                        'paddingBottom': padding,
                        '& .MuiAutocomplete-input': {
                            paddingTop: 0,
                            paddingBottom: 0
                        }
                    });

                    return {
                        // MUI positions its own end adornment from the styled component, not the
                        // class, so an adornment rendered as a plain `.MuiAutocomplete-endAdornment`
                        // element (a consumer's, or one rendered when MUI renders none — e.g. disabled
                        // with actions) would sit in the flow and grow the field. The same placement
                        // on the class; MUI's `right: 9` for outlined and filled still outranks it.
                        '& .MuiAutocomplete-endAdornment': {
                            position: 'absolute',
                            right: 0,
                            top: '50%',
                            transform: 'translate(0, -50%)'
                        },
                        ...(ownerState.multiple && {
                            '.MuiAutocomplete-endAdornment': {
                                height: `calc(100% - ${theme.getSpacing(1)})`,
                                display: 'flex',
                                alignItems: 'end'
                            }
                        }),
                        [medium.join(', ')]: {
                            ...inset(theme.getSpacing(1)),
                            'rowGap': theme.getSpacing(0.5),
                            '& .MuiAutocomplete-tag': {
                                marginTop: 0,
                                marginBottom: 0
                            }
                        },
                        [small.join(', ')]: inset(theme.getSpacing(0.5)),
                        ...autocompleteEndAdornmentReserve()
                    };
                }
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
            defaultProps: {
                expandIcon: accordionExpandIcon
            },
            styleOverrides: {
                expandIconWrapper: ({ theme }: { theme: Theme; }) => ({
                    fontSize: theme.typography.pxToRem(ACCORDION_CHEVRON_PX)
                }),
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
                variant: 'standard',
                iconMapping: alertIconMapping
            }
        },
        MuiInputLabel: {
            variants: (['outlined', 'filled', 'standard'] as const).map((variant) => ({
                props: { variant },
                style: ({ theme }: { theme: Theme; }) => fieldLabel(theme, variant)
            }))
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined'
            }
        },
        MuiFormHelperText: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => ({
                    // The outlined MuiInputLabel uses spacing(1) = 8px horizontal padding;
                    '&.MuiFormHelperText-contained': {
                        marginLeft: theme.getSpacing(1),
                        marginRight: theme.getSpacing(1)
                    }
                })
            }
        },
        MuiSelect: {
            defaultProps: {
                variant: 'outlined',
                IconComponent: ChevronDown
            },
            styleOverrides: {
                // The 20px glyph of every field, where Autocomplete draws its chevron: the adornment sits
                // 9px from the edge (0 in standard), MUI pulls the button 2px further out, and the button
                // centres the glyph — which so ends 11px from the edge in a medium field, 9px in a small one.
                icon: {
                    'width': 20,
                    'height': 20,
                    'top': 'calc(50% - 10px)',
                    '.MuiOutlinedInput-root &, .MuiFilledInput-root &': { right: 11 },
                    '.MuiOutlinedInput-root.MuiInputBase-sizeSmall &, .MuiFilledInput-root.MuiInputBase-sizeSmall &': {
                        right: 9
                    },
                    '.MuiInput-root &': { right: 2 },
                    '.MuiInput-root.MuiInputBase-sizeSmall &': { right: 0 }
                }
            }
        },
        MuiFormControl: {
            defaultProps: {
                variant: 'outlined'
            }
        },
        // The base of every input variant (outlined, filled, standard), so the in-field
        // IconButton sizing reaches all of them.
        MuiInputBase: {
            styleOverrides: {
                root: ({ ownerState }: { ownerState: { size?: string; }; }) => fieldIconButton(ownerState.size === 'small', pxTo)
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
                // See `fieldBox` and `fieldInput` for the shared field box.
                root: ({ theme, ownerState }: {
                    theme: Theme;
                    ownerState: { size?: string; startAdornment?: unknown; endAdornment?: unknown; };
                }) => ({
                    'backgroundColor': theme.palette.components.input.filled.enabledFill,
                    'borderRadius': theme.getBorderRadius(2),
                    ...fieldBox(theme, pxTo, ownerState.size === 'small'),

                    // The textarea carries the vertical padding (`fieldInput`). Beside an adornment the
                    // root keeps the 14px MUI gives a single-line field, so both insets match.
                    '&.MuiInputBase-multiline': {
                        paddingTop: 0,
                        paddingBottom: 0,
                        paddingLeft: ownerState.startAdornment ? 14 : 0,
                        paddingRight: ownerState.endAdornment ? 14 : 0
                    }
                }),
                input: ({ theme }: { theme: Theme; }) => ({
                    ...fieldInput(theme, pxTo),
                    'paddingRight': theme.getSpacing(1),
                    'paddingLeft': theme.getSpacing(2),
                    // Beside a start adornment MUI drops the left padding and the adornment's own 8px
                    // margin sets the gap, as the right padding does before an end button. The 16px
                    // inset above outranks MUI's rule, so it is dropped here again.
                    '&.MuiInputBase-inputAdornedStart': {
                        paddingLeft: 0
                    }
                })
            }
        },
        // Filled and standard get the same 32/40 box as outlined; their own look (fill,
        // underline) and horizontal padding stay MUI's. MUI pads the filled input 25/8px
        // (21/4 small, 16/17 or 8/9 with `hiddenLabel`) to make room for a label inside
        // the field; the label now sits above, so that padding goes.
        MuiFilledInput: {
            styleOverrides: {
                root: ({ theme, ownerState }: { theme: Theme; ownerState: { size?: string; }; }) => ({
                    ...fieldBox(theme, pxTo, ownerState.size === 'small'),
                    '&.MuiInputBase-multiline': {
                        paddingTop: 0,
                        paddingBottom: 0
                    }
                }),
                input: ({ theme }: { theme: Theme; }) => fieldInput(theme, pxTo)
            }
        },
        // MUI pushes a start adornment in a filled field 16px down, level with the text under
        // a label floating inside the field. The label sits above the field now, so the
        // adornment stays centred. Mirrors MUI's selector with one more class to outrank it.
        MuiInputAdornment: {
            styleOverrides: {
                root: {
                    '&.MuiInputAdornment-filled.MuiInputAdornment-positionStart&:not(.MuiInputAdornment-hiddenLabel)': {
                        marginTop: 0
                    }
                }
            }
        },
        // A standard input is a field only inside a form control (`TextField`, `FormControl`), the
        // same gate MUI uses for its label geometry; a bare `Input` or `Select` used inline keeps the
        // height of its own content. MUI pushes a standard input 16px down under a label that floats
        // over it; the label is in the flow above the field now, so that gap goes.
        MuiInput: {
            styleOverrides: {
                root: ({ theme, ownerState }: { theme: Theme; ownerState: { size?: string; formControl?: unknown; }; }) => ({
                    ...(ownerState.formControl ? fieldBox(theme, pxTo, ownerState.size === 'small') : {}),
                    'label + &': {
                        marginTop: 0
                    },
                    '&.MuiInputBase-multiline': {
                        paddingTop: 0,
                        paddingBottom: 0
                    }
                }),
                input: ({ theme, ownerState }: { theme: Theme; ownerState: { size?: string; formControl?: unknown; }; }) =>
                    ownerState.formControl ? fieldInput(theme, pxTo) : {}
            }
        },
        MuiPickersInputBase: {
            styleOverrides: {
                // The base of every picker field variant, as `MuiInputBase` is for inputs.
                root: ({ theme }: { theme: Theme; }) => ({
                    ...fieldIconButton(false, pxTo),
                    [PICKER_SMALL]: fieldIconButton(true, pxTo),
                    '&.Mui-disabled': {
                        color: theme.palette.text.disabled,
                        opacity: theme.palette.action.disabledOpacity
                    },
                    '& .MuiIconButton-root.Mui-disabled': {
                        color: theme.palette.text.disabled
                    }
                }),
                // No vertical padding, so the root's floor alone sets the field height (as
                // `fieldInput` does for inputs); the section list sets its own `1.4375em`
                // line height instead of inheriting the 24px one.
                sectionsContainer: ({ ownerState }: { ownerState?: { isFieldDisabled?: boolean; }; }) => ({
                    paddingTop: 0,
                    paddingBottom: 0,
                    lineHeight: pxTo(24),
                    ...(ownerState?.isFieldDisabled ? { opacity: 1 } : {})
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
                    padding: theme.getSpacing(0, 1, 0, 2),
                    ...pickerFieldBox(theme, pxTo)
                }),
                sectionsContainer: {
                    padding: 0
                }
            }
        },
        // Filled and standard picker fields, as `MuiFilledInput` / `MuiInput` for inputs.
        // The filled one styles its own sections container (25/8px, 21/4 small), so the
        // vertical padding is dropped there as well.
        MuiPickersFilledInput: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => pickerFieldBox(theme, pxTo),
                sectionsContainer: {
                    paddingTop: 0,
                    paddingBottom: 0
                }
            }
        },
        MuiPickersInput: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => ({
                    ...pickerFieldBox(theme, pxTo),
                    'label + &': {
                        marginTop: 0
                    }
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
                // Square boxes matching the Button heights: small 32, medium 36, large 40.
                // small matches the small input and large the medium one (40). The edge
                // margins pull the glyph, not the box, onto the edge: (box - icon) / 2. An
                // IconButton inside a field is sized by the field instead — see
                // `fieldIconButton`, applied from `MuiInputBase` and `MuiPickersInputBase`.
                sizeSmall: {
                    'width': 32,
                    'height': 32,
                    'padding': 0,
                    'boxSizing': 'border-box',
                    'fontSize': pxTo(20),
                    '&.MuiIconButton-edgeStart': { marginLeft: -6 },
                    '&.MuiIconButton-edgeEnd': { marginRight: -6 }
                },
                sizeMedium: {
                    'width': 36,
                    'height': 36,
                    'padding': 0,
                    'boxSizing': 'border-box',
                    'fontSize': pxTo(20),
                    '&.MuiIconButton-edgeStart': { marginLeft: -8 },
                    '&.MuiIconButton-edgeEnd': { marginRight: -8 }
                },
                sizeLarge: {
                    'width': 40,
                    'height': 40,
                    'padding': 0,
                    'boxSizing': 'border-box',
                    'fontSize': pxTo(24),
                    '&.MuiIconButton-edgeStart': { marginLeft: -8 },
                    '&.MuiIconButton-edgeEnd': { marginRight: -8 }
                }
            },
            variants: [
                {
                    props: { color: 'overlay' as const },
                    style: ({ theme }: { theme: Theme; }): object => overlayPlate(theme)
                },
                {
                    // The ring is a masked pseudo-element, so no border is added.
                    props: { color: 'ai' as const },
                    style: ({ theme }: { theme: Theme; }) => ({
                        ...aiGradientRing(theme, true),
                        'color': theme.palette.ai.main,
                        '&.Mui-disabled::before': { background: theme.palette.action.disabled, animation: 'none' }
                    })
                }
            ]
        },
        MuiCheckbox: {
            variants: [
                {
                    // Adds the selected step, where the plate moves to `selected` and the glyph
                    // to `selectedForeground`, so the control reads as chosen without relying
                    // on the image behind it.
                    props: { color: 'overlay' as const },
                    style: ({ theme }: { theme: Theme; }): object => overlayPlate(theme, { checkable: true })
                }
            ]
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
                // Heights: small 32, medium 36, large 40 — line height plus vertical padding.
                // small matches the small input and large the medium one (40), the same scale
                // as IconButton.
                // These size slots outrank MUI's per-variant padding, so the outlined 1px
                // border would add 2px on top; it is taken back out of the padding, as MUI
                // does for its own outlined sizes.
                sizeSmall: {
                    'fontSize': '0.8125rem',
                    'lineHeight': '22px',
                    'padding': '5px 12px',
                    '&.MuiButton-outlined': { padding: '4px 11px' }
                },
                sizeMedium: {
                    'fontSize': '0.875rem',
                    'letterSpacing': '0.4px',
                    'padding': '6px 16px',
                    '&.MuiButton-outlined': { padding: '5px 15px' }
                },
                sizeLarge: {
                    'fontSize': '1rem',
                    'padding': '8px 16px',
                    '&.MuiButton-outlined': { padding: '7px 15px' }
                },
                contained: {
                    'boxShadow': 'none',
                    '&:hover': {
                        boxShadow: 'none'
                    }
                }
            },
            variants: [
                {
                    props: { color: 'ai' as const, variant: 'outlined' as const },
                    style: ({ theme }: { theme: Theme; }) => ({
                        ...aiGradientRing(theme, true),
                        '& .MuiButton-startIcon, & .MuiButton-endIcon': { color: theme.palette.ai.main },
                        '&.Mui-disabled': {
                            'color': theme.palette.text.disabled,
                            '&::before': { background: theme.palette.action.disabled, animation: 'none' }
                        },
                        '& > :not(.MuiButton-startIcon):not(.MuiButton-endIcon):not(.MuiTouchRipple-root)': aiTextFill(theme),
                        ...aiTextFill(theme),
                        ...aiInteractionStates(theme)
                    })
                }
            ]
        },
        MuiChip: {
            defaultProps: {
                size: 'small',
                // Every chip deletes with the same glyph, including the ones a consumer renders
                // without passing one; MUI's own default is its filled `CancelIcon`.
                deleteIcon: chipDeleteIcon
            },
            // The Outlined / Filled / Tag surfaces, states and slot geometry live in `chip.ts`;
            // `color="ai"` keeps its own variant below and layers on top of them.
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }) => chipRoot(theme),
                sizeSmall: chipSizeSmall,
                label: chipLabel
            },
            variants: [
                ...chipVariants(),
                {
                    props: { color: 'ai' as const },
                    style: ({ theme }: { theme: Theme; }) => ({
                        ...aiOutlinedSurface(theme),
                        '& .MuiChip-label': aiTextFill(theme),
                        '& .MuiChip-icon': { color: theme.palette.ai.main },
                        '& .MuiChip-deleteIcon': {
                            'color': alpha(theme.palette.ai.main, DELETE_ICON_OPACITY),
                            '&:hover, &:active': { color: theme.palette.ai.main }
                        }
                    })
                },
                // An AI flag is a tag like any other label: the AI surface in the tag's box.
                {
                    props: { variant: 'tag' as const, color: 'ai' as const },
                    style: ({ theme }: { theme: Theme; }) => tagGeometry(theme)
                }
            ]
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
        },
        MuiSwitch: {
            styleOverrides: {
                root: ({ theme }: { theme: Theme; }): Record<string, unknown> => {
                    const { palette, shadows } = theme;
                    const switchTokens = palette.components.switch;
                    // The slide fills are variant-specific and typed optional, so both fall back
                    // instead of resolving to `undefined` — which would drop the declaration and
                    // leave the forced `opacity: 1` on MUI's stock `currentColor` track, painting
                    // it as an opaque slab. The unchecked fallback reproduces that stock rail at
                    // its usual 38%, and stays distinct from the disabled track below.
                    const uncheckedTrack = switchTokens.slideUncheckedFill ?? alpha(palette.text.primary, 0.38);
                    const checkedTrack = switchTokens.slideCheckedFill ?? palette.primary.light;

                    return {
                        ...SWITCH_MEDIUM.root,
                        '& .MuiSwitch-track': {
                            ...SWITCH_MEDIUM.track,
                            backgroundColor: uncheckedTrack,
                            opacity: 1
                        },
                        '& .MuiSwitch-thumb': {
                            ...SWITCH_MEDIUM.thumb,
                            backgroundColor: switchTokens.knobFillEnabled,
                            // One elevation for every state — the design unified it on elevation/3.
                            boxShadow: shadows[3]
                        },
                        '& .MuiSwitch-switchBase': {
                            ...SWITCH_MEDIUM.switchBase,
                            // Drives the halo and press ripple via currentColor; the thumb fill is pinned above.
                            'color': palette.action.active,
                            '&:hover': { backgroundColor: palette.action.hover },
                            '&.Mui-focusVisible': { backgroundColor: palette.action.focus },
                            '&.Mui-checked': {
                                ...SWITCH_MEDIUM.checkedTransform,
                                'color': palette.primary.main,
                                ...switchColorHalo(palette.primary.main, palette.action),
                                '& + .MuiSwitch-track': { backgroundColor: checkedTrack, opacity: 1 }
                            },
                            // The error switch is tinted in both states, checked and unchecked; this block
                            // intentionally follows `.Mui-checked` so its track color wins on source order.
                            '&.MuiSwitch-colorError': {
                                'color': palette.error.main,
                                ...switchColorHalo(palette.error.main, palette.action),
                                '& + .MuiSwitch-track': { backgroundColor: palette.error.light }
                            },
                            // Last on purpose: disabled beats both color blocks on source order.
                            '&.Mui-disabled': {
                                'color': palette.action.disabled,
                                '& .MuiSwitch-thumb': { backgroundColor: switchTokens.knobFillDisabled },
                                '& + .MuiSwitch-track': { backgroundColor: palette.action.disabledBackground, opacity: 1 }
                            }
                        },
                        '&.MuiSwitch-sizeSmall': {
                            ...SWITCH_SMALL.root,
                            '& .MuiSwitch-track': SWITCH_SMALL.track,
                            '& .MuiSwitch-thumb': SWITCH_SMALL.thumb,
                            '& .MuiSwitch-switchBase': {
                                ...SWITCH_SMALL.switchBase,
                                '&.Mui-checked': SWITCH_SMALL.checkedTransform
                            }
                        }
                    };
                }
            }
        }
    };
}
