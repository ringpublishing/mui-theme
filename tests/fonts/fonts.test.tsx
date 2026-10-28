import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import React from 'react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ThemeConfig, areThemeFontsReady, getTheme, getThemeFonts, waitForThemeFonts } from '../../src';

interface FakeFonts {
    check: ReturnType<typeof vi.fn>;
    load: ReturnType<typeof vi.fn>;
}

const installFonts = (fonts: FakeFonts | undefined): void => {
    Object.defineProperty(document, 'fonts', { value: fonts, configurable: true });
};

const deferred = (): { promise: Promise<unknown>; resolve: () => void; } => {
    let resolve = (): void => undefined;
    const promise = new Promise((r: (value: unknown) => void) => {
        resolve = (): void => r([]);
    });

    return { promise, resolve };
};

const INTER = { family: 'Inter', weights: [300, 400, 500, 600, 700] };

afterEach(() => {
    cleanup();
    installFonts(undefined);
    vi.useRealTimers();
});

describe('getThemeFonts', () => {
    it('reads the first family and every weight of the next typography', () => {
        expect(getThemeFonts(getTheme('light', { version: 'next' }))).toEqual(INTER);
    });

    it('follows typography overrides: a quoted family and keyword weights', () => {
        const theme = getTheme('light', {
            version: 'next',
            themeOverrides: { typography: { fontFamily: '"Source Sans 3", sans-serif', body1: { fontWeight: 'bold' } } }
        });

        expect(getThemeFonts(theme)).toEqual({ family: 'Source Sans 3', weights: [300, 400, 500, 600, 700] });
    });
});

describe('waitForThemeFonts', () => {
    it('resolves immediately without the Font Loading API', async () => {
        installFonts(undefined);

        expect(areThemeFontsReady(INTER)).toBe(true);
        await expect(waitForThemeFonts(INTER)).resolves.toBeUndefined();
    });

    it('resolves immediately when no fonts are given', async () => {
        const fonts = { check: vi.fn(() => false), load: vi.fn() };
        installFonts(fonts);

        expect(areThemeFontsReady(undefined)).toBe(true);
        await expect(waitForThemeFonts(undefined)).resolves.toBeUndefined();
        expect(fonts.load).not.toHaveBeenCalled();
    });

    it('requests every weight in latin + latin-ext and resolves when they load', async () => {
        const load = deferred();
        const fonts = { check: vi.fn(() => false), load: vi.fn(() => load.promise) };
        installFonts(fonts);

        const result = waitForThemeFonts(INTER);
        load.resolve();

        await expect(result).resolves.toBeUndefined();
        expect(fonts.load.mock.calls).toEqual([300, 400, 500, 600, 700].map((w) => [`${w} 1em "Inter"`, 'aą']));
    });

    it('quotes a family name that is not a valid identifier', async () => {
        const fonts = { check: vi.fn(() => false), load: vi.fn(() => Promise.resolve([])) };
        installFonts(fonts);

        await waitForThemeFonts({ family: 'Source Sans 3', weights: [400] });

        expect(fonts.load).toHaveBeenCalledWith('400 1em "Source Sans 3"', 'aą');
    });

    it('is not ready while one weight is still loading', () => {
        installFonts({ check: vi.fn((font: string) => !font.startsWith('700')), load: vi.fn() });

        expect(areThemeFontsReady(INTER)).toBe(false);
    });

    it('resolves after the timeout when the font never loads', async () => {
        vi.useFakeTimers();
        installFonts({ check: vi.fn(() => false), load: vi.fn(() => new Promise(() => undefined)) });

        const result = waitForThemeFonts(INTER, 500);
        vi.advanceTimersByTime(500);

        await expect(result).resolves.toBeUndefined();
    });

    it('resolves when loading fails', async () => {
        installFonts({ check: vi.fn(() => false), load: vi.fn(() => Promise.reject(new Error('network'))) });

        await expect(waitForThemeFonts(INTER)).resolves.toBeUndefined();
    });
});

