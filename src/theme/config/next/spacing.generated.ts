export const spacingBase = 8;

export const spacingScale = {
    0.5: 4,
    1: 8,
    1.5: 12,
    2: 16,
    3: 24,
    4: 32,
    5: 40,
    6: 48,
    7: 56,
    8: 64,
    9: 72,
    10: 80,
    11: 88,
    12: 96
} as const;

export type SpacingFactor = keyof typeof spacingScale;

export const spacing = (factor: number): number => factor * 8;
