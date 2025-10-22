/* eslint-env node */

// Minimal ESLint config without the broken eslint-config-expo dependency
module.exports = [
  {
    ignores: ['dist/*', 'node_modules/*', 'android/*', 'ios/*', '.expo/*', 'build/*'],
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      'react/display-name': 'off',
    },
  },
];
