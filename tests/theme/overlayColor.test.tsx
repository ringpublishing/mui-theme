import { Checkbox, IconButton, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { getTheme } from '../../src';
import { orderOf, rulesFor, styleFor } from './helpers/emotionRules';

// Stand-in values with a distinct channel per role, so a mix-up between
// `background` / `hover` / `selected` / the two glyph roles is visible in
// the assertion rather than hidden behind two similar greys.
const OVERLAY = {
    background: 'rgb(10, 0, 0)',
    hover: 'rgb(20, 0, 0)',
    selected: 'rgb(30, 0, 0)',
    foreground: 'rgb(0, 40, 0)',
    selectedForeground: 'rgb(0, 50, 0)'
};

const themeWith = (version: 'next' | 'reference'): ReturnType<typeof getTheme> => getTheme('light', {
    version,
    themeOverrides: { palette: { components: { overlay: OVERLAY } } }
});

const TOUCH = '(hover: none)';

const ICON_BUTTON = ['IconButton', 'button'] as const;
const CHECKBOX = ['Checkbox', 'span.MuiCheckbox-root'] as const;

describe('color="overlay"', () => {
    it('gives IconButton the plate and glyph from the token, in next', () => {
        const { container } = render(
            <ThemeProvider theme={themeWith('next')}>
                <IconButton color="overlay">x</IconButton>
            </ThemeProvider>
        );
        const el = container.querySelector('button') as HTMLElement;

        expect(el.className).toContain('MuiIconButton-colorOverlay');
        expect(getComputedStyle(el).backgroundColor).toBe(OVERLAY.background);
        expect(getComputedStyle(el).color).toBe(OVERLAY.foreground);
        expect(styleFor(el, ':hover', 'background-color')).toBe(OVERLAY.hover);
    });

    it('gives Checkbox a checked state that steps both plate and glyph, in next', () => {
        const { container } = render(
            <ThemeProvider theme={themeWith('next')}>
                <Checkbox color="overlay" />
            </ThemeProvider>
        );
        const el = container.querySelector('span.MuiCheckbox-root') as HTMLElement;

        expect(el.className).toContain('MuiCheckbox-colorOverlay');
        expect(getComputedStyle(el).backgroundColor).toBe(OVERLAY.background);
        expect(styleFor(el, ':hover', 'background-color')).toBe(OVERLAY.hover);
        expect(styleFor(el, '.Mui-checked', 'background-color')).toBe(OVERLAY.selected);
        expect(styleFor(el, '.Mui-checked', 'color')).toBe(OVERLAY.selectedForeground);
    });

    // MUI pairs indeterminate with checked for every colour it generates; a variant that
    // keys on checked alone leaves a partially selected control looking untouched.
    it('steps the plate for indeterminate as well as checked', () => {
        const { container } = render(
            <ThemeProvider theme={themeWith('next')}>
                <Checkbox color="overlay" indeterminate={true} />
            </ThemeProvider>
        );
        const el = container.querySelector('span.MuiCheckbox-root') as HTMLElement;

        expect(styleFor(el, '.MuiCheckbox-indeterminate', 'background-color')).toBe(OVERLAY.selected);
        expect(styleFor(el, '.MuiCheckbox-indeterminate', 'color')).toBe(OVERLAY.selectedForeground);
    });

    // Selected and hover share a specificity, so which one wins is decided by source order.
    it('keeps the selected plate while a selected Checkbox is hovered', () => {
        const { container } = render(
            <ThemeProvider theme={themeWith('next')}>
                <Checkbox color="overlay" checked={true} />
            </ThemeProvider>
        );
        const el = container.querySelector('span.MuiCheckbox-root') as HTMLElement;

        expect(styleFor(el, '.Mui-checked:hover', 'background-color')).toBe(OVERLAY.selected);
    });

    // MUI resets `:hover` to `transparent` under `(hover: none)` so a tap does not strand a
    // hover tint on a phone. Overriding `:hover` outright re-enables the tint and, on
    // IconButton, hands that reset the whole plate — both controls have to restate it.
    it.each([ICON_BUTTON, CHECKBOX])(
        'keeps %s opaque rather than tinted when hover is emulated on touch',
        (name, selector) => {
            const { container } = render(
                <ThemeProvider theme={themeWith('next')}>
                    {name === 'IconButton' ? <IconButton color="overlay">x</IconButton> : <Checkbox color="overlay" />}
                </ThemeProvider>
            );
            const el = container.querySelector(selector) as HTMLElement;

            expect(styleFor(el, ':hover', 'background-color', TOUCH)).toBe(OVERLAY.background);
        }
    );

    // MUI derives its disabled colour rule per palette key, and `overlay` is not a palette
    // key — without this the control is indistinguishable from an enabled one.
    it.each([ICON_BUTTON, CHECKBOX])('marks %s as disabled while keeping the plate', (name, selector) => {
        const theme = themeWith('next');
        const { container } = render(
            <ThemeProvider theme={theme}>
                {name === 'IconButton'
                    ? <IconButton color="overlay" disabled={true}>x</IconButton>
                    : <Checkbox color="overlay" checked={true} disabled={true} />}
            </ThemeProvider>
        );
        const el = container.querySelector(selector) as HTMLElement;

        expect(styleFor(el, '.Mui-disabled', 'background-color')).toBe(OVERLAY.background);
        expect(styleFor(el, '.Mui-disabled', 'color')).toBe(theme.palette.action.disabled);
    });

    // Equal specificity, so only source order decides whether a disabled checked box reads as
    // an active one.
    it('lets disabled win over checked on Checkbox', () => {
        const { container } = render(
            <ThemeProvider theme={themeWith('next')}>
                <Checkbox color="overlay" checked={true} disabled={true} />
            </ThemeProvider>
        );
        const el = container.querySelector('span.MuiCheckbox-root') as HTMLElement;

        expect(orderOf(el, '.Mui-disabled')).toBeGreaterThan(orderOf(el, '.Mui-checked'));
    });

    // `reference` declares neither component, so nothing keyed on the colour is ever emitted.
    it.each([ICON_BUTTON, CHECKBOX])(
        'leaves %s unstyled under reference, which has no overlay variant',
        (name, selector) => {
            const { container } = render(
                <ThemeProvider theme={themeWith('reference')}>
                    {name === 'IconButton' ? <IconButton color="overlay">x</IconButton> : <Checkbox color="overlay" />}
                </ThemeProvider>
            );
            const el = container.querySelector(selector) as HTMLElement;
            const emitted = rulesFor(el).rules.map((r) => r.body).join('\n');

            for (const value of Object.values(OVERLAY)) {
                expect(emitted).not.toContain(value);
            }
        }
    );

    // The tests above inject the role through `themeOverrides`; this one pins the guard in
    // `overlayPlate`. It has to be `next` with the role taken away rather than a variant that
    // never had it: only `next` carries the variants at all, so building `reference` here
    // would pass without ever reaching the code under test. Every rule the helper emits has
    // to be skipped, glyph and geometry included, so the controls keep the look they have
    // without the colour.
    it.each([ICON_BUTTON, CHECKBOX])('leaves %s alone when the palette defines no overlay role', (name, selector) => {
        const theme = getTheme('light', { version: 'next' });

        delete (theme.palette.components as { overlay?: unknown; }).overlay;
        const { container } = render(
            <ThemeProvider theme={theme}>
                {name === 'IconButton' ? <IconButton color="overlay">x</IconButton> : <Checkbox color="overlay" />}
            </ThemeProvider>
        );
        const plain = render(
            <ThemeProvider theme={theme}>
                {name === 'IconButton' ? <IconButton>x</IconButton> : <Checkbox />}
            </ThemeProvider>
        );
        const el = container.querySelector(selector) as HTMLElement;
        const reference = plain.container.querySelector(selector) as HTMLElement;

        expect(getComputedStyle(el).backgroundColor).toBe(getComputedStyle(reference).backgroundColor);
        expect(getComputedStyle(el).color).toBe(getComputedStyle(reference).color);
        expect(getComputedStyle(el).borderRadius).toBe(getComputedStyle(reference).borderRadius);
        expect(getComputedStyle(el).padding).toBe(getComputedStyle(reference).padding);
    });
});
