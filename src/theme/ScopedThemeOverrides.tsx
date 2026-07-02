import React, { useMemo } from 'react';
import {
    Components,
    Theme,
    ThemeProvider,
    createTheme,
    useTheme
} from '@mui/material';

export interface ScopedThemeOverridesProps {
    /** Per-component overrides on inherited theme components; use `ThemeConfig` for palette/typography/spacing. */
    components: Components<Omit<Theme, 'components'>>;
    children: React.ReactNode;
}

/** Scoped `components` overrides using parent theme as a base. */
export function ScopedThemeOverrides({
    components,
    children
}: ScopedThemeOverridesProps): React.ReactElement {
    const parent = useTheme();
    const merged = useMemo(
        () => createTheme(parent, { components }),
        [parent, components]
    );

    return <ThemeProvider theme={merged}>{children}</ThemeProvider>;
}
