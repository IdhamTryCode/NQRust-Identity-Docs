// scripts/fix-table-angles.ts
// One-shot: walks all .mdx files, finds markdown table rows, and escapes
// literal < > characters that appear OUTSIDE backtick code spans within cells.
// Existing &lt; / &gt; / <br/> are preserved.

import fs from 'fs'
import path from 'path'

const ROOTS = ['./pages/en/guides', './pages/id/guides']

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
      // Don't touch our own <br/> markers or already-escaped entities
      const escaped = seg.replace(/<(?!br\s*\/?>)([^>]*?)>/g, (_m, inner) => {
        // Skip valid self-closing/closing tags we know are safe (very limited list)
        return '&lt;' + inner + '&gt;'
      })
      parts.push(escaped)
      i += seg.length
    }
  }
  return parts.join('')
}

function processFile(file: string): boolean {
  const original = fs.readFileSync(file, 'utf-8')
  const lines = original.split(/\r?\n/)
  let changed = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Only touch table rows: start with `|`, contain at least one cell separator
    if (!/^\s*\|.*\|\s*$/.test(line)) continue
    // Skip the separator row `| --- | --- |`
    if (/^\s*\|(\s*:?-+:?\s*\|)+\s*$/.test(line)) continue
    const fixed = escapeAngleOutsideCode(line)
    if (fixed !== line) {
      lines[i] = fixed
      changed = true
    }
  }
  if (changed) fs.writeFileSync(file, lines.join('\n'), 'utf-8')
  return changed
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
for (const root of ROOTS) {
  for (const f of walk(root)) {
    if (processFile(f)) {
      touched++
      console.log(`✅ ${path.relative(process.cwd(), f)}`)
    }
  }
}
console.log(`\n🎉 Done. ${touched} files updated.`)
