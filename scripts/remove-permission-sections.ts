// Remove "Granting permission for the exchange" sections and all broken image
// lines from EN and ID MDX files.
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

const REMOVE_SECTIONS = [
  /^####\s+Granting permission for the exchange/i,
  /^####\s+Memberikan izin untuk pertukaran/i,
]

function removeSections(content: string): string {
  const lines = content.split('\n')
  const out: string[] = []
  let skip = false
  let skipLevel = 0

  for (const line of lines) {
    const headingMatch = line.match(/^(#{1,6})\s+/)

    if (skip && headingMatch) {
      const level = headingMatch[1].length
      if (level <= skipLevel) skip = false
    }

    if (!skip) {
      let shouldRemove = false
      for (const pattern of REMOVE_SECTIONS) {
        if (pattern.test(line)) {
          shouldRemove = true
          const m = line.match(/^(#{1,6})/)
          skipLevel = m ? m[1].length : 4
          break
        }
      }
      if (shouldRemove) {
        skip = true
        if (out.length > 0 && out[out.length - 1].trim() === '') out.pop()
        continue
      }
    }

    if (!skip) out.push(line)
  }

  return out.join('\n')
}

function removeBrokenImages(content: string): string {
  const lines = content.split('\n')
  const out: string[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (/^!\[.*\]\(\/en\/guides\/resources\//.test(trimmed) ||
        /^!\[.*\]\(\/id\/guides\/resources\//.test(trimmed) ||
        /^!\[.*\]\(https?:\/\/.*keycloak\.org\/resources\/images\//.test(trimmed) ||
        /^!\[.*\]\(https?:\/\/.*nqrust-identity\.org\/resources\/images\//.test(trimmed)) {
      continue
    }
    if (/^\s*Figure \d+\./.test(trimmed)) continue
    out.push(line)
  }

  return out.join('\n').replace(/\n{3,}/g, '\n\n')
}

let touchedSections = 0
let touchedImages = 0

for (const root of ROOTS) {
  for (const f of walk(root)) {
    const original = fs.readFileSync(f, 'utf-8')
    let modified = removeSections(original)
    modified = removeBrokenImages(modified)

    if (modified !== original) {
      fs.writeFileSync(f, modified)
      const rel = path.relative(process.cwd(), f)
      const sectionsRemoved = (original.match(/Granting permission|Memberikan izin untuk pertukaran/gi) || []).length
      const imagesRemoved = (original.match(/!\[.*\]\(.*resources\/images/g) || []).length
      if (sectionsRemoved > 0) { touchedSections++; console.log(`✅ Removed ${sectionsRemoved} permission sections: ${rel}`) }
      if (imagesRemoved > 0) { touchedImages++; console.log(`✅ Removed ${imagesRemoved} broken images: ${rel}`) }
      if (sectionsRemoved === 0 && imagesRemoved === 0) console.log(`✅ Cleaned: ${rel}`)
    }
  }
}

console.log(`\n🎉 Done. ${touchedSections} files had permission sections removed, ${touchedImages} files had broken images removed.`)
