export const shape = {
    borderRadius: 4,
    none: 0
};

export const borderRadiusScale = {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24
} as const;

export type BorderRadiusFactor = keyof typeof borderRadiusScale;
