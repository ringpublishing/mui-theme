// Chip surfaces for the `next` theme: the Outlined, Filled and Tag variants of the design
// system, drawn from `palette.components.chip.*`, `palette.tag.*` and the alert surfaces.
//
// Everything keys on MUI's own chip classes, so a plain `<Chip>` from `@mui/material` picks it
// up. Colour-scoped surfaces go through `variants` rather than class selectors on purpose: a
// variant paints at the root class's own specificity, so a consumer's `sx` still outranks it.
// `color="ai"` is styled in `aiColor.ts` and layers on top.

import { alpha, type Components, type CSSObject, type Theme } from '@mui/material';
import { CHIP_TAG_COLORS } from '../palette.tag.types';

type ChipVariants = NonNullable<NonNullable<Components<Theme>['MuiChip']>['variants']>;

/** Semantic colours the design draws as a tinted alert surface (the Filled / Warning row). */
const SEMANTIC_COLORS = ['error', 'warning', 'info', 'success'] as const;

/** Chip edge → first slot (avatar, icon or label); the label adds `LABEL_INSET` of its own. */
const ROOT_INSET = 4;
const LABEL_INSET = 6;

/** Boxes of the `icon` and `deleteIcon` slots: the design's small glyph, the DS medium icon. */
const ICON_SIZE = { small: 16, medium: 20 } as const;

/** Tags are always the small chip, whatever `size` says — the design draws no other. */
const TAG_HEIGHT = 24;

/** The selected state has no MUI prop; consumers mark it the way MUI marks its own lists. */
const SELECTED = '&.Mui-selected, &[aria-pressed="true"], &[aria-selected="true"]';

/** Hover and press feedback belong to clickable chips; a deletable chip reacts on its X. */
const CLICKABLE_HOVER = '&.MuiChip-clickable:hover';
const CLICKABLE_ACTIVE = '&.MuiChip-clickable:active';
const FOCUS = '&.Mui-focusVisible';
const DISABLED = '&.Mui-disabled';
const GLYPHS = '& .MuiChip-icon, & .MuiChip-deleteIcon';

/**
 * A translucent state colour over the resting surface. The overlay goes into
 * `background-image` so the surface itself stays a plain `background-color`.
 */
const layered = (overlay: string, surface: string): CSSObject => ({
    backgroundImage: `linear-gradient(${overlay}, ${overlay})`,
    backgroundColor: surface
});

interface StateSurfaces {
    hover: string;
    focus: string;
    pressed: string;
}

const stateStyles = ({ hover, focus, pressed }: StateSurfaces): CSSObject => ({
    [CLICKABLE_HOVER]: { backgroundColor: hover },
    [FOCUS]: { backgroundColor: focus },
    // MUI lifts a clickable chip with a shadow on press; the design paints a fill instead.
    [CLICKABLE_ACTIVE]: { backgroundColor: pressed, boxShadow: 'none' }
});

const selectedStyles = (theme: Theme, border: string): CSSObject => {
    const { palette } = theme;
    const chip = palette.components.chip;
    const fill = chip.SelectedFill ?? alpha(palette.primary.main, palette.action.selectedOpacity);
    const accent = chip.outlinedSelectedBorder ?? palette.primary.main;

    return {
        [SELECTED]: {
            'backgroundColor': fill,
            'borderColor': border,
            '& .MuiChip-avatar': { backgroundColor: accent },
            '& .MuiChip-deleteIcon': { color: accent },
            // The design draws no selected-hover, so feedback is the neutral state tint over
            // the selected fill rather than the resting hover surface, which would read as
            // deselecting.
            [CLICKABLE_HOVER]: layered(palette.action.hover, fill),
            [FOCUS]: layered(palette.action.focus, fill),
            [CLICKABLE_ACTIVE]: layered(alpha(palette.action.active, palette.action.activatedOpacity), fill)
        }
    };
};

// Disabled is drawn from tokens, not MUI's 38% opacity on the whole chip: the design keeps the
// text and glyphs on their disabled colours over a disabled surface.
const disabledStyles = (theme: Theme, border: string): CSSObject => {
    const { palette } = theme;

    return {
        [DISABLED]: {
            'opacity': 1,
            'color': palette.text.disabled,
            'backgroundImage': 'none',
            'backgroundColor': palette.action.disabledBackground,
            'borderColor': border,
            '& .MuiChip-avatar': {
                backgroundColor: palette.action.disabled,
                color: palette.background.paper
            },
            [GLYPHS]: { color: palette.action.disabled }
        }
    };
};

