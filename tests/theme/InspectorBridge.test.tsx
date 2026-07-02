import { render, act } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createTheme } from '@mui/material';
import {
    InspectorBridge,
    HANDLE_CONTRACT_VERSION,
    RING_HANDLE_PUBLISHED_EVENT,
    RING_HANDLE_UNPUBLISHED_EVENT,
    type RingHandle,
    type RingHandleLifecycleEventDetail
} from '../../src';

// Helpers ---------------------------------------------------------

const clearHandle = (): void => {
    delete (window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__;
};

const baseTheme = createTheme();

const renderBridge = (overrides: Partial<React.ComponentProps<typeof InspectorBridge>> = {}) =>
    render(
        <InspectorBridge
            baseTheme={baseTheme}
            effectiveMode="light"
            effectiveVersion="next"
            {...overrides}
        >
            <span data-testid="child">hello</span>
        </InspectorBridge>
    );

describe('InspectorBridge — always-on activation', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('renders children', () => {
        const { getByTestId } = renderBridge();
        expect(getByTestId('child').textContent).toBe('hello');
    });

    it('exposes window.__RING_UI__ on mount with no opt-in needed', () => {
        renderBridge();
        expect(window.__RING_UI__).toBeDefined();
        expect(window.__RING_UI__!.version).toBe(HANDLE_CONTRACT_VERSION);
    });
});

describe('InspectorBridge — handle contract', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('handle.version equals HANDLE_CONTRACT_VERSION constant', () => {
        renderBridge();
        expect(window.__RING_UI__!.version).toBe(HANDLE_CONTRACT_VERSION);
    });

    it('handle.origin equals window.location.origin', () => {
        renderBridge();
        expect(window.__RING_UI__!.origin).toBe(window.location.origin);
    });

    it('exposes getState, getVariants, setVariant, setMode, subscribe methods', () => {
        renderBridge();
        const h = window.__RING_UI__!;
        expect(typeof h.getState).toBe('function');
        expect(typeof h.getVariants).toBe('function');
        expect(typeof h.setVariant).toBe('function');
        expect(typeof h.setMode).toBe('function');
        expect(typeof h.subscribe).toBe('function');
    });

    it('getState() initial snapshot reflects props (no overrides)', () => {
        renderBridge({ effectiveMode: 'dark', effectiveVersion: 'reference' });
        const s = window.__RING_UI__!.getState();
        expect(s.variant).toBe('reference');
        expect(s.mode).toBe('dark');
        expect(s.hasOverrides).toBe(false);
    });

    it('getState() snapshot includes packageVersions.theme', () => {
        renderBridge();
        const s = window.__RING_UI__!.getState();
        expect(s.packageVersions?.theme).toMatch(/^\d+\.\d+\.\d+/);
        expect(typeof s.packageVersions?.themeHasUnreleased).toBe('boolean');
    });

    it('getVariants() returns reference + next with isCurrent flag', () => {
        renderBridge({ effectiveVersion: 'next' });
        const variants = window.__RING_UI__!.getVariants();
        expect(variants.map((v) => v.name).sort()).toEqual(['next', 'reference']);
        expect(variants.find((v) => v.name === 'next')!.isCurrent).toBe(true);
        expect(variants.find((v) => v.name === 'reference')!.isCurrent).toBe(false);
    });
});

describe('InspectorBridge — override state', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('setVariant updates getState().variant and sets hasOverrides=true', () => {
        renderBridge({ effectiveVersion: 'next' });
        const h = window.__RING_UI__!;

        act(() => {
            h.setVariant('reference');
        });

        const s = h.getState();
        expect(s.variant).toBe('reference');
        expect(s.hasOverrides).toBe(true);
    });

    it('setMode updates getState().mode and sets hasOverrides=true', () => {
        renderBridge({ effectiveMode: 'light' });
        const h = window.__RING_UI__!;

        act(() => {
            h.setMode('dark');
        });

        const s = h.getState();
        expect(s.mode).toBe('dark');
        expect(s.hasOverrides).toBe(true);
    });

    it('override wins over prop changes (props ignored while override active)', () => {
        const { rerender } = renderBridge({ effectiveVersion: 'next' });
        const h = window.__RING_UI__!;

        act(() => {
            h.setVariant('reference');
        });

        // Prop change should NOT clobber the override.
        rerender(
            <InspectorBridge baseTheme={baseTheme} effectiveMode="light" effectiveVersion="next">
                <span />
            </InspectorBridge>
        );

        expect(h.getState().variant).toBe('reference');
    });
});

