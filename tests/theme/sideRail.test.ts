import { alpha, createTheme, type CSSObject, type Theme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { getTheme } from '../../src/theme/theme';
import type { RingSideRailClassKey, RingSideRailOwnerState } from '../../src/theme/config/next/sideRail';

const SLOTS: RingSideRailClassKey[] = [
    'root',
    'drawer',
    'drawerContent',
    'panel',
    'rail',
    'list',
    'bottomGroup',
    'divider',
    'item'
];

const REST: RingSideRailOwnerState = { drawerOpen: false, drawerVariant: 'push', drawerWidth: 380 };

const slot = (theme: Theme, key: RingSideRailClassKey, ownerState: Partial<RingSideRailOwnerState> = {}): CSSObject => {
    const style = theme.ringComponents.RingSideRail?.[key];

    return (typeof style === 'function'
        ? (style as (props: object) => CSSObject)({ ownerState: { ...REST, ...ownerState }, theme })
        : style) as CSSObject;
};

describe('theme.ringComponents.RingSideRail', () => {
    it.each(['light', 'dark'] as const)('styles every slot of the SideRail in next (%s)', (mode) => {
        const theme = getTheme(mode, { version: 'next' });

        for (const key of SLOTS) {
            expect(slot(theme, key), key).toBeTypeOf('object');
        }
    });

    it('is not drawn in reference', () => {
        const theme = getTheme('light', { version: 'reference' });

        expect(theme.ringComponents.RingSideRail).toBeUndefined();
        expect(theme.ringComponents.RingFileUploader).toBeDefined();
    });

    it('leaves components.RingSideRail to the application', () => {
        expect(getTheme('light', { version: 'next' }).components?.RingSideRail).toBeUndefined();
    });

    it('keeps the base styles when an application sets styleOverrides for a slot', () => {
        const theme = createTheme(getTheme('light', { version: 'next' }), {
            components: { RingSideRail: { styleOverrides: { rail: { width: 56 } } } }
        });

        expect(slot(theme, 'rail')).toMatchObject({ width: 50, borderLeft: `1px solid ${theme.palette.divider}` });
        expect(theme.components?.RingSideRail?.styleOverrides?.rail).toEqual({ width: 56 });
    });

    it('draws a 50px rail with a divider on its left, on the default background', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'rail')).toMatchObject({
            width: 50,
            boxSizing: 'border-box',
            height: '100%',
            borderLeft: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default
        });
    });

    it('lays the scroll buttons over the ends of the list and hides the indicator', () => {
        const theme = getTheme('light', { version: 'next' });
        const list = slot(theme, 'list');
        const buttons = list['& .MuiTabs-scrollButtons'] as CSSObject;

        expect(list).toMatchObject({ position: 'relative', flex: '1 1 0', minHeight: 0 });
        expect(list['& .MuiTabs-indicator']).toEqual({ display: 'none' });
        expect(list['& .MuiTabs-list']).toEqual({ alignItems: 'center', gap: 8, paddingBlock: 4 });
        expect(buttons).toMatchObject({
            'position': 'absolute',
            'top': 0,
            'height': 26,
            'opacity': 1,
            'color': theme.palette.action.active,
            '&.Mui-disabled': { opacity: 0, pointerEvents: 'none' }
        });
        expect(buttons.background).toContain(theme.palette.background.default);
        expect(list['& .MuiTabs-scroller ~ .MuiTabs-scrollButtons']).toMatchObject({ top: 'auto', bottom: 0 });
    });

    it('spaces the bottom group from the list with a 32px divider', () => {
        const theme = getTheme('light', { version: 'next' });

        const group = slot(theme, 'bottomGroup');

        // 4px above the divider plus the top list's 4px; 4px gap plus the tab list's 4px below it.
        expect(group).toMatchObject({ flexShrink: 0, gap: 4, paddingTop: 4 });
        expect(group['& .MuiTabs-list']).toMatchObject({ paddingBlock: 4 });
        expect(slot(theme, 'divider')).toMatchObject({ width: 32, borderColor: theme.palette.divider });
    });

    it('leaves a highlight ring in the bottom group room inside the clipping Tabs, as in the top list', () => {
        const theme = getTheme('light', { version: 'next' });
        const group = slot(theme, 'bottomGroup');

        // As wide as the rail, not as narrow as an item, and the inset inside the tab list rather than around it.
        expect(group).toMatchObject({ alignSelf: 'stretch' });
        expect(group.paddingBottom).toBeUndefined();
        expect(group['& .MuiTabs-root']).toMatchObject({ width: '100%' });
        expect(group['& .MuiTabs-list']).toEqual(slot(theme, 'list')['& .MuiTabs-list']);
    });

    it('rings a focused panel, which an overlay drawer focuses when it opens', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'panel')['&:focus-visible']).toEqual({
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: -2
        });
    });

    it.each(['light', 'dark'] as const)('colours the item states from the action and primary palette (%s)', (mode) => {
        const theme = getTheme(mode, { version: 'next' });
        const { action, primary } = theme.palette;
        const item = slot(theme, 'item');
        const selected = item['&.Mui-selected'] as CSSObject;

        expect(item).toMatchObject({
            width: 40,
            height: 40,
            minWidth: 0,
            minHeight: 0,
            padding: '8px',
            borderRadius: '8px',
            color: action.active,
            fontWeight: 600
        });
        expect(item['&:hover']).toEqual({ backgroundColor: action.hover });
        expect(item['&.Mui-focusVisible']).toMatchObject({ backgroundColor: action.focus });
        expect(selected).toMatchObject({ color: primary.main, backgroundColor: action.selected });
        expect(selected['&:hover']).toEqual({ backgroundColor: action.hover });
        expect(selected['&.Mui-focusVisible']).toMatchObject({
            backgroundColor: alpha(primary.main, action.focusOpacity)
        });
    });

    it('rings a focused item inside its edge, the active and the disabled one too', () => {
        const theme = getTheme('light', { version: 'next' });
        const ring = { outline: `2px solid ${theme.palette.primary.main}`, outlineOffset: -2 };
        const item = slot(theme, 'item');
        const disabled = slot(theme, 'item', { disabled: true });

        expect(item['&.Mui-focusVisible']).toMatchObject(ring);
        expect((item['&.Mui-selected'] as CSSObject)['&.Mui-focusVisible']).toMatchObject(ring);
        expect((disabled['&.Mui-selected'] as CSSObject)['&.Mui-focusVisible']).toMatchObject(ring);
    });

    it('greys a disabled item out without a hover surface', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'item', { disabled: true })).toMatchObject({
            'color': theme.palette.action.disabled,
            '&:hover': { backgroundColor: 'transparent' }
        });
    });

    it('rings a highlighted item in its colour, or in the primary colour without one', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'item')).not.toHaveProperty('&::after');
        expect(slot(theme, 'item', { highlightColor: 'rgb(233, 30, 99)' })).not.toHaveProperty('&::after');
        expect(slot(theme, 'item', { highlighted: true, highlightColor: 'rgb(233, 30, 99)' })['&::after']).toMatchObject({
            inset: -3,
            border: '3px solid rgb(233, 30, 99)',
            borderRadius: 10
        });
        expect(slot(theme, 'item', { highlighted: true })['&::after']).toMatchObject({
            border: `3px solid ${theme.palette.primary.main}`
        });
    });

    it('colours the badge dot only when the item has a badge colour', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'item')).not.toHaveProperty('& .MuiBadge-badge');
        expect(slot(theme, 'item', { badgeColor: 'rgb(46, 125, 50)' })['& .MuiBadge-badge']).toEqual({
            backgroundColor: 'rgb(46, 125, 50)'
        });
    });

    it('sizes the drawer and floats it over the content in the overlay variant', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'drawerContent', { drawerWidth: 320 })).toMatchObject({
            width: 320,
            borderLeft: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.default
        });
        expect(slot(theme, 'drawer')).not.toHaveProperty('position');
        expect(slot(theme, 'drawer', { drawerVariant: 'overlay', drawerOpen: true })).toMatchObject({
            position: 'absolute',
            right: '100%',
            zIndex: theme.zIndex.drawer,
            boxShadow: theme.shadows[8]
        });
        expect(slot(theme, 'drawerContent', { drawerVariant: 'overlay' })).toMatchObject({
            backgroundColor: theme.palette.background.paper
        });
    });

    it('wraps a long word or address in a panel instead of scrolling the drawer sideways', () => {
        expect(slot(getTheme('light', { version: 'next' }), 'panel').overflowWrap).toBe('anywhere');
    });

    it('hides a panel kept mounted in the background', () => {
        expect(slot(getTheme('light', { version: 'next' }), 'panel')['&[hidden]']).toEqual({ display: 'none' });
    });
});
