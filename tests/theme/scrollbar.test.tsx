import { Theme } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { getTheme, ThemeConfig } from '../../src';

interface ScrollbarRule {
    scrollbarWidth?: string;
    scrollbarColor?: string;
}

// `MuiCssBaseline.styleOverrides` is a function of the theme in both versions; resolve it the
// way MUI's CssBaseline does, so the assertions read the rules that reach the page.
const baselineRule = (theme: Theme, selector: string): ScrollbarRule | undefined => {
    const overrides = theme.components?.MuiCssBaseline?.styleOverrides;
    const rules = typeof overrides === 'function'
        ? (overrides as (resolved: Theme) => Record<string, unknown>)(theme)
        : {};

    return rules[selector] as ScrollbarRule | undefined;
};

describe('next — global scrollbar styling', () => {
    it('makes every scroll container thin', () => {
        expect(baselineRule(getTheme('light', { version: 'next' }), '*')).toEqual({
            scrollbarWidth: 'thin'
        });
    });

    it('sets the thumb on a transparent track once, on html at zero specificity, so it inherits', () => {
        expect(baselineRule(getTheme('light', { version: 'next' }), ':where(html)')).toEqual({
            scrollbarColor: 'rgba(15, 23, 42, 0.5) transparent'
        });
    });

    it('uses a light thumb in dark mode', () => {
        expect(baselineRule(getTheme('dark', { version: 'next' }), ':where(html)')).toEqual({
            scrollbarColor: 'rgba(248, 250, 252, 0.55) transparent'
        });
    });

    it('reads the thumb from palette._native.scrollbarBackground', () => {
        const theme = getTheme('light', { version: 'next' });
        const recoloured = { ...theme, palette: { ...theme.palette, _native: { scrollbarBackground: 'rgb(1, 2, 3)' } } };

        expect(baselineRule(recoloured, ':where(html)')).toEqual({
            scrollbarColor: 'rgb(1, 2, 3) transparent'
        });
    });

    it('keeps the browser colour, and the thin width, when the palette has no thumb token', () => {
        const theme = getTheme('light', { version: 'next' });
        const withoutToken = { ...theme, palette: { ...theme.palette, _native: undefined } } as unknown as Theme;

        expect(baselineRule(withoutToken, ':where(html)')).toBeUndefined();
        expect(baselineRule(withoutToken, '*')).toEqual({ scrollbarWidth: 'thin' });
    });

    it('leaves the reference look alone', () => {
        const reference = getTheme('light', { version: 'reference' });

        expect(baselineRule(reference, '*')).toBeUndefined();
        expect(baselineRule(reference, ':where(html)')).toBeUndefined();
    });

    it('reaches the page through the CssBaseline rendered by ThemeConfig', () => {
        render(<ThemeConfig mode={'light'} version={'next'}>
            <div>scrollable</div>
        </ThemeConfig>);

        const css = Array.from(document.head.querySelectorAll('style'))
            .map((tag) => tag.textContent ?? '')
            .join('\n');

        expect(css).toMatch(/:where\(html\)\{scrollbar-color:rgba\(15, 23, 42, 0\.5\) transparent;?\}/);
        expect(css).toMatch(/\*\{scrollbar-width:thin;?\}/);
    });
});
