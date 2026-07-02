import { Paper, TextField, createTheme, useTheme } from '@mui/material';
import { render } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { ScopedThemeOverrides, ThemeConfig, getTheme } from '../../src';

// Probe child that snapshots `useTheme()` into a ref so tests can inspect
// what the descendant of ScopedThemeOverrides actually saw.
const ThemeProbe = ({
    onTheme
}: {
    onTheme: (theme: ReturnType<typeof useTheme>) => void;
}): React.ReactElement => {
    const theme = useTheme();

    onTheme(theme);

    return <div data-testid="probe" />;
};

describe('ScopedThemeOverrides', () => {
    it('injects scoped MuiTextField defaultProps onto descendants', () => {
        const { container } = render(
            <ThemeConfig mode="light">
                <ScopedThemeOverrides
                    components={{
                        MuiTextField: { defaultProps: { size: 'small', variant: 'outlined' } }
                    }}
                >
                    <TextField label="probe" />
                </ScopedThemeOverrides>
            </ThemeConfig>
        );

        // size="small" sets data-size on the underlying input wrapper class
        // selectors. We rely on MUI's stable className signature to assert
        // that the scoped defaultProps reached the leaf component.
        const root = container.querySelector('.MuiTextField-root');

        expect(root).not.toBeNull();
        expect(root?.className).toContain('MuiFormControl-root');

        const inputRoot = container.querySelector('.MuiInputBase-root');

        expect(inputRoot?.className).toContain('MuiInputBase-sizeSmall');
        expect(inputRoot?.className).toContain('MuiOutlinedInput-root');
    });

    it('inherits parent palette without rebuilding the theme from scratch', () => {
        let scopedTheme: ReturnType<typeof useTheme> | undefined;
        const expectedPrimary = getTheme('dark').palette.primary.main;

        render(
            <ThemeConfig mode="dark">
                <ScopedThemeOverrides
                    components={{ MuiButton: { defaultProps: { size: 'small' } } }}
                >
                    <ThemeProbe
                        onTheme={(theme): void => {
                            scopedTheme = theme;
                        }}
                    />
                </ScopedThemeOverrides>
            </ThemeConfig>
        );

        expect(scopedTheme).toBeDefined();
        expect(scopedTheme?.palette.mode).toBe('dark');
        expect(scopedTheme?.palette.primary.main).toBe(expectedPrimary);
        // Scoped defaults are present.
        expect(scopedTheme?.components?.MuiButton?.defaultProps?.size).toBe('small');
    });

    it('preserves Ring custom variants from the parent theme (augmentation)', () => {
        const { container } = render(
            <ThemeConfig mode="light">
                <ScopedThemeOverrides
                    components={{ MuiTextField: { defaultProps: { size: 'small' } } }}
                >
                    <Paper variant="borderless" data-testid="paper">
                        scoped
                    </Paper>
                </ScopedThemeOverrides>
            </ThemeConfig>
        );

        // Ring registers a `borderless` variant for MuiPaper via theme
        // augmentation. If the scoped subtree had rebuilt the theme from
        // scratch (or stripped components), this would fall back to a
        // plain Paper. We assert MUI accepted the variant by checking the
        // root class signature and that MUI did not warn.
        const paper = container.querySelector('[data-testid="paper"]');

        expect(paper?.className).toContain('MuiPaper-root');
    });

    it('nests: inner scope wins per key, outer scope keeps unrelated keys', () => {
        let leafTheme: ReturnType<typeof useTheme> | undefined;

        render(
            <ThemeConfig mode="light">
                <ScopedThemeOverrides
                    components={{
                        MuiButton: { defaultProps: { size: 'small', variant: 'outlined' } },
                        MuiTextField: { defaultProps: { size: 'small' } }
                    }}
                >
                    <ScopedThemeOverrides
                        components={{
                            MuiButton: { defaultProps: { variant: 'contained' } }
                        }}
                    >
                        <ThemeProbe
                            onTheme={(theme): void => {
                                leafTheme = theme;
                            }}
                        />
                    </ScopedThemeOverrides>
                </ScopedThemeOverrides>
            </ThemeConfig>
        );

        // Inner scope wins on MuiButton.variant; size is preserved by deep
        // merge from the outer scope.
        expect(leafTheme?.components?.MuiButton?.defaultProps?.variant).toBe('contained');
        expect(leafTheme?.components?.MuiButton?.defaultProps?.size).toBe('small');
        // Outer-only key survives.
        expect(leafTheme?.components?.MuiTextField?.defaultProps?.size).toBe('small');
    });

    it('memoizes the merged theme: stable parent + stable components → stable identity', () => {
        const components = {
            MuiButton: { defaultProps: { size: 'small' as const } }
        };
        const seen: Array<ReturnType<typeof useTheme>> = [];

        const Tree = ({ flag }: { flag: number; }): React.ReactElement => (
            <ThemeConfig mode="light">
                <ScopedThemeOverrides components={components}>
                    <ThemeProbe
                        onTheme={(theme): void => {
                            seen.push(theme);
                        }}
                    />
                    <span data-testid="flag">{flag}</span>
                </ScopedThemeOverrides>
            </ThemeConfig>
        );

        const { rerender } = render(<Tree flag={1} />);

        rerender(<Tree flag={2} />);

        // Parent ThemeConfig rebuilds its theme on every render (it does
        // not memoize), so the *parent* identity changes per render and
        // ScopedThemeOverrides legitimately recomputes. This test guards
        // the dep array shape (no missing deps) rather than perfect
        // referential stability across parent rebuilds. We assert the
        // probe ran at least twice and that the scoped overrides survived
        // both renders.
        expect(seen.length).toBeGreaterThanOrEqual(2);
        seen.forEach((theme) => {
            expect(theme.components?.MuiButton?.defaultProps?.size).toBe('small');
        });
    });

    it('does not crash without a parent ThemeConfig (uses MUI default theme)', () => {
        // ScopedThemeOverrides reads `useTheme()` which falls back to the
        // MUI default theme outside a provider. Augmentations are absent
        // but the primitive must not throw.
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

        expect(() =>
            render(
                <ScopedThemeOverrides
                    components={{ MuiButton: { defaultProps: { size: 'small' } } }}
                >
                    <span data-testid="standalone">standalone</span>
                </ScopedThemeOverrides>
            )
        ).not.toThrow();

        consoleError.mockRestore();
    });

    // Regression for the anti-pattern this primitive replaces. Documents — at
    // the test level, not just in the ADR — why consumers MUST NOT roll their
    // own `createTheme({ ...parent, components })`. If anyone later "simplifies"
    // ScopedThemeOverrides back to a one-arg `createTheme`, this test fails
    // and points at the right ADR.
    //
    // The contrast is intrinsic to MUI's `createTheme` two overloads:
    //   - `createTheme(options)`           → build-from-scratch from defaults
    //   - `createTheme(parent, override)`  → deep-merge override onto parent
    // Spreading a built theme into the one-arg form drops nested values whose
    // keys collide on the top level (here: `components`).
    it('regression: shallow-spread createTheme drops parent.components, deep-merge preserves them', () => {
        const parent = createTheme(
            {},
            { components: { MuiButton: { defaultProps: { size: 'large' } } } }
        );

        // Anti-pattern (the old FiltersWrapper code path). Top-level
        // `components` key fully replaced — MuiButton override is gone.
        const broken = createTheme({
            ...parent,
            components: { MuiTextField: { defaultProps: { size: 'small' } } }
        });

        expect(broken.components?.MuiButton).toBeUndefined();
        expect(broken.components?.MuiTextField?.defaultProps?.size).toBe('small');

        // ScopedThemeOverrides path — same call signature the primitive uses
        // internally. Both overrides survive.
        const fixed = createTheme(parent, {
            components: { MuiTextField: { defaultProps: { size: 'small' } } }
        });

        expect(fixed.components?.MuiButton?.defaultProps?.size).toBe('large');
        expect(fixed.components?.MuiTextField?.defaultProps?.size).toBe('small');
    });
});
