// eslint.config.js (flat config)
import js from '@eslint/js'
import path from 'node:path'

export default [
  // Global ignores
  {
    ignores: ['dist', 'node_modules', '.vite', '**/*.d.ts']
  },

  // Base JS rules
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        window: 'readonly',
        document: 'readonly',
        navigator: 'readonly'
      }
    },
    plugins: {
      // loaded dynamically below by name
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-console': 'warn'
    }
  },

  // TypeScript + React
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: (await import('@typescript-eslint/parser')).default,
      parserOptions: {
        project: false, // faster; no tsconfig type-aware linting
        ecmaFeatures: { jsx: true }
      }
    },
    plugins: {
      '@typescript-eslint': (await import('@typescript-eslint/eslint-plugin')).default,
      react: (await import('eslint-plugin-react')).default,
      'react-hooks': (await import('eslint-plugin-react-hooks')).default,
      import: (await import('eslint-plugin-import')).default
    },
    settings: {
      react: { version: 'detect' },
      // make eslint-import resolve your tsconfig paths (@/*)
      'import/resolver': {
        typescript: { project: path.resolve(process.cwd(), 'tsconfig.json') }
      }
    },
    rules: {
      // TS
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // React
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Import hygiene
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index']
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ]
    }
  },

  // Turn off lint rules that fight Prettier
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: (await import('eslint-config-prettier')).default.rules
  }
]
