import type { PaletteMode } from '@mui/material';

// Numeric action opacity values used by MUI TypeAction.
// Adjust here without touching token generation.

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
