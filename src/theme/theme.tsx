import {
    PaletteMode,
    Theme,
    createTheme,
    PaletteOptions,
    TypographyVariantsOptions,
    Components,
    CssBaseline,
    ThemeProvider
} from '@mui/material';
// Versioned theme config generated per profile.
// `reference` is current default; `next` is migration target.
import * as reference from './config/reference';
import * as next from './config/next';
import { colors } from './config/colors';
import type { SpacingFactor as SpacingFactorNext } from './config/next/spacing.generated';
import type { BorderRadiusFactor as BorderRadiusFactorNext } from './config/next/shape.generated';
import type { InspectorBridgeProps } from './InspectorBridge';
import type { RingMode } from './handleContract';

// Inspector activation flag set by bookmarklet (`'1'` in localStorage).
// ThemeConfig lazy-loads InspectorBridge only when this flag is present.
const INSPECTOR_ACTIVATION_FLAG = '__ring_ui_inspector__';

// Narrow ambient declaration for localStorage access without `lib.dom`.
declare const window: {
    localStorage: { getItem(key: string): string | null; };
} | undefined;

// Strict spacing factors from `next`, plus `0` shorthand for CSS spacing.
// Keep in sync with `SpacingFactor` in `augmentation.core.ts`.
type SpacingFactor = SpacingFactorNext | 0;
// Strict border-radius factors from `next`, plus `0` shorthand.
type BorderRadiusFactor = BorderRadiusFactorNext | 0;

const CONFIGS = { reference, next } as const;

export type ThemeVersion = keyof typeof CONFIGS;

// Other versions must match this breakpoints structure.
type Breakpoints = typeof reference.breakpoints;
import React from 'react';
import { CommonLanguages } from '../helpers/commonTypes';
import { plPL as corePL, enUS as coreUS } from '@mui/material/locale';

import { actionOpacities } from './config/actionOpacities';

export type TypographyMode = 'deprecated-px' | 'rem';

export interface ThemeOverrides {
    palette?: Partial<PaletteOptions>;
    typography?: Partial<TypographyVariantsOptions>;
    spacing?: number | ((factor: number) => string | number) | number[];
    breakpoints?: Partial<Breakpoints>;
    shape?: { borderRadius: number; };
    /**
     * Component overrides use last-wins semantics — function-valued styleOverrides
     * replace library defaults entirely, they are not composed.
     */
    components?: Components<Omit<Theme, 'components'>>;
}

export interface GetThemeOptions {
    language?: CommonLanguages | string;
    /** @deprecated Use themeOverrides.components instead. For backward compatibility only. */
    externalComponentsTheme?: object;
    externalLocales?: object[];
    /** @deprecated Use theme.palette instead. For backward compatibility only. */
    externalColors?: object;
    themeOverrides?: ThemeOverrides;
    /**
     * Use 'rem' (default) for standard rem-based typography (1rem = 16px, no html font-size hack needed).
     * Use 'deprecated-px' for backward compatibility with the px-based typography and html { font-size: 62.5% } setups.
     * @deprecated 'deprecated-px' mode – will be removed in the next major version
     */
    typographyMode?: TypographyMode;
    /** Theme version to apply (`reference` default, `next` optional). */
    version?: ThemeVersion;
}

/**
 * Creates a MUI theme with Ring Publishing defaults.
 *
 * @param mode The color mode ('light' or 'dark')
 * @param options Optional theme configuration
 * @returns MUI Theme object
 */
export function getTheme(mode: PaletteMode | string, options?: GetThemeOptions): Theme;
/**
 * @deprecated Use getTheme(mode, options) instead. Positional arguments will be removed in the next major version.
 */
export function getTheme(
    mode: PaletteMode | string,
    language: CommonLanguages,
    externalComponentsTheme: object,
    externalLocales?: object[],
    externalColors?: object,
    themeOverrides?: ThemeOverrides,
    typographyMode?: TypographyMode
): Theme;

