// Superset schema for `theme.palette.components` across all variants.
// Required fields are shared by all variants; optional fields are variant-specific.

export interface PaletteComponentsMap {
    // Shared fields

    rating: {
        enabledBorder: string;
        activeFill: string;
    };

    tooltip: {
        fill: string;
    };

    backdrop: {
        fill: string;
    };

    appBar: {
        defaultFill: string;
    };

    breadcrumbs: {
        collapseFill: string;
    };

    stepper: {
        connector: string;
    };

    snackbar: {
        fill: string;
    };

    datagrid: {
        border: string;
    };

    dataview: {
        border: string;
    };

    detail: {
        close: {
            background: string;
            hover: string;
        };
    };

    alert: {
        error: { color: string; background: string; };
        warning: { color: string; background: string; };
        info: { color: string; background: string; };
        success: { color: string; background: string; };
    };

    // Variant drift fields

    // `avatar` differs between variants.
    avatar: {
        fill?: string;
        stoneFill?: string;
        skyFill?: string;
        lavenderFill?: string;
        blushFill?: string;
        coralFill?: string;
        peachFill?: string;
        lemonFill?: string;
        sageFill?: string;
        tealFill?: string;
        azureFill?: string;
    };

    // `input` differs between variants.
    input: {
        standard: {
            enabledBorder: string;
            hoverBorder: string;
            disabledBorder?: string;
        };
        filled: {
            enabledFill: string;
            hoverFill: string;
        };
        outlined: {
            enabledBorder: string;
            hoverBorder: string;
            disabledBorder?: string;
        };
    };

    // `switch` differs between variants.
    switch: {
        knobFillEnabled: string;
        knowFillDisabled: string;
        slideFill?: string;
        slideCheckedFill?: string;
        slideUncheckedFill?: string;
    };

    // `chip` differs between variants.
    chip: {
        defaultCloseFill?: string;
        defaultHoverFill?: string;
        defaultEnabledBorder?: string;
        defaultFocusFill?: string;
        outlinedHoverFill?: string;
        outlinedEnabledBorder?: string;
        FocusFill?: string;
        PressedFill?: string;
        outlinedSelectedBorder?: string;
        SelectedFill?: string;
        outlinedEnabledFill?: string;
        filledEnabledFill?: string;
        filledEnabledHover?: string;
    };

    // Variant-only fields

    // `paper` is next-only.
    paper?: {
        [K in `elevation-${number}`]?: string;
    } & {
        outlineBorder?: string;
    };

    // `table` is next-only.
    table?: {
        border: string;
    };

    // `mediaImage` is reference-only.
    mediaImage?: {
        actions: string;
        focusable?: string;
    };

    // `skeleton` is reference-only.
    skeleton?: {
        border: string;
    };
}

// Partial form for `PaletteOptions.components`.
export type PaletteComponentsMapOptions = {
    [K in keyof PaletteComponentsMap]?: Partial<PaletteComponentsMap[K]>;
};
