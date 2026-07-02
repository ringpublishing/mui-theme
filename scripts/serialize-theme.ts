// Runtime serializer for deterministic `getTheme()` snapshots.
// Captures key theme sections and component keys.
import { writeFileSync } from 'node:fs';
import { getTheme } from '../src/theme';

function serializeTheme(themeArg: any) {
    const t = themeArg;
    const spacingValues: Record<string, string> = {};
    // Probe integer and fractional spacing factors.
    const probes = [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    for (const f of probes) {
        try {
            spacingValues[String(f)] = String(t.spacing(f));
        } catch (e: any) {
            spacingValues[String(f)] = `ERROR:${e?.message ?? String(e)}`;
        }
    }

    const getSpacingValues: Record<string, string> = {};

    if (typeof t.getSpacing === 'function') {
        for (const f of probes) {
            try {
                getSpacingValues[String(f)] = String(t.getSpacing(f));
            } catch (e: any) {
                getSpacingValues[String(f)] = `ERROR:${e?.message ?? String(e)}`;
            }
        }
    }

    return {
        palette: t.palette,
        typography: t.typography,
        spacing: spacingValues,
        getSpacing: getSpacingValues,
        shape: t.shape,
        breakpoints: { values: t.breakpoints?.values, keys: t.breakpoints?.keys },
        shadows: t.shadows,
        transitions: t.transitions
            ? {
                duration: t.transitions.duration,
                easing: t.transitions.easing
            }
            : undefined,
        zIndex: t.zIndex,
        componentsKeys: t.components ? Object.keys(t.components).sort() : []
    };
}

const out: Record<string, unknown> = {};
const versions = ['reference', 'next'] as const;
const modes = ['light', 'dark'] as const;

for (const v of versions) {
    for (const m of modes) {
        const theme = getTheme(m, { version: v as any });
        out[`${v}__${m}`] = serializeTheme(theme);
    }
}

const path = process.argv[2] ?? '/tmp/baseline-validation/runtime-before.json';
writeFileSync(path, JSON.stringify(out, null, 2));
console.error(`wrote ${path}`);
