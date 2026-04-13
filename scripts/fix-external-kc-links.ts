// Remove external links pointing to keycloak.org or nqrust-identity.org
// Convert [text](https://...keycloak...) → plain text
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

let totalFixed = 0
let touchedFiles = 0

for (const root of ROOTS) {
  for (const file of walk(root)) {
    const original = fs.readFileSync(file, 'utf-8')
    let fixed = 0

    const content = original.replace(/\[([^\]]*)\]\((https?:\/\/[^)]*(?:keycloak|nqrust-identity)[^)]*)\)/g, (match, text, href) => {
      // Keep GitHub links to keycloak repos (they're valid open source links)
      if (href.includes('github.com')) return match
      fixed++
      return text
    })

    if (fixed > 0) {
      fs.writeFileSync(file, content)
      touchedFiles++
      totalFixed += fixed
      console.log(`✅ ${path.relative(process.cwd(), file)} (${fixed} links → plain text)`)
    }
  }
}

console.log(`\n🎉 Done. ${touchedFiles} files updated, ${totalFixed} external keycloak/nqrust-identity links removed.`)
