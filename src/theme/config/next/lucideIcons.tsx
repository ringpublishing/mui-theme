import React from 'react';
import { styled, type SxProps, type Theme } from '@mui/material';
import {
    ArrowDown,
    ArrowUp,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    CircleCheck,
    Clock,
    EllipsisVertical,
    Info,
    TriangleAlert,
    X,
    type LucideIcon,
    type LucideProps
} from 'lucide-react';

// Icons the theme hands to MUI components as default props. Stroke and size come from the
// `LucideProvider` that `ThemeConfig` mounts (`RingIconDefaults`); a size given here is the one
// its slot needs.

export const chipDeleteIcon = <X />;

export const autocompletePopupIcon = <ChevronDown size={20} />;

export const autocompleteClearIcon = <X size={20} />;

type SlotIconProps = LucideProps & { ownerState?: unknown; sx?: SxProps<Theme>; };

// MUI X types the field and calendar slot icons as `SvgIcon`, so `slotProps` may hand one `sx`, and a
// field's icons also get its `ownerState`. Lucide would write both onto the `<svg>` as attributes;
// `styled` turns `sx` into a class, as `SvgIcon` does, and drops `ownerState`.
const slotIcon = (Icon: LucideIcon, name: string): React.ComponentType<SlotIconProps> => {
    const SlotIcon = styled(Icon)({});

    SlotIcon.displayName = name;

    return SlotIcon;
};

export const pickerDateIcon = slotIcon(CalendarDays, 'RingPickerDateIcon');

export const pickerTimeIcon = slotIcon(Clock, 'RingPickerTimeIcon');

export const pickerClearIcon = slotIcon(X, 'RingPickerClearIcon');

export const calendarSwitchViewIcon = slotIcon(ChevronDown, 'RingCalendarSwitchViewIcon');

export const calendarLeftArrowIcon = slotIcon(ChevronLeft, 'RingCalendarLeftArrowIcon');

export const calendarRightArrowIcon = slotIcon(ChevronRight, 'RingCalendarRightArrowIcon');

export const alertIconMapping = {
    error: <CircleAlert />,
    info: <Info />,
    success: <CircleCheck />,
    warning: <TriangleAlert />
};

// `1em` of the summary's icon wrapper, which the theme sizes.
export const accordionExpandIcon = <ChevronDown size="1em" />;

type TreeIconProps = LucideProps & { ownerState?: unknown; };

// MUI X before 8.14.1 also hands a tree item icon its `ownerState`, which lucide would write onto the `<svg>`.
const withoutOwnerState = (props: TreeIconProps): LucideProps => {
    const lucideProps = { ...props };

    delete lucideProps.ownerState;

    return lucideProps;
};

// `1em` of the item's icon container, which MUI X sizes for its own chevrons. The container is narrower than that, and
// an `<svg>` is a flex item that shrinks by default, so `flexShrink: 0` keeps the full size, as MUI X's `SvgIcon` does.
export const treeExpandIcon = ({ style, ...props }: TreeIconProps): React.JSX.Element => (
    <ChevronRight size="1em" style={{ flexShrink: 0, ...style }} {...withoutOwnerState(props)} />
);

export const treeCollapseIcon = ({ style, ...props }: TreeIconProps): React.JSX.Element => (
    <ChevronDown size="1em" style={{ flexShrink: 0, ...style }} {...withoutOwnerState(props)} />
);

// An unsorted column draws the arrow of its next sort direction through the two sorted slots. MUI X
// passes these icons `fontSize="small"`, the 20px of the field glyphs.
export const dataGridIcons = {
    columnSortedAscendingIcon: ArrowUp,
    columnSortedDescendingIcon: ArrowDown,
    columnMenuIcon: EllipsisVertical
};
