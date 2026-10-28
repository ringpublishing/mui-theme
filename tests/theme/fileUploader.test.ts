import { alpha, createTheme, type CSSObject, type Theme } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { getTheme } from '../../src/theme/theme';
import type { RingFileUploaderClassKey, RingFileUploaderOwnerState } from '../../src/theme/config/fileUploader';

const COMPACT = '@container ring-fileuploader (width < 400px)';

const SLOTS: RingFileUploaderClassKey[] = [
    'root',
    'header',
    'dropzone',
    'dropzoneBody',
    'dropzoneText',
    'dropzoneLinkGroup',
    'hintIcon',
    'dropzoneActions',
    'urlSection',
    'urlRow',
    'urlSubmit',
    'filesCounter',
    'fileList',
    'fileItem',
    'fileThumbnail',
    'fileContent',
    'fileName',
    'fileMeta',
    'fileMetaPercent',
    'fileMessage',
    'fileProgress',
    'fileActions',
    'filePercent'
];

const REST: RingFileUploaderOwnerState = { size: 'medium', dragOver: false, error: false };

const slot = (theme: Theme, key: RingFileUploaderClassKey, ownerState: Partial<RingFileUploaderOwnerState> = {}): CSSObject => {
    const style = theme.ringComponents.RingFileUploader[key];

    return (typeof style === 'function'
        ? (style as (props: object) => CSSObject)({ ownerState: { ...REST, ...ownerState }, theme })
        : style) as CSSObject;
};

const FILE_UPLOADER_TOKENS = {
    enabledBorder: 'rgb(1, 1, 1)',
    hoverBorder: 'rgb(2, 2, 2)',
    dragOverBorder: 'rgb(3, 3, 3)',
    dragOverFill: 'rgb(4, 4, 4)',
    errorBorder: 'rgb(5, 5, 5)',
    errorFill: 'rgb(6, 6, 6)'
};

const withTokens = (): Theme =>
    getTheme('light', {
        version: 'next',
        themeOverrides: { palette: { components: { fileUploader: FILE_UPLOADER_TOKENS } } }
    });

