// scripts/revert-codeblocks-branding.ts
// Inside fenced code blocks (``` ... ```) ONLY, revert NQRust-Identity branding
// back to Keycloak so URLs, package IDs, container names, env vars, XML namespaces,
// Java class names, etc. remain valid against upstream resources.
//
// Prose outside code blocks is left untouched — the doc still reads as
// "NQRust-Identity" everywhere except in copy-pasteable snippets.

import fs from 'fs'
import path from 'path'

function walk(d: string): string[] {
  const out: string[] = []
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else if (e.name.endsWith('.mdx')) out.push(full)
  }
  return out
}

function revertInside(body: string): string {
  return body
    .replace(/NQRUST-IDENTITY/g, 'KEYCLOAK')
    .replace(/NQRust-Identity/g, 'Keycloak')
    .replace(/nqrust-identity/g, 'keycloak')
}

function processFile(file: string): boolean {
  const before = fs.readFileSync(file, 'utf-8')
  // 1) Fenced code blocks with optional language tag.
  let after = before.replace(/(```[a-zA-Z0-9_-]*\n)([\s\S]*?)(```)/g, (_, open, body, close) => {
    return open + revertInside(body) + close
  })
  // 2) Inline code spans `...` (single-line).
  after = after.replace(/`([^`\n]+)`/g, (_full, body) => '`' + revertInside(body) + '`')
  if (after !== before) {
    fs.writeFileSync(file, after)
    return true
  }
  return false
}

let touched = 0
for (const f of walk('./pages')) {
  if (processFile(f)) touched++
}
console.log(`✅ Reverted code-block branding in ${touched} files`)
