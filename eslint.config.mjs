// @ts-check
import eslintNestJs from '@darraghor/eslint-plugin-nestjs-typed';
import eslint from '@eslint/js';
import jestDom from 'eslint-plugin-jest-dom';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import testingLibrary from 'eslint-plugin-testing-library';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  {
    ignores: [
      'eslint.config.mjs',
      'postcss.config.mjs',
      'tailwind.config.js',
      '**/webpack.config.js',
      '**/jest-*.config.js',
      'dist/**',
      'coverage/**',
      'reports/**',
      '**/admin/public/*.js',
      '.next',
      '**/.next',
      '**/*.d.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  ...eslintNestJs.configs.flatRecommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-floating-promises': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'lf' }],

      '@darraghor/nestjs-typed/injectable-should-be-provided': [
        'error',
        {
          // Fixes false positives when eslint is run from the command line
          // as the dependency graph is built differently
          src: ['**/*.ts'],
          filterFromPaths: ['node_modules', '.test.', '.spec.', '.e2e-spec.'],
        },
      ],
    },
  },
  {
    // NestJS modules may be empty classes
    files: ['**/*.module.ts'],
    rules: {
      '@typescript-eslint/no-extraneous-class': 'off',
    },
  },
  {
    // Disable OpenAPI complaints in admin controllers (it's an MVC app, not a REST API)
    files: ['**/admin/**/*.controller.ts'],
    rules: {
      '@darraghor/nestjs-typed/controllers-should-supply-api-tags': 'off',
      '@darraghor/nestjs-typed/api-method-should-specify-api-response': 'off',
    },
  },
  {
    // Allow `any` use in tests
    files: ['**/*.spec.ts', '**/*.*-spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-empty-function': 'off',
    },
  },
  {
    // MVC test files
    files: ['**/*.mvc-spec.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.jest,
      },
    },
    ...testingLibrary.configs['flat/dom'],
    ...jestDom.configs['flat/recommended'],
    rules: {
      // Allow loading client JS files with require()
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
];
