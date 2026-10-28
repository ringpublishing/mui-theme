import { alpha, Chip, ThemeProvider } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { getTheme } from '../../src';
import { styleFor } from './helpers/emotionRules';

const next = getTheme('light', { version: 'next' });
const nextDark = getTheme('dark', { version: 'next' });

const renderChip = (theme = next, props: React.ComponentProps<typeof Chip> = {}): HTMLElement => {
    const { container } = render(
        <ThemeProvider theme={theme}>
            <Chip label="Chip" {...props} />
        </ThemeProvider>
    );

    return container.querySelector('.MuiChip-root') as HTMLElement;
};

const DELETE_ICON = ' .MuiChip-deleteIcon';
const ICON = ' .MuiChip-icon';

describe('Chip in next', () => {
    it('paints the filled default chip with the solid fill and the outlined border', () => {
        const el = renderChip(next, { variant: 'filled' });
        const chip = next.palette.components.chip;

        expect(styleFor(el, '', 'background-color')).toBe(chip.filledEnabledFill);
        expect(styleFor(el, '', 'border-color')).toBe(chip.outlinedEnabledBorder);
        expect(styleFor(el, '.MuiChip-clickable:hover', 'background-color')).toBe(chip.filledEnabledHover);
        expect(styleFor(el, '.Mui-focusVisible', 'background-color')).toBe(chip.FocusFill);
        expect(styleFor(el, '.MuiChip-clickable:active', 'background-color')).toBe(chip.PressedFill);
    });

    it('paints the outlined default chip from the chip tokens', () => {
        const el = renderChip(next, { variant: 'outlined' });
        const chip = next.palette.components.chip;

        expect(styleFor(el, '', 'background-color')).toBe(chip.outlinedEnabledFill);
        expect(styleFor(el, '', 'border-color')).toBe(chip.outlinedEnabledBorder);
        expect(styleFor(el, '.MuiChip-clickable:hover', 'background-color')).toBe(chip.outlinedHoverFill);
    });

    // There is no `selected` prop on MUI's Chip; the theme keys on the class and the ARIA
    // attributes a consumer sets, so each of the three has to carry the same fill.
    it.each(['.Mui-selected', '[aria-pressed="true"]', '[aria-selected="true"]'])(
        'gives %s the selected fill and border on an outlined chip',
        (state) => {
            const el = renderChip(next, { variant: 'outlined' });
            const chip = next.palette.components.chip;

            expect(styleFor(el, state, 'background-color')).toBe(chip.SelectedFill);
            expect(styleFor(el, state, 'border-color')).toBe(chip.outlinedSelectedBorder);
        }
    );

    it('drops the border on a selected filled chip but keeps the accent on its glyphs', () => {
        const el = renderChip(next, { variant: 'filled' });
        const chip = next.palette.components.chip;

        expect(styleFor(el, '.Mui-selected', 'border-color')).toBe('transparent');
        expect(styleFor(el, '.Mui-selected .MuiChip-deleteIcon', 'color')).toBe(chip.outlinedSelectedBorder);
    });

    // A lucide svg is a shrinkable flex item, unlike MUI's SvgIcon: without a pinned box the
    // X next to a truncated label collapses to a few pixels. The colour is solid on purpose —
    // a translucent stroke doubles up where lucide's two paths cross.
    it('pins the delete glyph to a 16px box in small and a 20px box in medium, in a solid colour', () => {
        const small = renderChip(next, { size: 'small', onDelete: () => undefined });
        const medium = renderChip(next, { size: 'medium', onDelete: () => undefined });

        expect(styleFor(small, DELETE_ICON, 'font-size')).toBe('16px');
        expect(styleFor(medium, DELETE_ICON, 'font-size')).toBe('20px');

        for (const el of [small, medium]) {
            expect(styleFor(el, DELETE_ICON, 'width')).toBe('1em');
            expect(styleFor(el, DELETE_ICON, 'height')).toBe('1em');
            expect(styleFor(el, DELETE_ICON, 'flex-shrink')).toBe('0');
            expect(styleFor(el, `.MuiChip-colorDefault${DELETE_ICON}`, 'color')).toBe(next.palette.action.active);
            expect(styleFor(el, ICON, 'flex-shrink')).toBe('0');
        }
    });

    it('renders the lucide x as the default delete glyph', () => {
        const el = renderChip(next, { onDelete: () => undefined });
        const glyph = el.querySelector('.MuiChip-deleteIcon') as SVGElement;

        expect(glyph.tagName.toLowerCase()).toBe('svg');
        expect(glyph.getAttribute('class')).toContain('lucide-x');
        expect(glyph.querySelectorAll('path')).toHaveLength(2);
    });

    it('lets the consumer deleteIcon win over the default glyph', () => {
        const el = renderChip(next, { onDelete: () => undefined, deleteIcon: <span data-testid="own" /> });

        expect(el.querySelector('.MuiChip-deleteIcon')?.getAttribute('data-testid')).toBe('own');
    });

    // The design draws no primary chip, so MUI's own look stays — including the contrast
    // glyph; a solid `action.active` X would vanish on the dark fill.
    it('keeps the glyph box but not the default colour on a primary chip', () => {
        const el = renderChip(next, { color: 'primary', onDelete: () => undefined });

        expect(styleFor(el, DELETE_ICON, 'font-size')).toBe('16px');
        expect(styleFor(el, DELETE_ICON, 'flex-shrink')).toBe('0');
        // The default-colour rule is in the sheet but keyed on a class this chip lacks; what
        // applies is MUI's own contrast colour.
        expect(styleFor(el, DELETE_ICON, 'color')).toBe(alpha(next.palette.primary.contrastText, 0.7));
    });

    it('spaces the slots from the root inset and the label padding alone', () => {
        const el = renderChip(next, { onDelete: () => undefined, icon: <span>i</span> });

        expect(styleFor(el, '', 'padding')).toBe('0 4px');
        expect(styleFor(el, '', 'border')).toBe('1px solid transparent');
        expect(styleFor(el, DELETE_ICON, 'margin')).toBe('0');
        expect(styleFor(el, ICON, 'margin')).toBe('0');

        const label = el.querySelector('.MuiChip-label') as HTMLElement;

        expect(styleFor(label, '', 'padding-left')).toBe('6px');
        expect(styleFor(label, '', 'padding-right')).toBe('6px');
    });

    it('draws disabled from the tokens instead of fading the whole chip', () => {
        const el = renderChip(next, { variant: 'outlined', disabled: true });

        expect(styleFor(el, '.Mui-disabled', 'opacity')).toBe('1');
        expect(styleFor(el, '.Mui-disabled', 'background-color')).toBe(next.palette.action.disabledBackground);
        expect(styleFor(el, '.Mui-disabled', 'border-color')).toBe(next.palette.action.disabled);
        expect(styleFor(el, '.Mui-disabled', 'color')).toBe(next.palette.text.disabled);
    });

    it('paints a filled semantic chip as its alert surface with the light border and dark glyphs', () => {
        const el = renderChip(next, { variant: 'filled', color: 'warning', onDelete: () => undefined });
        const { warning, components, text } = next.palette;

        expect(styleFor(el, '', 'background-color')).toBe(components.alert.warning.background);
        expect(styleFor(el, '', 'border-color')).toBe(warning.light);
        expect(styleFor(el, '', 'color')).toBe(text.primary);
        expect(styleFor(el, DELETE_ICON, 'color')).toBe(warning.dark);
        // States tint the surface rather than replacing it.
        expect(styleFor(el, '.MuiChip-clickable:hover', 'background-color')).toBe(components.alert.warning.background);
        expect(styleFor(el, '.MuiChip-clickable:hover', 'background-image')).toContain('linear-gradient');
        expect(styleFor(el, '.Mui-selected', 'background-image')).toContain('linear-gradient');
    });

    describe('variant="tag"', () => {
        it('takes its three colours from palette.tag and the small square geometry', () => {
            const el = renderChip(next, { variant: 'tag', color: 'sky', size: 'medium' });
            const tag = next.palette.tag;

            expect(el.className).toContain('MuiChip-tag');
            expect(styleFor(el, '', 'background-color')).toBe(tag?.skyBackground);
            expect(styleFor(el, '', 'border-color')).toBe(tag?.skyBorder);
            expect(styleFor(el, '', 'color')).toBe(tag?.skyText);
            expect(styleFor(el, DELETE_ICON, 'color')).toBe(tag?.skyText);
            // Always the small chip, whatever `size` says.
            expect(styleFor(el, '', 'height')).toBe('24px');
            expect(styleFor(el, '', 'border-radius')).toBe('4px');
        });

        it('renders a tag without a colour as the neutral one', () => {
            const el = renderChip(next, { variant: 'tag' });

            expect(styleFor(el, '', 'background-color')).toBe('transparent');
            expect(styleFor(el, '', 'border-color')).toBe(next.palette.components.paper?.outlineBorder);
            expect(styleFor(el, '', 'color')).toBe(next.palette.text.secondary);
        });

        it('renders a semantic tag on the alert surface with the dark text', () => {
            const el = renderChip(next, { variant: 'tag', color: 'success' });

            expect(styleFor(el, '', 'background-color')).toBe(next.palette.components.alert.success.background);
            expect(styleFor(el, '', 'border-color')).toBe(next.palette.success.light);
            expect(styleFor(el, '', 'color')).toBe(next.palette.success.dark);
        });

        it('holds its surface still when a consumer makes it clickable', () => {
            const el = renderChip(next, { variant: 'tag', color: 'coral', onClick: () => undefined });
            const tag = next.palette.tag;

            expect(styleFor(el, '.MuiChip-clickable:hover', 'background-color')).toBe(tag?.coralBackground);
            expect(styleFor(el, '.Mui-focusVisible', 'box-shadow')).toBe(`0 0 0 2px ${tag?.coralBorder}`);
        });

        it('resolves the dark tag colours in dark mode', () => {
            const el = renderChip(nextDark, { variant: 'tag', color: 'lemon' });

            expect(styleFor(el, '', 'background-color')).toBe(nextDark.palette.tag?.lemonBackground);
            expect(nextDark.palette.tag?.lemonBackground).not.toBe(next.palette.tag?.lemonBackground);
        });
    });

    it('starts a leading icon at the label text inset', () => {
        const el = renderChip(next, { icon: <span data-testid="icon" /> });

        expect(styleFor(el, '', 'padding')).toBe('0 4px');
        expect(styleFor(el, ' .MuiChip-icon', 'margin-left')).toBe('6px');
    });

    it('renders an ai tag in the tag box on the ai surface', () => {
        const el = renderChip(next, { variant: 'tag', color: 'ai', size: 'medium' });

        expect(el.className).toContain('MuiChip-tagAi');
        expect(styleFor(el, '', 'height')).toBe('24px');
        expect(styleFor(el, '', 'border-radius')).toBe('4px');
        expect(styleFor(el, '', 'background')).toContain(next.palette.gradients.ai.surface);
    });

    it('keeps the ai colour variant', () => {
        const variants = next.components?.MuiChip?.variants ?? [];

        expect(variants.some((v) => typeof v.props === 'object' && v.props.color === 'ai')).toBe(true);
    });

    it('leaves reference untouched', () => {
        const reference = getTheme('light', { version: 'reference' });

        expect(reference.components?.MuiChip?.styleOverrides).toBeUndefined();
        expect(reference.components?.MuiChip?.variants).toBeUndefined();
    });
});
