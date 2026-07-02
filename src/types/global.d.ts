// Global window typings for inspector integration.
// Type declarations only; no runtime emit.

import type { RingHandle } from '../theme/handleContract';

declare global {
    interface Window {
        __RING_UI__?: RingHandle;
        // Activation key read by ThemeConfig.
        __ring_ui_inspector__?: '1';
        __RING_UI_COMPONENTS__?: {
            version: string;
            releasedVersion: string;
            hasUnreleased: boolean;
        };
    }

    // Minimal process declaration for NODE_ENV guards.
    // eslint-disable-next-line no-var
    var process: { env: { NODE_ENV?: string; }; } | undefined;
}

export {};
