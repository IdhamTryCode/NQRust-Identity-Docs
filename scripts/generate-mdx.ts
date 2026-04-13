// scripts/generate-mdx.ts
// All-in-one MDX generator using cheerio. Converts Antora HTML directly to:
//  - Proper headings
//  - <Callout type=...> for admonitions
//  - Markdown tables (both .options and generic)
//  - Code blocks with language hint
//  - Escaped <placeholder> outside backticks
//  - import { Callout } injected when needed
// Filters by KEEP_SLUGS so previously-removed pages stay removed.

import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const INPUT_DIR = './scraped-processed'
const OUTPUT_EN = './pages/en/guides'
const OUTPUT_ID = './pages/id/guides'

// Only these categories will be generated
const CATEGORIES: Record<string, { dir: string; label: string }> = {
  server:            { dir: 'server',            label: 'Server' },
  observability:     { dir: 'observability',     label: 'Observability' },
  'securing-apps':   { dir: 'securing-apps',     label: 'Securing Applications' },
  'high-availability': { dir: 'high-availability', label: 'High Availability' },
}

// Predefined order per category
const CATEGORY_ORDER: Record<string, string[]> = {
  server: [
    'configuration', 'configuration-production', 'bootstrap-admin-recovery',
    'directory-structure', 'enabletls', 'hostname', 'reverseproxy', 'db',
    'caching', 'outgoinghttp', 'keycloak-truststore', 'mutual-tls', 'features',
    'configuration-provider', 'logging', 'fips', 'management-interface',
    'importexport', 'vault', 'all-config', 'all-provider-config',
  ],
  observability: [
    'telemetry', 'health', 'configuration-metrics', 'event-metrics',
    'keycloak-service-level-indicators', 'metrics-for-troubleshooting',
    'tracing', 'grafana-dashboards', 'exemplars',
  ],
  'securing-apps': [
    'overview', 'oidc-layers', 'javascript-adapter', 'nodejs-adapter',
    'mod-auth-openidc', 'saml-galleon-layers', 'mod-auth-mellon',
    'docker-registry', 'client-registration', 'client-registration-cli',
    'mcp-authz-server', 'token-exchange', 'jwt-authorization-grant',
    'specifications', 'admin-client', 'authz-client', 'policy-enforcer',
    'upgrading',
  ],
  'high-availability': ['introduction'],
}

// Whitelist of slugs to actually generate (set built from CATEGORY_ORDER).
// Anything not in this set is skipped, so previously-removed pages stay gone.
const KEEP_SLUGS = new Set<string>()
for (const [cat, slugs] of Object.entries(CATEGORY_ORDER)) {
  for (const s of slugs) KEEP_SLUGS.add(`${cat}-${s}`)
}

// Antora admonition class → Nextra Callout type
const ADMONITION_MAP: Record<string, string> = {
  note: 'info', tip: 'default', important: 'warning',
  warning: 'warning', caution: 'warning',
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function detectCategory(slug: string): { category: string; fileSlug: string } | null {
  const sorted = Object.keys(CATEGORIES).sort((a, b) => b.length - a.length)
  for (const prefix of sorted) {
    if (slug.startsWith(prefix + '-')) {
      return { category: prefix, fileSlug: slug.slice(prefix.length + 1) }
    }
  }
  return null
}

// Tags we should NOT escape (real HTML/JSX components used in MDX)
const SAFE_TAGS = new Set([
  'br', 'Callout', 'Tabs', 'Tab', 'Steps', 'FileTree', 'Cards', 'Card',
  'a', 'p', 'div', 'span', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
  'thead', 'tbody', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img',
  'input', 'code', 'pre', 'strong', 'em', 'blockquote',
])

// Escape < > only OUTSIDE backtick code spans, and only for tags not in SAFE_TAGS
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
      const escaped = seg.replace(/<(\/?)(\w+)([^>]*?)>/g, (m, slash, tagName, rest) => {
        if (SAFE_TAGS.has(tagName)) return m
        return '&lt;' + slash + tagName + rest + '&gt;'
      })
      parts.push(escaped)
      i += seg.length
    }
  }
  return parts.join('')
}

