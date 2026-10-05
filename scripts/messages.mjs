#!/usr/bin/env node
// Collects the messages the views translate and their translations from the
// catalogs of Nginx UI, which owns the wording: every t('...') in src goes to
// src/msgids.json, and each locale's translations of them to
// src/messages.json. Nginx UI lists the same ids for its own extraction, so
// a change of wording happens there first.
//
// Usage: node scripts/messages.mjs [path to nginx-ui app/src/language]

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { po } from 'gettext-parser'

const languageDir = path.resolve(process.argv[2] ?? '../nginx-ui/app/src/language')
const srcDir = path.resolve(import.meta.dirname, '../src')

const CALL = /\bt\(\s*'((?:[^'\\]|\\.)*)'/g
const msgids = new Set()
for (const file of readdirSync(srcDir).filter(name => /\.(?:ts|vue)$/.test(name))) {
  for (const match of readFileSync(path.join(srcDir, file), 'utf8').matchAll(CALL))
    msgids.add(match[1].replace(/\\'/g, '\''))
}
const ids = [...msgids].sort()

const locales = {}
for (const file of readdirSync(languageDir).filter(name => name.endsWith('.po')).sort()) {
  const locale = file.slice(0, -3)
  if (locale === 'en')
    continue
  const catalog = po.parse(readFileSync(path.join(languageDir, file)))
  const table = {}
  for (const id of ids) {
    const entry = catalog.translations['']?.[id]
    const text = entry?.msgstr?.[0]
    if (text && !entry.comments?.flag?.includes('fuzzy'))
      table[id] = text
  }
  locales[locale] = table
}

writeFileSync(path.join(srcDir, 'msgids.json'), `${JSON.stringify(ids, null, 2)}\n`)
writeFileSync(path.join(srcDir, 'messages.json'), `${JSON.stringify({ locales }, null, 2)}\n`)
const missing = Object.entries(locales).map(([locale, table]) => `${locale} ${ids.length - Object.keys(table).length}`).join(', ')
console.log(`${ids.length} messages; untranslated by locale: ${missing}`)
