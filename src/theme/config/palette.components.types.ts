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
        /** @deprecated Use `palette.divider`. */
        border: string;
    };

    dataview: {
        /** @deprecated Use `palette.divider`. */
        border: string;
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

    // `switch` differs between variants — including the disabled knob, whose slot the
    // design file renamed on 2026-08-21. `next` carries the corrected spelling and is what
    // the theme reads; `reference` reads an older Figma library that still emits the typo,
    // so the legacy key stays typed for that generated config alone.
    switch: {
        knobFillEnabled: string;
        knobFillDisabled?: string;
        /** @deprecated Misspelled; use `knobFillDisabled`. */
        knowFillDisabled?: string;
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

    // `overlay` is scoped to `next`. Surface and glyph for anything that sits on top of
    // imagery, where the background underneath gives no contrast.
    overlay?: {
        background: string;
        hover: string;
        selected: string;
        foreground: string;
        selectedForeground: string;
    };

    // `media` is next-only. Fill behind a media asset inside its frame, visible
    // wherever the asset's ratio does not fill it.
    media?: {
        backgroundFill: string;
    };

    // `featuredIcon` is next-only. The circular plate behind a FeaturedIcon glyph, one fill per colour.
    featuredIcon?: {
        defaultFill: string;
        primaryFill: string;
        infoFill: string;
        successFill: string;
        warningFill: string;
        errorFill: string;
    };

    // `fileUploader` is next-only. The FileUploader drop area: a border per state (dashed at rest, on hover and
    // while a file is dragged over it; solid on error) and the drag-over and error fills.
    fileUploader?: {
        enabledBorder: string;
        hoverBorder: string;
        dragOverBorder: string;
        dragOverFill: string;
        errorBorder: string;
        errorFill: string;
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
