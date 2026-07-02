/// <reference lib="dom" />

// Registers components package version for inspector integration.
// Writes `window.__RING_UI_COMPONENTS__` in browser environments.

export interface ComponentsVersionInfo {
    version: string;
    releasedVersion: string;
    hasUnreleased: boolean;
}

export function registerComponentsVersion(info: ComponentsVersionInfo): void {
    if (typeof window === 'undefined') {
        return;
    }

    window.__RING_UI_COMPONENTS__ = info;
}
