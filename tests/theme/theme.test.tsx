import {
    Autocomplete,
    AutocompleteProps,
    IconButton,
    InputAdornment,
    Paper,
    PaperProps,
    TablePagination,
    TextField,
    TextFieldProps,
    Theme,
    ThemeProvider,
    useTheme
} from '@mui/material';
import { zhCN } from '@mui/material/locale';
import { DataGrid } from '@mui/x-data-grid';
import { plPL as xDataGridPl } from '@mui/x-data-grid/locales';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getTheme, ThemeConfig } from '../../src';
import { orderOf, styleFor } from './helpers/emotionRules';

// Children of ThemeConfig that are not MUI components leave no theme trace in
// the DOM, so snapshotting them proves nothing. This consumer surfaces the theme
// values a test wants to assert on as data attributes. Query it through the
// render's own `container` — RTL auto-cleanup is off here (no vitest globals),
// so document-wide queries would see consumers from earlier tests.
const ThemeConsumer = (): React.ReactElement => {
    const theme = useTheme();

    return (
        <div
            data-testid="theme-consumer"
            data-mode={theme.palette.mode}
            data-primary-main={theme.palette.primary.main}
            data-typography-mode={theme.typographyMode}
            data-body1-font-size={String(theme.typography.body1.fontSize)}
        />
    );
};

describe('getTheme', () => {
    it('Minimum working example should work', () => {
        const themeObject = getTheme('light', { language: 'plPL' });
        expect(themeObject.locale).toBe('plPL');
        expect(themeObject.palette.mode).toBe('light');
        // The default theme defines `MuiDataGrid` for its icon slots only; grid behaviour stays in `ringDataGridOverrides`.
        expect(themeObject.components).toHaveProperty('MuiDataGrid.defaultProps.slots');
        expect(themeObject.components).not.toHaveProperty('MuiDataGrid.defaultProps.hideFooter');
        expect(themeObject.components).not.toHaveProperty('MuiDataGrid.styleOverrides');
    });
    it('Full working example should work', () => {
        const themeObject = getTheme('dark', {
            language: 'enUS',
            externalComponentsTheme: { MuiDataGrid: {
                defaultProps: {
                    hideFooter: true
                },
                styleOverrides: {} } },
            externalLocales: [zhCN, xDataGridPl]
        });
        expect(themeObject.locale).toBe('enUS');
        expect(themeObject.palette.mode).toBe('dark');
        expect(themeObject.components).toHaveProperty('MuiDataGrid');
        expect(themeObject.colors).toBeDefined();
    });
});

describe('ThemeConfig', () => {
    it('Minimum working example should work', () => {
        const { container } = render(<ThemeConfig mode={'light'} language={'enUS'}>
            <div>test</div>
            <ThemeConsumer />
        </ThemeConfig>);

        expect(container.textContent).toContain('test');
        const consumer = container.querySelector<HTMLElement>('[data-testid="theme-consumer"]');
        expect(consumer?.dataset.mode).toBe('light');
    });

    it('Example with chineese core locales and pl translations in datagrid', () => {
        const MuiDataGridPart = {
            MuiDataGrid: {
                defaultProps: {
                    hideFooter: true
                },
                styleOverrides: {
                    root: ({ theme }: {theme: Theme;}): CSS.Properties => {
                        return {
                            '& .MuiDataGrid-columnHeaderTitle': {
                                color: theme.palette.text.secondary
                            },
                            '--unstable_DataGrid-headWeight': 600,
                            '--DataGrid-rowBorderColor': theme.palette.components.table.border,
                            'border': 'none',
                            '& .MuiDataGrid-cell:focus': {
                                outline: 'none'
                            },
                            '& .MuiDataGrid-cell:focus-within': {
                                outline: 'none'
                            },
                            '& .MuiDataGrid-columnHeader:focus': {
                                outline: 'none'
                            },
                            '& .MuiDataGrid-columnHeader:focus-within': {
                                outline: 'none'
                            },
                            '& .MuiDataGrid-row:hover': {
                                cursor: 'pointer'
                            }
                        };
                    }
                }
            }
        };
        const { container, queryByText } = render(
            <ThemeConfig
                mode={'light'}
                language={'enUS'}
                version={'next'}
                // `next` defines `MuiDataGrid` itself, so an application entry merges with it only here;
                // `externalComponentsTheme` would be replaced by it.
                themeOverrides={{ components: MuiDataGridPart }}
                externalLocales={[xDataGridPl, zhCN]}
            >

                <div style={{ height: '400px' }} >
                    <DataGrid
                        rows={[]}
                        columns={[{
                            field: 'firstName',
                            headerName: 'First name',
                            width: 150,
                            editable: true
                        }]}
                    />
                    <TablePagination
                        count={2000}
                        rowsPerPage={10}
                        page={1}
                        component="div"
                        onPageChange={vi.fn()}
                    />
                </div>
            </ThemeConfig>);

        const noRowsPl = xDataGridPl.components.MuiDataGrid.defaultProps.localeText.noRowsLabel;
        const rowsPerPageZh = zhCN.components?.MuiTablePagination?.defaultProps?.labelRowsPerPage;

        expect(queryByText(String(noRowsPl))).not.toBeNull();
        expect(queryByText(String(rowsPerPageZh))).not.toBeNull();
        expect(container.querySelector('.MuiDataGrid-footerContainer')).toBeNull();
    });
});

