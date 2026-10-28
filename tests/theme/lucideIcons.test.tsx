import {
    Accordion,
    AccordionSummary,
    Alert,
    Autocomplete,
    MenuItem,
    TextField,
    ThemeProvider,
    type Theme
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { render } from '@testing-library/react';
import { LucideProvider } from 'lucide-react';
import React from 'react';
import { describe, expect, it } from 'vitest';
import { getTheme } from '../../src';
import { ringDataGridOverrides } from '../../src/theme-mui-x';
import { rulesFor, styleFor } from './helpers/emotionRules';

const next = getTheme('light', { version: 'next' });
const reference = getTheme('light', { version: 'reference' });

const renderSelectIcon = (
    theme = next,
    props: Partial<React.ComponentProps<typeof TextField>> = {}
): Element => {
    const { container } = render(
        <ThemeProvider theme={theme}>
            <TextField
                select={true}
                label="Date"
                value="a"
                {...props}
            >
                <MenuItem value="a">Publication</MenuItem>
            </TextField>
        </ThemeProvider>
    );

    return container.querySelector('.MuiSelect-icon') as Element;
};

// `styleFor` keys on the state written after the element's own class; these rules key on an
// ancestor written before it (`.MuiOutlinedInput-root .css-…`), so they are matched whole.
const declaredUnder = (el: Element, ancestor: string, prop: string): string | undefined => {
    const { own, rules } = rulesFor(el);

    return rules
        .filter((r) => r.media === null && r.selector.split(',').map((p) => p.trim()).includes(`${ancestor} .${own}`))
        .flatMap((r) => r.body.split(';'))
        .map((d) => d.trim())
        .filter((d) => d.startsWith(`${prop}:`))
        .map((d) => d.slice(prop.length + 1).trim())
        .at(-1);
};

describe('Select in next', () => {
    it('draws lucide chevron-down instead of the MUI triangle', () => {
        const icon = renderSelectIcon();

        expect(icon.tagName.toLowerCase()).toBe('svg');
        expect(icon.getAttribute('class')).toContain('lucide-chevron-down');
        expect(icon.getAttribute('data-testid')).not.toBe('ArrowDropDownIcon');
    });

    it('sizes the glyph like every field glyph and places it where Autocomplete draws its chevron', () => {
        const icon = renderSelectIcon();

        expect(styleFor(icon, '', 'width')).toBe('20px');
        expect(styleFor(icon, '', 'height')).toBe('20px');
        expect(styleFor(icon, '', 'top')).toBe('calc(50% - 10px)');
        expect(declaredUnder(icon, '.MuiOutlinedInput-root', 'right')).toBe('11px');
        expect(declaredUnder(icon, '.MuiOutlinedInput-root.MuiInputBase-sizeSmall', 'right')).toBe('9px');
        expect(declaredUnder(icon, '.MuiInput-root', 'right')).toBe('2px');
    });

    it('keeps the IconComponent a consumer passes', () => {
        const Own = (props: React.SVGProps<SVGSVGElement>): React.JSX.Element => <svg data-testid="own" {...props} />;
        const icon = renderSelectIcon(next, { slotProps: { select: { IconComponent: Own } } });

        expect(icon.getAttribute('data-testid')).toBe('own');
    });

    it('leaves the reference theme on the MUI triangle', () => {
        const icon = renderSelectIcon(reference);

        expect(icon.getAttribute('data-testid')).toBe('ArrowDropDownIcon');
    });
});

const renderAutocomplete = (
    theme = next,
    props: Partial<React.ComponentProps<typeof Autocomplete>> = {}
): Element => {
    const { container } = render(
        <ThemeProvider theme={theme}>
            <Autocomplete
                options={['PAP', 'Reuters']}
                defaultValue="PAP"
                renderInput={(params): React.JSX.Element => <TextField {...params} label="Source" />}
                {...props}
            />
        </ThemeProvider>
    );

    return container.querySelector('.MuiAutocomplete-root') as Element;
};

const glyphOf = (root: Element, indicator: string): Element =>
    root.querySelector(`.MuiAutocomplete-${indicator} svg`) as Element;

describe('Autocomplete in next', () => {
    it('opens with lucide chevron-down and clears with lucide x, at the 20px field glyph', () => {
        const root = renderAutocomplete();

        for (const [indicator, glyph] of [['popupIndicator', 'lucide-chevron-down'], ['clearIndicator', 'lucide-x']]) {
            const svg = glyphOf(root, indicator);

            expect(svg.getAttribute('class')).toContain(glyph);
            expect(svg.getAttribute('width')).toBe('20');
            expect(svg.getAttribute('height')).toBe('20');
        }
    });

    // The theme sets no stroke, so an application's `LucideProvider` (the component library's
    // `RingIconDefaults`) decides it, as it does for every other lucide icon on the page.
    it('takes the stroke from the LucideProvider around it', () => {
        const { container } = render(
            <LucideProvider strokeWidth={3}>
                <ThemeProvider theme={next}>
                    <Autocomplete
                        options={['PAP']}
                        defaultValue="PAP"
                        renderInput={(params): React.JSX.Element => <TextField {...params} label="Source" />}
                    />
                    <TextField select={true} label="Date" value="a">
                        <MenuItem value="a">Publication</MenuItem>
                    </TextField>
                </ThemeProvider>
            </LucideProvider>
        );

        for (const selector of ['.MuiAutocomplete-popupIndicator svg', '.MuiAutocomplete-clearIndicator svg', '.MuiSelect-icon']) {
            expect(container.querySelector(selector)?.getAttribute('stroke-width')).toBe('3');
        }
    });

    it('keeps the icons a consumer passes', () => {
        const root = renderAutocomplete(next, {
            popupIcon: <svg data-testid="own-popup" />,
            clearIcon: <svg data-testid="own-clear" />
        });

        expect(glyphOf(root, 'popupIndicator').getAttribute('data-testid')).toBe('own-popup');
        expect(glyphOf(root, 'clearIndicator').getAttribute('data-testid')).toBe('own-clear');
    });

    it('leaves the reference theme on the MUI icons', () => {
        const root = renderAutocomplete(reference);

        expect(glyphOf(root, 'popupIndicator').getAttribute('data-testid')).toBe('ArrowDropDownIcon');
        expect(glyphOf(root, 'clearIndicator').getAttribute('data-testid')).toBe('CloseIcon');
    });
});

type SlotIcon = React.ComponentType<{ ownerState?: unknown; 'data-testid'?: string; sx?: object; }>;

const pickerSlots = (theme: Theme, key: string): Record<string, SlotIcon> =>
    ((theme.components as Record<string, { defaultProps?: { slots?: Record<string, SlotIcon>; }; }>)[key]
        ?.defaultProps?.slots ?? {});

const renderSlot = (Icon: SlotIcon): Element => {
    const { container } = render(<Icon ownerState={{ open: false }} data-testid="slot" />);

    return container.querySelector('[data-testid="slot"]') as Element;
};

// MUI X types the field and calendar slot icons as `SvgIcon` props, so `slotProps` may hand one `sx`,
// as it could the MUI X icon the slot replaces.
const expectSxApplied = (Icon: SlotIcon): void => {
    const { container } = render(
        <ThemeProvider theme={next}>
            <Icon ownerState={{ open: false }} sx={{ color: 'rgb(255, 0, 0)' }} />
        </ThemeProvider>
    );
    const svg = container.querySelector('svg') as Element;

    expect(svg.getAttributeNames().map((name) => name.toLowerCase()), Icon.displayName).not.toContain('sx');
    expect(styleFor(svg, '', 'color'), Icon.displayName).toBe('rgb(255, 0, 0)');
};

// Rendering a picker needs a date adapter, which is not a dependency of this package; the pickers
// themselves are rendered with these slots in the component library.
describe('date and time pickers in next', () => {
    const datePickers = [
        'MuiDatePicker',
        'MuiDesktopDatePicker',
        'MuiMobileDatePicker',
        'MuiDateTimePicker',
        'MuiDesktopDateTimePicker',
        'MuiMobileDateTimePicker'
    ];
    const timePickers = ['MuiTimePicker', 'MuiDesktopTimePicker', 'MuiMobileTimePicker'];

    it.each(datePickers)('%s opens with lucide calendar-days and clears with lucide x', (key) => {
        const slots = pickerSlots(next, key);

        expect(renderSlot(slots.openPickerIcon).getAttribute('class')).toContain('lucide-calendar-days');
        expect(renderSlot(slots.clearIcon).getAttribute('class')).toContain('lucide-x');
    });

    it.each(timePickers)('%s opens with lucide clock and clears with lucide x', (key) => {
        const slots = pickerSlots(next, key);

        expect(renderSlot(slots.openPickerIcon).getAttribute('class')).toContain('lucide-clock');
        expect(renderSlot(slots.clearIcon).getAttribute('class')).toContain('lucide-x');
    });

    it('drops the ownerState MUI X hands a field icon, instead of writing it onto the svg', () => {
        const svg = renderSlot(pickerSlots(next, 'MuiDatePicker').openPickerIcon);

        expect(svg.getAttributeNames().map((name) => name.toLowerCase())).not.toContain('ownerstate');
    });

    it('draws the calendar header and month arrows with lucide chevrons', () => {
        const header = pickerSlots(next, 'MuiPickersCalendarHeader');
        const arrows = pickerSlots(next, 'MuiPickersArrowSwitcher');

        expect(renderSlot(header.switchViewIcon).getAttribute('class')).toContain('lucide-chevron-down');
        expect(renderSlot(arrows.leftArrowIcon).getAttribute('class')).toContain('lucide-chevron-left');
        expect(renderSlot(arrows.rightArrowIcon).getAttribute('class')).toContain('lucide-chevron-right');
    });

    it('applies the sx slotProps hand a field, calendar header or month arrow icon', () => {
        const icons = ['MuiDatePicker', 'MuiTimePicker', 'MuiPickersCalendarHeader', 'MuiPickersArrowSwitcher']
            .flatMap((key) => Object.values(pickerSlots(next, key)));

        expect(icons).toHaveLength(7);
        icons.forEach(expectSxApplied);
    });

    it('leaves the reference theme on the MUI X icons', () => {
        for (const key of [...datePickers, ...timePickers, 'MuiPickersCalendarHeader', 'MuiPickersArrowSwitcher']) {
            expect(pickerSlots(reference, key)).toEqual({});
        }
    });
});

describe('tree views in next', () => {
    // `@mui/x-tree-view` is not a dependency of this package: the keys are checked here, the trees
    // they change are rendered in the component library.
    it.each(['MuiSimpleTreeView', 'MuiRichTreeView'])('%s expands with lucide chevron-right and collapses with chevron-down', (key) => {
        const slots = pickerSlots(next, key);

        expect(renderSlot(slots.expandIcon).getAttribute('class')).toContain('lucide-chevron-right');
        expect(renderSlot(slots.collapseIcon).getAttribute('class')).toContain('lucide-chevron-down');
        // The item's icon container sizes MUI X's own chevrons with its font size.
        expect(renderSlot(slots.expandIcon).getAttribute('width')).toBe('1em');
        // The container is narrower than `1em`; a shrinkable `<svg>` would be squeezed below the chevron's size.
        expect((renderSlot(slots.expandIcon) as SVGElement).style.flexShrink).toBe('0');
        expect((renderSlot(slots.collapseIcon) as SVGElement).style.flexShrink).toBe('0');
    });

    it.each(['expandIcon', 'collapseIcon'])('drops the ownerState MUI X hands the %s, instead of writing it onto the svg', (slot) => {
        const svg = renderSlot(pickerSlots(next, 'MuiSimpleTreeView')[slot]);

        expect(svg.getAttributeNames().map((name) => name.toLowerCase())).not.toContain('ownerstate');
    });

    it('leaves the item key alone, so an icon passed to a tree view still wins', () => {
        expect(pickerSlots(next, 'MuiTreeItem')).toEqual({});
    });

    it('leaves the reference theme on the MUI X chevrons', () => {
        expect(pickerSlots(reference, 'MuiSimpleTreeView')).toEqual({});
        expect(pickerSlots(reference, 'MuiRichTreeView')).toEqual({});
    });
});

const renderAlert = (theme: Theme, props: Partial<React.ComponentProps<typeof Alert>> = {}): Element => {
    const { container } = render(
        <ThemeProvider theme={theme}>
            <Alert {...props}>Saved</Alert>
        </ThemeProvider>
    );

    return container.querySelector('.MuiAlert-icon > *') as Element;
};

describe('Alert in next', () => {
    it.each([
        ['error', 'lucide-circle-alert'],
        ['info', 'lucide-info'],
        ['success', 'lucide-circle-check'],
        ['warning', 'lucide-triangle-alert']
    ] as const)('marks %s with %s', (severity, glyph) => {
        expect(renderAlert(next, { severity }).getAttribute('class')).toContain(glyph);
    });

    it('keeps the icon a consumer passes', () => {
        expect(renderAlert(next, { severity: 'error', icon: <svg data-testid="own" /> }).getAttribute('data-testid')).toBe('own');
    });

    it('leaves the reference theme on the MUI icons', () => {
        expect(renderAlert(reference, { severity: 'error' }).getAttribute('data-testid')).toBe('ErrorOutlineIcon');
    });
});

const renderSummary = (theme: Theme, props: Partial<React.ComponentProps<typeof AccordionSummary>> = {}): Element | null => {
    const { container } = render(
        <ThemeProvider theme={theme}>
            <Accordion>
                <AccordionSummary {...props}>Details</AccordionSummary>
            </Accordion>
        </ThemeProvider>
    );

    return container.querySelector('.MuiAccordionSummary-expandIconWrapper');
};

describe('AccordionSummary in next', () => {
    it('expands with lucide chevron-down at 1em of a 20px wrapper', () => {
        const wrapper = renderSummary(next) as Element;
        const svg = wrapper.querySelector('svg');

        expect(svg?.getAttribute('class')).toContain('lucide-chevron-down');
        expect(svg?.getAttribute('width')).toBe('1em');
        expect(styleFor(wrapper, '', 'font-size')).toBe('1.25rem');
    });

    it('keeps the expandIcon a consumer passes', () => {
        const wrapper = renderSummary(next, { expandIcon: <svg data-testid="own" /> }) as Element;

        expect(wrapper.querySelector('[data-testid="own"]')).not.toBeNull();
        expect(wrapper.querySelector('.lucide')).toBeNull();
    });

    it('renders no icon when a consumer passes expandIcon={null}', () => {
        expect(renderSummary(next, { expandIcon: null })).toBeNull();
    });

    it('leaves the reference theme without a default expand icon', () => {
        expect(renderSummary(reference)).toBeNull();
    });
});

const renderGrid = (theme: Theme, props: Partial<React.ComponentProps<typeof DataGrid>> = {}): HTMLElement => {
    const { container } = render(
        <ThemeProvider theme={theme}>
            <div style={{ width: 400, height: 300 }}>
                <DataGrid
                    rows={[{ id: 1, name: 'b', age: 2 }, { id: 2, name: 'a', age: 1 }]}
                    columns={[{ field: 'name', width: 100 }, { field: 'age', width: 100 }]}
                    initialState={{ sorting: { sortModel: [{ field: 'name', sort: 'desc' }] } }}
                    disableVirtualization={true}
                    {...props}
                />
            </div>
        </ThemeProvider>
    );

    return container;
};

const headerIcons = (container: HTMLElement, field: string): string[] =>
    Array.from(container.querySelectorAll(`.MuiDataGrid-columnHeader[data-field="${field}"] svg`))
        .map((svg) => svg.getAttribute('data-testid') ?? svg.getAttribute('class') ?? '');

describe('Data Grid icons', () => {
    // The component library passes `ringDataGridOverrides` through `themeOverrides.components`.
    const withGrid = (version: 'next' | 'reference', components: object = {}): Theme =>
        getTheme('light', { version, themeOverrides: { components: { ...ringDataGridOverrides, ...components } } });

    const expectLucide = (container: HTMLElement): void => {
        const sorted = headerIcons(container, 'name');
        // An unsorted column draws the arrow of its next sort direction through the sorted slots.
        const unsorted = headerIcons(container, 'age');

        expect(sorted.some((c) => c.includes('lucide-arrow-down'))).toBe(true);
        expect(sorted.some((c) => c.includes('lucide-ellipsis-vertical'))).toBe(true);
        expect(unsorted.some((c) => c.includes('lucide-arrow-up'))).toBe(true);

        for (const icons of [sorted, unsorted]) {
            expect(icons).not.toContain('ArrowUpwardIcon');
            expect(icons).not.toContain('ArrowDownwardIcon');
            expect(icons).not.toContain('TripleDotsVerticalIcon');
        }
    };

    it('next sorts and opens the column menu with lucide glyphs, with ringDataGridOverrides merged in', () => {
        const container = renderGrid(withGrid('next'));

        expectLucide(container);
        // `hideFooter` from ringDataGridOverrides survives the merge.
        expect(container.querySelector('.MuiDataGrid-footerContainer')).toBeNull();
    });

    it('next gives a bare grid the same glyphs', () => {
        expectLucide(renderGrid(next));
    });

    it('reference keeps the MUI X icons', () => {
        const container = renderGrid(withGrid('reference'));

        expect(headerIcons(container, 'name')).toContain('ArrowDownwardIcon');
        expect(headerIcons(container, 'name')).toContain('TripleDotsVerticalIcon');
        expect(headerIcons(container, 'age')).toContain('ArrowUpwardIcon');
        expect(container.querySelector('.MuiDataGrid-root .lucide')).toBeNull();
    });

    it.each(['next', 'reference'] as const)('keeps the slots a consumer passes to the grid (%s)', (version) => {
        const Own = (): React.JSX.Element => <svg data-testid="own-desc" />;
        const container = renderGrid(withGrid(version), { slots: { columnSortedDescendingIcon: Own } });

        expect(headerIcons(container, 'name')).toContain('own-desc');
    });

    it('keeps the slots a consumer sets in themeOverrides.components', () => {
        const Own = (): React.JSX.Element => <svg data-testid="own-menu" />;
        const theme = withGrid('next', {
            MuiDataGrid: { ...ringDataGridOverrides.MuiDataGrid, defaultProps: { slots: { columnMenuIcon: Own } } }
        });
        const icons = headerIcons(renderGrid(theme), 'name');

        expect(icons).toContain('own-menu');
        expect(icons.some((c) => c.includes('lucide-arrow-down'))).toBe(true);
    });

    it('keeps the column separator MUI draws', () => {
        expect(headerIcons(renderGrid(withGrid('next')), 'name')).toContain('SeparatorIcon');
    });

    it('leaves ringDataGridOverrides without icons, so it means the same on both versions', () => {
        expect(ringDataGridOverrides.MuiDataGrid.defaultProps).toEqual({ hideFooter: true });
    });
});
