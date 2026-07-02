import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CssBaseline, Theme, ThemeProvider } from '@mui/material';
import { getTheme, type ThemeOverrides, type ThemeVersion, type TypographyMode } from './theme';
import { CommonLanguages } from '../helpers/commonTypes';
import {
    HANDLE_CONTRACT_VERSION,
    type RingHandle,
    type RingHandleStateSnapshot,
    type RingHandleVariantInfo,
    type RingMode,
    RING_HANDLE_PUBLISHED_EVENT,
    RING_HANDLE_UNPUBLISHED_EVENT,
    type RingHandleLifecycleEventDetail
} from './handleContract';
import {
    PACKAGE_VERSION,
    HAS_UNRELEASED_CHANGES
} from '../version.generated';

// Narrow ambient DOM declarations for builds without `lib.dom`.
declare const window: {
    __RING_UI__?: RingHandle;
    __RING_UI_COMPONENTS__?: { version: string; releasedVersion: string; hasUnreleased: boolean; };
    location: { origin: string; };
    dispatchEvent(event: { type: string; detail?: unknown; }): boolean;
    CustomEvent: new <T>(type: string, init?: { detail?: T; }) => { type: string; detail?: T; };
} | undefined;
declare const document: {
    documentElement: Element;
} | undefined;
declare function getComputedStyle(el: Element): { fontSize: string; };
// eslint-disable-next-line @typescript-eslint/no-empty-interface -- ambient Element placeholder for DOM types without lib.dom
interface Element {}

// Internal ThemeConfig wrapper that publishes `window.__RING_UI__` and applies inspector overrides.
// It reuses `baseTheme` unless runtime overrides are active.

// Minimal deep merge for ThemeOverrides; arrays are replaced.
function deepMerge(
    base: Record<string, unknown>,
    override: Record<string, unknown>
): Record<string, unknown> {
    const result: Record<string, unknown> = { ...base };

    for (const key of Object.keys(override)) {
        const o = override[key];
        const b = base[key];

        if (
            o !== null
            && typeof o === 'object'
            && !Array.isArray(o)
            && b !== null
            && typeof b === 'object'
            && !Array.isArray(b)
        ) {
            result[key] = deepMerge(
                b as Record<string, unknown>,
                o as Record<string, unknown>
            );
        } else if (o !== undefined) {
            result[key] = o;
        }
    }

    return result;
}

const DEFAULT_VARIANT_LABELS: Partial<Record<ThemeVersion, string>> = {
    reference: 'Reference (legacy)',
    next: 'Next'
};

export interface InspectorBridgeProps {
    /** Host mode before inspector runtime overrides. */
    effectiveMode: RingMode;
    /** Host version before inspector runtime overrides. */
    effectiveVersion: ThemeVersion;
    /** Forwarded to getTheme() when rebuilding override theme. */
    language?: CommonLanguages | string;
    /** Forwarded to getTheme() when rebuilding override theme. */
    externalLocales?: object[];
    /** Forwarded to getTheme() when rebuilding override theme. */
    externalComponentsTheme?: object;
    /** Forwarded to getTheme() when rebuilding override theme. */
    themeOverrides?: ThemeOverrides;
    /** Forwarded to getTheme() when rebuilding override theme. */
    typographyMode?: TypographyMode;
    /** Theme from ThemeConfig; reused when no overrides are active. */
    baseTheme: Theme;
    children: React.ReactNode;
}