describe('themeOverrides', () => {
    it('should preserve default spacing when no overrides provided', () => {
        const theme = getTheme('light');
        expect(theme.spacing(1)).toBe('8px');
        expect(theme.spacing(2)).toBe('16px');
    });

    it('should not destroy defaults when empty overrides provided', () => {
        const themeWithOverrides = getTheme('light', { themeOverrides: {} });
        const themeWithout = getTheme('light');
        expect(themeWithOverrides.spacing(1)).toBe(themeWithout.spacing(1));
        expect(themeWithOverrides.palette.mode).toBe(themeWithout.palette.mode);
        expect(themeWithOverrides.shape.borderRadius).toBe(themeWithout.shape.borderRadius);
    });

    it('should override palette colors while preserving other palette values', () => {
        const theme = getTheme('light', {
            themeOverrides: { palette: { primary: { main: '#ff0000' } } }
        });
        expect(theme.palette.primary.main).toBe('#ff0000');
        expect(theme.palette.secondary).toBeDefined();
        expect(theme.palette.mode).toBe('light');
    });

    it('should override typography', () => {
        const theme = getTheme('light', {
            themeOverrides: { typography: { fontSize: 20 } }
        });
        expect(theme.typography.fontSize).toBe(20);
        expect(theme.typography.fontFamily).toBeDefined();
    });

    it('should override spacing with a number', () => {
        const theme = getTheme('light', {
            themeOverrides: { spacing: 4 }
        });
        expect(theme.spacing(1)).toBe('4px');
        expect(theme.spacing(2)).toBe('8px');
    });

    it('should override spacing with an array', () => {
        const theme = getTheme('light', {
            themeOverrides: { spacing: [0, 4, 8, 12, 16] }
        });
        expect(theme.spacing(1)).toBe('4px');
    });

    it('should override breakpoints while preserving others', () => {
        const theme = getTheme('light', {
            themeOverrides: { breakpoints: { sm: 700 } }
        });
        expect(theme.breakpoints.values.sm).toBe(700);
        expect(theme.breakpoints.values.md).toBeDefined();
    });

    it('should override shape', () => {
        const theme = getTheme('light', {
            themeOverrides: { shape: { borderRadius: 16 } }
        });
        expect(theme.shape.borderRadius).toBe(16);
    });

    it('should override component defaults while preserving library components', () => {
        const theme = getTheme('light', {
            themeOverrides: {
                components: {
                    MuiButton: {
                        defaultProps: { variant: 'outlined' }
                    }
                }
            }
        });
        expect(theme.components?.MuiButton?.defaultProps?.variant).toBe('outlined');
        expect(theme.components?.MuiTextField).toBeDefined();
    });

    it('should work with ThemeConfig component', () => {
        const { container } = render(
            <ThemeConfig
                mode="light"
                language="enUS"
                themeOverrides={{ palette: { primary: { main: '#ff0000' } } }}
            >
                <ThemeConsumer />
            </ThemeConfig>
        );
        const consumer = container.querySelector<HTMLElement>('[data-testid="theme-consumer"]');
        expect(consumer?.dataset.primaryMain).toBe('#ff0000');
    });

    it('should preserve backward compatibility with externalComponentsTheme', () => {
        const theme = getTheme('light', {
            externalComponentsTheme: {
                MuiDataGrid: { defaultProps: { hideFooter: true } }
            }
        });
        expect(theme.components).toHaveProperty('MuiDataGrid');
        expect(theme.components?.MuiTextField).toBeDefined();
    });
});

describe('typographyMode', () => {
    // Group 1: Default behavior
    it('should default to rem mode when typographyMode is not specified', () => {
        const theme = getTheme('light');
        expect(theme.typographyMode).toBe('rem');
    });

    it('should use rem typography config by default', () => {
        const theme = getTheme('light', { version: 'reference' });
        expect(theme.typography.body1.fontSize).toBe('0.875rem');
        expect(theme.typography.h1.fontSize).toBe('6rem');
    });

    // Group 2: Legacy-px mode works
    it('should store legacy-px mode on theme object', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        expect(theme.typographyMode).toBe('deprecated-px');
    });

    it('should use px typography config in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px', version: 'reference' });
        expect(theme.typography.body1.fontSize).toBe('14px');
        expect(theme.typography.h1.fontSize).toBe('96px');
    });

    // Group 3: Component override values diverge correctly
    it('should use rem values for MuiSvgIcon in default mode', () => {
        const theme = getTheme('light');
        const tooltipStyles = theme.components?.MuiSvgIcon?.styleOverrides?.fontSizeLarge;
        expect(tooltipStyles).toMatchObject({
            fontSize: '2rem'
        });
    });

    it('should use legacy rem values for MuiSvgIcon in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        const tooltipStyles = theme.components?.MuiSvgIcon?.styleOverrides?.fontSizeLarge;
        expect(tooltipStyles).toMatchObject({
            fontSize: '3.2rem'
        });
    });

    it('should use rem value for MuiSvgIcon fontSizeLarge in default mode', () => {
        const theme = getTheme('light');
        expect(theme.components?.MuiSvgIcon?.styleOverrides?.fontSizeLarge).toMatchObject({
            fontSize: '2rem'
        });
    });

    it('should use legacy rem value for MuiSvgIcon fontSizeLarge in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        expect(theme.components?.MuiSvgIcon?.styleOverrides?.fontSizeLarge).toMatchObject({
            fontSize: '3.2rem'
        });
    });

    it('should use rem values for MuiCssBaseline tiptap overrides in default mode', () => {
        const theme = getTheme('light');
        const styleOverridesFn = theme.components?.MuiCssBaseline?.styleOverrides;
        const styles = typeof styleOverridesFn === 'function' ? styleOverridesFn(theme) : styleOverridesFn;
        const tiptap = styles['.ring-text-editor .tiptap'];
        expect(tiptap['& h1'].fontSize).toBe('2.125rem');
        expect(tiptap['& h1'].lineHeight).toBe('2.625rem');
        expect(tiptap['& > p'].fontSize).toBe('1rem');
    });

    it('should use legacy rem values for MuiCssBaseline tiptap overrides in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        const styleOverridesFn = theme.components?.MuiCssBaseline?.styleOverrides;
        const styles = typeof styleOverridesFn === 'function' ? styleOverridesFn(theme) : styleOverridesFn;
        const tiptap = styles['.ring-text-editor .tiptap'];
        expect(tiptap['& h1'].fontSize).toBe('3.4rem');
        expect(tiptap['& h1'].lineHeight).toBe('4.2rem');
        expect(tiptap['& > p'].fontSize).toBe('1.6rem');
    });

    // Group 4: Interaction with themeOverrides
    it('themeOverrides.typography should override typographyMode config', () => {
        const theme = getTheme('light', {
            themeOverrides: { typography: { fontSize: 20 } },
            typographyMode: 'rem'
        });
        expect(theme.typography.fontSize).toBe(20);
        expect(theme.typography.fontFamily).toBeDefined();
    });

    // Group 5: ThemeConfig integration
    it('ThemeConfig should pass typographyMode to getTheme', () => {
        // Previously this passed the invalid value "legacy-px" (the union is
        // 'deprecated-px' | 'rem'), which silently fell through to rem — and
        // the container snapshot could not tell the difference.
        const { container } = render(
            <ThemeConfig mode="light" language="enUS" typographyMode="deprecated-px">
                <ThemeConsumer />
            </ThemeConfig>
        );
        const consumer = container.querySelector<HTMLElement>('[data-testid="theme-consumer"]');
        expect(consumer?.dataset.typographyMode).toBe('deprecated-px');
        // deprecated-px config on the default (next) version: body1 = 16px.
        expect(consumer?.dataset.body1FontSize).toBe('16px');
    });
});

