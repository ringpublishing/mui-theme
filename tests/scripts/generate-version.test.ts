import { describe, expect, it } from 'vitest';
import { parseChangelog } from '../../scripts/generate-version';

// Smart parser with explicit `next: X` hint. Test cases cover the
// decision tree in scripts/generate-version.ts:
//
//   - Released entry header parsing (modern bracket + legacy).
//   - [Unreleased] section absent → no dev bump.
//   - [Unreleased] section empty (only whitespace) → no dev bump.
//   - [Unreleased] with content → bump per hint, default = patch.
//   - Hints: patch / minor / major.
//   - Edge cases: malformed CHANGELOG, multiple released entries.

describe('parseChangelog — released entry', () => {
    it('parses modern `## [X.Y.Z] - YYYY-MM-DD` header', () => {
        const r = parseChangelog([
            '# Changelog',
            '',
            '## [4.4.0] - 2025-11-10',
            '- something released'
        ].join('\n'));
        expect(r.packageVersionReleased).toBe('4.4.0');
        expect(r.packageVersion).toBe('4.4.0');
        expect(r.hasUnreleasedChanges).toBe(false);
        expect(r.nextBumpType).toBe(null);
    });

    it('accepts legacy `## X.Y.Z - YYYY-MM-DD` header (no brackets)', () => {
        const r = parseChangelog([
            '# Changelog',
            '',
            '## 3.2.1 - 2024-01-05',
            '- legacy entry'
        ].join('\n'));
        expect(r.packageVersionReleased).toBe('3.2.1');
    });

    it('picks the FIRST released header when multiple exist', () => {
        const r = parseChangelog([
            '## [5.0.0] - 2026-01-01',
            '- newest',
            '',
            '## [4.4.0] - 2025-11-10',
            '- older'
        ].join('\n'));
        expect(r.packageVersionReleased).toBe('5.0.0');
    });

    it('throws when no released header is present', () => {
        expect(() => parseChangelog('# Changelog\n\nNothing here')).toThrow(/No released entry/);
    });
});

describe('parseChangelog — [Unreleased] absent or empty', () => {
    it('returns released version unchanged when [Unreleased] absent', () => {
        const r = parseChangelog([
            '## [4.4.0] - 2025-11-10',
            '- entry'
        ].join('\n'));
        expect(r.packageVersion).toBe('4.4.0');
        expect(r.hasUnreleasedChanges).toBe(false);
        expect(r.nextBumpType).toBe(null);
    });

    it('treats [Unreleased] with only whitespace as empty', () => {
        const r = parseChangelog([
            '## [Unreleased]',
            '   ',
            '',
            '## [4.4.0] - 2025-11-10',
            '- entry'
        ].join('\n'));
        expect(r.packageVersion).toBe('4.4.0');
        expect(r.hasUnreleasedChanges).toBe(false);
    });

    it('treats [Unreleased] - next: minor with empty body as empty (no dev bump)', () => {
        const r = parseChangelog([
            '## [Unreleased] - next: minor',
            '',
            '## [4.4.0] - 2025-11-10',
            '- entry'
        ].join('\n'));
        expect(r.hasUnreleasedChanges).toBe(false);
        expect(r.packageVersion).toBe('4.4.0');
    });
});

describe('parseChangelog — [Unreleased] with content + hint', () => {
    const fixture = (header: string): string => [
        header,
        '- new feature',
        '',
        '## [4.4.0] - 2025-11-10',
        '- released entry'
    ].join('\n');

    it('default (no hint) → patch bump', () => {
        const r = parseChangelog(fixture('## [Unreleased]'));
        expect(r.nextBumpType).toBe('patch');
        expect(r.packageVersion).toBe('4.4.1-dev');
        expect(r.packageVersionReleased).toBe('4.4.0');
        expect(r.hasUnreleasedChanges).toBe(true);
    });

    it('explicit `next: patch` → patch bump', () => {
        const r = parseChangelog(fixture('## [Unreleased] - next: patch'));
        expect(r.nextBumpType).toBe('patch');
        expect(r.packageVersion).toBe('4.4.1-dev');
    });

    it('explicit `next: minor` → minor bump (patch resets to 0)', () => {
        const r = parseChangelog(fixture('## [Unreleased] - next: minor'));
        expect(r.nextBumpType).toBe('minor');
        expect(r.packageVersion).toBe('4.5.0-dev');
    });

    it('explicit `next: major` → major bump (minor + patch reset to 0)', () => {
        const r = parseChangelog(fixture('## [Unreleased] - next: major'));
        expect(r.nextBumpType).toBe('major');
        expect(r.packageVersion).toBe('5.0.0-dev');
    });
});

describe('parseChangelog — bumping math edge cases', () => {
    it('minor bump from x.9.z stays at x.10 (no cascade)', () => {
        const r = parseChangelog([
            '## [Unreleased] - next: minor',
            '- feat',
            '',
            '## [2.9.7] - 2024-01-01',
            '- entry'
        ].join('\n'));
        expect(r.packageVersion).toBe('2.10.0-dev');
    });

    it('patch bump preserves major.minor', () => {
        const r = parseChangelog([
            '## [Unreleased]',
            '- fix',
            '',
            '## [10.20.30] - 2024-01-01',
            '- entry'
        ].join('\n'));
        expect(r.packageVersion).toBe('10.20.31-dev');
    });

    it('major bump resets minor and patch even when both non-zero', () => {
        const r = parseChangelog([
            '## [Unreleased] - next: major',
            '- breaking change',
            '',
            '## [4.7.3] - 2024-01-01',
            '- entry'
        ].join('\n'));
        expect(r.packageVersion).toBe('5.0.0-dev');
    });
});

describe('parseChangelog — robustness', () => {
    it('ignores text before [Unreleased] header', () => {
        const r = parseChangelog([
            '# Changelog',
            '',
            'All notable changes to this project will be documented in this file.',
            '',
            '## [Unreleased] - next: minor',
            '- new feature',
            '',
            '## [4.4.0] - 2025-11-10',
            '- entry'
        ].join('\n'));
        expect(r.packageVersion).toBe('4.5.0-dev');
    });

    it('case-sensitive hint — `next: MAJOR` makes whole header unrecognized', () => {
        // Regex requires lowercase 'major'. Because the hint group is
        // attached to the header line (via `?:`), uppercase causes the
        // ENTIRE `## [Unreleased] - next: MAJOR` line to miss the
        // UNRELEASED_HEADER regex. The parser then behaves as if the
        // section did not exist (hasUnreleasedChanges=false). This is
        // intentionally strict — typos surface as "no dev bump" rather
        // than silently picking a different bump type.
        const r = parseChangelog([
            '## [Unreleased] - next: MAJOR',
            '- feat',
            '',
            '## [4.4.0] - 2025-11-10',
            '- entry'
        ].join('\n'));
        expect(r.hasUnreleasedChanges).toBe(false);
        expect(r.nextBumpType).toBe(null);
        expect(r.packageVersion).toBe('4.4.0');
    });
});