export function getTheme(
    mode: PaletteMode | string,
    languageOrOptions?: CommonLanguages | GetThemeOptions,
    externalComponentsTheme = {},
    externalLocales: object[] = [],
    externalColors: object = {},
    themeOverrides: ThemeOverrides = {},
    typographyMode: TypographyMode = 'rem'
): Theme {
    let language: CommonLanguages | string = CommonLanguages.enUS;
    let version: ThemeVersion = 'reference';

    if (typeof languageOrOptions === 'object' && languageOrOptions !== null) {
        // New API: getTheme(mode, options)
        const opts = languageOrOptions as GetThemeOptions;
        language = opts.language ?? CommonLanguages.enUS;
        externalComponentsTheme = opts.externalComponentsTheme ?? {};
        externalLocales = opts.externalLocales ?? [];
        externalColors = opts.externalColors ?? {};
        themeOverrides = opts.themeOverrides ?? {};
        typographyMode = opts.typographyMode ?? 'rem';
        version = opts.version ?? 'reference';
    } else if (typeof languageOrOptions === 'string') {
        // Legacy API: getTheme(mode, language, ...)
        language = languageOrOptions as CommonLanguages;

        if (arguments.length > 2) {
            if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
                console.warn(
                            '[@ringpublishing/mui-theme] Positional arguments in getTheme() are deprecated. '
                            + 'Use getTheme(mode, { language, themeOverrides, ... }) instead. '
                            + 'Positional arguments will be removed in the next major version.'
                );
            }
        }
    }

    const coreLocale = language === CommonLanguages.plPL ? corePL : coreUS;
    const isLegacyPx = typographyMode === 'deprecated-px';

    // Convert px to rem for standard and legacy typography modes.
    const pxTo = (px: number): string => `${px / (isLegacyPx ? 10 : 16)}rem`;

    if (Object.keys(externalColors).length > 0) {
        if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
            console.warn('The "externalColors" parameter is deprecated and should be used only for backward compatibility. Please use theme.palette instead.');
        }
    }

    const cfg = CONFIGS[version];
    const selectedPalette = cfg.palette[mode as PaletteMode];
    const selectedActionOpacities = actionOpacities[mode as PaletteMode];

    const baseTheme = createTheme(
        {
            locale: language as CommonLanguages,
            palette: {
                ...selectedPalette,
                action: {
                    ...selectedPalette.action,
                    ...selectedActionOpacities
                }
            },
            breakpoints: {
                keys: ['xs', 'sm', 'md', 'lg', 'xl'],
                values: { ...cfg.breakpoints, ...themeOverrides?.breakpoints }
            },
            // Wrap array spacing to support fractional factors used by MUI X.
            spacing: themeOverrides?.spacing ?? (
                Array.isArray(cfg.spacing)
                    ? ((arr: readonly number[]) => (factor: number): number =>
                        Number.isInteger(factor) && factor >= 0 && factor < arr.length
                            ? arr[factor]
                            : factor * 8
                    )(cfg.spacing as readonly number[])
                    : cfg.spacing
            ),
            shape: themeOverrides?.shape ?? cfg.shape,
            typography: isLegacyPx ? cfg.typographyPx : cfg.typographyRem,
            typographyMode,
            getSpacing: (...factors: SpacingFactor[]): string => {
                // Resolve one strict spacing factor from the active config.
                const resolveOne = (factor: SpacingFactor): number | undefined => {
                    // `0` is always valid and should not trigger warnings.
                    if (Number(factor) === 0) {
                        return 0;
                    }

                    if ('spacingScale' in cfg) {
                        const scale = (cfg as { spacingScale: Record<number, number>; }).spacingScale;

                        return scale[factor as number];
                    }

                    if (Array.isArray((cfg as { spacing?: unknown; }).spacing)) {
                        const arr = (cfg as { spacing: readonly number[]; }).spacing;
                        const idx = Number(factor);

                        return Number.isInteger(idx) ? arr[idx] : undefined;
                    }

                    return undefined;
                };

                // Render current strict factors for warning messages.
                const availableFactors = (): string => {
                    if ('spacingScale' in cfg) {
                        return Object.keys((cfg as { spacingScale: Record<number, number>; }).spacingScale)
                            .map(Number)
                            .sort((a, b) => a - b)
                            .join(', ');
                    }

                    const arr = (cfg as { spacing: readonly number[]; }).spacing;

                    // Skip index 0.
                    return Array.from({ length: Math.max(0, arr.length - 1) }, (value, i) => i + 1).join(', ');
                };

                // Permissive fallback keeps rendering stable for unknown factors.
                const SPACING_BASE_PX = 8;
                const permissive = (factor: SpacingFactor): number => Number(factor) * SPACING_BASE_PX;

                if (factors.length === 0 || factors.length > 4) {
                    // Invalid arity.
                    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
                        console.error(
                            `[@ringpublishing/mui-theme] getSpacing accepts 1-4 arguments, got ${factors.length}.`
                        );
                    }

                    return '0px';
                }

                const parts: string[] = [];
                const invalidFactors: SpacingFactor[] = [];

                for (const factor of factors) {
                    const value = resolveOne(factor);

                    if (value === undefined) {
                        invalidFactors.push(factor);
                        parts.push(`${permissive(factor)}px`);
                    } else {
                        parts.push(`${value}px`);
                    }
                }

                const result = parts.join(' ');

                if (invalidFactors.length > 0) {
                    const offending = invalidFactors.map(String).join(', ');

                    if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
                        console.warn(
                            `[@ringpublishing/mui-theme] getSpacing: factor(s) ${offending} not in the current spacing scale.\n`
                            + `  Available factors: ${availableFactors()}.\n`
                            + `  Falling back to permissive ${SPACING_BASE_PX}px-grid value = "${result}".\n`
                            + '  → Use one of the listed factors to remove this warning.'
                        );
                    }
                }

                return result;
            },
            getBorderRadius: (factor: BorderRadiusFactor): string => {
                // Strict border-radius lookup with permissive fallback.
                const BASE_RADIUS_PX = cfg.shape.borderRadius;

                const availableFactors = (): string => {
                    if ('borderRadiusScale' in cfg) {
                        return Object.keys((cfg as { borderRadiusScale: Record<number, number>; }).borderRadiusScale)
                            .map(Number)
                            .sort((a, b) => a - b)
                            .join(', ');
                    }

                    // Flat config exposes only factor 1.
                    return '1';
                };

                const resolveOne = (): number | undefined => {
                    // `0` is always valid.
                    if (Number(factor) === 0) {
                        return 0;
                    }

                    if ('borderRadiusScale' in cfg) {
                        const scale = (cfg as { borderRadiusScale: Record<number, number>; }).borderRadiusScale;

                        return scale[factor as number];
                    }

                    // Flat config: only factor 1 maps to base radius.
                    return Number(factor) === 1 ? BASE_RADIUS_PX : undefined;
                };

                const value = resolveOne();

                if (value !== undefined) {
                    return `${value}px`;
                }

                const permissive = Number(factor) * BASE_RADIUS_PX;
                const result = `${permissive}px`;

                if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
                    console.warn(
                        `[@ringpublishing/mui-theme] getBorderRadius: factor ${String(factor)} not in the current border-radius scale.\n`
                        + `  Available factors: ${availableFactors()}.\n`
                        + `  Falling back to permissive ${BASE_RADIUS_PX}px-base value = "${result}".\n`
                        + '  → Use one of the listed factors to remove this warning.'
                    );
                }

                return result;
            },
            colors: { ...colors, ...externalColors } as typeof colors & Record<string, string>,
            components: {
                ...externalComponentsTheme,
                ...cfg.buildRingComponents({ pxTo })
            }
        },
        coreLocale,
        ...externalLocales
    );

    const deepOverrides = {
        ...(themeOverrides?.palette && { palette: themeOverrides.palette }),
        ...(themeOverrides?.typography && { typography: themeOverrides.typography }),
        ...(themeOverrides?.components && { components: themeOverrides.components })
    };

    if (Object.keys(deepOverrides).length > 0) {
        return createTheme(baseTheme, deepOverrides);
    }

    return baseTheme;
}

