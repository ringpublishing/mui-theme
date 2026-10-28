import { alpha, type CSSObject, type Theme } from '@mui/material/styles';

/**
 * Slots of the Ring `FileUploader` (`@ringpublishing/mui-components`). Each slot's own style is
 * `theme.ringComponents.RingFileUploader[slot]`, defined here; `theme.components.RingFileUploader.styleOverrides`
 * is left to the application and is layered on top, slot by slot. The component renders the structure and the
 * behaviour.
 */
export type RingFileUploaderClassKey =
    | 'root'
    | 'header'
    | 'dropzone'
    | 'dropzoneBody'
    | 'dropzoneText'
    | 'dropzoneLinkGroup'
    | 'hintIcon'
    | 'dropzoneActions'
    | 'urlSection'
    | 'urlRow'
    | 'urlSubmit'
    | 'filesCounter'
    | 'fileList'
    | 'fileItem'
    | 'fileThumbnail'
    | 'fileContent'
    | 'fileName'
    | 'fileMeta'
    | 'fileMetaPercent'
    | 'fileMessage'
    | 'fileProgress'
    | 'fileActions'
    | 'filePercent';

export type RingFileUploaderSize = 'small' | 'medium' | 'large';

export type RingFileUploaderFileStatus = 'idle' | 'uploading' | 'completed' | 'success' | 'error';

/** The state every `FileUploader` slot passes to its style overrides as `ownerState`. */
export interface RingFileUploaderOwnerState {
    size: RingFileUploaderSize;
    /** A file is being dragged over the drop area. */
    dragOver: boolean;
    /** The drop area shows an error message. */
    error: boolean;
    /** File-row slots: the upload status of the row. */
    status?: RingFileUploaderFileStatus;
    /** File-row slots: an action button stands in for the size, the progress and the status. */
    hasAction?: boolean;
    /** Files counter: the file list is collapsed. */
    collapsed?: boolean;
}

export type RingFileUploaderSlotStyle =
    | CSSObject
    | ((props: { ownerState: RingFileUploaderOwnerState; theme: Theme; }) => CSSObject);

/** The look of every FileUploader slot — the component's base styles, owned by the theme. */
export type RingFileUploaderStyles = Partial<Record<RingFileUploaderClassKey, RingFileUploaderSlotStyle>>;

/**
 * The root is a size container, so the layout follows the width the uploader gets — a narrow side panel on a
 * wide screen included — rather than the viewport. Under 400px every part switches to its compact layout.
 */
const CONTAINER = 'ring-fileuploader';
const COMPACT = `@container ${CONTAINER} (width < 400px)`;

/**
 * A size container takes no width from its content, so in a parent that sizes itself to its content (a dialog, a
 * popover, an inline-block) the uploader would collapse to nothing. This is the width it reports there instead —
 * the narrowest width the design system draws it at, in its compact layout.
 */
const INTRINSIC_WIDTH = 288;
const THUMBNAIL = 56;
const COMPACT_THUMBNAIL = 24;
const SUBMIT_MIN_WIDTH = 156;

/**
 * Drop-area colours. `next` generates `palette.components.fileUploader`; a palette without it (`reference`,
 * or an export that predates the tokens) gets the same colours from the semantic palette.
 */
function dropAreaColors(theme: Theme): Record<
    'enabledBorder' | 'hoverBorder' | 'dragOverBorder' | 'dragOverFill' | 'errorBorder' | 'errorFill',
    string
> {
    const tokens = theme.palette.components?.fileUploader;
    const { primary, error, divider, action } = theme.palette;

    return {
        enabledBorder: tokens?.enabledBorder ?? divider,
        hoverBorder: tokens?.hoverBorder ?? primary.main,
        dragOverBorder: tokens?.dragOverBorder ?? primary.main,
        dragOverFill: tokens?.dragOverFill ?? alpha(primary.main, action.hoverOpacity),
        errorBorder: tokens?.errorBorder ?? error.main,
        errorFill: tokens?.errorFill ?? alpha(error.main, action.hoverOpacity)
    };
}

