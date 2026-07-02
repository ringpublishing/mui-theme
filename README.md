# @ringpublishing/mui-theme

Package includes *Ring Publishing* theme for MUI components.

## Typography units – rem (default) vs deprecated-px

Starting from version **4.4.0**, the default typography uses standard **rem units** (1rem = 16px, browser default). This improves accessibility – components scale with the user's browser font size settings.

**If you are upgrading from an earlier version** and your project includes the legacy CSS hack:

```css
html {
    font-size: 62.5%;
}
```

you have two options:

### Option A – Migrate to rem (recommended)

1. Remove `html { font-size: 62.5%; }` from your global CSS.
2. Review any custom styles that used `rem` values assuming 1rem = 10px and convert them (multiply by 0.625, e.g. `2.4rem` → `1.5rem`).
3. Use the default `<ThemeConfig>` without any extra prop.

### Option B – Stay on deprecated-px mode

Use the `typographyMode="deprecated-px"` prop to keep the previous px-based typography and remain compatible with the `html { font-size: 62.5%; }` setup:

```tsx
<ThemeConfig mode="light" typographyMode="deprecated-px">
    <App />
</ThemeConfig>
```

> ⚠️ `typographyMode="deprecated-px"` is **deprecated** and will be removed in the next major version. It is intended as a temporary bridge to allow gradual migration.

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

## Theme overrides

Use `themeOverrides` to customize palette, typography, spacing, breakpoints, shape, and components.

```tsx
import { ThemeConfig } from '@ringpublishing/mui-theme';

function App() {
    return (
        <ThemeConfig
            mode="light"
            themeOverrides={{
                palette: {
                    primary: { main: '#FF5733' }
                },
                typography: {
                    h1: { fontSize: '4rem' }
                },
                spacing: 4,
                shape: { borderRadius: 16 },
                components: {
                    MuiButton: {
                        defaultProps: { variant: 'outlined' },
                        styleOverrides: {
                            root: { borderRadius: 8 }
                        }
                    }
                }
            }}
        >
            <App />
        </ThemeConfig>
    );
}
```

### Component styleOverrides merge behavior

When overriding components, `styleOverrides` merge depends on the value type:

| Library default | Your override | Result |
|---|---|---|
| object | object | Deep merge — your CSS keys override, rest preserved |
| function | function | **Last-wins** — your function replaces library default entirely |
| function | object | Replacement — your object wins |
| object | function | Replacement — your function wins |

**Object-valued** overrides safely merge CSS properties:

```tsx
// Library default: fontSize: '10px', fontWeight: '400', lineHeight: '14px'
// Your override:
themeOverrides={{
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    fontSize: '14px',  // overrides default 10px
                    color: 'red'       // added — fontWeight and lineHeight preserved
                }
            }
        }
    }
}}
```

**Function-valued** overrides replace the library default completely — you must include all styles you need:

```tsx
// Library default for MuiAccordion root is a function with backgroundColor, minHeight, margin
// Your override must repeat any styles you want to keep:
themeOverrides={{
    components: {
        MuiAccordion: {
            styleOverrides: {
                root: ({ theme }) => ({
                    backgroundColor: theme.palette.grey[100],
                    minHeight: theme.spacing(4),  // must repeat — library default is lost
                    margin: 0                      // must repeat — library default is lost
                })
            }
        }
    }
}}
```

### Deep merge example

Below is a full input/output example showing how `createTheme(base, overrides)` merges component definitions.

**Library defaults (base):**
```ts
components: {
    MuiTooltip: {
        styleOverrides: {
            tooltip: { fontSize: '10px', fontWeight: '400', lineHeight: '14px' }
        }
    },
    MuiTextField: {
        defaultProps: { variant: 'standard' }
    },
    MuiChip: {
        defaultProps: { size: 'small' }
    }
}
```

**Your overrides:**
```ts
themeOverrides={{
    components: {
        MuiTooltip: {
            styleOverrides: {
                tooltip: { fontSize: '14px', color: 'red' }
            }
        },
        MuiTextField: {
            defaultProps: { variant: 'outlined', size: 'small' }
        },
        MuiButton: {
            defaultProps: { variant: 'contained' }
        }
    }
}}
```

**Result after merge:**
```ts
components: {
    // Deep merged — fontSize overridden, color added, fontWeight and lineHeight preserved
    MuiTooltip: {
        styleOverrides: {
            tooltip: { fontSize: '14px', fontWeight: '400', lineHeight: '14px', color: 'red' }
        }
    },
    // Deep merged — variant overridden to 'outlined', size added
    MuiTextField: {
        defaultProps: { variant: 'outlined', size: 'small' }
    },
    // Untouched — no override provided
    MuiChip: {
        defaultProps: { size: 'small' }
    },
    // Added — new component not in base
    MuiButton: {
        defaultProps: { variant: 'contained' }
    }
}
```

## Using `getTheme` directly

If you need the theme object without `ThemeConfig` (e.g. for a custom `ThemeProvider`, SSR, or tests), use `getTheme` with an options object:

```tsx
import { ThemeProvider } from '@mui/material';
import { getTheme } from '@ringpublishing/mui-theme';

function App() {
    const theme = getTheme('light', {
        language: 'plPL',
        themeOverrides: {
            palette: { primary: { main: '#FF5733' } }
        }
    });

    return (
        <ThemeProvider theme={theme}>
            <MyApp />
        </ThemeProvider>
    );
}
```

### `getTheme` options

```ts
getTheme(mode: 'light' | 'dark', options?: GetThemeOptions): Theme
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `language` | `CommonLanguages \| string` | `'enUS'` | Locale for MUI core translations |
| `externalLocales` | `object[]` | `[]` | Additional MUI locale objects (e.g. `xDataGridPl`) |
| `themeOverrides` | `ThemeOverrides` | `{}` | Deep merge overrides for palette, typography, spacing, breakpoints, shape, components |
| `typographyMode` | `'rem' \| 'deprecated-px'` | `'rem'` | Typography unit mode. `'deprecated-px'` is deprecated |
| `externalComponentsTheme` | `object` | `{}` | Deprecated — use `themeOverrides.components` |
| `externalColors` | `object` | `{}` | Deprecated — use `themeOverrides.palette` |

### Examples

```ts
// Minimal
const theme = getTheme('light');

// With language
const theme = getTheme('dark', { language: 'plPL' });

// With typography mode for legacy projects using html { font-size: 62.5% }
const theme = getTheme('light', { typographyMode: 'deprecated-px' });

// With theme overrides
const theme = getTheme('light', {
    language: 'plPL',
    themeOverrides: {
        palette: { primary: { main: '#FF5733' } },
        spacing: 4,
        components: {
            MuiButton: { defaultProps: { variant: 'outlined' } }
        }
    }
});

// With external locales
const theme = getTheme('light', {
    language: 'plPL',
    externalLocales: [xDataGridPl, zhCN]
});
```

> **Migration from positional arguments:** The old positional signature `getTheme(mode, language, externalComponentsTheme, externalLocales, externalColors, themeOverrides, typographyMode)` is deprecated and logs a console warning.

## With custom components theme fragment (deprecated)

> **Deprecated**: Use `themeOverrides.components` instead. The `externalComponentsTheme` prop uses spread (`...`) which silently drops your overrides for components already defined in the library.

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