describe('InspectorBridge — subscribe lifecycle', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('subscriber receives notification when override changes', () => {
        renderBridge();
        const cb = vi.fn();
        window.__RING_UI__!.subscribe(cb);

        act(() => {
            window.__RING_UI__!.setMode('dark');
        });

        expect(cb).toHaveBeenCalled();
        const lastCall = cb.mock.calls.at(-1)!;
        expect(lastCall[0].mode).toBe('dark');
    });

    it('unsubscribe stops further notifications', () => {
        renderBridge();
        const cb = vi.fn();
        const unsub = window.__RING_UI__!.subscribe(cb);

        act(() => {
            window.__RING_UI__!.setMode('dark');
        });
        const countAfterFirst = cb.mock.calls.length;

        unsub();

        act(() => {
            window.__RING_UI__!.setMode('light');
        });

        expect(cb.mock.calls.length).toBe(countAfterFirst);
    });

    it('throwing subscriber does not break the bridge', () => {
        renderBridge();
        const bad = vi.fn(() => {
            throw new Error('boom');
        });
        const good = vi.fn();
        window.__RING_UI__!.subscribe(bad);
        window.__RING_UI__!.subscribe(good);

        expect(() => {
            act(() => {
                window.__RING_UI__!.setMode('dark');
            });
        }).not.toThrow();
        expect(good).toHaveBeenCalled();
    });
});

describe('InspectorBridge — ownership guard', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('unmount removes window.__RING_UI__ when bridge still owns it', () => {
        const { unmount } = renderBridge();
        expect(window.__RING_UI__).toBeDefined();

        unmount();

        expect(window.__RING_UI__).toBeUndefined();
    });

    it('unmount does NOT clobber window.__RING_UI__ if another actor replaced it', () => {
        const { unmount } = renderBridge();
        const foreign = { sentinel: 'other-owner' } as unknown as RingHandle;
        (window as unknown as { __RING_UI__: RingHandle; }).__RING_UI__ = foreign;

        unmount();

        expect(window.__RING_UI__).toBe(foreign);
        // cleanup
        delete (window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__;
    });
});

// ----------------------------------------------------------------
// Contract 1.0.0 handle surface
// ----------------------------------------------------------------

describe('InspectorBridge — contract 1.0.0 handle surface', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('handle.version is 1.0.0', () => {
        renderBridge();
        expect(window.__RING_UI__!.version).toBe('1.0.0');
        // And matches the exported constant.
        expect(window.__RING_UI__!.version).toBe(HANDLE_CONTRACT_VERSION);
    });

    it('exposes setTypographyMode and reset methods', () => {
        renderBridge();
        const h = window.__RING_UI__!;
        expect(typeof h.setTypographyMode).toBe('function');
        expect(typeof h.reset).toBe('function');
    });
});

describe('InspectorBridge — setTypographyMode override', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('setTypographyMode updates getState().typographyMode and sets hasOverrides=true', () => {
        renderBridge({ typographyMode: 'rem' });
        const h = window.__RING_UI__!;

        act(() => {
            h.setTypographyMode!('deprecated-px');
        });

        const s = h.getState();
        expect(s.typographyMode).toBe('deprecated-px');
        expect(s.hasOverrides).toBe(true);
    });

    it('snapshot.typographyMode falls back to prop when no override (rem default)', () => {
        renderBridge({ typographyMode: 'rem' });
        const s = window.__RING_UI__!.getState();
        expect(s.typographyMode).toBe('rem');
        expect(s.hasOverrides).toBe(false);
    });

    it('snapshot.typographyMode defaults to "rem" when no prop and no override', () => {
        renderBridge(); // no typographyMode prop
        const s = window.__RING_UI__!.getState();
        expect(s.typographyMode).toBe('rem');
    });

    it('typographyMode override survives prop changes (override wins)', () => {
        const { rerender } = renderBridge({ typographyMode: 'rem' });
        const h = window.__RING_UI__!;

        act(() => {
            h.setTypographyMode!('deprecated-px');
        });

        rerender(
            <InspectorBridge
                baseTheme={baseTheme}
                effectiveMode="light"
                effectiveVersion="next"
                typographyMode="rem"
            >
                <span />
            </InspectorBridge>
        );

        expect(h.getState().typographyMode).toBe('deprecated-px');
    });
});