function statusColor(theme: Theme, status: RingFileUploaderFileStatus | undefined): string {
    switch (status) {
        case 'uploading':
            return theme.palette.primary.main;
        case 'completed':
        case 'success':
            return theme.palette.success.main;
        case 'error':
            return theme.palette.error.main;
        default:
            return theme.palette.text.secondary;
    }
}

function dropzoneSize(theme: Theme, size: RingFileUploaderSize): CSSObject {
    if (size === 'small') {
        return {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing(1),
            minHeight: 40,
            padding: theme.spacing(1, 2),
            [COMPACT]: { flexDirection: 'column', alignItems: 'stretch' }
        };
    }

    return {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        ...(size === 'large'
            ? { gap: theme.spacing(3), padding: theme.spacing(3, 2), height: '100%' }
            : { gap: theme.spacing(1), padding: theme.spacing(3) })
    };
}

function dropzoneState(colors: ReturnType<typeof dropAreaColors>, ownerState: RingFileUploaderOwnerState): CSSObject {
    // A file dragged over an area in error still gets the drag-over feedback.
    if (ownerState.dragOver) {
        return { borderColor: colors.dragOverBorder, backgroundColor: colors.dragOverFill };
    }

    if (ownerState.error) {
        return { borderStyle: 'solid', borderColor: colors.errorBorder, backgroundColor: colors.errorFill };
    }

    return { '&:hover': { borderColor: colors.hoverBorder } };
}