describe('ThemeConfig font gating', () => {
    it('renders children synchronously without the Font Loading API', () => {
        installFonts(undefined);

        render(<ThemeConfig mode="light" version="next"><div>content</div></ThemeConfig>);

        expect(screen.getByText('content')).toBeTruthy();
    });

    it('waits for the theme font with version "next"', async () => {
        const load = deferred();
        const fonts = { check: vi.fn(() => false), load: vi.fn(() => load.promise) };
        installFonts(fonts);

        render(<ThemeConfig mode="light" version="next"><div>content</div></ThemeConfig>);
        expect(screen.queryByText('content')).toBeNull();

        await act(async () => {
            load.resolve();
            await load.promise;
        });

        expect(screen.getByText('content')).toBeTruthy();
        expect(fonts.load).toHaveBeenCalledWith('600 1em "Inter"', 'aą');
    });

    it('waits for the family set in themeOverrides', async () => {
        const load = deferred();
        const fonts = { check: vi.fn(() => false), load: vi.fn(() => load.promise) };
        installFonts(fonts);

        render(
            <ThemeConfig mode="light" version="next" themeOverrides={{ typography: { fontFamily: 'Roboto, sans-serif' } }}>
                <div>content</div>
            </ThemeConfig>
        );

        await act(async () => {
            load.resolve();
            await load.promise;
        });

        expect(fonts.load).toHaveBeenCalledWith('400 1em "Roboto"', 'aą');
        expect(fonts.load).not.toHaveBeenCalledWith('400 1em "Inter"', 'aą');
    });

    it('keeps one deadline when the theme font changes while waiting', async () => {
        vi.useFakeTimers();
        installFonts({ check: vi.fn(() => false), load: vi.fn(() => new Promise(() => undefined)) });

        const tree = (fontFamily: string): React.ReactElement => (
            <ThemeConfig mode="light" version="next" themeOverrides={{ typography: { fontFamily } }}>
                <div>content</div>
            </ThemeConfig>
        );
        const { rerender } = render(tree('Inter, sans-serif'));

        await act(() => vi.advanceTimersByTimeAsync(1500));
        rerender(tree('Roboto, sans-serif'));
        expect(screen.queryByText('content')).toBeNull();

        await act(() => vi.advanceTimersByTimeAsync(500));

        expect(screen.getByText('content')).toBeTruthy();
    });

    it('waits for the theme font when version is omitted', () => {
        const fonts = { check: vi.fn(() => false), load: vi.fn(() => new Promise(() => undefined)) };
        installFonts(fonts);

        render(<ThemeConfig mode="light"><div>content</div></ThemeConfig>);

        expect(screen.queryByText('content')).toBeNull();
        expect(fonts.load).toHaveBeenCalled();
    });

    it('does not wait with version "reference"', () => {
        const fonts = { check: vi.fn(() => false), load: vi.fn(() => new Promise(() => undefined)) };
        installFonts(fonts);

        render(<ThemeConfig mode="light" version="reference"><div>content</div></ThemeConfig>);

        expect(screen.getByText('content')).toBeTruthy();
        expect(fonts.load).not.toHaveBeenCalled();
    });

    it('does not wait when waitForFonts is false', () => {
        const fonts = { check: vi.fn(() => false), load: vi.fn(() => new Promise(() => undefined)) };
        installFonts(fonts);

        render(<ThemeConfig mode="light" version="next" waitForFonts={false}><div>content</div></ThemeConfig>);

        expect(screen.getByText('content')).toBeTruthy();
        expect(fonts.load).not.toHaveBeenCalled();
    });
});

describe('ThemeConfig hydrating server-rendered HTML', () => {
    const Content = ({ onClick }: { onClick: () => void; }): React.ReactElement => (
        <button type="button" onClick={onClick}>content</button>
    );

    it.each([
        { placement: 'at the root of the container', wrapped: false },
        { placement: 'inside an element', wrapped: true }
    ])('hydrates the server HTML once, $placement, while the font is still loading', async ({ wrapped }) => {
        const onClick = vi.fn();

        const app = (): React.ReactElement => {
            const tree = <ThemeConfig mode="light"><Content onClick={onClick} /></ThemeConfig>;

            return wrapped ? <div>{tree}</div> : tree;
        };

        // The server has no Font Loading API.
        installFonts(undefined);
        const container = document.createElement('div');
        container.innerHTML = renderToString(app());
        document.body.appendChild(container);

        const load = deferred();
        installFonts({ check: vi.fn(() => false), load: vi.fn(() => load.promise) });
        const onRecoverableError = vi.fn();
        let root: Root | undefined;

        await act(() => {
            root = hydrateRoot(container, app(), { onRecoverableError });
        });
        await act(async () => {
            load.resolve();
            await load.promise;
        });

        const buttons = within(container).getAllByText('content');

        expect(buttons).toHaveLength(1);
        expect(onRecoverableError).not.toHaveBeenCalled();
        fireEvent.click(buttons[0]);
        expect(onClick).toHaveBeenCalledTimes(1);

        act(() => root?.unmount());
        container.remove();
    });

    it('waits for the font in a ThemeConfig mounted after hydration', async () => {
        installFonts(undefined);
        const container = document.createElement('div');
        container.innerHTML = renderToString(<div />);
        document.body.appendChild(container);

        installFonts({ check: vi.fn(() => false), load: vi.fn(() => new Promise(() => undefined)) });
        let root: Root | undefined;

        await act(() => {
            root = hydrateRoot(container, <div />);
        });
        await act(() => {
            root?.render(<div><ThemeConfig mode="light"><div>content</div></ThemeConfig></div>);
        });

        expect(within(container).queryByText('content')).toBeNull();

        act(() => root?.unmount());
        container.remove();
    });
});
