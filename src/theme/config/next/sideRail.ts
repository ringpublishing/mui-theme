// Side rail surfaces for the `next` theme: the 50px rail of icon tabs on the right edge of a view and the drawer it
// opens to its left.
//
// The Ring `SideRail` (`@ringpublishing/mui-components`) reads each slot's style from
// `theme.ringComponents.RingSideRail[slot]`; `theme.components.RingSideRail.styleOverrides` is left to the
// application and is layered on top, slot by slot. The rail is MUI `Tabs`, so the tabs, scroll buttons and indicator
// are styled from inside the `list` and `bottomGroup` slots: an application's own `MuiTabs` keep their look.

import { alpha, type CSSObject, type Theme } from '@mui/material/styles';

/** Slots of the Ring `SideRail`. */
export type RingSideRailClassKey =
    | 'root'
    | 'drawer'
    | 'drawerContent'
    | 'panel'
    | 'rail'
    | 'list'
    | 'bottomGroup'
    | 'divider'
    | 'item';

/**
 * How the drawer takes its room: `push` sits beside the rail and narrows the content next to it, `overlay` floats over
 * that content.
 */
export type RingSideRailDrawerVariant = 'push' | 'overlay';

/** The state every `SideRail` slot passes to its style overrides as `ownerState`. */
export interface RingSideRailOwnerState {
    /** A drawer is open: an item, or an id without an item, is active. */
    drawerOpen: boolean;
    drawerVariant: RingSideRailDrawerVariant;
    /** Width of the open drawer, in pixels. */
    drawerWidth: number;
    /** Item slot: the item's drawer is the open one. */
    active?: boolean;
    /** Item slot: the item cannot be activated. It keeps its tooltip, so it is not a native `disabled` button. */
    disabled?: boolean;
    /** Item slot: the item has a ring drawn around it. */
    highlighted?: boolean;
    /** Item slot: CSS colour of the ring of a `highlighted` item; without it the ring takes the primary colour. */
    highlightColor?: string;
    /** Item slot: CSS colour of the item's badge dot; without it the dot takes the primary colour. */
    badgeColor?: string;
}

export type RingSideRailSlotStyle =
    | CSSObject
    | ((props: { ownerState: RingSideRailOwnerState; theme: Theme; }) => CSSObject);

/** The look of every SideRail slot — the component's base styles, owned by the theme. */
export type RingSideRailStyles = Partial<Record<RingSideRailClassKey, RingSideRailSlotStyle>>;

/** Rail width, the 1px left border included. */
const RAIL_WIDTH = 50;
const ITEM_SIZE = 40;
/** Rail edge → first and last item. Inside the scrolled list, so a highlight ring is not cut off at the ends. */
const RAIL_INSET = 4;
const ITEM_GAP = 8;
const DIVIDER_WIDTH = 32;
const SCROLL_BUTTON_HEIGHT = 26;
const SCROLL_ICON_SIZE = 16;
/** The highlight ring: drawn outside the item, with corners 2px rounder than the item's. */
const RING_WIDTH = 3;
const RING_RADIUS = 10;
/** The keyboard focus ring of an item or a panel: drawn inside its edge, clear of the highlight ring and of clipping. */
const FOCUS_RING_WIDTH = 2;

const TABS_LIST: CSSObject = { alignItems: 'center', gap: ITEM_GAP };

/**
 * Tabs laid out as a centred column of items: no indicator, no 48px minimum height. `Tabs` clips its content, so the
 * inset that leaves room for a highlight ring lies inside the tab list.
 */
const tabsColumn: CSSObject = {
    '& .MuiTabs-root': { minHeight: 0, width: '100%' },
    '& .MuiTabs-indicator': { display: 'none' },
    '& .MuiTabs-list': { ...TABS_LIST, paddingBlock: RAIL_INSET }
};

/**
 * The scroll buttons lie over the ends of the list instead of taking room from it: a chevron on a fade from the rail's
 * background, shown only on the side where more items are.
 */
function scrollButtons(theme: Theme): CSSObject {
    const surface = theme.palette.background.default;
    const clear = alpha(surface, 0);

    return {
        '& .MuiTabs-scrollButtons': {
            'position': 'absolute',
            'zIndex': 1,
            'top': 0,
            'left': 0,
            'right': 0,
            'width': 'auto',
            'height': SCROLL_BUTTON_HEIGHT,
            // An icon sized in `em` and a plain svg come out the same.
            'fontSize': SCROLL_ICON_SIZE,
            // The chevron is the full `action.active`, not MUI's 80% of it.
            'opacity': 1,
            'color': theme.palette.action.active,
            'background': `linear-gradient(to bottom, ${surface} 0%, ${surface} 75%, ${clear} 100%)`,
            '& svg': { width: SCROLL_ICON_SIZE, height: SCROLL_ICON_SIZE },
            // Hidden on the side with no more items; it must not catch the clicks meant for the item under it.
            '&.Mui-disabled': { opacity: 0, pointerEvents: 'none' }
        },
        // The end button is rendered after the scroller.
        '& .MuiTabs-scroller ~ .MuiTabs-scrollButtons': {
            top: 'auto',
            bottom: 0,
            background: `linear-gradient(to bottom, ${clear} 0%, ${surface} 25%, ${surface} 100%)`
        }
    };
}

