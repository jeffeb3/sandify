import js from '@eslint/js'
import parser from '@typescript-eslint/parser'
import plugin from '@typescript-eslint/eslint-plugin'
import react from 'eslint-plugin-react'
import reactRedux from 'eslint-plugin-react-redux'
import prettier from 'eslint-plugin-prettier'

export default [
  js.configs.recommended,
  {
    ignores: [
      'node_modules',
      'build',
      'tmp'
    ],
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        jest: true
      },
    },
    plugins: {
      react,
      'react-redux': reactRedux,
      '@typescript-eslint': plugin,
      prettier,
    },
    rules: {
      // ESLint core
      'object-shorthand': ['error', 'always'],
      'no-array-constructor': 'off',
      'no-redeclare': 'off',
      'no-use-before-define': 'off',
      'no-unused-expressions': 'off',
      'no-unused-vars': 'off',
      'no-useless-constructor': 'off',
      semi: ['warn', 'never'],

      // React
      'react/prop-types': 'off',
      'react/no-unused-prop-types': 'off',

      // React Redux
      'react-redux/useSelector-prefer-selectors': 'off',
      'react-redux/no-unused-prop-types': 'warn',
      'react-redux/prefer-separate-component-file': 'off',

      // TypeScript overrides
      ...plugin.configs.recommended.rules,
      ...prettier.configs.recommended.rules,
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/no-array-constructor': 'warn',
      '@typescript-eslint/no-redeclare': 'warn',
      '@typescript-eslint/no-use-before-define': [
        'warn',
        {
          functions: false,
          classes: false,
          variables: false,
          typedefs: false,
        },
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          args: 'none',
          ignoreRestSiblings: true,
        },
      ],
      '@typescript-eslint/no-useless-constructor': 'warn',

      // Prettier
      'prettier/prettier': 'error',
    },
    settings: {
      react: {
        createClass: 'createReactClass',
        pragma: 'React',
        fragment: 'Fragment',
        version: 'detect',
        flowVersion: '0.53',
      },
      propWrapperFunctions: [
        'forbidExtraProps',
        { property: 'freeze', object: 'Object' },
        { property: 'myFavoriteWrapper' },
        { property: 'forbidExtraProps', exact: true },
      ],
      componentWrapperFunctions: [
        'observer',
        { property: 'styled' },
        { property: 'observer', object: 'Mobx' },
        { property: 'observer', object: '<pragma>' },
      ],
      formComponents: ['CustomForm', { name: 'Form', formAttribute: 'endpoint' }],
      linkComponents: ['Hyperlink', { name: 'Link', linkAttribute: 'to' }],
    },
  },
  {
    // Test files
    files: ['**/*.spec.js', '**/*.spec.ts', '**/*.test.ts', '**/*.spec.tsx', '**/*.test.tsx'],
    languageOptions: {
      globals: {
        describe: true,
        it: true,
        test: true,
        expect: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
        jest: true,
      },
    },
  },
]