export function InspectorBridge(props: InspectorBridgeProps): React.JSX.Element {
    const {
        effectiveMode,
        effectiveVersion,
        language,
        externalLocales,
        externalComponentsTheme,
        themeOverrides,
        typographyMode,
        baseTheme,
        children
    } = props;

    const [overrideMode, setOverrideMode] = useState<RingMode | null>(null);
    const [overrideVersion, setOverrideVersion] = useState<ThemeVersion | null>(null);
    const [overrideTypographyMode, setOverrideTypographyMode] = useState<TypographyMode | null>(null);
    const [overrideThemeOverrides, setOverrideThemeOverrides] = useState<ThemeOverrides | null>(null);

    const currentMode: RingMode = overrideMode ?? effectiveMode;
    const currentVersion: ThemeVersion = overrideVersion ?? effectiveVersion;
    const currentTypographyMode: TypographyMode
        = overrideTypographyMode ?? typographyMode ?? 'rem';

    // Keep subscribers in a ref so handle methods stay stable.
    const subscribersRef = useRef(new Set<(s: RingHandleStateSnapshot) => void>());

    // Build snapshot from current effective state.
    const snapshot: RingHandleStateSnapshot = useMemo(() => {
        const hasComponentsRegistration
            = typeof window !== 'undefined' && window.__RING_UI_COMPONENTS__ !== undefined;

        // Read-only host html font-size measurement for inspector diagnostics.
        const hostHtmlFontSize: string
            = typeof window !== 'undefined' && typeof document !== 'undefined'
                ? getComputedStyle(document.documentElement).fontSize
                : '';

        // Derive typography alignment and host recommendation.
        const expected: '16px' | '10px'
            = currentTypographyMode === 'deprecated-px' ? '10px' : '16px';
        const aligned = hostHtmlFontSize === expected;
        const recommendation: 'none' | 'host-must-add-font-size-62.5' | 'host-must-remove-font-size-override'
            = aligned
                ? 'none'
                : currentTypographyMode === 'deprecated-px'
                    ? 'host-must-add-font-size-62.5'
                    : 'host-must-remove-font-size-override';

        return {
            variant: currentVersion,
            mode: currentMode,
            hasOverrides:
                overrideMode !== null
                || overrideVersion !== null
                || overrideTypographyMode !== null
                || overrideThemeOverrides !== null,
            hasThemeOverridesOverride: overrideThemeOverrides !== null,
            typographyMode: currentTypographyMode,
            packageVersions: {
                theme: PACKAGE_VERSION,
                themeHasUnreleased: HAS_UNRELEASED_CHANGES,
                ...(hasComponentsRegistration && {
                    components: window.__RING_UI_COMPONENTS__!.version,
                    componentsHasUnreleased: window.__RING_UI_COMPONENTS__!.hasUnreleased
                })
            },
            ...(hostHtmlFontSize && {
                conflicts: {
                    hostHtmlFontSize,
                    typographyAlignment: {
                        expected,
                        actual: hostHtmlFontSize,
                        aligned,
                        recommendation
                    }
                }
            })
        };
    }, [
        currentMode,
        currentVersion,
        currentTypographyMode,
        overrideMode,
        overrideVersion,
        overrideTypographyMode,
        overrideThemeOverrides
    ]);

    // Fan out snapshot updates without letting subscriber errors break the host.
    useEffect(() => {
        subscribersRef.current.forEach((cb) => {
            try {
                cb(snapshot);
            } catch {
                // Buggy subscribers must not break the bridge.
            }
        });
    }, [snapshot]);

    // Stable callbacks preserve handle identity.
    const setVariantFn = useCallback((name: ThemeVersion) => {
        setOverrideVersion(name);
    }, []);
    const setModeFn = useCallback((next: RingMode) => {
        setOverrideMode(next);
    }, []);
    const setTypographyModeFn = useCallback((next: TypographyMode) => {
        setOverrideTypographyMode(next);
    }, []);
    const resetFn = useCallback(() => {
        setOverrideMode(null);
        setOverrideVersion(null);
        setOverrideTypographyMode(null);
        setOverrideThemeOverrides(null);
    }, []);
    const setThemeOverridesFn = useCallback((overrides: ThemeOverrides | null) => {
        setOverrideThemeOverrides(overrides);
    }, []);

    // Build handle once and read current snapshot through refs.
    const snapshotRef = useRef(snapshot);
    snapshotRef.current = snapshot;
    const handleRef = useRef<RingHandle | null>(null);

    if (handleRef.current === null) {
        handleRef.current = {
            version: HANDLE_CONTRACT_VERSION,
            origin: typeof window !== 'undefined' ? window.location.origin : '',
            getState: () => snapshotRef.current,
            getVariants: (): readonly RingHandleVariantInfo[] => {
                const cur = snapshotRef.current.variant;

                return (Object.keys(DEFAULT_VARIANT_LABELS) as ThemeVersion[]).map((name) => ({
                    name,
                    label: DEFAULT_VARIANT_LABELS[name],
                    isCurrent: name === cur
                }));
            },
            setVariant: setVariantFn,
            setMode: setModeFn,
            setTypographyMode: setTypographyModeFn,
            reset: resetFn,
            setThemeOverrides: setThemeOverridesFn,
            subscribe: (cb) => {
                subscribersRef.current.add(cb);

                return (): void => {
                    subscribersRef.current.delete(cb);
                };
            }
        };
    }

    // Publish handle on mount and unpublish only if this instance owns the slot.
    // Emit lifecycle events so external listeners can reattach after remounts.
    useEffect(() => {
        if (typeof window === 'undefined') {
            return undefined;
        }

        const handle = handleRef.current!;
        window.__RING_UI__ = handle;
        window.dispatchEvent(
            new window.CustomEvent<RingHandleLifecycleEventDetail>(
                RING_HANDLE_PUBLISHED_EVENT,
                { detail: { handle } }
            )
        );

        return (): void => {
            if (window.__RING_UI__ === handle) {
                delete window.__RING_UI__;
                window.dispatchEvent(
                    new window.CustomEvent<RingHandleLifecycleEventDetail>(
                        RING_HANDLE_UNPUBLISHED_EVENT,
                        { detail: { handle } }
                    )
                );
            }
        };
    }, []);

    // Rebuild theme only when any runtime override is active.
    const themeForRender: Theme = useMemo(() => {
        const hasOverrides
            = overrideMode !== null
            || overrideVersion !== null
            || overrideTypographyMode !== null
            || overrideThemeOverrides !== null;

        if (!hasOverrides) {
            return baseTheme;
        }

        const effectiveThemeOverrides: ThemeOverrides | undefined
            = overrideThemeOverrides !== null
                ? deepMerge(
                    (themeOverrides ?? {}) as Record<string, unknown>,
                    overrideThemeOverrides as Record<string, unknown>
                ) as ThemeOverrides
                : themeOverrides;

        return getTheme(currentMode, {
            language,
            externalComponentsTheme,
            externalLocales,
            themeOverrides: effectiveThemeOverrides,
            typographyMode: currentTypographyMode,
            version: currentVersion
        });
    }, [
        overrideMode,
        overrideVersion,
        overrideTypographyMode,
        overrideThemeOverrides,
        currentMode,
        currentVersion,
        currentTypographyMode,
        baseTheme,
        language,
        externalComponentsTheme,
        externalLocales,
        themeOverrides
    ]);

    return (
        <ThemeProvider theme={themeForRender}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
}
