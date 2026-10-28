import { describe, expect, it } from 'vitest';

import { getTheme } from '../../src/theme/theme';
import { featuredIcon } from '../../src/theme/config/featuredIcon';

describe('theme.featuredIcon', () => {
    it.each(['next', 'reference'] as const)('%s carries the featured icon sizing rule', (version) => {
        for (const mode of ['light', 'dark'] as const) {
            expect(getTheme(mode, { version }).featuredIcon).toEqual(featuredIcon);
        }
    });

    it('keeps the fixed sizes within the inherit range and the stroke threshold among the glyphs', () => {
        const { sizes, plateMin, plateMax, glyphPerPlate, thinStrokeBelow } = featuredIcon;

        for (const plate of Object.values(sizes)) {
            expect(plate).toBeGreaterThanOrEqual(plateMin);
            expect(plate).toBeLessThanOrEqual(plateMax);
        }

        expect(plateMin * glyphPerPlate).toBeLessThan(thinStrokeBelow);
        expect(thinStrokeBelow).toBeLessThanOrEqual(plateMax * glyphPerPlate);
    });
});
