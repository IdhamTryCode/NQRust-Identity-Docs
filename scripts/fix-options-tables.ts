// scripts/fix-options-tables.ts
// Re-extract Antora "options" tables from scraped-raw HTML and replace the
// flat-paragraph dump in existing MDX files with proper markdown tables.
// Skips JSONs that have no matching MDX (so removed pages stay removed).

import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const RAW_DIR = './scraped-raw'
const EN_GUIDES = './pages/en/guides'

const REPLACEMENTS: [RegExp, string][] = [
  [/Keycloak/g, 'NQRust-Identity'],
  [/keycloak/g, 'nqrust-identity'],
  [/KEYCLOAK/g, 'NQRUST-IDENTITY'],
]

const CATEGORY_PREFIXES = [
  'getting-started', 'high-availability', 'securing-apps', 'observability',
  'server', 'operator', 'ui-customization', 'migration',
]

function detectCategory(slug: string): { category: string; fileSlug: string } | null {
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
  for (const [p, r] of REPLACEMENTS) out = out.replace(p, r)
  return out
}

// Escape < and > only OUTSIDE backtick code spans, so e.g. "<feature>" in prose
// becomes "&lt;feature&gt;" but `feature-<name>` inside backticks stays intact.
function escapeAngleOutsideCode(text: string): string {
  const parts: string[] = []
  let i = 0
  while (i < text.length) {
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1)
      if (end === -1) { parts.push(text.slice(i)); break }
      parts.push(text.slice(i, end + 1))
      i = end + 1
    } else {
      const next = text.indexOf('`', i)
      const seg = text.slice(i, next === -1 ? text.length : next)
      parts.push(seg.replace(/</g, '&lt;').replace(/>/g, '&gt;'))
      i += seg.length
    }
  }
  return parts.join('')
}

// Replace problematic table-cell characters so they don't break markdown tables.
function escapeCell(text: string): string {
  return escapeAngleOutsideCode(text)
    .replace(/\r?\n+/g, '<br/>')
    .replace(/\|/g, '\\|')
    .trim()
}

interface OptionTable {
  heading: string         // text after `## ` or `### `
  headerLabels: string[]  // e.g. ["", "Type or Values", "Default"]
  rows: string[][]        // raw HTML strings per cell, already converted
}

// Convert a cheerio element's children to a compact MDX-friendly fragment.
// Code → backticks, em → italics, strong → bold, br → newline, p → paragraph break.
function nodeToMdx($: cheerio.CheerioAPI, el: cheerio.Cheerio<any>): string {
  let parts: string[] = []
  el.contents().each((_, node) => {
    if (node.type === 'text') {
      parts.push((node as any).data || '')
      return
    }
    if (node.type !== 'tag') return
    const $node = $(node as any)
    const tag = (node as any).tagName?.toLowerCase()
    if (tag === 'code') {
      parts.push('`' + $node.text() + '`')
    } else if (tag === 'em' || tag === 'i') {
      // Skip icon spans (fa-* classes)
      const cls = $node.attr('class') || ''
      if (cls.includes('fa-')) return
      parts.push('_' + nodeToMdx($, $node) + '_')
    } else if (tag === 'strong' || tag === 'b') {
      parts.push('**' + nodeToMdx($, $node) + '**')
    } else if (tag === 'br') {
      parts.push('\n')
    } else if (tag === 'p') {
      parts.push('\n' + nodeToMdx($, $node) + '\n')
    } else if (tag === 'span') {
      parts.push(nodeToMdx($, $node))
    } else if (tag === 'div') {
      parts.push('\n' + nodeToMdx($, $node))
    } else {
      parts.push(nodeToMdx($, $node))
    }
  })
  return parts.join('').replace(/\n{2,}/g, '\n').trim()
}

