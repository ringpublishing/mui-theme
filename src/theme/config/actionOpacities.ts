import type { PaletteMode } from '@mui/material';

// Numeric action opacity values used by MUI TypeAction, for `reference` (MUI's defaults) and the
// two Ring-only keys of both variants. Under `next` the five MUI keys come from
// `next/opacity.generated.ts` and override these.

interface ActionOpacities {
    hoverOpacity: number;
    selectedOpacity: number;
    disabledOpacity: number;
    focusOpacity: number;
    focusVisibleOpacity: number;
    activatedOpacity: number;
    outlinedBorderOpacity: number;
}

export const actionOpacities: Record<PaletteMode, ActionOpacities> = {
    light: {
        hoverOpacity: 0.04,
        selectedOpacity: 0.08,
        disabledOpacity: 0.38,
        focusOpacity: 0.12,
        focusVisibleOpacity: 0.30,
        activatedOpacity: 0.12,
        outlinedBorderOpacity: 0.50
    },
    dark: {
        hoverOpacity: 0.08,
        selectedOpacity: 0.16,
        disabledOpacity: 0.38,
        focusOpacity: 0.12,
        focusVisibleOpacity: 0.30,
        activatedOpacity: 0.24,
        outlinedBorderOpacity: 0.50
    }
};
