import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';

export default [
    js.configs.recommended,
    tseslint.configs.recommended,
    {
        plugins: {
            react: reactPlugin,
        },
        rules: {
            'react/react-in-jsx-scope': 'off', // если используешь новые версии React
            'react/prop-types': 'off',          // если не используешь PropTypes (с TypeScript они не нужны)
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['*.ts', '*.tsx'],
        extends: [
            js.configs.recommended,
            tseslint.configs.recommended,
        ],
        rules: {
            'react/react-in-jsx-scope': 'off', // если используешь новые версии React
            'react/prop-types': 'off',          // если не используешь PropTypes (с TypeScript они не нужны)
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
