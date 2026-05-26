export default {
  locales: ['en', 'vi'],
  extract: {
    input: ['src/**/*.{ts,tsx}'],
    ignore: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    output: 'src/lib/i18n/locales/{{language}}.json',
    defaultNS: false,
    removeUnusedKeys: false,
    warnOnConflicts: true,
    indentation: 2
  },
  lint: {
    ignore: ['src/lib/i18n/**'],
    checkInterpolationParams: true
  },
  types: {
    input: ['src/lib/i18n/locales/en.json'],
    output: '.i18n-types/i18next.d.ts',
    resourcesFile: '.i18n-types/resources.d.ts',
    enableSelector: false
  }
}
