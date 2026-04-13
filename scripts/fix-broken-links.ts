// scripts/fix-broken-links.ts
// Scan all MDX files for internal links. If the target page doesn't exist
// in the project, convert the link to plain text (keep text, remove href).
// External links (https://...) are left as-is.

import fs from 'fs'
import path from 'path'

const ROOTS = ['./pages/en/guides', './pages/id/guides']
const PAGES_DIR = './pages'

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

function resolveInternalLink(href: string): boolean {
  // Strip fragment (#anchor)
  const noFragment = href.split('#')[0]
  if (!noFragment) return true // just an anchor like #section — always valid

  // Build possible file paths
  const candidates = [
    path.join(PAGES_DIR, noFragment + '.mdx'),
    path.join(PAGES_DIR, noFragment, 'index.mdx'),
    path.join(PAGES_DIR, noFragment + '/index.mdx'),
  ]

  return candidates.some(c => fs.existsSync(c))
}

function fixBrokenLinks(content: string, filePath: string): { content: string; fixed: number } {
  let fixed = 0

  const result = content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (match, text, href) => {
    // Skip external links
    if (href.startsWith('http://') || href.startsWith('https://')) return match
    // Skip image references
    if (href.startsWith('/images/')) return match
    // Skip anchors-only
    if (href.startsWith('#')) return match

    // Internal link — check if target exists
    if (!resolveInternalLink(href)) {
      fixed++
      return text // plain text, no link
    }

    return match
  })

  return { content: result, fixed }
}

let totalFixed = 0
let touchedFiles = 0

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, 'utf-8')
    const { content, fixed } = fixBrokenLinks(original, file)

    if (fixed > 0) {
      fs.writeFileSync(file, content)
      touchedFiles++
      totalFixed += fixed
      console.log(`✅ ${path.relative(process.cwd(), file)} (${fixed} broken links → plain text)`)
    }
  }
}

console.log(`\n🎉 Done. ${touchedFiles} files updated, ${totalFixed} broken links converted to plain text.`)