describe('shadows', () => {
    it('next fills theme.shadows from Figma elevation styles (Ring #0F172A ladder)', () => {
        const theme = getTheme('light', { version: 'next' });
        expect(theme.shadows[0]).toBe('none');
        // elevation/4 — same geometry as the Accordion card shadow (PR #48).
        expect(theme.shadows[4]).toBe(
            '0px 2px 4px -1px rgba(15, 23, 42, 0.05), '
            + '0px 4px 5px 0px rgba(15, 23, 42, 0.04), '
            + '0px 1px 10px 0px rgba(15, 23, 42, 0.03)'
        );
        expect(theme.shadows).toHaveLength(25);
    });

    it('reference keeps MUI default shadows', () => {
        const theme = getTheme('light', { version: 'reference' });
        // MUI default shadows[4] — black-based, untouched by the Ring ladder.
        expect(theme.shadows[4]).toContain('rgba(0,0,0');
    });
});

describe('spacing pipeline', () => {
    it('should expose getSpacing on the theme', () => {
        const theme = getTheme('light');
        expect(typeof theme.getSpacing).toBe('function');
    });

    it('getSpacing should return correct px string for integer factors', () => {
        const theme = getTheme('light');
        expect(theme.getSpacing(1)).toBe('8px');
        expect(theme.getSpacing(2)).toBe('16px');
        expect(theme.getSpacing(4)).toBe('32px');
        expect(theme.getSpacing(12)).toBe('96px');
    });

    it('getSpacing should return correct px string for fractional factors', () => {
        const theme = getTheme('light', { version: 'next' });
        expect(theme.getSpacing(0.5)).toBe('4px');
        expect(theme.getSpacing(1.5)).toBe('12px');
    });

    it('getSpacing accepts literal 0 (CSS-shorthand convention) without warn on both versions', () => {
        // `0` is not a Figma "step" but is required for shorthand like
        // `margin: 8px 0`. Resolver short-circuits `0` before scale lookup
        // → no permissive-fallback warn even on `next` (whose scale starts
        // at 0.5).
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const nextTheme = getTheme('light', { version: 'next' });
        const refTheme = getTheme('light', { version: 'reference' });
        expect(nextTheme.getSpacing(0)).toBe('0px');
        expect(refTheme.getSpacing(0)).toBe('0px');
        expect(nextTheme.getSpacing(1, 0)).toBe('8px 0px');
        expect(refTheme.getSpacing(1, 0)).toBe('8px 0px');
        expect(nextTheme.getSpacing(0, 1, 0, 1)).toBe('0px 8px 0px 8px');
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('getSpacing should warn and return permissive fallback for out-of-range factor', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const theme = getTheme('light');
        // factor 13 is outside the active spacing scale; permissive fallback = 13 * 8 = 104px.
        const result = (theme.getSpacing as (f: number) => string)(13);
        expect(result).toBe('104px');
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('factor(s) 13 not in the current spacing scale')
        );
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Available factors:')
        );
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Falling back to permissive')
        );
        warnSpy.mockRestore();
    });

    it('getSpacing should warn and return permissive fallback for non-grid factor like 0.2', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const theme = getTheme('light');
        // 0.2 is not on any scale; permissive fallback = 0.2 * 8 = 1.6px.
        const result = (theme.getSpacing as (f: number) => string)(0.2);
        expect(result).toBe('1.6px');
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('factor(s) 0.2 not in the current spacing scale')
        );
        warnSpy.mockRestore();
    });

    it('getSpacing warn message does NOT mention theme version (universal hint)', () => {
        // Message intentionally version-agnostic: never names "reference" or
        // "next". Consumer should think "use one of these factors", not
        // "I'm on the wrong config".
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const theme = getTheme('light');
        (theme.getSpacing as (f: number) => string)(0.2);
        const message = warnSpy.mock.calls[0]?.[0] as string;
        expect(message).not.toMatch(/reference/i);
        expect(message).not.toMatch(/\bnext\b/i);
        expect(message).not.toMatch(/version/i);
        warnSpy.mockRestore();
    });

    it('theme.spacing (permissive) should still accept any number', () => {
        const theme = getTheme('light', { version: 'next' });
        expect(theme.spacing(0.5)).toBe('4px');
        expect(theme.spacing(1)).toBe('8px');
        expect(theme.spacing(1.5)).toBe('12px');
        expect(theme.spacing(13)).toBe('104px');
    });

    it('getSpacing values should match theme.spacing for all Figma-defined factors', () => {
        const theme = getTheme('light', { version: 'next' });
        const factors = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

        for (const f of factors) {
            expect(theme.getSpacing(f)).toBe(theme.spacing(f));
        }
    });

    // ---- Multi-arg arity (mirrors MUI theme.spacing 1-4 args shorthand) ----

    it('getSpacing with 2 args returns "Npx Mpx" (top/bottom + left/right)', () => {
        const theme = getTheme('light', { version: 'next' });
        expect(theme.getSpacing(1, 2)).toBe('8px 16px');
        expect(theme.getSpacing(0.5, 4)).toBe('4px 32px');
    });

    it('getSpacing with 2 args matches theme.spacing for same factors', () => {
        const theme = getTheme('light');
        expect(theme.getSpacing(1, 2)).toBe(theme.spacing(1, 2));
        expect(theme.getSpacing(3, 4)).toBe(theme.spacing(3, 4));
    });

    it('getSpacing with 3 args returns "Npx Mpx Kpx" (top + L/R + bottom)', () => {
        const theme = getTheme('light');
        expect(theme.getSpacing(1, 2, 3)).toBe('8px 16px 24px');
    });

    it('getSpacing with 3 args matches theme.spacing for same factors', () => {
        const theme = getTheme('light');
        expect(theme.getSpacing(1, 2, 3)).toBe(theme.spacing(1, 2, 3));
    });

    it('getSpacing with 4 args returns "Npx Mpx Kpx Lpx" (top, right, bottom, left)', () => {
        const theme = getTheme('light');
        expect(theme.getSpacing(1, 2, 3, 4)).toBe('8px 16px 24px 32px');
    });

    it('getSpacing with 4 args matches theme.spacing for same factors', () => {
        const theme = getTheme('light');
        expect(theme.getSpacing(1, 2, 3, 4)).toBe(theme.spacing(1, 2, 3, 4));
    });

    it('getSpacing supports fractional factors in multi-arg form', () => {
        const theme = getTheme('light', { version: 'next' });
        expect(theme.getSpacing(0.5, 1.5)).toBe('4px 12px');
        expect(theme.getSpacing(0.5, 1, 1.5, 2)).toBe('4px 8px 12px 16px');
    });

    // ---- Multi-arg validation / error paths ----

    it('getSpacing with 5 args logs error and returns 0px', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const theme = getTheme('light');
        const result = (theme.getSpacing as (...f: number[]) => string)(1, 2, 3, 4, 5);
        expect(result).toBe('0px');
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('getSpacing accepts 1-4 arguments')
        );
        errorSpy.mockRestore();
    });

    it('getSpacing with 0 args logs error and returns 0px', () => {
        const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const theme = getTheme('light');
        const result = (theme.getSpacing as (...f: number[]) => string)();
        expect(result).toBe('0px');
        expect(errorSpy).toHaveBeenCalledWith(
            expect.stringContaining('getSpacing accepts 1-4 arguments')
        );
        errorSpy.mockRestore();
    });

    it('getSpacing with mixed valid/invalid factor: invalid slot uses permissive fallback, warn fires once', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const theme = getTheme('light');
        // First arg valid (1 → 8px), second arg non-grid (0.2 → permissive 1.6px).
        // Single warn lists the offending factor; valid slot is unaffected.
        const result = (theme.getSpacing as (...f: number[]) => string)(1, 0.2);
        expect(result).toBe('8px 1.6px');
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('factor(s) 0.2 not in the current spacing scale')
        );
        warnSpy.mockRestore();
    });

    it('getSpacing reference — multi-arg works for integer factors via array lookup', () => {
        const theme = getTheme('light', { version: 'reference' });
        expect(theme.getSpacing(1, 2)).toBe('8px 16px');
        expect(theme.getSpacing(1, 2, 3, 4)).toBe('8px 16px 24px 32px');
    });

    it('getSpacing reference — fractional factor in multi-arg uses permissive fallback (reference grid is integer-only)', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const theme = getTheme('light', { version: 'reference' });
        // `reference` array lookup rejects fractional indices → permissive
        // fallback (0.5 * 8 = 4px) keeps the call rendering on the 8px grid.
        const result = (theme.getSpacing as (...f: number[]) => string)(1, 0.5);
        expect(result).toBe('8px 4px');
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('factor(s) 0.5 not in the current spacing scale')
        );
        warnSpy.mockRestore();
    });

    it('should preserve default spacing when no overrides provided', () => {
        const theme = getTheme('light');
        expect(theme.spacing(1)).toBe('8px');
        expect(theme.spacing(2)).toBe('16px');
    });
});

