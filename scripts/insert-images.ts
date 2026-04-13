// scripts/insert-images.ts
// Match images from public/images/ to their correct positions in MDX pages
// by checking the scraped-raw HTML for original image positions.
import * as cheerio from 'cheerio'
import fs from 'fs'
import path from 'path'

const RAW_DIR = './scraped-raw'
const EN_DIR = './pages/en/guides'
const ID_DIR = './pages/id/guides'
const IMG_DIR = './public/images'

// Map: page category/slug → scraped-raw JSON slug
const SLUG_MAP: Record<string, string> = {
  'observability/exemplars': 'observability-exemplars',
  'observability/grafana-dashboards': 'observability-grafana-dashboards',
  'observability/telemetry': 'observability-telemetry',
  'observability/tracing': 'observability-tracing',
  'securing-apps/mod-auth-mellon': 'securing-apps-mod-auth-mellon',
  'securing-apps/policy-enforcer': 'securing-apps-policy-enforcer',
  'securing-apps/token-exchange': 'securing-apps-token-exchange',
  'server/caching': 'server-caching',
}

interface ImagePosition {
  imgSrc: string          // original keycloak URL
  localPath: string       // new local path /images/...
  textBefore: string      // text/heading right before the image (for matching)
  altText: string         // alt text from original
}

function extractImagePositions(html: string, pageKey: string): ImagePosition[] {
  const $ = cheerio.load(html)
  const positions: ImagePosition[] = []

  // Get sorted list of local images for this page
  const category = pageKey.split('/')[0]
  const pageName = pageKey.split('/')[1]
  const imgFiles = fs.readdirSync(path.join(IMG_DIR, category))
    .filter(f => f.startsWith(pageName + '-'))
    .sort((a, b) => {
      const numA = parseInt(a.match(/-(\d+)\./)?.[1] || '0')
      const numB = parseInt(b.match(/-(\d+)\./)?.[1] || '0')
      return numA - numB
    })

  let imgIdx = 0
  $('img').each((_, img) => {
    const src = $(img).attr('src') || ''
    if (!src.includes('/images/guides/') && !src.includes('/resources/images/')) return
    if (imgIdx >= imgFiles.length) return

    const alt = $(img).attr('alt') || ''
    const localPath = `/images/${category}/${imgFiles[imgIdx]}`

    // Find text context: walk up to find nearest paragraph or heading before this image
    let textBefore = ''
    let $el: cheerio.Cheerio<any> = $(img).parent()
    // Walk up until we find a useful parent
    while ($el.length) {
      const $prev = $el.prev()
      if ($prev.length) {
        const tag = ($prev[0] as any).tagName?.toLowerCase() || ''
        if (/^h[1-6]$/.test(tag) || tag === 'p' || tag === 'div') {
          textBefore = $prev.text().trim().substring(0, 80)
          break
        }
      }
      $el = $el.parent()
    }

    // If no context found, try parent's text
    if (!textBefore) {
      textBefore = $(img).parent().prev().text().trim().substring(0, 80)
    }

    positions.push({ imgSrc: src, localPath, textBefore, altText: alt })
    imgIdx++
  })

  return positions
}

function insertImageInMdx(mdxPath: string, positions: ImagePosition[]): boolean {
  if (!fs.existsSync(mdxPath)) return false
  let content = fs.readFileSync(mdxPath, 'utf-8')
  let modified = false

  for (const pos of positions) {
    // Skip if image already inserted
    if (content.includes(pos.localPath)) continue

    // Find the text context in MDX
    const searchKey = pos.textBefore
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      .substring(0, 50)

    if (!searchKey || searchKey.length < 10) {
      // No context — append at end of file
      content = content.trimEnd() + `\n\n![${pos.altText}](${pos.localPath})\n`
      modified = true
      continue
    }

    const idx = content.indexOf(pos.textBefore.substring(0, 50))
    if (idx === -1) {
      // Try shorter match
      const shortKey = pos.textBefore.substring(0, 30)
      const shortIdx = content.indexOf(shortKey)
      if (shortIdx === -1) continue

      // Find end of this paragraph/line
      const lineEnd = content.indexOf('\n\n', shortIdx)
      if (lineEnd === -1) continue
      const insertAt = lineEnd
      content = content.substring(0, insertAt) + `\n\n![${pos.altText}](${pos.localPath})` + content.substring(insertAt)
      modified = true
    } else {
      // Find end of this paragraph
      const lineEnd = content.indexOf('\n\n', idx)
      if (lineEnd === -1) continue
      const insertAt = lineEnd
      content = content.substring(0, insertAt) + `\n\n![${pos.altText}](${pos.localPath})` + content.substring(insertAt)
      modified = true
    }
  }

  if (modified) fs.writeFileSync(mdxPath, content)
  return modified
}

function run() {
  for (const [pageKey, rawSlug] of Object.entries(SLUG_MAP)) {
    const rawFile = path.join(RAW_DIR, rawSlug + '.json')
    if (!fs.existsSync(rawFile)) { console.log(`⏭️  Skip ${pageKey} (no raw file)`); continue }

    const raw = JSON.parse(fs.readFileSync(rawFile, 'utf-8'))
    const positions = extractImagePositions(raw.html, pageKey)
    if (positions.length === 0) { console.log(`⏭️  Skip ${pageKey} (no images in HTML)`); continue }

    console.log(`\n📄 ${pageKey} — ${positions.length} images`)
    for (const p of positions) {
      console.log(`  ${p.localPath} → after "${p.textBefore.substring(0, 60)}..."`)
    }

    const enPath = path.join(EN_DIR, pageKey + '.mdx')
    const idPath = path.join(ID_DIR, pageKey + '.mdx')

    if (insertImageInMdx(enPath, positions)) console.log(`  ✅ EN updated`)
    if (insertImageInMdx(idPath, positions)) console.log(`  ✅ ID updated`)
  }
}

run()
