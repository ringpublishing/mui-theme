import { defineConfig } from 'tsup';

// Dual ESM/CJS build to keep consumer bundlers on a single MUI instance.
// `exports` conditions select `import` or `require` output automatically.
export default defineConfig({
    entry: {
        'index': 'src/index.ts',
        'theme-mui-x/index': 'src/theme-mui-x/index.ts'
    },
    format: ['cjs', 'esm'],
    // Build-specific tsconfig fixes rootDir/outDir for DTS generation.
    tsconfig: 'tsconfig.tsup.json',
    dts: true,
    sourcemap: true,
    clean: true,
    // Keep esbuild metafiles disabled by default.
    metafile: false,
    // Enable ESM chunk splitting for shared modules between entry points.
    splitting: true,
    treeshake: true,
    target: 'es2019',
    // Keep peer/host packages external.
    external: [
        'react',
        'react-dom',
        /^@mui\//,
        /^@emotion\//
    ],
    // Keep `.js` for CJS and `.mjs` for ESM outputs.
    outExtension: ({ format }) => ({ js: format === 'esm' ? '.mjs' : '.js' })
});
