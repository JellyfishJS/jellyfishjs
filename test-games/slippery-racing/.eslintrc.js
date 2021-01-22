module.exports = {
    'env': {
        'browser': true,
        'es6': true,
        'node': true
    },
    'extends': [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking'
    ],
    'parser': '@typescript-eslint/parser',
    'parserOptions': {
        'project': ['tsconfig.json'],
        'sourceType': 'module',
        'tsconfigRootDir': __dirname
    },
    'plugins': [
        'eslint-plugin-import',
        'eslint-plugin-prefer-arrow',
        '@typescript-eslint',
    ],
    'rules': {
        '@typescript-eslint/adjacent-overload-signatures': 'error',
        '@typescript-eslint/array-type': 'error',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': [
            'error',
            {
                'extendDefaults': true,
                'types': {
                    '{}': false
                }
            }
        ],
        '@typescript-eslint/consistent-type-assertions': 'error',
        '@typescript-eslint/consistent-type-definitions': 'error',
        '@typescript-eslint/dot-notation': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/member-delimiter-style': [
            'error',
            {
                'multiline': {
                    'delimiter': 'semi',
                    'requireLast': true
                },
                'singleline': {
                    'delimiter': 'semi',
                    'requireLast': false
                },
                'overrides': {
                    'typeLiteral': {
                        'multiline': {
                            'delimiter': 'comma',
                            'requireLast': true
                        },
                        'singleline': {
                            'delimiter': 'comma',
                            'requireLast': false
                        },
                    },
                }
            }
        ],
        '@typescript-eslint/member-ordering': 'off',
        '@typescript-eslint/naming-convention': [
            'error',
            {
                "selector": [
                    "enumMember"
                ],
                "format": ["PascalCase"]
            }
        ],
        '@typescript-eslint/no-this-alias': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'error',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-inferrable-types': ['error', { 'ignoreParameters': true }],
        '@typescript-eslint/no-misused-new': 'error',
        '@typescript-eslint/no-namespace': 'error',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-parameter-properties': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unused-expressions': ['error', { 'allowShortCircuit': true }],
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-use-before-define': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/prefer-for-of': 'error',
        '@typescript-eslint/prefer-function-type': 'error',
        '@typescript-eslint/prefer-namespace-keyword': 'error',
        '@typescript-eslint/quotes': ['error', 'single', { 'avoidEscape': true }],
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/space-before-function-paren': [
            'error',
            {
                'anonymous': 'always',
                'asyncArrow': 'always',
                'named': 'never'
            }
        ],
        '@typescript-eslint/triple-slash-reference': [
            'error',
            {
                'path': 'always',
                'types': 'prefer-import',
                'lib': 'always'
            }
        ],
        '@typescript-eslint/type-annotation-spacing': 'error',
        '@typescript-eslint/unified-signatures': 'off',
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
