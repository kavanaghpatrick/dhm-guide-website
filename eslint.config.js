import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      // Layering safety: ban motion.header / motion.main / motion.footer.
      // These wrap the layout shell with framer-motion, which applies a
      // continuous transform/opacity → creates a stacking context → traps
      // any z-indexed descendants (e.g. the Topics dropdown, modals, etc.)
      // inside the shell's local context. We hit this exact bug in PR #339
      // when motion.header had `style={{ opacity: headerOpacity }}`.
      // Ref: docs/layering-strategy-2026-04-27/A2-stacking-discipline.md (rule 3)
      'no-restricted-syntax': [
        'error',
        {
          selector: "JSXOpeningElement[name.type='JSXMemberExpression'][name.object.name='motion'][name.property.name=/^(header|main|footer)$/]",
          message:
            "Do not wrap layout-shell elements (header/main/footer) with framer-motion. Motion applies a transform/opacity that creates a stacking context, trapping descendants' z-index. Use a regular <header>/<main>/<footer> and put animations on inner sections.",
        },
      ],
    },
  },
]
