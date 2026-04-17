// scripts/fix-anchor-links.ts
// Convert Antora-style anchors (#_some_heading) to Nextra-style (#some-heading).
// Also strips any leading underscore and converts remaining underscores to dashes.
// Applies to both markdown links [text](#...) and cross-page links [text](/path#...).

import fs from 'fs'
import path from 'path'

const ROOTS = ['./pages/en/guides', './pages/id/guides']

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

function convertAnchor(anchor: string): string {
  // Strip leading underscore, then convert remaining underscores to dashes
  return anchor.replace(/^_+/, '').replace(/_/g, '-')
}

function fixLinks(content: string): { content: string; count: number } {
  let count = 0
  // Match markdown links: [text](url#anchor) where anchor contains underscores
  const result = content.replace(/\[([^\]]*)\]\(([^)#]*)#(_[^\s)]+|[^\s)]*_[^\s)]+)\)/g, (match, text, url, anchor) => {
    const newAnchor = convertAnchor(anchor)
    if (newAnchor === anchor) return match
    count++
    return `[${text}](${url}#${newAnchor})`
  })
  return { content: result, count }
}

// Also strip the Antora anchor prefix from heading anchors if MDX uses explicit IDs
// (e.g. `## [](#_some_heading)Heading` → `## Heading`)
// This is already done in generate-mdx.ts, so we don't touch headings here.

let totalFixed = 0
let touchedFiles = 0

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, 'utf-8')
    const { content, count } = fixLinks(original)
    if (count > 0) {
      fs.writeFileSync(file, content)
      touchedFiles++
      totalFixed += count
      console.log(`✅ ${path.relative(process.cwd(), file)} (${count} anchors)`)
    }
  }
}

console.log(`\n🎉 Done. ${touchedFiles} files updated, ${totalFixed} anchor links converted.`)
