// scripts/add-callouts.ts
// Scan scraped-raw HTML for Antora admonition blocks and wrap matching
// paragraphs in existing MDX files with Nextra <Callout> components.
// Skips JSON files that don't have a matching MDX (so removed pages stay removed).

import fs from 'fs'
import path from 'path'

const RAW_DIR = './scraped-raw'
const EN_GUIDES = './pages/en/guides'
const ID_GUIDES = './pages/id/guides'

// Same brand replacements as process-content.ts (so HTML text matches MDX text)
const REPLACEMENTS: [RegExp, string][] = [
  [/Keycloak/g, 'NQRust-Identity'],
  [/keycloak/g, 'nqrust-identity'],
  [/KEYCLOAK/g, 'NQRUST-IDENTITY'],
  [/keycloak\.org/g, 'docs-identity.nexusquantum.id'],
]

// Antora admonition type → Nextra Callout type
const TYPE_MAP: Record<string, string> = {
  note: 'info',
  tip: 'info',
  important: 'warning',
  warning: 'warning',
  caution: 'warning',
}

// Same category prefix detection as generate-mdx.ts
const CATEGORY_PREFIXES = [
  'getting-started',
  'high-availability',
  'securing-apps',
  'observability',
  'server',
  'operator',
  'ui-customization',
  'migration',
]

function detectCategory(slug: string): { category: string; fileSlug: string } | null {
  // Longest prefix first to avoid false matches
  const sorted = [...CATEGORY_PREFIXES].sort((a, b) => b.length - a.length)
  for (const prefix of sorted) {
    if (slug.startsWith(prefix + '-')) {
      return { category: prefix, fileSlug: slug.slice(prefix.length + 1) }
    }
  }
  return null
}

function applyReplacements(text: string): string {
  let out = text
  for (const [pattern, repl] of REPLACEMENTS) out = out.replace(pattern, repl)
  return out
}

interface Admonition {
  type: string
  text: string
}

