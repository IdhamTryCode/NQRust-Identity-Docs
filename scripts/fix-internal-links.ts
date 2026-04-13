// scripts/fix-internal-links.ts
// Convert hardcoded https://www.nqrust-identity.org/<path> URLs in MDX files
// into relative paths that resolve against the current locale's guides root.
//
// EN files: https://www.nqrust-identity.org/server/foo  →  /en/guides/server/foo
// ID files: https://www.nqrust-identity.org/server/foo  →  /id/guides/server/foo
//
// Preserves fragments (#anchor) and query strings. Strips trailing slashes.

import fs from 'fs'
import path from 'path'

const ROOTS: Array<{ dir: string; localePrefix: string }> = [
  { dir: './pages/en/guides', localePrefix: '/en/guides' },
  { dir: './pages/id/guides', localePrefix: '/id/guides' },
]

const URL_PATTERN = /https?:\/\/(?:www\.)?nqrust-identity\.org\/([^\s)"'`]*)/g

function rewrite(content: string, localePrefix: string): string {
  return content.replace(URL_PATTERN, (_match, rest: string) => {
    // Strip trailing slash but preserve fragments/query
    const cleaned = rest.replace(/\/+$/, '')
    if (!cleaned) return localePrefix
    return `${localePrefix}/${cleaned}`
  })
}

function walk(dir: string): string[] {
  const out: string[] = []
  if (!fs.existsSync(dir)) return out
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else if (e.name.endsWith('.mdx')) out.push(full)
  }
  return out
}

let touched = 0
let totalReplacements = 0
for (const { dir, localePrefix } of ROOTS) {
  for (const file of walk(dir)) {
    const original = fs.readFileSync(file, 'utf-8')
    const matches = original.match(URL_PATTERN)
    if (!matches) continue
    const updated = rewrite(original, localePrefix)
    if (updated !== original) {
      fs.writeFileSync(file, updated)
      touched++
      totalReplacements += matches.length
      console.log(`✅ ${path.relative(process.cwd(), file)} (${matches.length} links)`)
    }
  }
}
console.log(`\n🎉 Done. ${touched} files updated, ${totalReplacements} links rewritten.`)