/** Geometry and the slots every chip shares, whatever its variant or colour. */
export function chipRoot(theme: Theme): CSSObject {
    const { palette } = theme;

    return {
        'padding': `0 ${ROOT_INSET}px`,
        // Every state keeps a border box, so painting one (outlined, filled, selected) never
        // moves the label.
        'border': '1px solid transparent',
        '& .MuiChip-avatar': { margin: 0 },
        // One box for any glyph: MUI's `SvgIcon` sizes itself and never shrinks, a lucide svg
        // is a plain flex item that gets squeezed next to a truncated label unless the slot
        // pins its box. `width`/`height` outrank the svg's own `size` attribute, so an icon
        // passed with another size still renders at the slot's.
        [GLYPHS]: {
            margin: 0,
            width: '1em',
            height: '1em',
            flexShrink: 0,
            fontSize: ICON_SIZE.medium
        },
        // The leading icon starts where the label's text would: the label carries its own
        // inset, the icon slot does not, so without this a glyph sits 6px closer to the edge
        // than the first letter of an icon-less chip.
        '& .MuiChip-icon': { marginLeft: LABEL_INSET },
        // Colours belong to the default colour only: a `primary` or `secondary` chip keeps
        // MUI's contrast glyphs and avatar, the semantic and tag colours set their own below.
        '&.MuiChip-colorDefault': {
            '& .MuiChip-avatar': {
                color: palette.secondary.contrastText,
                backgroundColor: palette.secondary.dark
            },
            [GLYPHS]: { color: palette.action.active },
            '& .MuiChip-deleteIcon': {
                '&:hover, &:active': { color: palette.text.primary }
            }
        },
        ...disabledStyles(theme, 'transparent')
    };
}

export const chipSizeSmall: CSSObject = {
    [GLYPHS]: { fontSize: ICON_SIZE.small }
};

export const chipLabel: CSSObject = {
    paddingLeft: LABEL_INSET,
    paddingRight: LABEL_INSET
};

const outlinedDefault = (theme: Theme): CSSObject => {
    const { palette } = theme;
    const chip = palette.components.chip;

    return {
        backgroundColor: chip.outlinedEnabledFill ?? 'transparent',
        borderColor: chip.outlinedEnabledBorder ?? palette.divider,
        ...stateStyles({
            hover: chip.outlinedHoverFill ?? palette.action.hover,
            focus: chip.FocusFill ?? palette.action.focus,
            pressed: chip.PressedFill ?? palette.action.focus
        }),
        ...selectedStyles(theme, chip.outlinedSelectedBorder ?? palette.primary.main),
        ...disabledStyles(theme, palette.action.disabled)
    };
};

// The filled chip carries the outlined border as well; only its selected state drops it.
const filledDefault = (theme: Theme): CSSObject => {
    const { palette } = theme;
    const chip = palette.components.chip;

    return {
        backgroundColor: chip.filledEnabledFill ?? palette.action.selected,
        borderColor: chip.outlinedEnabledBorder ?? 'transparent',
        ...stateStyles({
            hover: chip.filledEnabledHover ?? palette.action.focus,
            focus: chip.FocusFill ?? palette.action.focus,
            pressed: chip.PressedFill ?? palette.action.focus
        }),
        ...selectedStyles(theme, 'transparent'),
        ...disabledStyles(theme, 'transparent')
    };
};

// A filled semantic chip is the alert surface of its colour with the `light` ramp step as the
// border, dark glyphs and primary text; its states are the colour's `main` at the shared
// action opacities, laid over that surface.
const filledSemantic = (theme: Theme, color: (typeof SEMANTIC_COLORS)[number]): CSSObject => {
    const { palette } = theme;
    const ramp = palette[color];
    const surface = palette.components.alert[color].background;

    return {
        'color': palette.text.primary,
        'backgroundColor': surface,
        'borderColor': ramp.light,
        [GLYPHS]: { color: ramp.dark },
        '& .MuiChip-deleteIcon': {
            '&:hover, &:active': { color: palette.text.primary }
        },
        [CLICKABLE_HOVER]: layered(alpha(ramp.main, palette.action.hoverOpacity), surface),
        [FOCUS]: layered(alpha(ramp.main, palette.action.focusOpacity), surface),
        [CLICKABLE_ACTIVE]: {
            ...layered(alpha(ramp.main, palette.action.activatedOpacity), surface),
            boxShadow: 'none'
        },
        [SELECTED]: {
            ...layered(alpha(ramp.main, palette.action.selectedOpacity), surface),
            borderColor: ramp.light
        },
        ...disabledStyles(theme, 'transparent')
    };
};

