import React from 'react';
import { GlobalStyles, type SvgIconProps, type Theme } from '@mui/material';
import { LucideProvider } from 'lucide-react';

/** Size, in pixels, the design system draws an icon at. */
export const DEFAULT_LUCIDE_ICON_SIZE = 20;

/**
 * Stroke thickness, in rendered pixels, the design system draws an icon with — thinner than
 * lucide's own default of 2, and the same at every icon size.
 */
export const DEFAULT_LUCIDE_STROKE_WIDTH = 1.5;

type PaletteColorName = Exclude<NonNullable<SvgIconProps['color']>, 'inherit'>;

/** MUI `SvgIcon` colour names and the palette slot each one reads. */
export const RING_LUCIDE_PALETTE_COLORS: Record<PaletteColorName, string> = {
    action: 'action.active',
    disabled: 'action.disabled',
    error: 'error.main',
    info: 'info.main',
    primary: 'primary.main',
    secondary: 'secondary.main',
    success: 'success.main',
    warning: 'warning.main'
};

// Spelled out rather than read with `Object.keys`, so that nothing a toolchain attaches to the
// exported map at runtime can leak into the generated rules.
const PALETTE_COLOR_NAMES: readonly PaletteColorName[] = [
    'action',
    'disabled',
    'error',
    'info',
    'primary',
    'secondary',
    'success',
    'warning'
];

// Pixel size behind each `SvgIcon` `fontSize` variant; `inherit` follows the surrounding font size.
const FONT_SIZE_LENGTHS: Record<NonNullable<SvgIconProps['fontSize']>, string> = {
    small: '20px',
    medium: '24px',
    large: '32px',
    inherit: '1em'
};

const resolvePaletteColor = (theme: Theme, path: string): string => {
    const value = path
        .split('.')
        .reduce<unknown>((node, key) => (node as Record<string, unknown> | undefined)?.[key], theme.palette);

    return typeof value === 'string' ? value : path;
};

/**
 * The `color` half of the rules `RingIconDefaults` injects: one rule per MUI palette name,
 * resolved against `theme`.
 *
 * The rules are global, so they can only follow one theme. A subtree that swaps the theme with a
 * bare `ThemeProvider` mounts its own copy with a `scope` selector for its root. The scope sits
 * outside `:where()`, so the scoped rules carry the specificity of that selector: they beat the
 * page-wide ones whatever order emotion inserted the two in, and an application stylesheet still
 * overrides them with anything at class level.
 */
export function lucidePaletteRules(theme: Theme, scope?: string): Record<string, Record<string, string>> {
    const prefix = scope ? `${scope} ` : '';
    const rules: Record<string, Record<string, string>> = {};

    for (const name of PALETTE_COLOR_NAMES) {
        rules[`${prefix}:where(svg.lucide[stroke="${name}"])`] = {
            stroke: resolvePaletteColor(theme, RING_LUCIDE_PALETTE_COLORS[name])
        };
    }

    return rules;
}

/**
 * Lets a plain lucide icon take the two MUI `SvgIcon` props it has no idea about. Lucide writes
 * `color` to the `stroke` attribute and passes `fontSize` through as a `font-size` attribute, so in
 * `<Trash2 color="error" fontSize="small" />` neither does anything: `stroke="error"` is not a colour
 * and `font-size` does not size an SVG. Both attributes stay in the DOM, and a CSS property beats a
 * presentation attribute, so a rule keyed on the attribute value supplies the palette colour and the
 * variant size.
 *
 * `:where()` keeps every rule at zero specificity: any stylesheet of the application, down to a
 * bare `svg {}`, overrides them, while the presentation attribute still loses.
 */
function muiPropsOnLucideIcons(theme: Theme): Record<string, Record<string, string>> {
    const rules = lucidePaletteRules(theme);

    for (const [fontSize, length] of Object.entries(FONT_SIZE_LENGTHS)) {
        rules[`:where(svg.lucide[font-size="${fontSize}"])`] = { width: length, height: length };
    }

    return rules;
}

export interface RingIconDefaultsProps {
    children?: React.ReactNode;
    /** Size, in pixels, applied to lucide icons that do not carry their own `size`. */
    size?: number;
    /** Rendered stroke thickness, in pixels, for lucide icons that do not carry their own `strokeWidth`. */
    strokeWidth?: number;
}

/**
 * Supplies the design system's icon size and stroke thickness to plain `lucide-react` icons
 * rendered underneath it, and teaches them the MUI `color` palette names and `fontSize` variants.
 *
 * Lucide renders at 24px with a 2px stroke unless told otherwise, while the design system draws
 * icons at 20px with a 1.5px stroke. This provider moves both defaults into context: `<Save />`
 * becomes 20px, and an explicit `<Save size={28} />` still wins.
 *
 * `nonScalingStroke` goes with the stroke on purpose. On its own, a stroke width is a value in the
 * 24-unit viewBox and thins out as the icon shrinks — 1.5 would render as 1.25px at 20px — so the
 * thickness is pinned to the rendered pixel and measures 1.5px at every size. A plain lucide icon
 * that also passes `absoluteStrokeWidth` gets both mechanisms at once and a thinner stroke, so the
 * prop should be dropped under this provider. `nonScalingStroke` arrived in lucide-react 1.42.0,
 * which is why the peer range starts there.
 *
 * On an icon carrying both, `fontSize` wins over `size`: `fontSize` is CSS and `size` an attribute.
 *
 * `ThemeConfig` mounts this inside its theme, so an application that renders `ThemeConfig` gets the
 * defaults for free. Mount it directly when wiring MUI's `ThemeProvider` with `getTheme()` instead,
 * or to apply other defaults to a subtree; it reads the palette from the surrounding theme.
 */
export const RingIconDefaults = ({
    children,
    size = DEFAULT_LUCIDE_ICON_SIZE,
    strokeWidth = DEFAULT_LUCIDE_STROKE_WIDTH
}: RingIconDefaultsProps): React.JSX.Element => (
    <LucideProvider size={size} strokeWidth={strokeWidth} nonScalingStroke={true}>
        <GlobalStyles styles={muiPropsOnLucideIcons} />
        {children}
    </LucideProvider>
);
