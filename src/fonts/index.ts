import type { Theme } from '@mui/material';

// Font loading helpers. ThemeConfig uses them to delay the first render until the theme's
// font family is loaded in every weight its typography uses.
// Works with any source that declares the family: a Google Fonts <link>
// (one variable file covers all weights) or `@fontsource/inter` (one file per weight).
// `@fontsource-variable/inter` declares `Inter Variable` and is not matched.

// Text sample passed to `document.fonts.load()`. Covers `latin` and `latin-ext`
// (Polish diacritics) so both unicode-range subsets are requested.
export const RING_FONT_SAMPLE_TEXT = 'aą';

export const RING_FONT_WAIT_TIMEOUT_MS = 2000;

/** A font family and the weights to wait for. */
export interface ThemeFonts {
    family: string;
    weights: readonly number[];
}

/** Keys of `theme.typography` that hold numbers rather than variants. */
const WEIGHT_TOKENS = ['fontWeightLight', 'fontWeightRegular', 'fontWeightMedium', 'fontWeightBold'] as const;

const KEYWORD_WEIGHTS: Record<string, number> = { normal: 400, bold: 700 };

const toWeight = (value: unknown): number | undefined => {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : undefined;
    }

    if (typeof value !== 'string') {
        return undefined;
    }

    const keyword = KEYWORD_WEIGHTS[value.trim().toLowerCase()];

    if (keyword !== undefined) {
        return keyword;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
};

/**
 * The first family of `theme.typography.fontFamily`, unquoted, and every weight the typography
 * uses: the four weight tokens plus the `fontWeight` of each variant, ascending.
 * `undefined` when the typography names no family.
 */
export function getThemeFonts(theme: Theme): ThemeFonts | undefined {
    const typography = theme.typography as unknown as Record<string, unknown>;
    const stack = typography.fontFamily;

    if (typeof stack !== 'string') {
        return undefined;
    }

    const family = stack.split(',')[0].trim().replace(/^["']|["']$/g, '');

    if (family.length === 0) {
        return undefined;
    }

    const weights = new Set<number>();

    const add = (value: unknown): void => {
        const weight = toWeight(value);

        if (weight !== undefined) {
            weights.add(weight);
        }
    };

    WEIGHT_TOKENS.forEach((token) => add(typography[token]));
    Object.values(typography).forEach((variant) => {
        if (typeof variant === 'object' && variant !== null && 'fontWeight' in variant) {
            add((variant as { fontWeight?: unknown; }).fontWeight);
        }
    });

    return { family, weights: [...weights].sort((a, b) => a - b) };
}

// Narrow typing of the CSS Font Loading API; the base tsconfig has no `lib.dom`.
interface FontFaceSetLike {
    load(font: string, text?: string): Promise<unknown>;
    check(font: string, text?: string): boolean;
}

const getFontFaceSet = (): FontFaceSetLike | undefined => {
    const doc = (globalThis as { document?: { fonts?: FontFaceSetLike; }; }).document;

    return doc?.fonts;
};

// The family is quoted: an unquoted name such as `Source Sans 3` is not a valid `font` value.
const toDescriptors = ({ family, weights }: ThemeFonts): string[] =>
    weights.map((weight) => `${weight} 1em "${family.replace(/["\\]/g, '\\$&')}"`);

/**
 * Returns true when the fonts are usable without waiting: already loaded, not declared
 * by any @font-face, no fonts given, or the Font Loading API is unavailable (SSR, jsdom).
 */
export function areThemeFontsReady(themeFonts: ThemeFonts | undefined): boolean {
    const fonts = getFontFaceSet();

    if (!fonts || themeFonts === undefined) {
        return true;
    }

    try {
        return toDescriptors(themeFonts).every((descriptor) => fonts.check(descriptor, RING_FONT_SAMPLE_TEXT));
    } catch {
        return true;
    }
}

/**
 * Resolves when the family is loaded in all its weights or after `timeoutMs`, whichever comes first.
 * Never rejects, so a failing font CDN cannot block the app.
 */
export function waitForThemeFonts(
    themeFonts: ThemeFonts | undefined,
    timeoutMs: number = RING_FONT_WAIT_TIMEOUT_MS
): Promise<void> {
    const fonts = getFontFaceSet();

    if (!fonts || themeFonts === undefined || areThemeFontsReady(themeFonts)) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        const timer = setTimeout(resolve, timeoutMs);

        const done = (): void => {
            clearTimeout(timer);
            resolve();
        };

        // With a variable font all descriptors resolve to the same file, fetched once.
        Promise.all(toDescriptors(themeFonts).map((descriptor) => fonts.load(descriptor, RING_FONT_SAMPLE_TEXT)))
            .then(done, done);
    });
}