// Extract admonition blocks from HTML.
// Antora structure:
//   <div class="admonitionblock {type}">
//     <table><tr>
//       <td class="icon">...</td>
//       <td class="content">...inner...</td>
//     </tr></table>
//   </div>
function extractAdmonitions(html: string): Admonition[] {
  const results: Admonition[] = []
  // Match opening tag with type, then walk balanced divs to find the end.
  const openRe = /<div class="admonitionblock\s+(\w+)"[^>]*>/g
  let m: RegExpExecArray | null
  while ((m = openRe.exec(html)) !== null) {
    const type = m[1]
    const start = m.index
    // Walk forward, balancing <div> tags
    let depth = 1
    let i = openRe.lastIndex
    const tagRe = /<\/?div[^>]*>/g
    tagRe.lastIndex = i
    let end = -1
    let t: RegExpExecArray | null
    while ((t = tagRe.exec(html)) !== null) {
      if (t[0].startsWith('</')) {
        depth--
        if (depth === 0) {
          end = t.index + t[0].length
          break
        }
      } else {
        depth++
      }
    }
    if (end === -1) continue
    const blockHtml = html.slice(start, end)
    // Extract content cell text
    const contentMatch = /<td class="content">([\s\S]*?)<\/td>/.exec(blockHtml)
    if (!contentMatch) continue
    // Strip all HTML tags, collapse whitespace
    const text = contentMatch[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
    if (text) results.push({ type, text: applyReplacements(text) })
  }
  return results
}

// Build a search key from the first few words of admonition text.
// Used to fuzzy-match against an MDX line.
function searchKey(text: string): string {
  // First 8 words, alphanumeric only — robust against punctuation differences
  return text
    .split(/\s+/)
    .slice(0, 8)
    .join(' ')
    .replace(/[^\w\s]/g, '')
    .toLowerCase()
}

function lineKey(line: string): string {
  // Strip backticks/markdown formatting then take first 8 words
  return line
    .replace(/[`*_~\[\]()]/g, '')
    .split(/\s+/)
    .slice(0, 8)
    .join(' ')
    .replace(/[^\w\s]/g, '')
    .toLowerCase()
}

function wrapMdxFile(mdxPath: string, admonitions: Admonition[]): boolean {
  if (!fs.existsSync(mdxPath)) return false
  const original = fs.readFileSync(mdxPath, 'utf-8')
  const lines = original.split(/\r?\n/)

  // Track which lines to wrap: lineIdx → callout type
  const wraps: Map<number, string> = new Map()

  const isCodeFence = (l: string) => l.trimStart().startsWith('```')

  // Pre-compute which lines are inside code blocks OR existing Callout blocks
  const skipLine: boolean[] = new Array(lines.length).fill(false)
  let inCode = false
  let inCallout = false
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (isCodeFence(lines[i])) { inCode = !inCode; skipLine[i] = true; continue }
    if (inCode) { skipLine[i] = true; continue }
    if (trimmed.startsWith('<Callout')) { inCallout = true; skipLine[i] = true; continue }
    if (inCallout) {
      skipLine[i] = true
      if (trimmed.startsWith('</Callout')) inCallout = false
      continue
    }
  }

  for (const adm of admonitions) {
    const calloutType = TYPE_MAP[adm.type] || 'info'
    const key = searchKey(adm.text)
    if (!key || key.length < 10) continue

    for (let i = 0; i < lines.length; i++) {
      if (skipLine[i]) continue
      const line = lines[i].trim()
      if (!line) continue
      const lk = lineKey(line)
      if (lk.startsWith(key.slice(0, Math.min(40, key.length)))) {
        wraps.set(i, calloutType)
        break // only wrap first match per admonition
      }
    }
  }

  if (wraps.size === 0) return false

  // Apply wraps from bottom to top so indices don't shift
  const sortedIdx = Array.from(wraps.keys()).sort((a, b) => b - a)
  for (const idx of sortedIdx) {
    const type = wraps.get(idx)!
    const indent = lines[idx].match(/^\s*/)?.[0] || ''
    const content = lines[idx].trimStart()
    lines[idx] = `${indent}<Callout type="${type}">\n${indent}  ${content}\n${indent}</Callout>`
  }

  // Inject `import { Callout }` if missing
  let result = lines.join('\n')
  if (!/import\s*\{\s*Callout\s*\}\s*from\s*['"]nextra\/components['"]/.test(result)) {
    // Insert after the H1 heading line
    const h1Match = result.match(/^# .+$/m)
    if (h1Match) {
      const insertAt = h1Match.index! + h1Match[0].length
      result =
        result.slice(0, insertAt) +
        `\n\nimport { Callout } from 'nextra/components'` +
        result.slice(insertAt)
    }
  }

  if (result === original) return false
  fs.writeFileSync(mdxPath, result, 'utf-8')
  return true
}

async function run() {
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'))
  let totalWrapped = 0
  let filesChanged = 0

  for (const file of files) {
    const slug = file.replace('.json', '')
    const cat = detectCategory(slug)
    if (!cat) continue

    const raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf-8'))
    const admonitions = extractAdmonitions(raw.html)
    if (admonitions.length === 0) continue

    const enPath = path.join(EN_GUIDES, cat.category, `${cat.fileSlug}.mdx`)
    const idPath = path.join(ID_GUIDES, cat.category, `${cat.fileSlug}.mdx`)

    let touched = false
    if (wrapMdxFile(enPath, admonitions)) {
      console.log(`✅ EN: ${cat.category}/${cat.fileSlug}.mdx (${admonitions.length} admonitions)`)
      touched = true
    }
    if (wrapMdxFile(idPath, admonitions)) {
      console.log(`✅ ID: ${cat.category}/${cat.fileSlug}.mdx (${admonitions.length} admonitions)`)
      touched = true
    }
    if (touched) {
      filesChanged++
      totalWrapped += admonitions.length
    }
  }

  console.log(`\n🎉 Done. ${filesChanged} files updated, ~${totalWrapped} admonitions processed.`)
}

run().catch(console.error)
