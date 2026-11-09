import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import hooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
export default [
 {ignores:['.next/**','.astro/**','dist/**','out/**','node_modules/**','artifacts/**']},
 {...js.configs.recommended,files:['eslint.config.js'],languageOptions:{globals:globals.node}},
 ...tseslint.configs.recommended.map(config=>({...config,files:['src/**/*.{ts,tsx}','next.config.ts']})),
 {files:['src/**/*.{ts,tsx}','next.config.ts'],languageOptions:{globals:{...globals.browser,...globals.node}},plugins:{'react-hooks':hooks},rules:{...hooks.configs.recommended.rules,'@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]}},
];
