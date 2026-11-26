import { afterEach, describe, expect, it, vi } from 'vitest';
import { createTheme, getContrastRatio, type Theme } from '@mui/material';

import { getTheme } from '../../src/theme/theme';
import { getStringColor } from '../../src/theme/stringColor';
import { CHIP_TAG_COLORS } from '../../src/theme/config/palette.tag.types';
import {
    getStringColorTone,
    stringColorNeutralTone,
    stringColorTones,
    type StringColorTone
} from '../../src/theme/config/next/stringColor.generated';

describe('getStringColorTone', () => {
    // FNV-1a reference values: "a" → 0xe40c292c and "foobar" → 0xbf9cf968, both index 0 of 20 tones.
    it.each([
        ['a', 'berry'],
        ['foobar', 'berry'],
        ['Jan Kowalski', 'ocean'],
        ['Anna Nowak', 'orchid'],
        ['user-1', 'berry'],
        ['user-2', 'sky'],
        ['42', 'orchid'],
        ['Zażółć gęślą jaźń', 'sky'],
        ['b9d1c3e0-5f1a-4c2e-9a7b-1f2e3d4c5b6a', 'sand']
    ])('gives %j the tone %s', (input, tone) => {
        expect(getStringColorTone(input)).toBe(tone);
    });

    it('ignores case, surrounding spaces and Unicode normalisation', () => {
        const tone = getStringColorTone('Zażółć gęślą jaźń');

        expect(getStringColorTone('  ZAŻÓŁĆ GĘŚLĄ JAŹŃ\n')).toBe(tone);
        expect(getStringColorTone('Zażółć gęślą jaźń'.normalize('NFD'))).toBe(tone);
    });

    it.each([
        ['Σ', 'σ', 'ς'],
        ['ΟΔΟΣ', 'οδος', 'οδοσ'],
        ['Straße', 'STRASSE', 'strasse']
    ])('folds case so %j, %j and %j meet', (...inputs) => {
        const tones = inputs.map(getStringColorTone);

        expect(new Set(tones).size).toBe(1);
    });

    it.each(['', '   ', '\t\n'])('gives the neutral tone to %j', (input) => {
        expect(getStringColorTone(input)).toBe(stringColorNeutralTone);
    });

    // The same hash over `TextEncoder` bytes: the hand-written UTF-8 encoding has to give exactly those bytes.
    function toneOverTextEncoder(input: string): string {
        const text = input.trim().toUpperCase().toLowerCase().normalize('NFC');
        let hash = 0x811c9dc5;

        for (const byte of new TextEncoder().encode(text)) {
            hash = Math.imul(hash ^ byte, 0x01000193);
        }

        return stringColorTones[(hash >>> 0) % stringColorTones.length];
    }

    it.each([
        'Jan Kowalski',
        'Zażółć gęślą jaźń',
        '山田太郎',
        '👩‍💻 Ada',
        'café ☕',
        'lone \uD800 high',
        'lone \uDC00 low',
        'end \uD83D'
    ])('encodes %j to the bytes TextEncoder gives', (input) => {
        expect(getStringColorTone(input)).toBe(toneOverTextEncoder(input));
    });

    it('picks from the avatar tones other than the neutral one, sorted by name, from a frozen list', () => {
        const avatarTones = Object.keys(getTheme('light').palette.components.avatar)
            .filter((key) => key.endsWith('Fill') && key !== 'azureFill')
            .map((key) => key.slice(0, -'Fill'.length));

        expect([...stringColorTones]).toEqual([...stringColorTones].sort());
        expect([...stringColorTones, stringColorNeutralTone].sort()).toEqual(avatarTones.sort());
        expect(Object.isFrozen(stringColorTones)).toBe(true);
    });

    describe('in a runtime without TextEncoder', () => {
        afterEach(() => {
            vi.unstubAllGlobals();
        });

        it('imports and hashes', async () => {
            vi.stubGlobal('TextEncoder', undefined);
            vi.resetModules();

            const module = await import('../../src/theme/config/next/stringColor.generated');

            expect(module.getStringColorTone('Jan Kowalski')).toBe('ocean');
        });
    });
});

