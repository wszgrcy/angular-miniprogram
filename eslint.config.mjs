import js from '@eslint/js';
import importX from 'eslint-plugin-import-x';
import prettier from 'eslint-config-prettier/flat';
import tseslint from 'typescript-eslint';
import globals from 'globals';

/**
 * 原 .eslintignore + .eslintrc 的 ignorePatterns，flat config 里统一在这里声明。
 */
const ignores = [
  'dist/**',
  'node_modules/**',
  '.yarn/**',
  'tests/**',
  'test/**',
  'script/**',
  'astro-docs/**',
  'deploy/**',
  'docs/**',
  '**/fixture/**',
  '**/*.d.ts',
  '**/*.xspec.ts',
  'vitest.config.mts',
  'jest.builder.config.ts',
  'build-ng-package.ts',
  'schema-merge.ts',
  'commitlint.config.js',
  'src/library/common/**',
  'src/library/forms/**',
  'src/library/platform/http/**',
  'src/builder/karma/**',
];

/**
 * `angular-miniprogram` 就是本仓库自己（测试工程走 tsconfig paths 引用，
 * 自链接后它又能真解析到），不是外部依赖，不该被
 * `no-extraneous-dependencies` 要求写进 dependencies。
 */
const settings = {
  'import-x/resolver': { node: { extensions: ['.ts', '.js', '.json'] } },
  'import-x/core-modules': [
    'angular-miniprogram',
    'angular-miniprogram/platform',
  ],
};

/** 每个 tsconfig 各自负责的文件集，parser 需要它来做类型推导 */
const projectParserOptions = (project) => ({
  languageOptions: {
    parserOptions: { project, tsconfigRootDir: import.meta.dirname },
  },
});

export default tseslint.config(
  { ignores },
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: { ...globals.node },
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings,
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  { plugins: { 'import-x': importX } },
  prettier,
  {
    rules: {
      '@typescript-eslint/consistent-type-assertions': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-unnecessary-qualifier': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      curly: 'warn',
      'import-x/first': 'warn',
      'import-x/newline-after-import': 'warn',
      'import-x/no-absolute-path': 'warn',
      'import-x/no-duplicates': 'warn',
      'import-x/no-extraneous-dependencies': [
        'off',
        { devDependencies: false },
      ],
      'import-x/no-unassigned-import': [
        'warn',
        { allow: ['miniprogram-api-typings'] },
      ],
      'import-x/order': [
        'warn',
        {
          alphabetize: { order: 'asc' },
          groups: [['builtin', 'external'], 'parent', 'sibling', 'index'],
        },
      ],
      'max-len': [
        'warn',
        {
          code: 140,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true,
          ignoreRegExpLiterals: true,
        },
      ],
      'max-lines-per-function': ['warn', { max: 400 }],
      'no-caller': 'warn',
      'no-console': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }],
      'no-eval': 'warn',
      'no-multiple-empty-lines': ['warn'],
      'no-var': 'warn',
      'prefer-const': 'warn',
      'prefer-rest-params': 'warn',
      'prefer-spread': 'warn',
      'sort-imports': ['warn', { ignoreDeclarationSort: true }],
      'spaced-comment': ['warn', 'always', { markers: ['/'] }],

      /* TODO: evaluate usage of these rules and fix issues as needed */
      'no-case-declarations': 'off',
      'no-fallthrough': 'off',
      'no-underscore-dangle': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      // v8 把 ban-types 拆成了 no-empty-object-type / no-unsafe-function-type /
      // no-wrapper-object-types，这里沿用原来 ban-types: off 的取舍
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unnecessary-type-assertion': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/restrict-plus-operands': 'off',
      '@typescript-eslint/restrict-template-expressions': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/only-throw-error': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'warn',
        { checksVoidReturn: false },
      ],
      '@typescript-eslint/no-this-alias': ['warn', { allowedNames: ['_this'] }],
    },
  },
  {
    files: ['**/*.spec.ts'],
    ...projectParserOptions('./tsconfig.spec.json'),
    rules: {
      'import-x/no-extraneous-dependencies': [
        'warn',
        { devDependencies: true, packageDir: './' },
      ],
      'max-lines-per-function': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['./src/builder/**/*.ts'],
    ignores: ['./src/**/*.template.ts', './src/**/*.d.ts', '**/*.spec.ts'],
    ...projectParserOptions('./tsconfig.builder.json'),
  },
  {
    files: ['./src/library/**/*.ts'],
    ignores: [
      './src/**/*.template.ts',
      './src/**/*.d.ts',
      '**/*.spec.ts',
      './src/library/forms/**',
      './src/library/common/**',
      './src/library/platform/http/**',
    ],
    ...projectParserOptions('./tsconfig.library.json'),
  },
);
