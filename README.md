# @ringpublishing/mui-theme

Package includes *Ring Publishing* theme for MUI components.

Theme was created with the assumption 1rem = 10px. Before using add below CSS to your project.

```css
html {
    font-size: 62.5%;
}
```

## Version 4.x.x supports:

* "@emotion/styled": "^11.0.0"
* "@mui/material": "^7.0.0"
* "@mui/x-data-grid": "^8.0.0"
* "@mui/x-data-grid-pro": "^8.0.0"
* "@mui/x-date-pickers": "^8.0.0"
* "@mui/x-date-pickers-pro": "^8.0.0"

## Installation

```shell
npm install @ringpublishing/mui-theme
```

## Minimal usage example

```tsx
import { TablePagination } from '@mui/material';
import { ThemeConfig } from '@ringpublishing/mui-theme';

function App() {
    return (
        <ThemeConfig mode="light">
            <TablePagination
                count={2000}
                rowsPerPage={10}
                page={1}
                component="div"
                onPageChange={() => {
                    //
                }}
            />
        </ThemeConfig>
    );
}
```

## With language and custom locales

Note: default language is 'enUS' and it works 'out of the box'. If you want to support other locales, follow example below.

PL locales for MUI core also are available. Just set language to 'plPL'.

```tsx
import { TablePagination } from '@mui/material';
import { zhCN } from '@mui/material/locale';
import { plPL as xDataGridPl } from '@mui/x-data-grid/locales';
import { ThemeConfig } from '@ringpublishing/mui-theme';

function App() {
    return (
        <ThemeConfig mode="light" language="plPL" externalLocales={[xDataGridPl, zhCN]}>
            <TablePagination
                count={2000}
                rowsPerPage={10}
                page={1}
                component="div"
                onPageChange={() => {
                    //
                }}
            />
        </ThemeConfig>
    );
}
```

## With custom components theme fragment

```tsx
import { TablePagination } from '@mui/material';
import { ThemeConfig } from '@ringpublishing/mui-theme';

function App() {
    const MuiDataGridPart = {
        components: {
            MuiDataGrid: {
                styleOverrides: {
                    root: {
                        backgroundColor: 'red'
                    }
                }
            }
        }
    };

    return (
        <ThemeConfig mode="light" externalComponentsTheme={MuiDataGridPart}>
            <TablePagination
                count={2000}
                rowsPerPage={10}
                page={1}
                component="div"
                onPageChange={() => {
                    //
                }}
            />
        </ThemeConfig>
    );
}
```