// Escape {identifier} patterns OUTSIDE backtick code spans so MDX doesn't try
// to evaluate them as JSX expressions.
function escapeBracesOutsideCode(text: string): string {
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
      const escaped = seg.replace(/\{([^}]*?)\}/g, (match, inner) => {
        // Keep JSX comment blocks {/* ... */}
        if (inner.startsWith('/*')) return match
        // Escape simple identifiers like {id}, {version}, {realm-name}, {ENV_VAR}
        if (/^[a-zA-Z_$][a-zA-Z0-9_$\-]*$/.test(inner.trim())) {
          return '&#123;' + inner + '&#125;'
        }
        // Keep valid JS expressions (operators, property access)
        if (/^[a-zA-Z_$'"`\d\.\[\]()=>!&|?:+\-*/%,\s]*$/.test(inner)) return match
        // Otherwise escape
        return '&#123;' + inner + '&#125;'
      })
      parts.push(escaped)
      i += seg.length
    }
  }
  return parts.join('')
}

// Apply escapeAngleOutsideCode and escapeBracesOutsideCode line-by-line,
// skipping any line that's inside a code fence.
function safeEscapeBody(body: string): string {
  const lines = body.split('\n')
  let inCode = false
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trimStart()
    if (trimmed.startsWith('```')) { inCode = !inCode; continue }
    if (inCode) continue
    let line = lines[i]
    line = escapeAngleOutsideCode(line)
    line = escapeBracesOutsideCode(line)
    lines[i] = line
  }
  return lines.join('\n')
}

function escapeCellContent(text: string): string {
  return escapeAngleOutsideCode(text)
    .replace(/\r?\n+/g, '<br/>')
    .replace(/\|/g, '\\|')
    .trim()
}

