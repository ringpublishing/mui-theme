import { TablePagination, Theme } from '@mui/material';
import { zhCN } from '@mui/material/locale';
import { DataGrid } from '@mui/x-data-grid';
import { plPL as xDataGridPl } from '@mui/x-data-grid/locales';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getTheme, ThemeConfig } from '../../src';

describe('getTheme', () => {
    it('Minimum working example should work', () => {
        const themeObject = getTheme('light', { language: 'plPL' });
        expect(themeObject.locale).toBe('plPL');
        expect(themeObject.palette.mode).toBe('light');
        expect(themeObject.components).not.toHaveProperty('MuiDataGrid');
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
        </ThemeConfig>);

        expect(container).toMatchSnapshot();
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
                            '--DataGrid-rowBorderColor': theme.palette.components.datagrid.border,
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
        const { container } = render(<ThemeConfig mode={'light'} language={'enUS'} externalComponentsTheme={MuiDataGridPart}
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

        expect(container).toMatchSnapshot();
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
                <div>test</div>
            </ThemeConfig>
        );
        expect(container).toMatchSnapshot();
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
        const theme = getTheme('light');
        expect(theme.typography.body1.fontSize).toBe('0.875rem');
        expect(theme.typography.h1.fontSize).toBe('6rem');
    });

    // Group 2: Legacy-px mode works
    it('should store legacy-px mode on theme object', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        expect(theme.typographyMode).toBe('deprecated-px');
    });

    it('should use px typography config in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        expect(theme.typography.body1.fontSize).toBe('14px');
        expect(theme.typography.h1.fontSize).toBe('96px');
    });

    // Group 3: Component override values diverge correctly
    it('should use rem values for MuiTooltip in default mode', () => {
        const theme = getTheme('light');
        const tooltipStyles = theme.components?.MuiTooltip?.styleOverrides?.tooltip;
        expect(tooltipStyles).toMatchObject({
            fontSize: '0.625rem',
            lineHeight: '0.875rem'
        });
    });

    it('should use px values for MuiTooltip in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        const tooltipStyles = theme.components?.MuiTooltip?.styleOverrides?.tooltip;
        expect(tooltipStyles).toMatchObject({
            fontSize: '10px',
            lineHeight: '14px'
        });
    });

    it('should use rem value for MuiSvgIcon fontSizeLarge in default mode', () => {
        const theme = getTheme('light');
        expect(theme.components?.MuiSvgIcon?.styleOverrides?.fontSizeLarge).toMatchObject({
            fontSize: '2rem'
        });
    });

    it('should use px value for MuiSvgIcon fontSizeLarge in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        expect(theme.components?.MuiSvgIcon?.styleOverrides?.fontSizeLarge).toMatchObject({
            fontSize: '3.25rem'
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

    it('should use px values for MuiCssBaseline tiptap overrides in legacy-px mode', () => {
        const theme = getTheme('light', { typographyMode: 'deprecated-px' });
        const styleOverridesFn = theme.components?.MuiCssBaseline?.styleOverrides;
        const styles = typeof styleOverridesFn === 'function' ? styleOverridesFn(theme) : styleOverridesFn;
        const tiptap = styles['.ring-text-editor .tiptap'];
        expect(tiptap['& h1'].fontSize).toBe('3.4rem');
        expect(tiptap['& h1'].lineHeight).toBe('42px');
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
        const { container } = render(
            <ThemeConfig mode="light" language="enUS" typographyMode="legacy-px">
                <div>test</div>
            </ThemeConfig>
        );
        expect(container).toMatchSnapshot();
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