describe('InspectorBridge — reset clears all overrides', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('reset() returns variant/mode/typographyMode to host props and flips hasOverrides=false', () => {
        renderBridge({
            effectiveMode: 'light',
            effectiveVersion: 'next',
            typographyMode: 'rem'
        });
        const h = window.__RING_UI__!;

        act(() => {
            h.setVariant('reference');
            h.setMode('dark');
            h.setTypographyMode!('deprecated-px');
        });
        expect(h.getState().hasOverrides).toBe(true);

        act(() => {
            h.reset!();
        });

        const s = h.getState();
        expect(s.variant).toBe('next');
        expect(s.mode).toBe('light');
        expect(s.typographyMode).toBe('rem');
        expect(s.hasOverrides).toBe(false);
    });

    it('reset() notifies subscribers exactly once with the cleared snapshot', () => {
        renderBridge({ effectiveMode: 'light' });
        const h = window.__RING_UI__!;

        act(() => {
            h.setMode('dark');
        });

        const cb = vi.fn();
        h.subscribe(cb);

        act(() => {
            h.reset!();
        });

        expect(cb).toHaveBeenCalledTimes(1);
        expect(cb.mock.calls[0][0].mode).toBe('light');
        expect(cb.mock.calls[0][0].hasOverrides).toBe(false);
    });
});

describe('InspectorBridge — hasOverrides 3-state truth table', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('false when no override set', () => {
        renderBridge();
        expect(window.__RING_UI__!.getState().hasOverrides).toBe(false);
    });

    it('true when only variant override active', () => {
        renderBridge({ effectiveVersion: 'next' });
        const h = window.__RING_UI__!;
        act(() => {
            h.setVariant('reference');
        });
        expect(h.getState().hasOverrides).toBe(true);
    });

    it('true when only mode override active', () => {
        renderBridge({ effectiveMode: 'light' });
        const h = window.__RING_UI__!;
        act(() => {
            h.setMode('dark');
        });
        expect(h.getState().hasOverrides).toBe(true);
    });

    it('true when only typographyMode override active', () => {
        renderBridge({ typographyMode: 'rem' });
        const h = window.__RING_UI__!;
        act(() => {
 h.setTypographyMode!('deprecated-px');
        });
        expect(h.getState().hasOverrides).toBe(true);
    });
});

describe('InspectorBridge — typographyAlignment detection', () => {
    beforeEach(() => {
        clearHandle();
        document.documentElement.style.fontSize = '';
    });
    afterEach(() => {
        clearHandle();
        document.documentElement.style.fontSize = '';
    });

    it('omits conflicts entirely when host has no computed font-size (jsdom default)', () => {
        // jsdom returns '' for getComputedStyle(documentElement).fontSize
        // unless an inline style is set. In that case the bridge has
        // nothing to diagnose and the conflicts block is absent.
        renderBridge();
        const s = window.__RING_UI__!.getState();
        expect(s.conflicts).toBeUndefined();
    });

    it('rem mode + host 16px = aligned, recommendation "none"', () => {
        document.documentElement.style.fontSize = '16px';
        renderBridge({ typographyMode: 'rem' });
        const c = window.__RING_UI__!.getState().conflicts!;
        expect(c.hostHtmlFontSize).toBe('16px');
        expect(c.typographyAlignment).toEqual({
            expected: '16px',
            actual: '16px',
            aligned: true,
            recommendation: 'none'
        });
    });

    it('deprecated-px mode + host 10px = aligned, recommendation "none"', () => {
        document.documentElement.style.fontSize = '10px';
        renderBridge({ typographyMode: 'deprecated-px' });
        const c = window.__RING_UI__!.getState().conflicts!;
        expect(c.typographyAlignment).toEqual({
            expected: '10px',
            actual: '10px',
            aligned: true,
            recommendation: 'none'
        });
    });

    it('deprecated-px mode + host 16px = misaligned, recommends host adds 62.5%', () => {
        document.documentElement.style.fontSize = '16px';
        renderBridge({ typographyMode: 'deprecated-px' });
        const c = window.__RING_UI__!.getState().conflicts!;
        expect(c.typographyAlignment).toEqual({
            expected: '10px',
            actual: '16px',
            aligned: false,
            recommendation: 'host-must-add-font-size-62.5'
        });
    });

    it('rem mode + host 10px = misaligned, recommends host removes override', () => {
        document.documentElement.style.fontSize = '10px';
        renderBridge({ typographyMode: 'rem' });
        const c = window.__RING_UI__!.getState().conflicts!;
        expect(c.typographyAlignment).toEqual({
            expected: '16px',
            actual: '10px',
            aligned: false,
            recommendation: 'host-must-remove-font-size-override'
        });
    });

    it('alignment recomputes against override, not host prop', () => {
        // Host says rem (expected 16px) but the inspector overrides
        // to deprecated-px — expected flips to 10px, so a 16px host
        // is now reported as misaligned in the other direction.
        document.documentElement.style.fontSize = '16px';
        renderBridge({ typographyMode: 'rem' });
        const h = window.__RING_UI__!;

        // Baseline: aligned under rem.
        expect(h.getState().conflicts!.typographyAlignment.aligned).toBe(true);

        act(() => {
 h.setTypographyMode!('deprecated-px');
        });

        const c = h.getState().conflicts!;
        expect(c.typographyAlignment.expected).toBe('10px');
        expect(c.typographyAlignment.aligned).toBe(false);
        expect(c.typographyAlignment.recommendation).toBe('host-must-add-font-size-62.5');
    });
});

