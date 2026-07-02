// Optional MUI X helpers exposed via `@ringpublishing/mui-theme/mui-x`.
// Import this sub-entry only in apps that use Data Grid or Date Pickers.

// Side-effect imports enable required MUI X and Ring theme augmentations.
// Keep plain `import` (not `import type`) so declarations are preserved in DTS output.
import '../theme/themeAugmentation';
import '@mui/x-data-grid/themeAugmentation';
import '@mui/x-date-pickers/themeAugmentation';

import type { Theme } from '@mui/material';
import { enUS as coreEn, plPL as corePl } from '@mui/material/locale';
import { enUS as xDataGridEn, plPL as xDataGridPl } from '@mui/x-data-grid-pro/locales';
import { enUS as xDatePickersEn, plPL as xDatePickersPl } from '@mui/x-date-pickers/locales';

import { CommonLanguages } from '../helpers/commonTypes';

// Returns locales in createTheme order: core first, then MUI X bundles.
// Unknown language values warn and fall back to enUS.
export function getMuiXLocales(language: CommonLanguages | string = CommonLanguages.enUS): object[] {
    const isPl = language === CommonLanguages.plPL;
    const isEn = language === CommonLanguages.enUS;

    if (!isPl && !isEn) {
        if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
            console.warn(
                `[mui-theme] getMuiXLocales: unknown language "${language}" — falling back to enUS bundle. `
                + `Supported values: ${Object.values(CommonLanguages).join(', ')}.`
            );
        }
    }

    return [
        isPl ? corePl : coreEn,
        isPl ? xDataGridPl : xDataGridEn,
        isPl ? xDatePickersPl : xDatePickersEn
    ];
}

// Ring defaults and styleOverrides for MuiDataGrid.
// Pass through `ThemeConfig` `externalComponentsTheme`.
export const ringDataGridOverrides = {
    MuiDataGrid: {
        defaultProps: {
            hideFooter: true
        },
        styleOverrides: {
            root: ({ theme }: { theme: Theme; }) => ({
                '& .MuiDataGrid-columnHeaderTitle': {
                    color: theme.palette.text.secondary
                },
                '--unstable_DataGrid-headWeight': 600,
                '--DataGrid-rowBorderColor': theme.palette.components.datagrid?.border,
                'border': 'none',
                '& .MuiDataGrid-cell:focus': { outline: 'none' },
                '& .MuiDataGrid-cell:focus-within': { outline: 'none' },
                '& .MuiDataGrid-columnHeader:focus': { outline: 'none' },
                '& .MuiDataGrid-columnHeader:focus-within': { outline: 'none' },
                '& .MuiDataGrid-row:hover': { cursor: 'pointer' }
            })
        }
    }
};
