#!/usr/bin/env node
// Reports (and optionally removes) i18n keys in src/lib/i18n/locales/*.json
// that aren't referenced anywhere in src/.
//
// The built-in `yarn i18n:check:unused` produces high false positives because
// strict I18nKey typing pushed many keys out of `t('...')` calls and into:
//   - typed `Record<X, I18nKey>` / `I18nKey[]` literals (keys appear as bare strings)
//   - template-literal calls like `t(`foo.${dynamic}` as I18nKey)`
// This script accounts for both: any en.json key whose full path appears as a
// bare string literal anywhere in src/ is considered used; any en.json key
// whose path is prefixed by a template-literal static prefix found in src/
// is considered used.
//
// Usage:
//   node scripts/i18n-find-unused.mjs           # report only (exits 1 if any unused)
//   node scripts/i18n-find-unused.mjs --fix     # also delete unused keys from
//                                                 en.json AND vi.json

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const SOURCE_DIR = join(ROOT, 'src')
const LOCALES_DIR = join(ROOT, 'src/lib/i18n/locales')
const PRIMARY_LOCALE = 'en'
const SCAN_EXTS = new Set(['.ts', '.tsx'])
const SKIP_DIRS = new Set(['node_modules', 'dist', '.i18n-types'])

const FIX = process.argv.includes('--fix')

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || SKIP_DIRS.has(entry.name)) continue
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      walk(full, out)
    } else if (SCAN_EXTS.has(extname(entry.name))) {
      out.push(full)
    }
  }
  return out
}

function flattenKeys(obj, prefix = '') {
  const keys = []
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

function deleteKey(obj, path) {
  const parts = path.split('.')
  const stack = [obj]
  let node = obj
  for (let i = 0; i < parts.length - 1; i++) {
    node = node?.[parts[i]]
    if (!node || typeof node !== 'object') return
    stack.push(node)
  }
  delete node[parts[parts.length - 1]]
  for (let i = stack.length - 1; i > 0; i--) {
    if (Object.keys(stack[i]).length === 0) {
      delete stack[i - 1][parts[i - 1]]
    } else {
      break
    }
  }
}

const enPath = join(LOCALES_DIR, `${PRIMARY_LOCALE}.json`)
const enJson = JSON.parse(readFileSync(enPath, 'utf8'))
const allKeys = flattenKeys(enJson)

const sourceFiles = walk(SOURCE_DIR)
const sourceText = sourceFiles
  .filter((f) => !f.startsWith(LOCALES_DIR))
  .map((f) => readFileSync(f, 'utf8'))
  .join('\n')

// Template-literal static prefixes: matches the static part before ${...} in
// `something.with.dots.${...}` or `something.suffix${...}`. We require at
// least one `.` in the captured prefix so we don't match arbitrary template
// literals like `Hello ${name}`.
const templatePrefixes = new Set()
const templateRegex = /`([A-Za-z_][\w.]*)\$\{/g
for (const m of sourceText.matchAll(templateRegex)) {
  if (m[1].includes('.')) templatePrefixes.add(m[1])
}

// i18next plural / ordinal suffixes. If `foo.count` is referenced in source,
// `foo.count_one`, `foo.count_other`, etc. should also be considered used.
const PLURAL_SUFFIXES = ['_zero', '_one', '_two', '_few', '_many', '_other']

function literalIncludes(key) {
  return sourceText.includes(`'${key}'`) || sourceText.includes(`"${key}"`) || sourceText.includes(`\`${key}\``)
}

function isReferenced(key) {
  if (literalIncludes(key)) return true
  // Plural: strip trailing _suffix and check if the stem is referenced.
  for (const suffix of PLURAL_SUFFIXES) {
    if (key.endsWith(suffix)) {
      const stem = key.slice(0, -suffix.length)
      if (literalIncludes(stem)) return true
      // Also: stem might itself be covered by a template prefix.
      for (const prefix of templatePrefixes) {
        if (stem.startsWith(prefix)) return true
      }
      break
    }
  }
  for (const prefix of templatePrefixes) {
    if (key.startsWith(prefix)) return true
  }
  return false
}

const unused = allKeys.filter((k) => !isReferenced(k))

console.log(`Scanned ${sourceFiles.length} source files.`)
console.log(`Total keys in ${PRIMARY_LOCALE}.json: ${allKeys.length}`)
console.log(`Template-literal prefixes detected: ${templatePrefixes.size}`)
console.log(`Unused keys: ${unused.length}`)

if (unused.length === 0) {
  process.exit(0)
}

console.log('')
for (const k of unused) console.log(k)

if (!FIX) {
  console.log('')
  console.log('Run again with --fix to delete these from en.json and vi.json.')
  process.exit(1)
}

const locales = readdirSync(LOCALES_DIR).filter((f) => f.endsWith('.json'))
for (const file of locales) {
  const path = join(LOCALES_DIR, file)
  const json = JSON.parse(readFileSync(path, 'utf8'))
  for (const key of unused) deleteKey(json, key)
  writeFileSync(path, JSON.stringify(json, null, 2) + '\n')
  console.log(`Updated ${relative(ROOT, path)}`)
}
