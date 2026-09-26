import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  { ignores: ['dist/**', '.astro/**', 'node_modules/**', 'artifacts/**'] },
  {
    ...js.configs.recommended,
    files: ['astro.config.mjs', 'eslint.config.js', 'experiments/verify-motion.mjs', 'experiments/audit-hero-contrast.mjs', 'experiments/verify-css-delivery.mjs', 'scripts/split-home-css.mjs'],
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
  },
  ...tseslint.configs.recommended.map((config) => ({ ...config, files: ['src/**/*.ts'] })),
  { files: ['src/**/*.ts'], languageOptions: { globals: globals.browser } },
  ...astro.configs.recommended,
  ...astro.configs['jsx-a11y-recommended'],
];
