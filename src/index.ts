import './theme/themeAugmentation';

// Global inspector window typings are loaded from `src/types/global.d.ts`.
// Keep this file runtime-only; `.d.ts` has no JS emit.

export * from './theme';
export * from './helpers/commonTypes';

export type { Theme } from '@mui/material';
