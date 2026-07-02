import { expect } from 'vitest';
import { createSerializer } from '@emotion/jest';

// Replace Emotion's runtime-generated CSS class hashes with stable
// "[emotion-X]" tokens in snapshots so they don't change when the
// @emotion/react version changes between CI runs or local installs.
// The real CSS is still verified — only the hash suffix is normalised.
expect.addSnapshotSerializer(createSerializer());
