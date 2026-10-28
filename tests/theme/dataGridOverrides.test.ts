import { Theme } from '@mui/material';
import { describe, expect, it } from 'vitest';
import { getTheme } from '../../src';
import { ringDataGridOverrides } from '../../src/theme-mui-x';

const rootRules = (theme: Theme): Record<string, unknown> =>
    ringDataGridOverrides.MuiDataGrid.styleOverrides.root({ theme });

describe('ringDataGridOverrides', () => {
    // jsdom has no layout, so the scroll width itself is measured in a browser; this pins the rule.
    it.each(['reference', 'next'] as const)('clips the last column header (%s)', (version) => {
        expect(rootRules(getTheme('light', { version }))['& .MuiDataGrid-columnHeader--last']).toEqual({
            overflow: 'hidden'
        });
    });

    it.each([
        ['reference', 'light'],
        ['reference', 'dark'],
        ['next', 'light'],
        ['next', 'dark']
    ] as const)('draws row and column-header lines in the divider colour (%s, %s)', (version, mode) => {
        const theme = getTheme(mode, { version });

        expect(rootRules(theme)['--DataGrid-rowBorderColor']).toBe(theme.palette.divider);
    });
});
