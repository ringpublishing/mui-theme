import { act, render } from '@testing-library/react';
import { Trash2 } from 'lucide-react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import {
    DEFAULT_LUCIDE_ICON_SIZE,
    DEFAULT_LUCIDE_STROKE_WIDTH,
    RING_LUCIDE_PALETTE_COLORS,
    RingIconDefaults,
    ThemeConfig,
    getTheme,
    lucidePaletteRules
} from '../../src';
import type { RingHandle } from '../../src/theme/handleContract';

/* eslint-disable n/no-unsupported-features/node-builtins -- jsdom localStorage, as in ThemeConfig.lazyInspector */

const INSPECTOR_FLAG = '__ring_ui_inspector__';

const injectedCss = (): string => Array.from(document.head.querySelectorAll('style'))
    .map((style) => style.textContent ?? '')
    .join('\n');

afterEach(() => {
    window.localStorage.removeItem(INSPECTOR_FLAG);
    delete (window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__;
});

const expectRingDefaults = (svg: Element | null): void => {
    expect(svg?.getAttribute('width')).toBe(String(DEFAULT_LUCIDE_ICON_SIZE));
    expect(svg?.getAttribute('stroke-width')).toBe(String(DEFAULT_LUCIDE_STROKE_WIDTH));
    // The thickness is pinned to the rendered pixel on the drawn shapes.
    expect(svg?.querySelector('path')?.getAttribute('vector-effect')).toBe('non-scaling-stroke');
};

describe('ThemeConfig mounts RingIconDefaults', () => {
    it.each(['reference', 'next'] as const)('gives a plain lucide icon 20px and a 1.5px stroke (%s)', (version) => {
        const { container } = render(
            <ThemeConfig mode="light" version={version}>
                <Trash2 data-testid="icon" />
            </ThemeConfig>
        );

        expectRingDefaults(container.querySelector('[data-testid="icon"]'));
    });

    it('keeps the size and stroke an icon passes', () => {
        const { container } = render(
            <ThemeConfig mode="light">
                <Trash2 data-testid="icon" size={28} strokeWidth={3} />
            </ThemeConfig>
        );
        const svg = container.querySelector('[data-testid="icon"]');

        expect(svg?.getAttribute('width')).toBe('28');
        expect(svg?.getAttribute('stroke-width')).toBe('3');
    });

    it.each(['reference', 'next'] as const)('maps MUI palette names and fontSize variants at zero specificity (%s)', (version) => {
        render(
            <ThemeConfig mode="light" version={version}>
                <Trash2 color="error" fontSize="small" />
            </ThemeConfig>
        );
        const css = injectedCss();
        const { palette } = getTheme('light', { version });

        expect(css).toContain(`:where(svg.lucide[stroke="error"]){stroke:${palette.error.main};}`);
        expect(css).toContain(`:where(svg.lucide[stroke="action"]){stroke:${palette.action.active};}`);
        expect(css).toContain(`:where(svg.lucide[stroke="disabled"]){stroke:${palette.action.disabled};}`);
        expect(css).toContain(':where(svg.lucide[font-size="small"]){width:20px;height:20px;}');
        expect(css).toContain(':where(svg.lucide[font-size="medium"]){width:24px;height:24px;}');
        expect(css).toContain(':where(svg.lucide[font-size="large"]){width:32px;height:32px;}');
        expect(css).toContain(':where(svg.lucide[font-size="inherit"]){width:1em;height:1em;}');
    });

    it('follows the dark palette in dark mode', () => {
        render(
            <ThemeConfig mode="dark" version="next">
                <Trash2 color="error" />
            </ThemeConfig>
        );

        expect(injectedCss()).toContain(
            `:where(svg.lucide[stroke="error"]){stroke:${getTheme('dark', { version: 'next' }).palette.error.main};}`
        );
    });

    it('mounts it on the inspector path too', async () => {
        window.localStorage.setItem(INSPECTOR_FLAG, '1');

        const { container } = render(
            <ThemeConfig mode="light" version="next">
                <Trash2 data-testid="icon" />
            </ThemeConfig>
        );

        // One hop for the dynamic import, one for the state update that mounts the bridge.
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        expect((window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__).toBeDefined();

        expectRingDefaults(container.querySelector('[data-testid="icon"]'));
    });
});

describe('RingIconDefaults on its own', () => {
    it('applies other defaults to a subtree', () => {
        const { container } = render(
            <ThemeConfig mode="light">
                <RingIconDefaults size={24} strokeWidth={2}>
                    <Trash2 data-testid="icon" />
                </RingIconDefaults>
            </ThemeConfig>
        );
        const svg = container.querySelector('[data-testid="icon"]');

        expect(svg?.getAttribute('width')).toBe('24');
        expect(svg?.getAttribute('stroke-width')).toBe('2');
    });
});

describe('lucidePaletteRules', () => {
    const theme = getTheme('dark', { version: 'next' });

    it('scopes the rules under a selector, outside :where()', () => {
        const rules = lucidePaletteRules(theme, '.lightbox');

        expect(rules['.lightbox :where(svg.lucide[stroke="error"])']).toEqual({ stroke: theme.palette.error.main });
        expect(rules['.lightbox :where(svg.lucide[stroke="action"])']).toEqual({ stroke: theme.palette.action.active });
    });

    it('covers every palette name of RING_LUCIDE_PALETTE_COLORS', () => {
        const names = Object.keys(lucidePaletteRules(theme)).map((selector) => /stroke="(\w+)"/.exec(selector)?.[1]);

        expect(names.sort()).toEqual(Object.keys(RING_LUCIDE_PALETTE_COLORS).sort());
    });
});