describe('theme.ringComponents.RingFileUploader', () => {
    it.each(['next', 'reference'] as const)('%s styles every slot of the FileUploader', (version) => {
        const theme = getTheme('light', { version });

        for (const key of SLOTS) {
            expect(slot(theme, key), key).toBeTypeOf('object');
        }
    });

    it.each(['next', 'reference'] as const)('leaves components.RingFileUploader to the application (%s)', (version) => {
        expect(getTheme('light', { version }).components?.RingFileUploader).toBeUndefined();
    });

    it('keeps the base styles when an application sets styleOverrides for a slot', () => {
        const theme = createTheme(getTheme('light', { version: 'next' }), {
            components: { RingFileUploader: { styleOverrides: { dropzone: { borderRadius: 16 } } } }
        });

        expect(slot(theme, 'dropzone')).toMatchObject({ display: 'flex', border: `1px dashed ${theme.palette.divider}` });
        expect(theme.components?.RingFileUploader?.styleOverrides?.dropzone).toEqual({ borderRadius: 16 });
    });

    it('draws the drop area from palette.components.fileUploader', () => {
        const theme = withTokens();

        expect(slot(theme, 'dropzone')).toMatchObject({
            'border': '1px dashed rgb(1, 1, 1)',
            '&:hover': { borderColor: 'rgb(2, 2, 2)' }
        });
        expect(slot(theme, 'dropzone', { dragOver: true })).toMatchObject({
            borderColor: 'rgb(3, 3, 3)',
            backgroundColor: 'rgb(4, 4, 4)'
        });
        expect(slot(theme, 'dropzone', { error: true })).toMatchObject({
            borderStyle: 'solid',
            borderColor: 'rgb(5, 5, 5)',
            backgroundColor: 'rgb(6, 6, 6)'
        });
    });

    it.each(['light', 'dark'] as const)('takes the same colours from the semantic palette when the tokens are missing (%s)', (mode) => {
        const theme = getTheme(mode, { version: 'reference' });
        const { primary, error, divider, action } = theme.palette;

        expect(slot(theme, 'dropzone')).toMatchObject({ 'border': `1px dashed ${divider}`, '&:hover': { borderColor: primary.main } });
        expect(slot(theme, 'dropzone', { dragOver: true })).toMatchObject({
            borderColor: primary.main,
            backgroundColor: alpha(primary.main, action.hoverOpacity)
        });
        expect(slot(theme, 'dropzone', { error: true })).toMatchObject({
            borderColor: error.main,
            backgroundColor: alpha(error.main, action.hoverOpacity)
        });
    });

    it('keeps the drag-over feedback on an area in error and drops the hover colour there', () => {
        const theme = withTokens();
        const draggedInError = slot(theme, 'dropzone', { dragOver: true, error: true });

        expect(draggedInError).toMatchObject({ borderColor: 'rgb(3, 3, 3)', backgroundColor: 'rgb(4, 4, 4)' });
        expect(slot(theme, 'dropzone', { error: true })).not.toHaveProperty('&:hover');
    });

    it('pads each size as the design does', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'dropzone', { size: 'small' })).toMatchObject({ padding: '8px 16px', minHeight: 40 });
        expect(slot(theme, 'dropzone', { size: 'medium' })).toMatchObject({ padding: '24px', gap: '8px' });
        expect(slot(theme, 'dropzone', { size: 'large' })).toMatchObject({ padding: '24px 16px', gap: '24px' });
    });

    it('switches the drop-area actions, the URL row and the file row to their compact layout under 400px', () => {
        const theme = getTheme('light', { version: 'next' });

        expect(slot(theme, 'root')).toMatchObject({
            containerType: 'inline-size',
            containerName: 'ring-fileuploader',
            // Without it a dialog or an inline-block parent would size the uploader to nothing.
            containIntrinsicInlineSize: '288px'
        });
        expect(slot(theme, 'dropzoneActions')[COMPACT]).toMatchObject({ flexDirection: 'column' });
        expect(slot(theme, 'urlRow')[COMPACT]).toMatchObject({ flexDirection: 'column' });
        expect(slot(theme, 'fileItem')[COMPACT]).toMatchObject({ padding: '12px', columnGap: '8px' });
        expect(slot(theme, 'filePercent')[COMPACT]).toEqual({ display: 'none' });
        expect(slot(theme, 'fileMetaPercent')[COMPACT]).toEqual({ display: 'inline' });
        expect(slot(theme, 'fileContent')[COMPACT]).toEqual({ display: 'contents' });
    });

    it.each(['next', 'reference'] as const)('keeps the counter and the row action in sentence case (%s)', (version) => {
        const theme = getTheme('light', { version });

        expect(slot(theme, 'filesCounter')).toMatchObject({ textTransform: 'none' });
        expect(slot(theme, 'fileActions')['& > .MuiButton-root']).toEqual({ textTransform: 'none' });
    });

    it.each(['light', 'dark'] as const)('draws retry and remove in the secondary text colour (%s)', (mode) => {
        const theme = getTheme(mode, { version: 'next' });

        expect(slot(theme, 'fileActions')['& > .MuiIconButton-root']).toEqual({ color: theme.palette.text.secondary });
    });

    it('lets the small link group break only when it is wider than the line', () => {
        const group = slot(getTheme('light', { version: 'next' }), 'dropzoneLinkGroup');

        expect(group).toMatchObject({ display: 'inline-flex', flexWrap: 'wrap', maxWidth: '100%' });
        expect(group).not.toHaveProperty('whiteSpace');
    });

    it('colours the file row by its status', () => {
        const theme = getTheme('light', { version: 'next' });
        const { palette } = theme;

        expect(slot(theme, 'fileItem', { status: 'error' })).toMatchObject({ border: `1px solid ${palette.error.main}` });
        expect(slot(theme, 'fileItem', { status: 'idle' })).toMatchObject({ border: `1px solid ${palette.divider}` });
        expect(slot(theme, 'fileThumbnail', { status: 'uploading' })).toMatchObject({ color: palette.primary.main });
        expect(slot(theme, 'fileThumbnail', { status: 'completed' })).toMatchObject({ color: palette.success.main });
        expect(slot(theme, 'fileThumbnail', { status: 'idle' })).toMatchObject({ color: palette.text.secondary });
        expect(slot(theme, 'fileName', { status: 'error' })).toMatchObject({ color: palette.error.main });
    });
});
