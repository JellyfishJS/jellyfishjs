module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
    ],
    'plugins': [
        'eslint-plugin-import',
        'eslint-plugin-prefer-arrow',
    ],
    'rules': {
        'arrow-body-style': 'error',
        'arrow-parens': ['error', 'always'],
        'brace-style': ['error', '1tbs', { 'allowSingleLine': true }],
        'comma-dangle': ['error', 'always-multiline'],
        'complexity': 'off',
        'constructor-super': 'error',
        'curly': 'error',
        'eol-last': 'error',
        'eqeqeq': ['error', 'always'],
        'guard-for-in': 'error',
        'id-blacklist': 'error',
        'id-match': 'error',
        'import/no-default-export': 'error',
        'import/order': 'error',
        'jsdoc/check-alignment': 'off',
        'jsdoc/check-indentation': 'off',
        'jsdoc/newline-after-description': 'off',
        'max-classes-per-file': 'off',
        'max-len': [
            'error',
            {
                'ignorePattern': "(`|\'|').{80,}(`|\'|')",
                'code': 120
            }
        ],
        'new-parens': 'error',
        'no-bitwise': 'error',
        'no-caller': 'error',
        'no-cond-assign': 'error',
        'no-console': 'off',
        'no-constant-condition': 'off',
        'no-debugger': 'error',
        'no-empty': 'off',
        'no-eval': 'error',
        'no-fallthrough': 'off',
        'no-invalid-this': 'off', // Doesn't allow accessing this in class member initializers
        'no-multiple-empty-lines': 'error',
        'no-new-wrappers': 'error',
        'no-shadow': ['off', { 'hoist': 'all' }],
        'no-throw-literal': 'error',
        'no-trailing-spaces': 'error',
        'no-undef-init': 'error',
        'no-unsafe-finally': 'error',
        'no-unused-labels': 'error',
        'no-unused-vars': [
            'error',
            { 'args': 'none' }
        ],
        'no-var': 'error',
        'object-shorthand': 'error',
        'one-var': ['error', 'never'],
        'prefer-arrow/prefer-arrow-functions': 'off',
        'prefer-const': 'error',
        'quote-props': ['error', 'as-needed'],
        'radix': 'error',
        'spaced-comment': [
            'error',
            'always',
            {
                'markers': [
                    '/'
                ]
            }
        ],
        'use-isnan': 'error',
        'valid-typeof': 'off',
    }
};
