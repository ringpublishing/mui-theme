// Contract for the inspector handle published at `window.__RING_UI__`.
// `HANDLE_CONTRACT_VERSION` tracks handle shape changes independently of package releases.

import type { ThemeOverrides, ThemeVersion, TypographyMode } from './theme';

export const HANDLE_CONTRACT_VERSION = '1.0.0' as const;

export type RingMode = 'light' | 'dark';

export interface RingHandleStateSnapshot {
    variant: ThemeVersion;
    mode: RingMode;
    hasOverrides: boolean;
    hasThemeOverridesOverride?: boolean;
    typographyMode?: TypographyMode;
    packageVersions?: {
        theme: string;
        themeHasUnreleased?: boolean;
        components?: string;
        componentsHasUnreleased?: boolean;
    };
    conflicts?: {
        hostHtmlFontSize: string;
        typographyAlignment: {
            expected: '16px' | '10px';
            actual: string;
            aligned: boolean;
            recommendation:
                | 'none'
                | 'host-must-add-font-size-62.5'
                | 'host-must-remove-font-size-override';
        };
    };
}

export interface RingHandleVariantInfo {
    name: ThemeVersion;
    label?: string;
    isCurrent: boolean;
}

export interface RingHandle {
    readonly version: string;
    readonly origin: string;
    getState(): RingHandleStateSnapshot;
    getVariants(): readonly RingHandleVariantInfo[];
    setVariant(name: ThemeVersion): void;
    setMode(mode: RingMode): void;
    subscribe(cb: (s: RingHandleStateSnapshot) => void): () => void;
    setTypographyMode?(mode: TypographyMode): void;
    reset?(): void;
    setThemeOverrides?(overrides: ThemeOverrides | null): void;
}

// Convenience re-export.
export type { ThemeOverrides, ThemeVersion, TypographyMode };

// Lifecycle events emitted when handle is published or unpublished.
// Consumers should listen to these events instead of polling `window.__RING_UI__`.
export const RING_HANDLE_PUBLISHED_EVENT = 'ring-ui-handle-published';
export const RING_HANDLE_UNPUBLISHED_EVENT = 'ring-ui-handle-unpublished';

export interface RingHandleLifecycleEventDetail {
    handle: RingHandle;
}
