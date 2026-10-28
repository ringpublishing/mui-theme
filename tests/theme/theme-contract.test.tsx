import { describe, expect, it } from 'vitest';
import { getTheme } from '../../src';

// Snapshot of the resolved theme *contract*: only serializable,
// this-repo-owned branches (tokens compiled from config/), so a diff always
// points at a change in this package — never at an MUI/MUI X release.
// JSON round-trip strips MUI helper functions (augmentColor, getContrastText)
// so the snapshot holds token values only. An intended token change (Figma
// re-export) is expected to touch the snapshot: update with `vitest -u` and
// let the diff document the change in the PR.
const pickContract = (theme: Record<string, unknown>): Record<string, unknown> => {
    const { palette, typography, shape, colors, typographyMode, locale, featuredIcon } = theme as never;
    const breakpoints = (theme as { breakpoints: { values: unknown; }; }).breakpoints.values;

    return JSON.parse(JSON.stringify(
        { locale, typographyMode, shape, breakpoints, palette, typography, colors, featuredIcon }
    ));
};

describe('theme contract', () => {
    const versions = ['reference', 'next'] as const;
    const modes = ['light', 'dark'] as const;

    for (const version of versions) {
        for (const mode of modes) {
            it(`${version}/${mode} resolves to a stable token contract`, () => {
                expect(pickContract(getTheme(mode, { version }))).toMatchSnapshot();
            });
        }
    }
});
