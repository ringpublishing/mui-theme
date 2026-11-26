import type { CSSObject, Theme } from '@mui/material/styles';

/**
 * Slots of the Ring `NavigationMenu` (`@ringpublishing/mui-components`). Each slot's own style is
 * `theme.ringComponents.RingNavigationMenu[slot]`, defined here; `theme.components.RingNavigationMenu.styleOverrides`
 * is left to the application and is layered on top, slot by slot.
 */
export type RingNavigationMenuClassKey =
    | 'root'
    | 'list'
    | 'group'
    | 'groupLabel'
    | 'groupList'
    | 'item'
    | 'itemStartIcon'
    | 'itemText'
    | 'itemEndAdornment';

/** The state every `NavigationMenu` slot passes to its style overrides as `ownerState`. */
export interface RingNavigationMenuOwnerState {
    /** Item slots: the item is the current one. */
    selected?: boolean;
}

export type RingNavigationMenuSlotStyle =
    | CSSObject
    | ((props: { ownerState: RingNavigationMenuOwnerState; theme: Theme; }) => CSSObject);

/** The look of every NavigationMenu slot — the component's base styles, owned by the theme. */
export type RingNavigationMenuStyles = Partial<Record<RingNavigationMenuClassKey, RingNavigationMenuSlotStyle>>;

const LIST_RESET: CSSObject = { margin: 0, padding: 0, listStyle: 'none' };

function adornmentColor(theme: Theme, ownerState: RingNavigationMenuOwnerState): string {
    return ownerState.selected ? theme.palette.text.primary : theme.palette.action.active;
}

export function buildNavigationMenuStyles(): RingNavigationMenuStyles {
    return {
        list: LIST_RESET,
        group: ({ theme }) => ({ 'marginTop': theme.spacing(2), '&:first-child': { marginTop: 0 } }),
        groupLabel: ({ theme }) => ({
            display: 'block',
            marginBottom: theme.spacing(1),
            color: theme.palette.text.secondary
        }),
        groupList: LIST_RESET,
        item: ({ theme }) => ({ borderRadius: theme.shape.borderRadius, color: theme.palette.text.primary }),
        itemStartIcon: ({ ownerState, theme }) => ({
            minWidth: theme.spacing(4),
            color: adornmentColor(theme, ownerState)
        }),
        itemText: { overflowWrap: 'break-word' },
        itemEndAdornment: ({ ownerState, theme }) => ({
            display: 'inline-flex',
            alignItems: 'center',
            flexShrink: 0,
            marginLeft: theme.spacing(1),
            color: adornmentColor(theme, ownerState)
        })
    };
}
