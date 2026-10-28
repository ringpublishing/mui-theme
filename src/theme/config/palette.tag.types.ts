// Tag colours of the design system: `palette.tag.<colour>{Background,Border,Text}`. The
// pipeline exports them for `next` only, which is why the palette slot stays optional.

export const CHIP_TAG_COLORS = [
    'stone', 'sky', 'azure', 'lavender', 'blush', 'coral', 'peach', 'lemon', 'sage', 'teal'
] as const;

export type ChipTagColor = (typeof CHIP_TAG_COLORS)[number];

export type ChipTagPalette = Record<`${ChipTagColor}${'Background' | 'Border' | 'Text'}`, string>;
