import eslintConfigPrettier from 'eslint-config-prettier/flat';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import js from '@eslint/js';

export default tseslint.config(
  {
    ignores: ['.git/**', '.output/**', '.wxt/**', 'node_modules/**', 'legacy/**', '.data/**']
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  {
    files: ['**/*.svelte', '**/*.svelte.js', '**/*.svelte.ts'],
    languageOptions: {
      parserOptions: {
        extraFileExtensions: ['.svelte'],
        parser: tseslint.parser
      }
    },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    files: ['**/*.js', '**/*.cjs', '**/*.mjs', '**/*.ts', '**/*.cts', '**/*.mts'],
    rules: {
      // 'no-restricted-syntax': [
      //   'error',
      //   {
      //     selector: 'BinaryExpression[operator="in"]',
      //     message:
      //       'Avoid the `in` operator: it checks property keys, not array values. ' +
      //       'Use `.includes()` for arrays and `Object.hasOwn()` for objects. ' +
      //       'If you intentionally need `in` (e.g. feature detection), disable this rule inline with a comment.'
      //   }
      // ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true
        }
      ]
    }
  },
  eslintConfigPrettier
);