describe('theme version switch', () => {
    it('should default to next (design system palette + typography)', () => {
        const theme = getTheme('light');
        // `next` body1.fontSize = 16px / 16 = 1rem.
        expect(theme.typography.body1.fontSize).toBe('1rem');
        // Design system blue primary — distinct from `reference` cyan.
        expect(theme.palette.primary.main).toBe('rgba(20, 80, 180, 1)');
    });

    it('reference should render Ring legacy palette (cyan primary from master branch)', () => {
        const theme = getTheme('light', { version: 'reference' });
        // Ring legacy cyan — rgba(0, 167, 238, 1) — distinct from `next` blue.
        expect(theme.palette.primary.main).toBe('rgba(0, 167, 238, 1)');
        // Ring legacy body1 = 14px = 0.875rem, Arial font family.
        expect(theme.typography.body1.fontSize).toBe('0.875rem');
    });

    it('next should render MUI 7.2 kit palette (different from reference)', () => {
        const theme = getTheme('light', { version: 'next' });
        // `next` ships from the MUI 7.2 Figma kit — primary main is blue
        // (currently #1976d2 from upstream MUI; will become #1450b4 once
        // the Ring DS file is exported into config/next/). Distinct from
        // reference's legacy cyan rgba(0, 167, 238, 1).
        expect(theme.palette.primary.main).toMatch(/^rgba\(/);
        expect(theme.palette.primary.main).not.toBe('rgba(0, 167, 238, 1)');
        expect(theme.typography.body1.fontSize).toBe('1rem');
    });

    it('reference and next should each produce a valid theme with its own palette', () => {
        const referenceTheme = getTheme('light', { version: 'reference' });
        const nextTheme = getTheme('light', { version: 'next' });
        expect(referenceTheme.palette.primary.main).toMatch(/^rgba\(/);
        expect(nextTheme.palette.primary.main).toMatch(/^rgba\(/);
        // Typography shape is identical (rem strings) — only values differ.
        expect(typeof referenceTheme.typography.body1.fontSize).toBe(typeof nextTheme.typography.body1.fontSize);
        expect(referenceTheme.palette.primary.main).not.toBe(nextTheme.palette.primary.main);
    });

    it('reference should keep master component defaults for form controls', () => {
        const theme = getTheme('light', { version: 'reference' });

        expect(theme.components?.MuiTextField?.defaultProps?.variant).toBe('standard');
        expect(theme.components?.MuiFormControl?.defaultProps?.variant).toBe('standard');
        expect(theme.components?.MuiSelect?.defaultProps?.variant).toBe('standard');
        expect(theme.components?.MuiNativeSelect?.defaultProps?.variant).toBe('standard');
        expect(theme.components?.MuiOutlinedInput?.defaultProps?.notched).toBeUndefined();
    });

    it('next should keep branch component defaults for form controls', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(theme.components?.MuiTextField?.defaultProps?.variant).toBe('outlined');
        expect(theme.components?.MuiFormControl?.defaultProps?.variant).toBe('outlined');
        expect(theme.components?.MuiSelect?.defaultProps?.variant).toBe('outlined');
        expect(theme.components?.MuiNativeSelect).toBeUndefined();
        expect(theme.components?.MuiOutlinedInput?.defaultProps?.notched).toBe(false);
    });

    it('next input slots should resolve a height floor per size in every variant', () => {
        const theme = getTheme('light', { version: 'next' });

        // A floor rather than a fixed height, so multiline textareas and wrapping
        // Autocomplete chips still grow the field.
        for (const component of ['MuiOutlinedInput', 'MuiFilledInput', 'MuiInput'] as const) {
            const variantRoot = theme.components?.[component]?.styleOverrides?.root as (
                props: { theme: Theme; ownerState: { size?: string; formControl?: unknown; }; }
            ) => Record<string, unknown> & { minHeight?: string; height?: string; };
            expect(typeof variantRoot).toBe('function');
            expect(variantRoot({ theme, ownerState: { size: 'medium', formControl: true } }).minHeight).toBe('40px');
            expect(variantRoot({ theme, ownerState: { size: 'small', formControl: true } }).minHeight).toBe('32px');
            expect(variantRoot({ theme, ownerState: { size: 'medium', formControl: true } }).height).toBeUndefined();
        }

        // A standard input is a field only inside a form control; a bare `Input` / `Select` keeps its
        // own content height and MUI's own input box.
        const standardRoot = theme.components?.MuiInput?.styleOverrides?.root as (
            props: { theme: Theme; ownerState: { size?: string; formControl?: unknown; }; }
        ) => { minHeight?: string; };
        const standardInput = theme.components?.MuiInput?.styleOverrides?.input as (
            props: { theme: Theme; ownerState: { formControl?: unknown; }; }
        ) => { height?: string; } | undefined;
        expect(standardRoot({ theme, ownerState: { size: 'small' } }).minHeight).toBeUndefined();
        expect(standardInput({ theme, ownerState: {} })?.height).toBeUndefined();
        expect(standardInput({ theme, ownerState: { formControl: true } })?.height).toBe('1.5rem');

        // An IconButton inside any field is sized by the field: 28px in medium, 24px in small, and
        // MUI's own 24px SvgIcon default drops to the 20px glyph of every other field icon.
        const FIELD_BUTTON = [
            '& > .MuiIconButton-root',
            '& .MuiInputAdornment-root .MuiIconButton-root',
            '& .MuiAutocomplete-endAdornment .MuiIconButton-root'
        ].join(', ');
        const inputBaseRoot = theme.components?.MuiInputBase?.styleOverrides?.root as (
            props: { theme: Theme; ownerState: { size?: string; }; }
        ) => Record<string, { width: number; height: number; padding: number; '& .MuiSvgIcon-fontSizeMedium': { fontSize: string; }; }>;
        expect(inputBaseRoot({ theme, ownerState: { size: 'medium' } })[FIELD_BUTTON]).toEqual({
            'width': 28,
            'height': 28,
            'padding': 0,
            '& .MuiSvgIcon-fontSizeMedium': { fontSize: '1.25rem' }
        });
        expect(inputBaseRoot({ theme, ownerState: { size: 'small' } })[FIELD_BUTTON].width).toBe(24);
        const pickerBase = theme.components?.MuiPickersInputBase?.styleOverrides?.root as (
            props: { theme: Theme; }
        ) => Record<string, Record<string, { width: number; }>>;
        expect(pickerBase({ theme })[FIELD_BUTTON].width).toBe(28);
        expect(pickerBase({ theme })['&.MuiPickersInputBase-inputSizeSmall'][FIELD_BUTTON].width).toBe(24);

        const root = theme.components?.MuiOutlinedInput?.styleOverrides?.root as (
            props: { theme: Theme; ownerState: { size?: string; }; }
        ) => Record<string, unknown>;
        const rootMedium = root({ theme, ownerState: { size: 'medium' } });

        expect(rootMedium['&&.MuiAutocomplete-inputRoot']).toBeUndefined();

        // Autocomplete replaces its own padding with an inset that lands a 24px row on the
        // floor (8 + 24 + 8, 4 + 24 + 4); wrapped chip rows are spaced by `rowGap`.
        const autocompleteRoot = theme.components?.MuiAutocomplete?.styleOverrides?.root as (
            props: { theme: Theme; ownerState: { multiple?: boolean; }; }
        ) => Record<string, Record<string, unknown>>;

        // One rule per size covers every field variant, including MUI's `hiddenLabel` selectors.
        const findRule = (styles: Record<string, Record<string, unknown>>, selector: string): Record<string, unknown> => {
            const key = Object.keys(styles).find((candidate) => candidate.split(', ').includes(selector));
            expect(key).toBeDefined();

            return styles[key as string];
        };

        for (const multiple of [false, true]) {
            const styles = autocompleteRoot({ theme, ownerState: { multiple } });
            const medium = findRule(styles, '& .MuiOutlinedInput-root');
            const small = findRule(styles, '& .MuiOutlinedInput-root.MuiInputBase-sizeSmall');

            // A plain `.MuiAutocomplete-endAdornment` element (no MUI styled class) is placed as
            // MUI places its own, so it never sits in the flow and grows the field.
            expect(styles['& .MuiAutocomplete-endAdornment']).toEqual({
                position: 'absolute',
                right: 0,
                top: '50%',
                transform: 'translate(0, -50%)'
            });

            // Room for every end adornment button at the in-field size (28 / 24) plus the
            // adornment's offset (9, 0 in standard) and a 4px gap.
            for (const buttons of [1, 2, 3, 4]) {
                const has = `&:has(.MuiAutocomplete-endAdornment > :nth-of-type(${buttons}))`;
                expect(styles[`${has} .MuiOutlinedInput-root`]).toEqual({ paddingRight: 9 + (buttons * 28) + 4 });
                expect(styles[`${has} .MuiOutlinedInput-root.MuiInputBase-sizeSmall`])
                    .toEqual({ paddingRight: 9 + (buttons * 24) + 4 });
                expect(styles[`${has} .MuiInput-root`]).toEqual({ paddingRight: (buttons * 28) + 4 });
            }

            for (const root of ['.MuiFilledInput-root', '.MuiInput-root']) {
                expect(findRule(styles, `& ${root}`)).toBe(medium);
                expect(findRule(styles, `& ${root}.MuiInputBase-hiddenLabel.MuiInputBase-sizeSmall`)).toBe(small);
            }

            expect(medium).toMatchObject({ paddingTop: '8px', paddingBottom: '8px', rowGap: '4px' });
            expect(medium['& .MuiAutocomplete-input']).toEqual({ paddingTop: 0, paddingBottom: 0 });
            expect(medium['& .MuiAutocomplete-tag']).toEqual({ marginTop: 0, marginBottom: 0 });
            expect(small).toMatchObject({ paddingTop: '4px', paddingBottom: '4px' });
            expect(small['& .MuiAutocomplete-input']).toEqual({ paddingTop: 0, paddingBottom: 0 });
        }

        const input = theme.components?.MuiOutlinedInput?.styleOverrides?.input as (
            props: { theme: Theme; }
        ) => { paddingTop: number; paddingBottom: number; };
        expect(input({ theme }).paddingTop).toBe(0);
        expect(input({ theme }).paddingBottom).toBe(0);

        // Pickers take the same floor on their own `root`; small is keyed on the size class MUI X
        // puts on the root, because not every picker slot receives an `ownerState`.
        expect(theme.components?.MuiPickersOutlinedInput?.styleOverrides?.sectionsContainer).toEqual({
            padding: 0
        });

        for (const component of ['MuiPickersOutlinedInput', 'MuiPickersFilledInput', 'MuiPickersInput'] as const) {
            const pickerRoot = theme.components?.[component]?.styleOverrides?.root as (
                props: { theme: Theme; }
            ) => { 'minHeight': string; '&.MuiPickersInputBase-inputSizeSmall': { minHeight: string; }; };
            expect(typeof pickerRoot).toBe('function');
            expect(pickerRoot({ theme }).minHeight).toBe('40px');
            expect(pickerRoot({ theme })['&.MuiPickersInputBase-inputSizeSmall'].minHeight).toBe('32px');
        }
    });

    it('next input text should be 14/24 in both typography modes', () => {
        // `deprecated-px` resolves rem against a 10px root, so 1.4rem is 14px there.
        for (const [typographyMode, fontSize, lineHeight] of [
            ['rem', '0.875rem', '1.5rem'],
            ['deprecated-px', '1.4rem', '2.4rem']
        ] as const) {
            const theme = getTheme('light', { version: 'next', typographyMode });
            const root = theme.components?.MuiOutlinedInput?.styleOverrides?.root as (
                props: { theme: Theme; ownerState: { size?: string; }; }
            ) => { fontSize: string; lineHeight: string; };
            const input = theme.components?.MuiOutlinedInput?.styleOverrides?.input as (
                props: { theme: Theme; }
            ) => { height: string; };
            const pickerRoot = theme.components?.MuiPickersOutlinedInput?.styleOverrides?.root as (
                props: { theme: Theme; }
            ) => { fontSize: string; lineHeight: string; };
            const sections = theme.components?.MuiPickersInputBase?.styleOverrides?.sectionsContainer as (
                props: { ownerState?: object; }
            ) => { lineHeight: string; };

            expect(root({ theme, ownerState: {} })).toMatchObject({ fontSize, lineHeight });
            expect(input({ theme }).height).toBe(lineHeight);
            expect(pickerRoot({ theme })).toMatchObject({ fontSize, lineHeight });
            expect(sections({ ownerState: {} }).lineHeight).toBe(lineHeight);
        }
    });
});

describe('next field adornments and lists', () => {
    const theme = getTheme('light', { version: 'next' });

    const renderField = (props: TextFieldProps): HTMLElement => {
        const { container } = render(
            <ThemeProvider theme={theme}>
                <TextField {...props} />
            </ThemeProvider>
        );

        return container.querySelector('.MuiInputBase-root') as HTMLElement;
    };

    const textOf = (root: HTMLElement): HTMLElement =>
        root.querySelector('.MuiInputBase-input:not([aria-hidden])') as HTMLElement;

    const endAdornment = <IconButton aria-label="action">x</IconButton>;
    const startAdornment = <InputAdornment position="start">@</InputAdornment>;

    // MUI insets an adornment 14px from the border of a single-line outlined field. The multiline
    // root drops MUI's own multiline padding, so the inset has to come from the theme rule.
    it.each(['small', 'medium'] as const)('keeps the single-line adornment inset on a %s multiline outlined field', (size) => {
        const multiline = { multiline: true, rows: 2 };
        const singleEnd = renderField({ size, slotProps: { input: { endAdornment } } });
        const singleStart = renderField({ size, slotProps: { input: { startAdornment } } });
        const multiEnd = renderField({ size, ...multiline, slotProps: { input: { endAdornment } } });
        const multiStart = renderField({ size, ...multiline, slotProps: { input: { startAdornment } } });
        const multiPlain = renderField({ size, ...multiline });
        const MULTILINE = '.MuiInputBase-multiline';

        expect(singleEnd.classList.contains('MuiInputBase-multiline')).toBe(false);
        expect(styleFor(singleEnd, '', 'padding-right')).toBe('14px');
        expect(styleFor(singleStart, '', 'padding-left')).toBe('14px');

        expect(multiEnd.classList.contains('MuiInputBase-multiline')).toBe(true);
        expect(styleFor(multiEnd, MULTILINE, 'padding-right')).toBe('14px');
        expect(styleFor(multiEnd, MULTILINE, 'padding-left')).toBe('0');
        expect(styleFor(multiStart, MULTILINE, 'padding-left')).toBe('14px');
        expect(styleFor(multiStart, MULTILINE, 'padding-right')).toBe('0');

        for (const root of [multiEnd, multiStart, multiPlain]) {
            expect(styleFor(root, MULTILINE, 'padding-top')).toBe('0');
            expect(styleFor(root, MULTILINE, 'padding-bottom')).toBe('0');
        }

        expect(styleFor(multiPlain, MULTILINE, 'padding-left')).toBe('0');
        expect(styleFor(multiPlain, MULTILINE, 'padding-right')).toBe('0');

        // Text to button stays 8px, single line and multiline alike.
        expect(styleFor(textOf(singleEnd), '', 'padding-right')).toBe('8px');
        expect(styleFor(textOf(multiEnd), '', 'padding-right')).toBe('8px');

        // Beside a start adornment the text has no inset of its own: the adornment's 8px margin is the gap.
        const ADORNED_START = '.MuiInputBase-inputAdornedStart';

        for (const root of [singleStart, multiStart]) {
            expect(textOf(root).classList.contains('MuiInputBase-inputAdornedStart')).toBe(true);
            expect(styleFor(textOf(root), ADORNED_START, 'padding-left')).toBe('0');
        }

        expect(styleFor(textOf(singleEnd), '', 'padding-left')).toBe('16px');
    });

    const labelOf = (props: TextFieldProps): HTMLElement => {
        const { container } = render(
            <ThemeProvider theme={theme}>
                <TextField label="Label" {...props} />
            </ThemeProvider>
        );

        return container.querySelector('.MuiInputLabel-root') as HTMLElement;
    };

    // The rest is centred on the input line, 20px below the caption line and its gap: at 20px in
    // a medium field, 16px in a small one, 24px in a textarea; the 12px caption is drawn at 14px.
    it('rests a standard label on the input line until it shrinks to the caption above the field', () => {
        const SMALL = '.MuiInputLabel-sizeSmall';
        const MULTILINE = ':has(+ .MuiInputBase-multiline)';
        const SHRINK = '.MuiInputLabel-shrink';
        const label = labelOf({ variant: 'standard' });

        expect(styleFor(label, '', 'transform')).toBe('translate(0, 30.667px) scale(1.1667)');
        expect(styleFor(label, '', 'max-width')).toBe('85.714%');
        expect(styleFor(label, SMALL, 'transform')).toBe('translate(0, 26.667px) scale(1.1667)');
        expect(styleFor(label, MULTILINE, 'transform')).toBe('translate(0, 34.667px) scale(1.1667)');
        expect(styleFor(label, SHRINK, 'transform')).toBe('none');
        expect(styleFor(label, SHRINK, 'max-width')).toBe('100%');
        expect(styleFor(label, '', 'transition')).toContain('transform');

        // Equal specificity, so the shrunk caption wins on source order over every rest.
        expect(orderOf(label, SHRINK)).toBeGreaterThan(orderOf(label, SMALL));
        expect(orderOf(label, SHRINK)).toBeGreaterThan(orderOf(label, MULTILINE));
    });

    it.each(['outlined', 'filled'] as const)('keeps the %s label above the field', (variant) => {
        const label = labelOf({ variant });

        expect(styleFor(label, '', 'transform')).toBe('none');
        expect(styleFor(label, '.MuiInputLabel-sizeSmall', 'transform')).toBeUndefined();
    });

    const CustomPaper = (props: PaperProps): React.ReactElement => <Paper {...props} />;

    const paperClasses = (props: Pick<AutocompleteProps<string, false, false, false>, 'slots' | 'slotProps'>): string[] => {
        const { baseElement, unmount } = render(
            <ThemeProvider theme={theme}>
                <Autocomplete
                    open={true}
                    options={['Alpha']}
                    renderInput={(params): React.ReactElement => <TextField {...params} />}
                    {...props}
                />
            </ThemeProvider>
        );
        const papers = baseElement.querySelectorAll('.MuiAutocomplete-paper');

        expect(papers).toHaveLength(1);
        const classes = Array.from(papers[0].classList);
        unmount();

        return classes;
    };

    it('opens the Autocomplete list at elevation 8, also through a custom paper slot', () => {
        expect(paperClasses({})).toContain('MuiPaper-elevation8');
        expect(paperClasses({ slotProps: { listbox: {} } })).toContain('MuiPaper-elevation8');
        expect(paperClasses({ slots: { paper: CustomPaper } })).toContain('MuiPaper-elevation8');
    });

    it('lets a consumer elevation on the Autocomplete paper win', () => {
        expect(paperClasses({ slotProps: { paper: { elevation: 2 } } })).toContain('MuiPaper-elevation2');
        expect(paperClasses({ slots: { paper: CustomPaper }, slotProps: { paper: { elevation: 0 } } }))
            .toContain('MuiPaper-elevation0');
    });
});

describe('borderRadius pipeline', () => {
    it('should expose getBorderRadius on the theme', () => {
        const theme = getTheme('light');
        expect(typeof theme.getBorderRadius).toBe('function');
    });

    it('getBorderRadius returns correct px strings for all next scale factors', () => {
        const theme = getTheme('light', { version: 'next' });
        expect(theme.getBorderRadius(1)).toBe('4px');
        expect(theme.getBorderRadius(2)).toBe('8px');
        expect(theme.getBorderRadius(3)).toBe('12px');
        expect(theme.getBorderRadius(4)).toBe('16px');
        expect(theme.getBorderRadius(5)).toBe('24px');
    });

    it('getBorderRadius accepts literal 0 (no-radius shorthand) without warn on both versions', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const nextTheme = getTheme('light', { version: 'next' });
        const refTheme = getTheme('light', { version: 'reference' });
        expect(nextTheme.getBorderRadius(0)).toBe('0px');
        expect(refTheme.getBorderRadius(0)).toBe('0px');
        expect(warnSpy).not.toHaveBeenCalled();
        warnSpy.mockRestore();
    });

    it('getBorderRadius warns and returns permissive fallback for invalid factor on next', () => {
        const theme = getTheme('light', { version: 'next' });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        // factor 99 not in scale; permissive fallback = 99 * shape.borderRadius.
        // `next` shape.borderRadius = 4 → 396px.
        const result = (theme.getBorderRadius as (f: number) => string)(99);
        expect(result).toBe(`${99 * theme.shape.borderRadius}px`);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('factor 99 not in the current border-radius scale')
        );
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Available factors:')
        );
        warnSpy.mockRestore();
    });

    it('getBorderRadius on reference returns flat shape.borderRadius for factor=1', () => {
        const theme = getTheme('light', { version: 'reference' });
        expect(theme.getBorderRadius(1)).toBe('4px');
    });

    it('getBorderRadius on reference warns and returns permissive fallback for factor != 1', () => {
        const theme = getTheme('light', { version: 'reference' });
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        // `reference` exposes only factor=1; permissive fallback = 3 * 4 = 12px.
        const result = (theme.getBorderRadius as (f: number) => string)(3);
        expect(result).toBe('12px');
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('factor 3 not in the current border-radius scale')
        );
        warnSpy.mockRestore();
    });
});

describe('getTheme backward compatibility', () => {
    it('should work with legacy positional arguments', () => {
        const theme = getTheme('light', 'plPL', {}, []);
        expect(theme.locale).toBe('plPL');
        expect(theme.palette.mode).toBe('light');
    });

    it('should produce same result with new and legacy API', () => {
        const legacyTheme = getTheme('dark', 'plPL', {}, []);
        const newTheme = getTheme('dark', { language: 'plPL' });
        expect(legacyTheme.palette.mode).toBe(newTheme.palette.mode);
        expect(legacyTheme.locale).toBe(newTheme.locale);
        expect(legacyTheme.typographyMode).toBe(newTheme.typographyMode);
        expect(legacyTheme.spacing(2)).toBe(newTheme.spacing(2));
    });

    it('should warn when using positional arguments', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        getTheme('light', 'enUS', {}, []);
        expect(warnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Positional arguments in getTheme() are deprecated')
        );
        warnSpy.mockRestore();
    });

    it('should not warn when using new options API', () => {
        const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        getTheme('light', { language: 'enUS' });
        expect(warnSpy).not.toHaveBeenCalledWith(
            expect.stringContaining('Positional arguments')
        );
        warnSpy.mockRestore();
    });
});