export function buildFileUploaderStyles({ pxTo }: { pxTo: (px: number) => string; }): RingFileUploaderStyles {
    return {
        root: ({ theme }) => ({
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2),
            width: '100%',
            height: '100%',
            minWidth: 0,
            containerType: 'inline-size',
            containerName: CONTAINER,
            containIntrinsicInlineSize: `${INTRINSIC_WIDTH}px`
        }),
        header: ({ theme }) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }),
        dropzone: ({ ownerState, theme }): CSSObject => {
            const colors = dropAreaColors(theme);
            const transition = theme.transitions.create(['border-color', 'background-color', 'color'], {
                duration: theme.transitions.duration.shorter
            });

            return {
                'display': 'flex',
                'boxSizing': 'border-box',
                'width': '100%',
                'border': `1px dashed ${colors.enabledBorder}`,
                'borderRadius': theme.shape.borderRadius,
                transition,
                // The upload icon is a FeaturedIcon; its plate recolours with the area.
                '& .ring-featuredicon > *': { transition },
                ...dropzoneSize(theme, ownerState.size),
                ...dropzoneState(colors, ownerState)
            };
        },
        dropzoneBody: ({ ownerState, theme }) => (ownerState.size === 'small'
            ? { display: 'flex', alignItems: 'center', gap: theme.spacing(1), flex: '0 1 auto', minWidth: 0 }
            : {
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: theme.spacing(1),
                [COMPACT]: { alignSelf: 'stretch' }
            }),
        dropzoneText: { display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' },
        // One inline box, so it moves to the next line as a whole; only a group wider than the whole line (a long
        // link label in a narrow area) breaks between its parts instead of running out of the drop area.
        dropzoneLinkGroup: ({ theme }) => ({
            display: 'inline-flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            columnGap: theme.spacing(0.5),
            maxWidth: '100%'
        }),
        hintIcon: ({ theme }) => ({
            display: 'inline-flex',
            flexShrink: 0,
            fontSize: pxTo(16),
            color: theme.palette.text.secondary,
            borderRadius: '50%'
        }),
        dropzoneActions: ({ theme }) => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: theme.spacing(1),
            flexShrink: 0,
            [COMPACT]: {
                'flexDirection': 'column',
                'alignItems': 'stretch',
                'alignSelf': 'stretch',
                '& > *': { width: '100%' }
            }
        }),
        urlSection: ({ theme }) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }),
        urlRow: ({ theme }) => ({
            display: 'flex',
            alignItems: 'flex-start',
            gap: theme.spacing(2),
            [COMPACT]: { flexDirection: 'column', alignItems: 'stretch', gap: theme.spacing(1) }
        }),
        urlSubmit: { flexShrink: 0, minWidth: SUBMIT_MIN_WIDTH, [COMPACT]: { width: '100%' } },
        filesCounter: ({ ownerState, theme }) => ({
            ...theme.typography.body2,
            // A count, not a command: it keeps its case where buttons are upper-cased (`reference`).
            'textTransform': 'none',
            'alignSelf': 'flex-start',
            'minWidth': 0,
            'padding': 0,
            'marginBottom': theme.spacing(1),
            'color': theme.palette.text.secondary,
            '&:hover': { backgroundColor: 'transparent', color: theme.palette.text.primary },
            '& .MuiButton-startIcon': { marginLeft: 0, marginRight: theme.spacing(0.5) },
            '& .MuiButton-startIcon > *': {
                transform: ownerState.collapsed ? 'rotate(-90deg)' : 'none',
                transition: theme.transitions.create('transform')
            }
        }),
        fileList: ({ theme }) => ({ display: 'flex', flexDirection: 'column', gap: theme.spacing(1) }),
        // Default: the icon box, the text and the actions side by side. Compact: the icon, the name and the actions
        // on the first row and the rest under the name — `fileContent` steps aside so its parts join the grid.
        fileItem: ({ ownerState, theme }) => ({
            display: 'grid',
            gridTemplateColumns: `${THUMBNAIL}px minmax(0, 1fr) auto`,
            gridTemplateAreas: '"thumb content actions"',
            alignItems: 'center',
            columnGap: theme.spacing(2),
            boxSizing: 'border-box',
            width: '100%',
            padding: theme.spacing(2),
            border: `1px solid ${ownerState.status === 'error' ? theme.palette.error.main : theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius,
            [COMPACT]: {
                gridTemplateColumns: `${COMPACT_THUMBNAIL}px minmax(0, 1fr) auto`,
                gridTemplateAreas: `
                    "thumb name     actions"
                    ".     meta     meta"
                    ".     message  message"
                    ".     progress progress"`,
                columnGap: theme.spacing(1),
                padding: theme.spacing(1.5)
            }
        }),
        fileContent: {
            gridArea: 'content',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            [COMPACT]: { display: 'contents' }
        },
        fileThumbnail: ({ ownerState, theme }) => ({
            'gridArea': 'thumb',
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'center',
            'width': THUMBNAIL,
            'height': THUMBNAIL,
            'fontSize': pxTo(24),
            'lineHeight': 0,
            'color': statusColor(theme, ownerState.status),
            // A custom icon is drawn at the same size and colour as the default one.
            '& > *': { fontSize: 'inherit !important' },
            '& svg': { width: '1em', height: '1em', flexShrink: 0 },
            [COMPACT]: { width: COMPACT_THUMBNAIL, height: COMPACT_THUMBNAIL }
        }),
        fileName: ({ ownerState, theme }) => ({
            gridArea: 'name',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: ownerState.status === 'error' ? theme.palette.error.main : theme.palette.text.primary
        }),
        fileMeta: ({ theme }) => ({ gridArea: 'meta', minWidth: 0, color: theme.palette.text.secondary }),
        // In the compact row the percentage moves next to the size.
        fileMetaPercent: { display: 'none', [COMPACT]: { display: 'inline' } },
        // In the compact row the name sits on the 32px row of the action buttons, which already spaces it.
        fileMessage: ({ theme }) => ({
            gridArea: 'message',
            marginTop: theme.spacing(0.5),
            color: theme.palette.error.main,
            [COMPACT]: { marginTop: 0 }
        }),
        fileProgress: ({ ownerState, theme }) => ({
            gridArea: 'progress',
            paddingTop: theme.spacing(0.5),
            ...(ownerState.status === 'error' && { marginTop: theme.spacing(0.5) })
        }),
        fileActions: ({ theme }) => ({
            'gridArea': 'actions',
            'display': 'flex',
            'alignItems': 'center',
            'justifyContent': 'flex-end',
            'gap': theme.spacing(2),
            // The row's action is a text button in sentence case in both versions.
            '& > .MuiButton-root': { textTransform: 'none' },
            // Retry and remove are quieter than the default icon colour, which in dark is near white.
            '& > .MuiIconButton-root': { color: theme.palette.text.secondary },
            [COMPACT]: { gap: theme.spacing(1) }
        }),
        filePercent: ({ theme }) => ({ color: theme.palette.text.secondary, [COMPACT]: { display: 'none' } })
    };
}