interface TagSurface {
    background: string;
    border: string;
    text: string;
}

// Tags are labels, not controls: the surface holds still under hover and press, and a
// keyboard focus is shown as a ring in the tag's own border colour instead of MUI's
// colour-ramp fill. Both are reachable only when a consumer wires `onClick`/`onDelete`
// onto a tag, which the design does not draw.
const tagStyles = (theme: Theme, { background, border, text }: TagSurface): CSSObject => ({
    'height': TAG_HEIGHT,
    'borderRadius': theme.shape.borderRadius,
    'color': text,
    'backgroundColor': background,
    'borderColor': border,
    [GLYPHS]: { fontSize: ICON_SIZE.small, color: text },
    '& .MuiChip-deleteIcon': {
        '&:hover, &:active': { color: text }
    },
    [`${CLICKABLE_HOVER}, ${CLICKABLE_ACTIVE}`]: { backgroundColor: background, boxShadow: 'none' },
    [FOCUS]: {
        backgroundColor: background,
        boxShadow: `0 0 0 2px ${border}`
    },
    ...disabledStyles(theme, 'transparent')
});

const tagNeutral = (theme: Theme): TagSurface => ({
    background: 'transparent',
    border: theme.palette.components.paper?.outlineBorder ?? theme.palette.divider,
    text: theme.palette.text.secondary
});

const tagSemantic = (theme: Theme, color: (typeof SEMANTIC_COLORS)[number]): TagSurface => ({
    background: theme.palette.components.alert[color].background,
    border: theme.palette[color].light,
    text: theme.palette[color].dark
});

/** The tag's box alone — for a colour whose surface is painted elsewhere (`color="ai"`). */
export function tagGeometry(theme: Theme): CSSObject {
    return {
        height: TAG_HEIGHT,
        borderRadius: theme.shape.borderRadius,
        [GLYPHS]: { fontSize: ICON_SIZE.small }
    };
}

/** Variant styles, scoped by colour and variant at the root class's own specificity. */
export function chipVariants(): ChipVariants {
    return [
        {
            props: { variant: 'outlined' as const, color: 'default' as const },
            style: ({ theme }: { theme: Theme; }): CSSObject => outlinedDefault(theme)
        },
        {
            props: { variant: 'filled' as const, color: 'default' as const },
            style: ({ theme }: { theme: Theme; }): CSSObject => filledDefault(theme)
        },
        ...SEMANTIC_COLORS.map((color) => ({
            props: { variant: 'filled' as const, color },
            style: ({ theme }: { theme: Theme; }): CSSObject => filledSemantic(theme, color)
        })),
        // A tag without a colour is the neutral one.
        ...(['default', 'neutral'] as const).map((color) => ({
            props: { variant: 'tag' as const, color },
            style: ({ theme }: { theme: Theme; }): CSSObject => tagStyles(theme, tagNeutral(theme))
        })),
        ...SEMANTIC_COLORS.map((color) => ({
            props: { variant: 'tag' as const, color },
            style: ({ theme }: { theme: Theme; }): CSSObject => tagStyles(theme, tagSemantic(theme, color))
        })),
        ...CHIP_TAG_COLORS.map((color) => ({
            props: { variant: 'tag' as const, color },
            style: ({ theme }: { theme: Theme; }): CSSObject => {
                const tag = theme.palette.tag;

                // `reference` exports no tag palette; the slot is typed optional for that.
                if (!tag) {
                    return {};
                }

                return tagStyles(theme, {
                    background: tag[`${color}Background`],
                    border: tag[`${color}Border`],
                    text: tag[`${color}Text`]
                });
            }
        }))
    ];
}
