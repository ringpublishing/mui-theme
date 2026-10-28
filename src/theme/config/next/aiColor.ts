// Styling for `color="ai"` — the gradient motif shared by Button, IconButton
// and Chip in the `next` theme.
//
// Everything here reads from `theme.palette.ai` and `theme.palette.gradients`,
// composed in theme.tsx from the colour stops the pipeline delivers, so
// recolouring a stop in Figma recolours every surface below.

import { alpha, type CSSObject, type Theme } from '@mui/material';
import { AI_ANGLE_DEG, aiGradientAxis, gradientTextFill } from '../gradients';

export const AI_OUTLINE_KEYFRAMES = 'ring-ai-outline';

/** Thickness of the gradient ring. */
const RING_WIDTH_PX = 1;

/** One leg of the travelling gradient: start → mid → end → start. */
const TRAVEL_LEG_PX = 44;
const TRAVEL_LEGS = 3;
const TRAVEL_PERIOD_PX = TRAVEL_LEG_PX * TRAVEL_LEGS;
const TRAVEL_DURATION = '3s';

const [AXIS_X, AXIS_Y] = aiGradientAxis();

// Shifting the background by one whole period along the gradient axis lands on
// an identical image, so the loop closes without a visible jump.
const offsetAt = (fraction: number): string =>
    `${(TRAVEL_PERIOD_PX * AXIS_X * fraction).toFixed(1)}px ${(TRAVEL_PERIOD_PX * AXIS_Y * fraction).toFixed(1)}px`;

const travellingGradient = ({ start, mid, end }: { start: string; mid: string; end: string; }): string =>
    `repeating-linear-gradient(${AI_ANGLE_DEG}deg, ${start} 0px, ${mid} ${TRAVEL_LEG_PX}px, `
    + `${end} ${TRAVEL_LEG_PX * 2}px, ${start} ${TRAVEL_PERIOD_PX}px)`;

/**
 * A ring painted with `background`, drawn as a masked pseudo-element rather
 * than a border: `border-image` cannot be animated, and a border-box
 * background would tint the interior once the surface is translucent.
 */
function maskedRing(background: string): CSSObject {
    const mask = 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)';

    return {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        padding: `${RING_WIDTH_PX}px`,
        background,
        WebkitMask: mask,
        mask,
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none'
    };
}

/** Text (or any inline content) filled with the AI gradient. */
export function aiTextFill(theme: Theme): CSSObject {
    return gradientTextFill(theme.palette.gradients.ai.fill);
}

/**
 * Hover/focus/press feedback for a control whose ROOT is painted with
 * `aiTextFill`. That paint clips the root's own background to the glyphs and
 * makes `currentColor` transparent, so MUI's stock feedback silently
 * disappears. The wash is therefore drawn on an `::after` overlay and the
 * ripple gets an explicit colour. `::before` is taken by the gradient ring.
 */
export function aiInteractionStates(theme: Theme): CSSObject {
    const overlay = (opacity: number): CSSObject => ({
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: 'inherit',
        backgroundColor: alpha(theme.palette.ai.main, opacity),
        pointerEvents: 'none'
    });

    return {
        // MUI's own wash would be clipped to the glyphs anyway — disable it so
        // the overlay below is the single source of the state.
        '&:hover': { backgroundColor: 'transparent' },
        '&:hover::after': overlay(theme.palette.action.hoverOpacity),
        '&.Mui-focusVisible::after': overlay(theme.palette.action.focusOpacity),
        '& .MuiTouchRipple-root': { color: theme.palette.ai.main }
    };
}

/**
 * The animated gradient outline. The gradient travels along its own axis, so
 * the motion reads as the outline flowing rather than blinking; it stops under
 * `prefers-reduced-motion`.
 */
export function aiGradientRing(theme: Theme, animated: boolean): CSSObject {
    const { stops, fill } = theme.palette.gradients.ai;

    return {
        'position': 'relative',
        'borderColor': 'transparent',

        '&::before': {
            ...maskedRing(animated ? travellingGradient(stops) : fill),
            // MUI's Button claims the same pseudo-element when a start icon is
            // present (zero-width-space baseline shim: width 0, overflow hidden);
            // undo it or the ring collapses to a sliver.
            width: 'auto',
            height: 'auto',
            overflow: 'visible',
            ...(animated ? { animation: `${AI_OUTLINE_KEYFRAMES} ${TRAVEL_DURATION} linear infinite` } : {})
        },

        ...(animated
            ? {
                '@media (prefers-reduced-motion: reduce)': {
                    '&::before': { animation: 'none' }
                }
            }
            : {})
    };
}

/** The `@keyframes` the ring animation refers to. Registered once, globally. */
export const aiOutlineKeyframes: CSSObject = {
    [`@keyframes ${AI_OUTLINE_KEYFRAMES}`]: {
        '0%': { backgroundPosition: offsetAt(0) },
        '100%': { backgroundPosition: offsetAt(1) }
    }
};

/**
 * Chip surface: the gradient tint layered over the theme's paper colour, ringed
 * by the same gradient at outline strength. The opaque paper base is what keeps
 * the label legible when the chip sits on imagery — a bare tint disappears on a
 * dark photograph.
 */
export function aiOutlinedSurface(theme: Theme): CSSObject {
    const { surface, outline } = theme.palette.gradients.ai;

    return {
        'position': 'relative',
        'border': 0,
        'background': `${surface}, ${theme.palette.background.paper}`,

        '&::before': maskedRing(outline)
    };
}
