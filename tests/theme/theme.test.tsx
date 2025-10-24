import { TablePagination } from '@mui/material';
import { zhCN } from '@mui/material/locale';
import { DataGrid } from '@mui/x-data-grid';
import { plPL as xDataGridPl } from '@mui/x-data-grid/locales';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getTheme, ThemeConfig } from '../../src';

describe('getTheme', () => {
    it('Minimum working example should work', () => {
        const themeObject = getTheme('light', 'plPL');
        expect(themeObject.locale).toBe('plPL');
        expect(themeObject.palette.mode).toBe('light');
        expect(themeObject.components).not.toHaveProperty('MuiDataGrid');
    });
    it('Full working example should work', () => {
        const themeObject = getTheme('dark', 'enUS', { MuiDataGrid: {
            defaultProps: {
                hideFooter: true
            },
            styleOverrides: {} } }, [zhCN, xDataGridPl]);
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