// ----------------------------------------------------------------
// Lifecycle events (auto-reconnect support)
// ----------------------------------------------------------------
//
// InspectorBridge must dispatch 'ring-ui-handle-published' on mount
// and 'ring-ui-handle-unpublished' on unmount — the inspector
// listens for these to auto-reconnect when ThemeConfig remounts
// (Storybook story change, HMR, navigation).
describe('InspectorBridge — lifecycle events', () => {
    beforeEach(() => {
        clearHandle();
    });
    afterEach(() => {
        clearHandle();
    });

    it('dispatches ring-ui-handle-published on mount with the new handle', () => {
        const seen: RingHandleLifecycleEventDetail[] = [];

        const listener = (e: Event): void => {
            // eslint-disable-next-line n/no-unsupported-features/node-builtins -- CustomEvent is browser API (jsdom).
            seen.push((e as CustomEvent<RingHandleLifecycleEventDetail>).detail);
        };

        window.addEventListener(RING_HANDLE_PUBLISHED_EVENT, listener);

        try {
            renderBridge();
            expect(seen).toHaveLength(1);
            expect(seen[0].handle).toBe(window.__RING_UI__);
        } finally {
            window.removeEventListener(RING_HANDLE_PUBLISHED_EVENT, listener);
        }
    });

    it('dispatches ring-ui-handle-unpublished on unmount with retracted handle', () => {
        const { unmount } = renderBridge();
        const handle = window.__RING_UI__;
        const seen: RingHandleLifecycleEventDetail[] = [];

        const listener = (e: Event): void => {
            // eslint-disable-next-line n/no-unsupported-features/node-builtins -- CustomEvent is browser API (jsdom).
            seen.push((e as CustomEvent<RingHandleLifecycleEventDetail>).detail);
        };

        window.addEventListener(RING_HANDLE_UNPUBLISHED_EVENT, listener);

        try {
            unmount();
            expect(seen).toHaveLength(1);
            expect(seen[0].handle).toBe(handle);
            expect(window.__RING_UI__).toBeUndefined();
        } finally {
            window.removeEventListener(RING_HANDLE_UNPUBLISHED_EVENT, listener);
        }
    });

    it('remount cycle dispatches published twice with different handle refs', () => {
        // Simulates Storybook story change: bridge unmount + remount.
        // Inspector listening for 'published' should see two events
        // with two distinct handle references — that is the signal to
        // re-run connectToHandle and reset stale closure state.
        const seen: RingHandle[] = [];

        const listener = (e: Event): void => {
            // eslint-disable-next-line n/no-unsupported-features/node-builtins -- CustomEvent is browser API (jsdom).
            seen.push((e as CustomEvent<RingHandleLifecycleEventDetail>).detail.handle);
        };

        window.addEventListener(RING_HANDLE_PUBLISHED_EVENT, listener);

        try {
            const first = renderBridge();
            const handleA = window.__RING_UI__;
            first.unmount();
            renderBridge();
            const handleB = window.__RING_UI__;
            expect(seen).toHaveLength(2);
            expect(seen[0]).toBe(handleA);
            expect(seen[1]).toBe(handleB);
            expect(handleA).not.toBe(handleB);
        } finally {
            window.removeEventListener(RING_HANDLE_PUBLISHED_EVENT, listener);
        }
    });

    it('does not dispatch unpublished when another actor replaced the slot', () => {
        const { unmount } = renderBridge();
        const foreign = { sentinel: 'other-owner' } as unknown as RingHandle;
        (window as unknown as { __RING_UI__: RingHandle; }).__RING_UI__ = foreign;
        const seen: RingHandleLifecycleEventDetail[] = [];

        const listener = (e: Event): void => {
            // eslint-disable-next-line n/no-unsupported-features/node-builtins -- CustomEvent is browser API (jsdom).
            seen.push((e as CustomEvent<RingHandleLifecycleEventDetail>).detail);
        };

        window.addEventListener(RING_HANDLE_UNPUBLISHED_EVENT, listener);

        try {
            unmount();
            expect(seen).toHaveLength(0);
            expect(window.__RING_UI__).toBe(foreign);
            delete (window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__;
        } finally {
            window.removeEventListener(RING_HANDLE_UNPUBLISHED_EVENT, listener);
        }
    });
});
