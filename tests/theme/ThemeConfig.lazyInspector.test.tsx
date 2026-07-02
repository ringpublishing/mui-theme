import { act, render } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeConfig } from '../../src';
import type { RingHandle } from '../../src/theme/handleContract';

// Lazy inspector activation contract:
//
//   * Default mount (no localStorage flag) → bridge NEVER loads,
//     no window.__RING_UI__ is published.
//   * localStorage.setItem('__ring_ui_inspector__', '1') before
//     mount → dynamic import resolves, bridge mounts, handle is
//     published on window.__RING_UI__.
//
// These tests guard the wire so we never silently regress to
// always-on bridge activation in the consumer bundle.
//
// eslint-disable n/no-unsupported-features/node-builtins — this is a
// jsdom-hosted test file (vitest browser-like env via @testing-library),
// not Node runtime. `window.localStorage` is the browser API the
// production code path also relies on (see theme.tsx INSPECTOR_ACTIVATION_FLAG
// gate); flagging it here is a Node-builtin rule false positive.
/* eslint-disable n/no-unsupported-features/node-builtins */

const FLAG = '__ring_ui_inspector__';

const clearHandle = (): void => {
    delete (window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__;
};

beforeEach(() => {
    window.localStorage.removeItem(FLAG);
    clearHandle();
});

afterEach(() => {
    window.localStorage.removeItem(FLAG);
    clearHandle();
});

describe('ThemeConfig — lazy InspectorBridge activation', () => {
    it('does NOT publish window.__RING_UI__ when the inspector flag is absent', async () => {
        render(
            <ThemeConfig mode="light" language="enUS">
                <div>content</div>
            </ThemeConfig>
        );

        // Flush a microtask cycle so any (would-be) dynamic import
        // would have had the chance to resolve. None should fire.
        await act(async () => {
            await Promise.resolve();
        });

        expect((window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__).toBeUndefined();
    });

    it('publishes window.__RING_UI__ after dynamic import when the flag is "1"', async () => {
        window.localStorage.setItem(FLAG, '1');

        render(
            <ThemeConfig mode="light" language="enUS">
                <div>content</div>
            </ThemeConfig>
        );

        // Two macrotask hops: one for the dynamic import promise,
        // one for the resulting setState → effect that publishes
        // the handle. act() flushes both.
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        const handle = (window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__;
        expect(handle).toBeDefined();
        expect(handle!.getState().mode).toBe('light');
    });

    it('treats flag value other than "1" as inactive (e.g. "0")', async () => {
        window.localStorage.setItem(FLAG, '0');

        render(
            <ThemeConfig mode="light" language="enUS">
                <div>content</div>
            </ThemeConfig>
        );

        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        expect((window as unknown as { __RING_UI__?: RingHandle; }).__RING_UI__).toBeUndefined();
    });
});
