// Brand gradients — composed here, not exported from Figma.
//
// A Figma variable can only hold BOOLEAN | COLOR | FLOAT | STRING, so a
// gradient cannot be a design token. The pipeline delivers the three colour
// stops (`palette.gradient.ai`); the geometry and the derived tints live here.

import { alpha, darken, getContrastRatio, lighten, type PaletteColor } from '@mui/material';
import { common } from '@mui/material/colors';

/** Colour stops, named as in the design source. */
export interface GradientStops {
    start: string;
    mid: string;
    end: string;
}

export interface Gradient {
    /** Full-strength CSS `linear-gradient(...)`. */
    fill: string;
    /** The same gradient at surface strength — translucent surface. */
    surface: string;
    /** The same gradient at outline strength — translucent outline. */
    outline: string;
    /** The stops it was built from, under their design names. */
    stops: GradientStops;
}

/**
 * The style object that paints text with a gradient. A type alias, not an interface: only an
 * alias is assignable to `CSSObject`, whose index signature an interface does not satisfy.
 */
export type GradientTextStyle = {
    backgroundImage: string;
    WebkitBackgroundClip: 'text';
    backgroundClip: 'text';
    color: 'transparent';
};

/** Geometry of the AI paint style. Not tokens — see the note above. */
export const AI_ANGLE_DEG = 212;
const AI_STOP_POSITIONS = ['0%', '48%', '98%'] as const;

/** Strength of the two translucent variants of the gradient. */
const SURFACE_OPACITY = 0.1;
const OUTLINE_OPACITY = 0.5;

/** Distance either side of `main` for the `light`/`dark` ramp. */
const RAMP_STEP = 0.2;

/** Below this ratio MUI treats white text as unreadable; matches its default. */
const CONTRAST_THRESHOLD = 3;

/**
 * Unit vector of the gradient axis, in CSS coordinates (y grows downwards).
 * Shifting a background by a multiple of this vector moves the paint along
 * the gradient's own direction.
 */
export function aiGradientAxis(): readonly [number, number] {
    const radians = (AI_ANGLE_DEG * Math.PI) / 180;

    return [Math.sin(radians), -Math.cos(radians)];
}

/** CSS `linear-gradient(...)` built from the three stops. */
export function buildAiGradient(stops: GradientStops, opacity = 1): string {
    const paint = [stops.start, stops.mid, stops.end]
        .map((colour) => (opacity === 1 ? colour : alpha(colour, opacity)));

    return `linear-gradient(${AI_ANGLE_DEG}deg, ${paint
        .map((colour, i) => `${colour} ${AI_STOP_POSITIONS[i]}`)
        .join(', ')})`;
}

/** The gradient plus the derived values component styles need. */
export function buildAiGradientSet(stops: GradientStops): Gradient {
    return {
        fill: buildAiGradient(stops),
        surface: buildAiGradient(stops, SURFACE_OPACITY),
        outline: buildAiGradient(stops, OUTLINE_OPACITY),
        stops
    };
}

/** Clips a background image to the glyphs, so text is painted by the gradient. */
export function gradientTextFill(fill: string): GradientTextStyle {
    return {
        backgroundImage: fill,
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        color: 'transparent'
    };
}

/**
 * `palette.ai` has to be a real colour, not a gradient: MUI resolves
 * `alpha(palette[color].main, …)` for any component given `color="ai"`, and a
 * gradient string throws there.
 *
 * `light`/`dark` ramp around the middle stop rather than reusing the outer
 * stops — the end stop is a light blue, so `ai.dark` would be lighter than
 * `ai.main` and the `contained` variant (which hovers to `dark`) would turn
 * blue. The stops keep their own names under `palette.gradients.ai.stops`.
 */
export function buildAiPaletteColor(stops: GradientStops): PaletteColor {
    return {
        main: stops.mid,
        light: lighten(stops.mid, RAMP_STEP),
        dark: darken(stops.mid, RAMP_STEP),
        contrastText:
            getContrastRatio(stops.mid, common.white) >= CONTRAST_THRESHOLD ? common.white : common.black
    };
}
