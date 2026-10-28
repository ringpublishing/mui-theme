import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import pkg from '../../package.json';

type PeerName = keyof typeof pkg.peerDependencies;

const DATA_GRID_CYCLE = 'the picker slots hold Emotion styled icons, which refer to themselves, and Data Grid before '
    + '8.2.0 hashes the theme with a bare JSON.stringify, which throws on that cycle and unmounts the application';

// Floors the rest of the suite cannot defend: the tests install the newest release a range allows, so a range
// lowered back to `^<major>.0.0` passes every other test and breaks only an application on an older release.
const FLOORS: { name: PeerName; floor: string; reason: string; }[] = [
    { name: 'lucide-react', floor: '1.42.0', reason: 'RingIconDefaults passes nonScalingStroke, added in lucide-react 1.42.0' },
    { name: '@mui/x-data-grid', floor: '8.2.0', reason: DATA_GRID_CYCLE },
    { name: '@mui/x-data-grid-pro', floor: '8.2.0', reason: DATA_GRID_CYCLE }
];

const isAtLeast = (version: string, floor: string): boolean => {
    const [a, b] = [version, floor].map((v) => v.split('.').map(Number));
    const index = a.findIndex((part, i) => part !== b[i]);

    return index === -1 || a[index] > b[index];
};

describe('peer ranges', () => {
    it.each(FLOORS)('$name starts at $floor or later', ({ name, floor, reason }) => {
        const range = pkg.peerDependencies[name];
        const [, start] = /^\^(\d+\.\d+\.\d+)$/.exec(range) ?? [];

        expect(start, `${name} must be a caret range ^major.minor.patch; it is ${range}`).toBeDefined();
        expect(isAtLeast(start, floor), `${reason}; the ${name} peer range is ${range}`).toBe(true);
    });

    it.each(['README.md', 'CONTRIBUTING.md'])('%s lists the ranges package.json declares', (file) => {
        const text = readFileSync(resolve(__dirname, '../..', file), 'utf8');
        const listed = [...text.matchAll(/^\* "([^"]+)": "([^"]+)"$/gm)];

        expect(listed.length, `${file} lists no peer ranges`).toBeGreaterThan(0);

        for (const [, name, range] of listed) {
            expect(range, `${file} lists ${name}`).toBe(pkg.peerDependencies[name as PeerName]);
        }
    });
});
