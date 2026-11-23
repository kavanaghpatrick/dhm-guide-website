import { defineConfig } from 'vitest/config';

// Post-build SEO gate over dist/ (see tests/dist-seo.test.js). Separate from the
// unit config because it needs a built site and no jsdom.
export default defineConfig({
  test: { include: ['tests/dist-seo.test.js'], environment: 'node' },
});
