// scripts/scraper.ts
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://www.keycloak.org'
const GUIDES_URL = `${BASE_URL}/guides`
const OUTPUT_DIR = './scraped-raw'

interface ScrapedPage {
  title: string
  href: string
  section: string
  slug: string
  html: string
  text: string
}

async function scrapeGuides() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  // Step 1: Get all guide links from card elements
  await page.goto(GUIDES_URL)
  await page.waitForTimeout(2000)

  const guideLinks = await page.evaluate((baseUrl: string) => {
    const links: { title: string; href: string; section: string }[] = []
    const seen = new Set<string>()

    // Find all cards - each card has a link and belongs to a section
    const cards = document.querySelectorAll('.card')
    cards.forEach(card => {
      const anchor = card.querySelector('a[href]') as HTMLAnchorElement | null
      if (!anchor) return

      const href = anchor.href
      if (!href.startsWith(baseUrl) || seen.has(href)) return
      seen.add(href)

      // Get title from card text
      const title = (card as HTMLElement).innerText?.trim().split('\n')[0] || ''

      // Find section by traversing up to find a section heading
      let section = 'misc'
      let el: Element | null = card
      while (el) {
        const prev = el.previousElementSibling
        if (prev) {
          const h2 = prev.querySelector('h2') || (prev.tagName === 'H2' ? prev : null)
          if (h2) {
            section = h2.textContent?.trim() || 'misc'
            break
          }
        }
        el = el.parentElement
      }

      // Fallback: use URL path segment as section
      if (section === 'misc') {
        const parts = href.replace(baseUrl + '/', '').split('/')
        section = parts[0] || 'misc'
      }

      links.push({ title, href, section })
    })

    return links
  }, BASE_URL)

  console.log(`Found ${guideLinks.length} guides`)

  const results: ScrapedPage[] = []

  // Step 2: Scrape each guide page
  for (const guide of guideLinks) {
    try {
      await page.goto(guide.href)
      await page.waitForLoadState('networkidle')

      const content = await page.evaluate(() => {
        // Try Antora structures first, then Keycloak's bootstrap layout (kc-article)
        const article = (
          document.querySelector('article.doc') ||
          document.querySelector('article') ||
          document.querySelector('.doc') ||
          document.querySelector('.kc-article .col-md-9') ||
          document.querySelector('.kc-article')
        ) as HTMLElement | null

        let html = ''
        let text = ''

        if (article) {
          html = article.innerHTML
          text = article.innerText
        } else {
          // Fallback: combine all .sect1 sections + preamble
          const preamble = document.querySelector('#preamble') as HTMLElement | null
          const sections = Array.from(document.querySelectorAll('.sect1')) as HTMLElement[]
          const parts = [...(preamble ? [preamble] : []), ...sections]
          html = parts.map(el => el.outerHTML).join('\n')
          text = parts.map(el => el.innerText).join('\n')
        }

        return {
          title: document.querySelector('h1')?.textContent?.trim() || '',
          html,
          text,
        }
      })

      const slug = guide.href
        .replace(BASE_URL + '/', '')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/gi, '-')
        .toLowerCase()

      const scraped: ScrapedPage = {
        title: content.title || guide.title,
        href: guide.href,
        section: guide.section,
        slug,
        html: content.html,
        text: content.text,
      }
      results.push(scraped)

      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${slug}.json`),
        JSON.stringify(scraped, null, 2)
      )

      console.log(`✅ Scraped: ${guide.title} → ${slug}`)
      await page.waitForTimeout(500)
    } catch (err) {
      console.error(`❌ Failed: ${guide.title}`, err)
    }
  }

  await browser.close()
  console.log(`\n🎉 Done. ${results.length} pages saved to ${OUTPUT_DIR}/`)
}

scrapeGuides().catch(console.error)
