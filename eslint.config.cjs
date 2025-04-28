const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const reactPlugin = require('eslint-plugin-react');

module.exports = {
    overrides: [
        {
            files: ['*.ts', '*.tsx'],
            extends: [
                js.configs.recommended,
                tseslint.configs.recommended
            ],
            plugins: {
                react: reactPlugin
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
    ],
};
