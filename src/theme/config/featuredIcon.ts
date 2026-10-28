/**
 * Sizing rule of the featured icon — a glyph centred on a circular plate, shown where content is missing.
 * The fixed sizes are plate diameters. `inherit` sizes the plate from the box it sits in: `platePerShorterSide`
 * of the box's shorter side, kept within `plateMin`–`plateMax`. The glyph is `glyphPerPlate` of the plate;
 * glyphs smaller than `thinStrokeBelow` are drawn with a `thinStroke` line instead of the icons' usual 1.5 px,
 * which reads better at that size. The same for both theme versions.
 */
export interface FeaturedIconMetrics {
    /** Plate diameters of the fixed sizes, px. */
    sizes: { small: number; medium: number; large: number; };
    /** Smallest plate of `inherit`, px. */
    plateMin: number;
    /** Largest plate of `inherit`, px. */
    plateMax: number;
    /** Plate diameter of `inherit` as a share of the shorter side of its box. */
    platePerShorterSide: number;
    /** Glyph size as a share of the plate diameter. */
    glyphPerPlate: number;
    /** Glyphs smaller than this, px, are drawn with `thinStroke`. */
    thinStrokeBelow: number;
    /** Stroke width of the small glyphs, px. */
    thinStroke: number;
}

export const featuredIcon: FeaturedIconMetrics = {
    sizes: { small: 40, medium: 60, large: 80 },
    plateMin: 40,
    plateMax: 120,
    platePerShorterSide: 0.5,
    glyphPerPlate: 0.4,
    thinStrokeBelow: 24,
    thinStroke: 1
};
