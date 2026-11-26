import { createTheme, type CSSObject, type Theme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { getTheme } from '../../src/theme/theme';
import type { RingNavigationMenuClassKey, RingNavigationMenuOwnerState } from '../../src/theme/config/navigationMenu';

const SLOTS: RingNavigationMenuClassKey[] = [
    'list',
    'group',
    'groupLabel',
    'groupList',
    'item',
    'itemStartIcon',
    'itemText',
    'itemEndAdornment'
];

const slot = (theme: Theme, key: RingNavigationMenuClassKey, ownerState: RingNavigationMenuOwnerState = {}): CSSObject => {
    const style = theme.ringComponents.RingNavigationMenu[key];

    return (typeof style === 'function'
        ? (style as (props: object) => CSSObject)({ ownerState, theme })
        : style) as CSSObject;
};

describe('theme.ringComponents.RingNavigationMenu', () => {
    it.each(['next', 'reference'] as const)('%s styles every slot of the NavigationMenu but the nav landmark', (version) => {
        const theme = getTheme('light', { version });

        for (const key of SLOTS) {
            expect(slot(theme, key), key).toBeTypeOf('object');
        }
    });

    it.each(['next', 'reference'] as const)('leaves components.RingNavigationMenu to the application (%s)', (version) => {
        expect(getTheme('light', { version }).components?.RingNavigationMenu).toBeUndefined();
    });

    it('darkens the icon and the end adornment of the selected item', () => {
        const theme = getTheme('light', { version: 'next' });

        for (const key of ['itemStartIcon', 'itemEndAdornment'] as const) {
            expect(slot(theme, key).color, key).toBe(theme.palette.action.active);
            expect(slot(theme, key, { selected: true }).color, key).toBe(theme.palette.text.primary);
        }
    });

    it('spaces a group from whatever comes before it, not the first one, with a plain marginTop', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'group')).toEqual({ 'marginTop': theme.spacing(2), '&:first-child': { marginTop: 0 } });
    });

    it('keeps the base styles when an application sets styleOverrides for a slot', () => {
        const theme = createTheme(getTheme('light', { version: 'next' }), {
            components: { RingNavigationMenu: { styleOverrides: { item: { borderRadius: 16 } } } }
        });

        expect(slot(theme, 'item')).toMatchObject({ borderRadius: theme.shape.borderRadius });
        expect(theme.components?.RingNavigationMenu?.styleOverrides?.item).toEqual({ borderRadius: 16 });
    });
});
