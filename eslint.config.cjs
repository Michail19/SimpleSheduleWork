const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');
const globals = require('globals');

module.exports = tseslint.config(
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignores: ['**/*.config.js'],
        languageOptions: {
            globals: {
                ...globals.browser, // Добавляем глобальные переменные браузера
                ...globals.node,    // Добавляем глобальные переменные Node.js
            },
        },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        plugins: {
            react: reactPlugin,
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',

            // Правила для TypeScript
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',

            // Правила для JavaScript
            'no-undef': 'error',
            'prefer-const': 'warn',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    }
);