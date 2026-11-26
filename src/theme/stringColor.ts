import { getContrastRatio, type Theme } from '@mui/material';

import type { PaletteComponentsMap } from './config/palette.components.types';
import { getStringColorTone, type StringColorTone } from './config/next/stringColor.generated';

// WCAG AA for normal text: the initials are 12–20px, below the large-text size.
const MIN_TEXT_CONTRAST = 4.5;

// `getContrastRatio` throws on a colour it cannot parse, such as a CSS variable or `transparent` set by an override.
function contrastOf(fill: string, text: string): number | undefined {
    try {
        return getContrastRatio(fill, text);
    } catch {
        return undefined;
    }
}

function textOnFill(fill: string, preferred: string | undefined, common: { white: string; black: string; }): string {
    const preferredContrast = preferred === undefined ? undefined : contrastOf(fill, preferred);

    if (preferred !== undefined && (preferredContrast === undefined || preferredContrast >= MIN_TEXT_CONTRAST)) {
        return preferred;
    }

    const onWhite = contrastOf(fill, common.white);
    const onBlack = contrastOf(fill, common.black);

    if (onWhite === undefined || onBlack === undefined) {
        return common.white;
    }

    return onWhite >= onBlack ? common.white : common.black;
}

/** The colours `getStringColor` gives a string, read from the theme's palette. */
export interface StringColor {
    /** The tone picked for the string; where it is also a tag colour, it is a `color` of `<Chip variant="tag">`. */
    tone: StringColorTone;
    /** Avatar fill: `palette.components.avatar.<tone>Fill`. */
    fill: string;
    /**
     * Text on `fill`: `palette.components.avatar.contrastText` when it reaches 4.5:1 on `fill`, otherwise whichever of
     * `palette.common.white` and `palette.common.black` contrasts more. When `fill` is a colour whose contrast cannot be
     * measured, such as a CSS variable, it is `contrastText`, or `palette.common.white` without it.
     */
    fillText: string;
    /** Tag background: `palette.tag.<tone>Background`, or `palette.action.selected` for a tone without tag colours. */
    background: string;
    /** Text on `background`: `palette.tag.<tone>Text`, or `palette.text.primary` for a tone without tag colours. */
    text: string;
}

/**
 * Gives a string, such as a user ID or a name, a tone that is the same for it everywhere (case, surrounding spaces and
 * Unicode normalisation aside; an empty string gets `stone`) and returns that tone's colours in `theme`. Without the
 * tone tokens, `fill` is `palette.components.avatar.fill` or else MUI's default `Avatar` grey, and `background` and
 * `text` are the colours of MUI's default `Chip`.
 */
export function getStringColor(input: string, theme: Theme): StringColor {
    const tone = getStringColorTone(input);
    const { palette } = theme;
    // Typed as always present, but a plain MUI theme has neither.
    const avatar = (palette.components as Partial<PaletteComponentsMap> | undefined)?.avatar;
    // Only some avatar tones are tag colours too.
    const tag = palette.tag as Partial<Record<string, string>> | undefined;
    const isLight = palette.mode === 'light';
    const fill = avatar?.[`${tone}Fill`] ?? avatar?.fill ?? palette.grey[isLight ? 400 : 600];

    return {
        tone,
        fill,
        fillText: textOnFill(fill, avatar?.contrastText, palette.common),
        background: tag?.[`${tone}Background`] ?? palette.action.selected,
        text: tag?.[`${tone}Text`] ?? palette.text.primary
    };
}
