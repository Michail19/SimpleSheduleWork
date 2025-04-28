const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');

module.exports = tseslint.config(
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignores: ['**/*.config.js'],
        languageOptions: {
            globals: {
                // Вручную определяем необходимые глобальные переменные
                document: 'readonly',
                window: 'readonly',
                localStorage: 'readonly',
                setTimeout: 'readonly',
                CustomEvent: 'readonly',
                // Добавьте другие необходимые глобальные переменные
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
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
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/ban-ts-comment': 'warn',
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