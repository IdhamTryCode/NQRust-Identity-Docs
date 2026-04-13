// scripts/process-content.ts
import fs from 'fs'
import path from 'path'

const INPUT_DIR = './scraped-raw'
const OUTPUT_DIR = './scraped-processed'

const REPLACEMENTS: [RegExp, string][] = [
  // Internal doc links → relative path. Run BEFORE the brand rename so we
  // can match `keycloak.org`. Replace with a placeholder that generate-mdx
  // (or a later step) will rewrite per-locale to /<locale>/guides/<path>.
  [/https?:\/\/(?:www\.)?keycloak\.org\/([a-z][a-z0-9\-/]*)/g, '/__GUIDES__/$1'],
  // Keycloak branding → NQRust-Identity
  [/Keycloak/g, 'NQRust-Identity'],
  [/keycloak/g, 'nqrust-identity'],
  [/KEYCLOAK/g, 'NQRUST-IDENTITY'],
  // Org references
  [/Red Hat, Inc\./g, 'NQ Research'],
  [/Red Hat/g, 'NQ Research'],
  [/JBoss/g, 'NQRust'],
  // Community
  [/the Keycloak community/g, 'the NQRust-Identity team'],
  [/Keycloak documentation/g, 'NQRust-Identity documentation'],
  [/Keycloak server/g, 'Identity server'],
  [/Keycloak realm/g, 'Identity realm'],
]

function processText(text: string): string {
  let result = text
  for (const [pattern, replacement] of REPLACEMENTS) {
    result = result.replace(pattern, replacement)
  }
  return result
}

async function processAll() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'))

  if (files.length === 0) {
    console.log('No scraped files found. Run pnpm scrape first.')
    process.exit(1)
  }

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8'))
    const processed = {
      ...raw,
      title: processText(raw.title),
      text: processText(raw.text),
      html: processText(raw.html),
    }
    fs.writeFileSync(
      path.join(OUTPUT_DIR, file),
      JSON.stringify(processed, null, 2)
    )
    console.log(`✅ Processed: ${file}`)
  }
  console.log('\n🎉 Processing done.')
}

processAll().catch(console.error)