function extractOptionTables(html: string): OptionTable[] {
  const $ = cheerio.load(html)
  const tables: OptionTable[] = []

  // Walk h2/h3/h4 and table.options in document order so each table picks up
  // the most recent preceding heading regardless of nesting depth.
  const orderedNodes: { kind: 'heading' | 'table'; text?: string; el?: cheerio.Cheerio<any> }[] = []
  $('h2, h3, h4, table.options').each((_, el) => {
    const $el = $(el)
    const tag = (el as any).tagName?.toLowerCase()
    if (tag && /^h[2-4]$/.test(tag)) {
      orderedNodes.push({ kind: 'heading', text: $el.text().trim() })
    } else {
      orderedNodes.push({ kind: 'table', el: $el })
    }
  })

  let currentHeading = ''
  for (const node of orderedNodes) {
    if (node.kind === 'heading') {
      currentHeading = node.text || ''
      continue
    }
    const $table = node.el!
    const heading = currentHeading


    const headerLabels: string[] = []
    $table.find('thead th').each((_, th) => {
      headerLabels.push(nodeToMdx($, $(th)) || '')
    })

    const rows: string[][] = []
    $table.find('tbody tr').each((_, tr) => {
      const cells: string[] = []
      $(tr).find('td').each((idx, td) => {
        const $td = $(td)
        if (idx === 0) {
          // First column: option key + description + extended + CLI/Env
          // Extract structured pieces for cleaner formatting
          const keyText = $td.find('.options-key').text().trim()
          const descText = $td.find('.options-description').text().trim()

          // Extended paragraphs (everything inside .options-extended .content > .paragraph)
          const extendedParts: string[] = []
          $td.find('.options-extended > .content > .paragraph').each((_, p) => {
            const txt = nodeToMdx($, $(p)).trim()
            if (txt) extendedParts.push(txt)
          })

          // Build the cell content
          const lines: string[] = []
          if (keyText) lines.push('**`' + keyText + '`**')
          if (descText) lines.push(applyReplacements(descText))
          for (const ex of extendedParts) lines.push(applyReplacements(ex))

          cells.push(escapeCell(lines.join('\n')))
        } else {
          cells.push(escapeCell(applyReplacements(nodeToMdx($, $td))))
        }
      })
      if (cells.length) rows.push(cells)
    })

    if (rows.length > 0) {
      tables.push({ heading: applyReplacements(heading), headerLabels, rows })
    }
  }

  return tables
}

function buildMarkdownTable(t: OptionTable): string {
  const colCount = Math.max(t.headerLabels.length, ...t.rows.map(r => r.length))
  // Pad header
  const headers = [...t.headerLabels]
  while (headers.length < colCount) headers.push('')
  // First column has no label in Antora — use "Option"
  if (!headers[0]?.trim()) headers[0] = 'Option'

  const sep = headers.map(() => '---')
  const lines = [
    '| ' + headers.join(' | ') + ' |',
    '| ' + sep.join(' | ') + ' |',
  ]
  for (const row of t.rows) {
    const padded = [...row]
    while (padded.length < colCount) padded.push('')
    lines.push('| ' + padded.join(' | ') + ' |')
  }
  return lines.join('\n')
}

// Replace the flat-text section under a heading in MDX with the markdown table.
// Strategy: find the heading line, find the NEXT heading at ANY level, splice between.
// This preserves nested subsections (e.g. h3 inside h2 stays intact).
function replaceSectionInMdx(mdx: string, heading: string, replacement: string): string | null {
  const lines = mdx.split(/\r?\n/)

  // Match heading by trailing text (Antora-style: `## [](#anchor)Heading Text`)
  let startIdx = -1
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^(#{2,6})\s+(.*)$/)
    if (!m) continue
    const text = m[2].replace(/^\[\]\([^)]*\)/, '').trim()
    if (text === heading) {
      startIdx = i
      break
    }
  }
  if (startIdx === -1) return null

  // Find next heading at any level (so nested subsections are preserved)
  let endIdx = lines.length
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^#{1,6}\s+/.test(lines[i])) {
      endIdx = i
      break
    }
  }

  const before = lines.slice(0, startIdx + 1)
  const after = lines.slice(endIdx)
  return [...before, '', replacement, '', ...after].join('\n')
}

async function run() {
  const files = fs.readdirSync(RAW_DIR).filter(f => f.endsWith('.json'))
  let touched = 0
  let totalTables = 0

  for (const file of files) {
    const slug = file.replace('.json', '')
    const cat = detectCategory(slug)
    if (!cat) continue

    const enPath = path.join(EN_GUIDES, cat.category, `${cat.fileSlug}.mdx`)
    if (!fs.existsSync(enPath)) continue

    const raw = JSON.parse(fs.readFileSync(path.join(RAW_DIR, file), 'utf-8'))
    const tables = extractOptionTables(raw.html)
    if (tables.length === 0) continue

    let mdx = fs.readFileSync(enPath, 'utf-8')
    let changed = false
    const appendix: string[] = []
    for (const t of tables) {
      if (!t.heading) continue
      const md = buildMarkdownTable(t)
      const updated = replaceSectionInMdx(mdx, t.heading, md)
      if (updated && updated !== mdx) {
        mdx = updated
        changed = true
        totalTables++
      } else if (updated === null) {
        // Heading not found — append at end so the section isn't lost.
        // Use h3 by default since most missing ones are subsections.
        appendix.push(`\n### ${t.heading}\n\n${md}\n`)
      }
    }
    if (appendix.length > 0) {
      mdx = mdx.replace(/\s*$/, '') + '\n' + appendix.join('')
      changed = true
      totalTables += appendix.length
    }
    if (changed) {
      fs.writeFileSync(enPath, mdx, 'utf-8')
      touched++
      console.log(`✅ ${cat.category}/${cat.fileSlug}.mdx (${tables.length} tables)`)
    }
  }

  console.log(`\n🎉 Done. ${touched} files updated, ${totalTables} tables replaced.`)
}

run().catch(console.error)