describe('getStringColor', () => {
    const tones = [...stringColorTones, stringColorNeutralTone];
    const tagTones: readonly string[] = CHIP_TAG_COLORS;

    function inputOf(tone: StringColorTone): string {
        if (tone === stringColorNeutralTone) {
            return '';
        }

        for (let n = 0; n < 1000; n++) {
            if (getStringColorTone(`user-${n}`) === tone) {
                return `user-${n}`;
            }
        }

        throw new Error(`No input found for ${tone}`);
    }

    it.each(['light', 'dark'] as const)('reads every tone from the %s palette, initials at 4.5:1 or more', (mode) => {
        const theme = getTheme(mode);
        const { palette } = theme;
        const tag = palette.tag as Record<string, string>;

        for (const tone of tones) {
            const color = getStringColor(inputOf(tone), theme);
            const isTag = tagTones.includes(tone);

            expect(color).toMatchObject({
                tone,
                fill: palette.components.avatar[`${tone}Fill`],
                background: isTag ? tag[`${tone}Background`] : palette.action.selected,
                text: isTag ? tag[`${tone}Text`] : palette.text.primary
            });
            expect(getContrastRatio(color.fill, color.fillText)).toBeGreaterThanOrEqual(4.5);
        }
    });

    it.each(['light', 'dark'] as const)('keeps avatar.contrastText on every %s fill of the palette', (mode) => {
        const theme = getTheme(mode);

        for (const tone of tones) {
            expect(getStringColor(inputOf(tone), theme).fillText).toBe(theme.palette.components.avatar.contrastText);
        }
    });

    it('has tag colours for the tones that are tag colours too', () => {
        const withTag = tones.filter((tone) => tagTones.includes(tone)).sort();

        expect(withTag).toEqual(['blush', 'coral', 'lavender', 'lemon', 'peach', 'sage', 'sky', 'stone', 'teal']);
    });

    it.each([
        ['light', 'rgba(232, 195, 0, 1)', 'black'],
        ['dark', 'rgba(84, 56, 200, 1)', 'white']
    ] as const)('in %s switches to common.%s on a fill where contrastText is below 4.5:1', (mode, fill, text) => {
        const base = getTheme(mode);
        const theme = {
            ...base,
            palette: {
                ...base.palette,
                components: {
                    ...base.palette.components,
                    avatar: { ...base.palette.components.avatar, lemonFill: fill }
                }
            }
        } as Theme;

        expect(getStringColor(inputOf('lemon'), theme).fillText).toBe(theme.palette.common[text]);
    });

    it.each(['light', 'dark'] as const)('falls back to the reference avatar fill in %s', (mode) => {
        const theme = getTheme(mode, { version: 'reference' });
        const color = getStringColor('Jan Kowalski', theme);

        expect(color).toMatchObject({
            tone: 'ocean',
            fill: theme.palette.components.avatar.fill,
            background: theme.palette.action.selected,
            text: theme.palette.text.primary
        });
        expect([theme.palette.common.white, theme.palette.common.black]).toContain(color.fillText);
        expect(getContrastRatio(color.fill, color.fillText)).toBeGreaterThanOrEqual(4.5);
    });

    it.each([
        ['light', 400, 'black'],
        ['dark', 600, 'white']
    ] as const)('gives a plain MUI %s theme the default Avatar grey and Chip colours', (mode, grey, text) => {
        const theme = createTheme({ palette: { mode } });
        const color = getStringColor('Jan Kowalski', theme);

        expect(color).toEqual({
            tone: 'ocean',
            fill: theme.palette.grey[grey],
            fillText: theme.palette.common[text],
            background: theme.palette.action.selected,
            text: theme.palette.text.primary
        });
        expect(getContrastRatio(color.fill, color.fillText)).toBeGreaterThanOrEqual(4.5);
    });

    it.each(['var(--avatar-fill)', 'transparent'])('keeps the initials colour when it cannot measure the fill %j', (fill) => {
        const base = getTheme('light');
        const overridden = {
            ...base,
            palette: {
                ...base.palette,
                components: {
                    ...base.palette.components,
                    avatar: { ...base.palette.components.avatar, lemonFill: fill }
                }
            }
        } as Theme;
        const plain = createTheme({ palette: { components: { avatar: { fill } } } as never });

        expect(getStringColor(inputOf('lemon'), overridden)).toMatchObject({
            fill,
            fillText: base.palette.components.avatar.contrastText
        });
        expect(getStringColor('Jan Kowalski', plain)).toMatchObject({ fill, fillText: plain.palette.common.white });
    });
});