// Convert a cheerio element's contents to inline MDX text
// (handles code, em, strong, br, links, etc.)
function inlineToMdx($: cheerio.CheerioAPI, $el: cheerio.Cheerio<any>): string {
  const parts: string[] = []
  $el.contents().each((_, node) => {
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
      const cls = $node.attr('class') || ''
      if (cls.includes('fa-')) return
      parts.push('_' + inlineToMdx($, $node) + '_')
    } else if (tag === 'strong' || tag === 'b') {
      parts.push('**' + inlineToMdx($, $node) + '**')
    } else if (tag === 'br') {
      parts.push('\n')
    } else if (tag === 'a') {
      const href = $node.attr('href') || ''
      const cls = $node.attr('class') || ''
      const id = $node.attr('id') || ''
      const innerText = $node.text().trim()
      // Skip Antora anchor links (empty text, anchor class, or self-referencing anchor)
      if (!innerText || cls.includes('anchor') || id || (href.startsWith('#') && href.slice(1) === innerText.replace(/^#/, ''))) {
        return
      }
      const text = inlineToMdx($, $node) || href
      parts.push(`[${text}](${href})`)
    } else if (tag === 'span') {
      parts.push(inlineToMdx($, $node))
    } else if (tag === 'kbd' || tag === 'samp') {
      parts.push('`' + $node.text() + '`')
    } else {
      parts.push(inlineToMdx($, $node))
    }
  })
  return parts.join('')
}

// Convert a block-level element to markdown text (paragraphs, lists, code, etc.)
function blockToMdx($: cheerio.CheerioAPI, $root: cheerio.Cheerio<any>, depth = 0): string {
  const out: string[] = []
  $root.children().each((_, node) => {
    const $el = $(node as any)
    const tag = (node as any).tagName?.toLowerCase()
    if (!tag) return

    if (tag === 'div') {
      const cls = $el.attr('class') || ''
      // Skip table-of-contents, image blocks already handled, etc.
      if (cls.includes('admonitionblock')) {
        out.push(renderAdmonition($, $el))
        return
      }
      // Antora callout list: numbered explanations after code blocks
      if (cls.includes('colist')) {
        const items: string[] = []
        $el.find('tr').each((_, tr) => {
          const $tds = $(tr).find('td')
          if ($tds.length >= 2) {
            const num = $tds.first().text().trim()
            const desc = inlineToMdx($, $tds.last()).trim()
            items.push(`${num}. ${desc}`)
          }
        })
        if (items.length) out.push(items.join('\n'))
        return
      }
      if (cls.includes('listingblock') || cls.includes('literalblock')) {
        out.push(renderCodeBlock($, $el))
        return
      }
      // Only treat as table wrapper if the div is JUST a table (no other content).
      // Otherwise fall through to generic recursion so headings/paragraphs aren't lost.
      if (cls.includes('tableblock') && $el.children().length === 1 && $el.children('table').length === 1) {
        out.push(renderTable($, $el.children('table').first()))
        return
      }
      if (cls.includes('paragraph')) {
        const $p = $el.find('> p').first()
        if ($p.length) out.push(inlineToMdx($, $p).trim())
        return
      }
      if (cls.includes('ulist')) {
        out.push(renderList($, $el.find('> ul').first(), false, depth))
        return
      }
      if (cls.includes('olist')) {
        out.push(renderList($, $el.find('> ol').first(), true, depth))
        return
      }
      if (cls.includes('imageblock')) {
        const $img = $el.find('img').first()
        if ($img.length) {
          const src = $img.attr('src') || ''
          const alt = $img.attr('alt') || ''
          out.push(`![${alt}](${src})`)
        }
        return
      }
      // Generic div: recurse into children
      out.push(blockToMdx($, $el, depth))
      return
    }

    if (tag === 'p') {
      out.push(inlineToMdx($, $el).trim())
      return
    }
    if (/^h[1-6]$/.test(tag)) {
      const level = parseInt(tag[1], 10)
      const text = inlineToMdx($, $el).trim()
      out.push('#'.repeat(level) + ' ' + text)
      return
    }
    if (tag === 'ul') { out.push(renderList($, $el, false, depth)); return }
    if (tag === 'ol') { out.push(renderList($, $el, true, depth)); return }
    if (tag === 'pre') { out.push(renderPre($, $el)); return }
    if (tag === 'table') { out.push(renderTable($, $el)); return }
    if (tag === 'blockquote') {
      const inner = blockToMdx($, $el, depth)
      out.push(inner.split('\n').map(l => '> ' + l).join('\n'))
      return
    }

    // Fallback: recurse
    out.push(blockToMdx($, $el, depth))
  })
  return out.filter(Boolean).join('\n\n')
}

function renderList($: cheerio.CheerioAPI, $list: cheerio.Cheerio<any>, ordered: boolean, depth: number): string {
  const lines: string[] = []
  const indent = '  '.repeat(depth)
  $list.children('li').each((idx, li) => {
    const $li = $(li)
    const marker = ordered ? `${idx + 1}.` : '-'
    // Separate inline-first-paragraph text from nested block content
    const firstParaText: string[] = []
    const nestedBlocks: string[] = []

    $li.children().each((_, child) => {
      const $c = $(child as any)
      const tag = (child as any).tagName?.toLowerCase()
      const cls = $c.attr('class') || ''

      // Nested lists → render recursively
      if (tag === 'ul' || tag === 'ol') {
        const isOrd = tag === 'ol'
        nestedBlocks.push(renderList($, $c, isOrd, depth + 1))
        return
      }
      if (cls.includes('ulist')) {
        nestedBlocks.push(renderList($, $c.find('> ul').first(), false, depth + 1))
        return
      }
      if (cls.includes('olist')) {
        nestedBlocks.push(renderList($, $c.find('> ol').first(), true, depth + 1))
        return
      }
      // Code blocks inside li → render as block (indented for list context)
      if (cls.includes('listingblock') || cls.includes('literalblock') || tag === 'pre') {
        const code = tag === 'pre' ? renderPre($, $c) : renderCodeBlock($, $c)
        // Indent code block to be part of the list item
        const indented = code.split('\n').map(l => indent + '  ' + l).join('\n')
        nestedBlocks.push(indented)
        return
      }
      // Callout list (colist) → render as numbered list
      if (cls.includes('colist')) {
        const items: string[] = []
        $c.find('tr').each((_, tr) => {
          const $tds = $(tr).find('td')
          if ($tds.length >= 2) {
            const num = $tds.first().text().trim()
            const desc = inlineToMdx($, $tds.last()).trim()
            items.push(indent + '  ' + num + '. ' + desc)
          }
        })
        if (items.length) nestedBlocks.push(items.join('\n'))
        return
      }
      // Regular paragraph text → add to first line or as continuation
      if (tag === 'p' || cls.includes('paragraph')) {
        const $p = cls.includes('paragraph') ? $c.find('> p').first() : $c
        const t = $p.length ? inlineToMdx($, $p).trim() : ''
        if (t) {
          if (firstParaText.length === 0) firstParaText.push(t)
          else nestedBlocks.push(indent + '  ' + t)
        }
        return
      }
      // Fallback: try inline
      const t = inlineToMdx($, $c).replace(/\s+/g, ' ').trim()
      if (t) {
        if (firstParaText.length === 0) firstParaText.push(t)
        else nestedBlocks.push(indent + '  ' + t)
      }
    })

    // If li has no children elements (just text node), handle directly
    if (firstParaText.length === 0) {
      const directText = $li.contents().filter((_, n) => n.type === 'text').text().trim()
      if (directText) firstParaText.push(directText)
    }

    lines.push(`${indent}${marker} ${firstParaText.join(' ')}`)
    if (nestedBlocks.length) {
      lines.push('')
      lines.push(nestedBlocks.join('\n\n'))
    }
  })
  return lines.join('\n')
}

function renderPre($: cheerio.CheerioAPI, $pre: cheerio.Cheerio<any>): string {
  const $code = $pre.find('code').first()
  let lang = ''
  if ($code.length) {
    const cls = $code.attr('class') || ''
    const m = cls.match(/language-(\w+)/)
    if (m) lang = m[1]
  }
  // Strip Antora callout markers (<i class="conum">) and their <b>(N)</b> from code
  const $clone = ($code.length ? $code : $pre).clone()
  $clone.find('i.conum').remove()
  $clone.find('b').each((_, b) => {
    const t = $(b).text().trim()
    // Remove (1), (2) etc markers but keep other bold
    if (/^\(\d+\)$/.test(t)) $(b).remove()
  })
  const text = $clone.text()
  return '```' + lang + '\n' + text.replace(/\n+$/, '') + '\n```'
}

function renderCodeBlock($: cheerio.CheerioAPI, $block: cheerio.Cheerio<any>): string {
  const $pre = $block.find('pre').first()
  if ($pre.length) return renderPre($, $pre)
  return '```\n' + $block.text().trim() + '\n```'
}

function renderAdmonition($: cheerio.CheerioAPI, $block: cheerio.Cheerio<any>): string {
  const cls = $block.attr('class') || ''
  let type = 'info'
  for (const k of Object.keys(ADMONITION_MAP)) {
    if (cls.includes(k)) { type = ADMONITION_MAP[k]; break }
  }
  const $content = $block.find('td.content').first()
  let inner = ''
  if ($content.length) {
    inner = blockToMdx($, $content).trim()
    // Fallback: if blockToMdx couldn't extract anything (no recognized children),
    // collect inline content from any <p>/text inside td.content
    if (!inner) {
      const paras: string[] = []
      $content.find('p').each((_, p) => {
        const t = inlineToMdx($, $(p)).trim()
        if (t) paras.push(t)
      })
      inner = paras.join('\n\n').trim() || $content.text().trim()
    }
  } else {
    inner = $block.text().trim()
  }
  if (!inner) return ''
  const indented = inner.split('\n').map(l => l ? '  ' + l : l).join('\n')
  return `<Callout type="${type}">\n${indented}\n</Callout>`
}

function renderTable($: cheerio.CheerioAPI, $table: cheerio.Cheerio<any>): string {
  // Detect Antora "options" table (3 cols, first cell wide with .options-key)
  const isOptions = ($table.attr('class') || '').includes('options')

  // Extract headers
  const headers: string[] = []
  $table.find('thead th').each((_, th) => {
    const t = inlineToMdx($, $(th)).trim()
    headers.push(t || '')
  })

  // Extract body rows
  const rows: string[][] = []
  const $rowsSel = $table.find('tbody tr').length
    ? $table.find('tbody tr')
    : $table.find('tr').filter((_, tr) => $(tr).find('td').length > 0)
  $rowsSel.each((_, tr) => {
    const cells: string[] = []
    $(tr).find('td').each((idx, td) => {
      const $td = $(td)
      if (isOptions && idx === 0) {
        // Build structured first cell: key + description + extended
        const lines: string[] = []
        const keyText = $td.find('.options-key').text().trim()
        const descText = $td.find('.options-description').text().trim()
        if (keyText) lines.push('**`' + keyText + '`**')
        if (descText) lines.push(descText)
        $td.find('.options-extended > .content > .paragraph').each((_, p) => {
          const txt = inlineToMdx($, $(p).find('> p').first()).trim()
          if (txt) lines.push(txt)
        })
        cells.push(escapeCellContent(lines.join('\n')))
      } else {
        // Generic cell: build inline content (collapse paragraphs to <br/>)
        const paragraphs: string[] = []
        const $ps = $td.find('p, .paragraph > p')
        if ($ps.length) {
          $ps.each((_, p) => {
            const t = inlineToMdx($, $(p)).trim()
            if (t) paragraphs.push(t)
          })
        } else {
          paragraphs.push(inlineToMdx($, $td).trim())
        }
        cells.push(escapeCellContent(paragraphs.join('\n')))
      }
    })
    if (cells.length) rows.push(cells)
  })

  if (rows.length === 0) return ''

  // Pad headers to row width
  const colCount = Math.max(headers.length, ...rows.map(r => r.length))
  while (headers.length < colCount) headers.push('')
  if (isOptions && (!headers[0] || !headers[0].trim())) headers[0] = 'Option'
  // For generic tables, leave empty headers as-is

  const sep = headers.map(() => '---')
  const out: string[] = []
  out.push('| ' + headers.join(' | ') + ' |')
  out.push('| ' + sep.join(' | ') + ' |')
  for (const row of rows) {
    const padded = [...row]
    while (padded.length < colCount) padded.push('')
    out.push('| ' + padded.join(' | ') + ' |')
  }
  return out.join('\n')
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function cleanCategoryDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    return
  }
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f)
    if (fs.statSync(full).isFile()) fs.unlinkSync(full)
  }
}

