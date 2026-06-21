import next from 'eslint-config-next/core-web-vitals';

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'sanity-studio/**', 'next-env.d.ts', 'coverage/**'],
  },
  ...next,
];

export default eslintConfig;
