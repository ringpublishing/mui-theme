import { describe, expect, it } from 'vitest';
import { alpha, decomposeColor, type Theme } from '@mui/material/styles';

import { getTheme } from '../../src/theme/theme';
import { actionOpacities as generated } from '../../src/theme/config/next/opacity.generated';
import { actionOpacities as manual } from '../../src/theme/config/actionOpacities';

const MODES = ['light', 'dark'] as const;
const STATES = ['hover', 'selected', 'focus', 'activated', 'disabled'] as const;

describe('palette.action opacities', () => {
    it.each(MODES)('next (%s) takes the five MUI opacities from the generated file', (mode) => {
        const { action } = getTheme(mode, { version: 'next' }).palette;

        for (const state of STATES) {
            expect(action[`${state}Opacity`]).toBe(generated[mode][`${state}Opacity`]);
        }
    });

    // The design composes each `action.<state>` colour from the same opacity variable the number
    // comes from. A mismatch means one of the two generated files was regenerated without the other.
    it.each(MODES)('next (%s) action colours carry the same alpha as the opacity numbers', (mode) => {
        const { action } = getTheme(mode, { version: 'next' }).palette;

        for (const state of STATES) {
            const alpha = decomposeColor(action[state]).values[3];

            expect({ state, alpha }).toEqual({ state, alpha: action[`${state}Opacity`] });
        }
    });

    it.each(MODES)('reference (%s) keeps the hand-written values', (mode) => {
        const { action } = getTheme(mode, { version: 'reference' }).palette;

        for (const state of STATES) {
            expect(action[`${state}Opacity`]).toBe(manual[mode][`${state}Opacity`]);
        }
    });

    it.each(MODES)('next (%s) keeps the Ring-only keys', (mode) => {
        const { action } = getTheme(mode, { version: 'next' }).palette;

        expect(action.focusVisibleOpacity).toBe(manual[mode].focusVisibleOpacity);
        expect(action.outlinedBorderOpacity).toBe(manual[mode].outlinedBorderOpacity);
    });
});

type Styles = Record<string, Record<string, Record<string, Record<string, string>>>>;

const switchBase = (theme: Theme): Styles[string] => {
    const root = theme.components?.MuiSwitch?.styleOverrides?.root as (props: { theme: Theme; }) => Styles;

    return root({ theme })['& .MuiSwitch-switchBase'];
};

describe('next Switch halo', () => {
    // MUI's own Switch tints a coloured hover with `alpha(main, hoverOpacity)` (Switch.js); the
    // redesigned override keeps that, so the halo follows the exported opacity in both modes.
    it.each(MODES)('%s: checked and error hover use palette.action.hoverOpacity', (mode) => {
        const theme = getTheme(mode, { version: 'next' });
        const { palette } = theme;
        const base = switchBase(theme);

        expect(base['&.Mui-checked']['&:hover'].backgroundColor).toBe(
            alpha(palette.primary.main, palette.action.hoverOpacity)
        );
        expect(base['&.MuiSwitch-colorError']['&:hover'].backgroundColor).toBe(
            alpha(palette.error.main, palette.action.hoverOpacity)
        );
    });
});
