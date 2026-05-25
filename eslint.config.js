import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import i18next from 'eslint-plugin-i18next'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      pluginQuery.configs['flat/recommended'],
      i18next.configs['flat/recommended']
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser
    },
    rules: {
      'i18next/no-literal-string': ['warn', { mode: 'jsx-text-only' }],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'date-fns',
              importNames: ['format', 'formatDistance', 'formatDistanceToNow', 'formatRelative'],
              message: "Use the helpers from '@/lib/date' instead so dates render in the active locale."
            },
            {
              name: 'date-fns/locale',
              message: "Don't import date-fns locales directly; '@/lib/date' resolves the locale from i18next."
            }
          ]
        }
      ]
    }
  },
  {
    files: ['src/lib/date/**'],
    rules: {
      'no-restricted-imports': 'off'
    }
  }
])