export interface ThemeConfigProps {
    mode: PaletteMode;
    children: React.ReactNode[] | React.ReactNode;
    language?: CommonLanguages;
    externalLocales?: object[];
    themeOverrides?: ThemeOverrides;
    /**
     * @deprecated Use themeOverrides.components instead. For backward compatibility only
     */
    externalComponentsTheme?: object;
    /** @deprecated 'deprecated-px' will be removed in the next major version. Migrate to rem-based typography. */
    typographyMode?: TypographyMode;
    /** Theme version to apply — defaults to 'reference'. Opt into 'next' explicitly. */
    version?: ThemeVersion;
}

export const ThemeConfig = ({
    mode,
    children,
    language,
    externalLocales,
    themeOverrides,
    externalComponentsTheme,
    typographyMode,
    version
}: ThemeConfigProps): React.ReactNode[] | React.ReactNode => {
    const baseTheme = getTheme(mode, {
        language,
        externalComponentsTheme,
        externalLocales,
        themeOverrides,
        typographyMode,
        version
    });

    // Lazy-load InspectorBridge only when the localStorage flag is set.
    // Default path stays plain ThemeProvider + CssBaseline.
    const [BridgeComp, setBridgeComp] = React.useState<
        null | React.ComponentType<InspectorBridgeProps>
    >(null);

    React.useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (window.localStorage.getItem(INSPECTOR_ACTIVATION_FLAG) !== '1') {
            return;
        }

        // Dynamic import keeps inspector code in a separate chunk.
        void import('./InspectorBridge').then((mod) => {
            setBridgeComp(() => mod.InspectorBridge);
        });
    }, []);

    if (BridgeComp !== null) {
        return (
            <BridgeComp
                effectiveMode={mode as RingMode}
                effectiveVersion={version ?? 'reference'}
                language={language}
                externalLocales={externalLocales}
                externalComponentsTheme={externalComponentsTheme}
                themeOverrides={themeOverrides}
                typographyMode={typographyMode}
                baseTheme={baseTheme}
            >
                {children}
            </BridgeComp>
        );
    }

    return (
        <ThemeProvider theme={baseTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

/** @deprecated Use theme.palette.grey instead */
export const basicGrey100 = '#D9D9D9';
/** @deprecated Use theme.palette.grey instead */
export const basicGrey200 = '#7b7b7b';
