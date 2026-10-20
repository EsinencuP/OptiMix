import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: process.env.PUBLIC_SITE_URL || 'https://opti-mix-three.vercel.app',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