function itemStyles(theme: Theme, ownerState: RingSideRailOwnerState): CSSObject {
    const { palette } = theme;
    // The tint alone is too faint to find the focus by, on the active item above all, so a ring goes with it.
    const focusRing: CSSObject = {
        outline: `${FOCUS_RING_WIDTH}px solid ${palette.primary.main}`,
        outlineOffset: -FOCUS_RING_WIDTH
    };
    const selected: CSSObject = {
        'color': palette.primary.main,
        'backgroundColor': palette.action.selected,
        // The design keeps the neutral hover on the active item.
        '&:hover': { backgroundColor: palette.action.hover },
        '&.Mui-focusVisible': {
            ...focusRing,
            backgroundColor: alpha(palette.primary.main, palette.action.focusOpacity)
        }
    };

    return {
        // Initials of a plugin or an extension stand where the icon would, in body1 semibold — which `subtitle1` is.
        ...theme.typography.subtitle1,
        'boxSizing': 'border-box',
        'flexShrink': 0,
        'width': ITEM_SIZE,
        'height': ITEM_SIZE,
        'minWidth': 0,
        'minHeight': 0,
        'maxWidth': 'none',
        'padding': theme.getSpacing(1),
        'borderRadius': theme.getBorderRadius(2),
        'textTransform': 'none',
        'opacity': 1,
        'color': palette.action.active,
        // The highlight ring is drawn outside the item; the ripple keeps to the item on its own.
        'overflow': 'visible',
        '&:hover': { backgroundColor: palette.action.hover },
        '&.Mui-focusVisible': { ...focusRing, backgroundColor: palette.action.focus },
        '&.Mui-selected': selected,
        ...(ownerState.disabled && {
            'color': palette.action.disabled,
            'cursor': 'default',
            '&:hover': { backgroundColor: 'transparent' },
            // Disabled while its drawer is open: the active surface still shows whose panel is open, but the icon is
            // greyed out and nothing changes on hover.
            '&.Mui-selected': {
                ...selected,
                'color': palette.action.disabled,
                '&:hover': { backgroundColor: palette.action.selected }
            }
        }),
        ...(ownerState.badgeColor && {
            '& .MuiBadge-badge': { backgroundColor: ownerState.badgeColor }
        }),
        ...(ownerState.highlighted && {
            '&::after': {
                content: '""',
                position: 'absolute',
                inset: -RING_WIDTH,
                border: `${RING_WIDTH}px solid ${ownerState.highlightColor ?? palette.primary.main}`,
                borderRadius: RING_RADIUS,
                pointerEvents: 'none'
            }
        })
    };
}

export function buildSideRailStyles(): RingSideRailStyles {
    return {
        root: {
            position: 'relative',
            display: 'flex',
            flexShrink: 0,
            height: '100%',
            minHeight: 0
        },
        drawer: ({ ownerState, theme }) => ({
            'flexShrink': 0,
            'height': '100%',
            '& .MuiCollapse-wrapper, & .MuiCollapse-wrapperInner': { height: '100%' },
            ...(ownerState.drawerVariant === 'overlay' && {
                position: 'absolute',
                top: 0,
                bottom: 0,
                // The root is only as wide as the rail, so the drawer opens from the rail's left edge over the content.
                right: '100%',
                zIndex: theme.zIndex.drawer,
                ...(ownerState.drawerOpen && { boxShadow: theme.shadows[8] })
            })
        }),
        drawerContent: ({ ownerState, theme }) => ({
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
            width: ownerState.drawerWidth,
            // An overlay drawer never covers the rail, however narrow the view.
            maxWidth: ownerState.drawerVariant === 'overlay' ? `calc(100vw - ${RAIL_WIDTH}px)` : 'none',
            height: '100%',
            overflow: 'hidden',
            borderLeft: `1px solid ${theme.palette.divider}`,
            backgroundColor: ownerState.drawerVariant === 'overlay'
                ? theme.palette.background.paper
                : theme.palette.background.default
        }),
        // Panels bring their own padding; a plugin frame fills the drawer edge to edge.
        panel: ({ theme }) => ({
            'display': 'flex',
            'flexDirection': 'column',
            'flex': '1 1 auto',
            'minHeight': 0,
            'overflowY': 'auto',
            // Ids, addresses and long words have no natural break points; the fixed-width drawer wraps them instead of
            // scrolling sideways.
            'overflowWrap': 'anywhere',
            // `display: flex` would otherwise show a panel kept mounted in the background.
            '&[hidden]': { display: 'none' },
            // An overlay drawer takes the focus into the panel it opens; the ring shows where the focus went.
            '&:focus-visible': {
                outline: `${FOCUS_RING_WIDTH}px solid ${theme.palette.primary.main}`,
                outlineOffset: -FOCUS_RING_WIDTH
            }
        }),
        rail: ({ theme }) => ({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxSizing: 'border-box',
            flexShrink: 0,
            width: RAIL_WIDTH,
            height: '100%',
            borderLeft: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default
        }),
        // The top list fills the rail down to the bottom group and scrolls on its own, without a scrollbar.
        list: ({ theme }) => ({
            'position': 'relative',
            'flex': '1 1 0',
            'minHeight': 0,
            'width': '100%',
            '& .MuiTabs-indicator': { display: 'none' },
            '& .MuiTabs-list': { ...TABS_LIST, paddingBlock: RAIL_INSET },
            ...scrollButtons(theme)
        }),
        // Pinned under the list, as wide as the rail so that a highlight ring has room on both sides. The top list's
        // inset and this one space the divider 8px from the last item above; the gap and the tab list's own inset
        // space it 8px from the first item below.
        bottomGroup: {
            ...tabsColumn,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            alignSelf: 'stretch',
            flexShrink: 0,
            gap: ITEM_GAP - RAIL_INSET,
            paddingTop: RAIL_INSET
        },
        divider: ({ theme }) => ({
            width: DIVIDER_WIDTH,
            flexShrink: 0,
            borderColor: theme.palette.divider
        }),
        item: ({ ownerState, theme }) => itemStyles(theme, ownerState)
    };
}