async function generate() {
  if (!fs.existsSync(INPUT_DIR)) {
    console.error(`Input dir ${INPUT_DIR} not found. Run "pnpm process" first.`)
    process.exit(1)
  }

  // Clean only category dirs (preserve pages/en/_meta.json, pages/id/_meta.json, etc.)
  for (const { dir } of Object.values(CATEGORIES)) {
    cleanCategoryDir(path.join(OUTPUT_EN, dir))
    cleanCategoryDir(path.join(OUTPUT_ID, dir))
  }

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'))
  const enMeta: Record<string, Record<string, string>> = {}
  const idMeta: Record<string, Record<string, string>> = {}

  let generated = 0
  let skipped = 0
  for (const file of files) {
    const slug = file.replace('.json', '')
    if (!KEEP_SLUGS.has(slug)) {
      skipped++
      continue
    }
    const cat = detectCategory(slug)
    if (!cat) { skipped++; continue }

    const data = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8'))
    const $ = cheerio.load(data.html)

    // Find main content root
    const $root = $('article.doc').first().length
      ? $('article.doc').first()
      : $('article').first().length
        ? $('article').first()
        : $('body').first()

    // Strip TOC, page headers, navigation, footers
    $root.find('.toc, .toc2, header, footer, nav').remove()
    // Strip the document <h1> (we put title from frontmatter)
    $root.find('h1').first().remove()

    let body = blockToMdx($, $root)
    body = safeEscapeBody(body)
    // Collapse 3+ blank lines
    body = body.replace(/\n{3,}/g, '\n\n').trim()

    const needsCallout = /<Callout\s/.test(body)
    const importLine = needsCallout
      ? "\nimport { Callout } from 'nextra/components'\n"
      : ''

    // Rewrite the /__GUIDES__/ placeholder (set in process-content.ts) to the
    // locale-specific guides root so internal links resolve on any domain.
    const enBody = body.replace(/\/__GUIDES__\//g, '/en/guides/')
    const idBody = body.replace(/\/__GUIDES__\//g, '/id/guides/')

    const enContent = `---
title: ${data.title}
description: ${data.title} - NQRust-Identity Documentation
---

# ${data.title}
${importLine}
${enBody}
`

    const idContent = `---
title: ${data.title}
description: ${data.title} - Dokumentasi NQRust-Identity
---

# ${data.title}
${importLine}
{/* TODO: Translate this page to Bahasa Indonesia */}

${idBody}
`

    const enDir = path.join(OUTPUT_EN, CATEGORIES[cat.category].dir)
    const idDir = path.join(OUTPUT_ID, CATEGORIES[cat.category].dir)
    fs.writeFileSync(path.join(enDir, `${cat.fileSlug}.mdx`), enContent)
    fs.writeFileSync(path.join(idDir, `${cat.fileSlug}.mdx`), idContent)

    if (!enMeta[cat.category]) enMeta[cat.category] = {}
    if (!idMeta[cat.category]) idMeta[cat.category] = {}
    enMeta[cat.category][cat.fileSlug] = data.title
    idMeta[cat.category][cat.fileSlug] = data.title

    generated++
    console.log(`✅ ${cat.category}/${cat.fileSlug}.mdx`)
  }

  // Write per-category _meta.json in predefined order
  for (const [cat, { dir }] of Object.entries(CATEGORIES)) {
    if (!enMeta[cat]) continue
    const order = CATEGORY_ORDER[cat] || []
    const orderedEn: Record<string, string> = {}
    const orderedId: Record<string, string> = {}
    for (const slug of order) {
      if (enMeta[cat][slug]) {
        orderedEn[slug] = enMeta[cat][slug]
        orderedId[slug] = idMeta[cat][slug]
      }
    }
    // Append any remaining slugs not in predefined order
    for (const slug of Object.keys(enMeta[cat])) {
      if (!orderedEn[slug]) {
        orderedEn[slug] = enMeta[cat][slug]
        orderedId[slug] = idMeta[cat][slug]
      }
    }
    fs.writeFileSync(path.join(OUTPUT_EN, dir, '_meta.json'), JSON.stringify(orderedEn, null, 2))
    fs.writeFileSync(path.join(OUTPUT_ID, dir, '_meta.json'), JSON.stringify(orderedId, null, 2))
  }

  // Write top-level guides _meta.json (just the categories)
  const guidesMeta: Record<string, string> = {}
  for (const [cat, { dir, label }] of Object.entries(CATEGORIES)) {
    if (enMeta[cat]) guidesMeta[dir] = label
  }
  fs.writeFileSync(path.join(OUTPUT_EN, '_meta.json'), JSON.stringify(guidesMeta, null, 2))
  fs.writeFileSync(path.join(OUTPUT_ID, '_meta.json'), JSON.stringify(guidesMeta, null, 2))

  console.log(`\n🎉 Done. Generated ${generated} pages, skipped ${skipped}.`)
}

generate().catch(console.error)
