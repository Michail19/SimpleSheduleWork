const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');

module.exports = tseslint.config(
    {
        // Базовые настройки
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        ignores: ['**/*.config.js'],
    },
    // Наследуем рекомендуемые конфигурации
    js.configs.recommended,
    ...tseslint.configs.recommended,
    // Добавляем React-специфичные настройки
    {
        plugins: {
            react: reactPlugin,
        },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        rules: {
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    }
);