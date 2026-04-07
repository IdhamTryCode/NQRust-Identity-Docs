# MASTERPLAN: NQRust-Identity Documentation Website
> Status: Ready to Execute | Stack: Nextra + Tailwind + shadcn/ui | Package Manager: pnpm

---

## 📋 Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack & Rationale](#2-tech-stack--rationale)
3. [Project Structure](#3-project-structure)
4. [Phase 0 — Pre-Setup Checklist](#phase-0--pre-setup-checklist)
5. [Phase 1 — Project Initialization](#phase-1--project-initialization)
6. [Phase 2 — Nextra Configuration](#phase-2--nextra-configuration)
7. [Phase 3 — Tailwind & shadcn Setup](#phase-3--tailwind--shadcn-setup)
8. [Phase 4 — Branding & Theming](#phase-4--branding--theming)
9. [Phase 5 — Scraper (Keycloak Guides)](#phase-5--scraper-keycloak-guides)
10. [Phase 6 — Content Processing Pipeline](#phase-6--content-processing-pipeline)
11. [Phase 7 — Bilingual (i18n) Setup](#phase-7--bilingual-i18n-setup)
12. [Phase 8 — Versioning Foundation](#phase-8--versioning-foundation)
13. [Phase 9 — UI/UX Components](#phase-9--uiux-components)
14. [Phase 10 — Dark/Light Mode](#phase-10--darklight-mode)
15. [Phase 11 — QA & Polish](#phase-11--qa--polish)
16. [Phase 12 — Deployment Prep](#phase-12--deployment-prep)
17. [File Reference](#file-reference)
18. [Replacement Dictionary](#replacement-dictionary)

---

## 1. Project Overview

| Field | Detail |
|---|---|
| **Product Name** | NQRust-Identity |
| **Short Name** | Identity |
| **Type** | Keycloak fork (skinned) — Keycloak tidak disebutkan di docs |
| **Target Audience** | End users |
| **Languages** | Bahasa Indonesia (primary) + English |
| **Color Brand** | Orange `#f36523` |
| **Dark/Light Mode** | ✅ Wajib |
| **Versioning** | ✅ Fondasi disiapkan, belum aktif |
| **Content Source** | Scrape dari keycloak.org/guides#getting-started |
| **Hosting** | TBD (Vercel-ready) |

---

## 2. Tech Stack & Rationale

### Kenapa Nextra?
- Didesain **khusus untuk dokumentasi** — bukan general-purpose framework
- Built on Next.js → familiar buat kamu (routing, SSR, dll sama)
- Support MDX out of the box → komponen React bisa masuk ke konten docs
- Built-in full-text search (Flexsearch)
- Built-in dark mode
- Built-in i18n
- Built-in versioning support via folder structure
- Performa sangat ringan — static export ready

### Stack Final

| Layer | Tool | Versi |
|---|---|---|
| Framework | Next.js | 14.x |
| Docs Engine | Nextra | 2.x (stable) |
| Styling | Tailwind CSS | 3.x |
| UI Components | shadcn/ui | latest |
| Package Manager | pnpm | latest |
| Language | TypeScript | 5.x |
| Content | MDX | via Nextra |
| Search | Flexsearch | via Nextra built-in |
| Scraper | Playwright | latest |
| i18n | next-i18next / Nextra i18n | built-in |
| Icons | Lucide React | latest |
| Fonts | Geist (display) + Inter (body, via Nextra default bisa override) | — |

---

## 3. Project Structure

```
nqrust-identity-docs/
├── pages/
│   ├── _app.tsx
│   ├── _document.tsx
│   ├── index.mdx                        # Landing / redirect
│   ├── en/                              # English docs
│   │   ├── _meta.json
│   │   ├── getting-started/
│   │   │   ├── _meta.json
│   │   │   ├── index.mdx
│   │   │   ├── installation.mdx
│   │   │   └── ...
│   │   └── guides/
│   │       ├── _meta.json
│   │       └── ...
│   └── id/                              # Bahasa Indonesia docs
│       ├── _meta.json
│       └── ... (mirror dari en/)
├── components/
│   ├── ui/                              # shadcn components
│   ├── Logo.tsx
│   ├── HeroBanner.tsx
│   ├── VersionBadge.tsx
│   └── LanguageSwitcher.tsx
├── public/
│   ├── logo.png                         # ← Taruh logo NQR di sini
│   ├── favicon.ico
│   └── og-image.png
├── scripts/
│   ├── scraper.ts                       # Playwright scraper
│   ├── process-content.ts               # Replace Keycloak → NQRust-Identity
│   └── generate-mdx.ts                  # Generate MDX files dari hasil scrape
├── styles/
│   └── globals.css
├── theme.config.tsx                     # Nextra theme config (logo, nav, footer)
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── i18n.json                            # Nextra i18n config
├── .env.local
└── package.json
```

---

## Phase 0 — Pre-Setup Checklist

Sebelum mulai, pastikan ini sudah siap:

- [ ] Node.js ≥ 18.x installed (`node -v`)
- [ ] pnpm installed: `npm install -g pnpm`
- [ ] Playwright system deps: `pnpm dlx playwright install chromium`
- [ ] Logo file `nqr.png` disiapkan → akan di-copy ke `public/logo.png`
- [ ] Koneksi internet aktif (untuk scraping)
- [ ] Git repo disiapkan (opsional tapi recommended)

---

## Phase 1 — Project Initialization

### 1.1 Init Project Nextra

```bash
# Buat folder project
mkdir nqrust-identity-docs && cd nqrust-identity-docs

# Init pnpm project
pnpm init

# Install Next.js + Nextra + React
pnpm add next@14 react react-dom nextra nextra-theme-docs

# Install TypeScript + types
pnpm add -D typescript @types/react @types/node @types/react-dom

# Generate tsconfig
pnpm dlx tsc --init
```

### 1.2 Install Tailwind CSS

```bash
pnpm add -D tailwindcss postcss autoprefixer
pnpm dlx tailwindcss init -p
```

### 1.3 Init shadcn/ui

```bash
pnpm dlx shadcn@latest init
# Pilih:
# - Style: Default
# - Base color: Orange (atau Neutral, lalu kita override manual ke #f36523)
# - CSS variables: Yes
```

### 1.4 Install shadcn Components yang Dibutuhkan

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add badge
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add separator
pnpm dlx shadcn@latest add tabs
pnpm dlx shadcn@latest add tooltip
pnpm dlx shadcn@latest add dropdown-menu
pnpm dlx shadcn@latest add scroll-area
pnpm dlx shadcn@latest add alert
pnpm dlx shadcn@latest add code  # jika tersedia, atau pakai custom
```

### 1.5 Install Dependencies Tambahan

```bash
# Icons
pnpm add lucide-react

# Scraper
pnpm add -D playwright @playwright/test
pnpm dlx playwright install chromium

# Content processing
pnpm add -D gray-matter remark remark-mdx

# i18n (opsional helper)
pnpm add next-i18next
```

### 1.6 Setup Scripts di package.json

Tambahkan manual ke `package.json` bagian `scripts`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "scrape": "pnpm tsx scripts/scraper.ts",
    "process": "pnpm tsx scripts/process-content.ts",
    "generate": "pnpm tsx scripts/generate-mdx.ts",
    "docs:build": "pnpm scrape && pnpm process && pnpm generate",
    "lint": "next lint"
  }
}
```

```bash
# Install tsx untuk run TypeScript scripts langsung
pnpm add -D tsx
```

---

## Phase 2 — Nextra Configuration

### 2.1 next.config.js

```js
// next.config.js
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  flexsearch: {
    codeblocks: false
  },
  staticImage: true,
})

module.exports = withNextra({
  i18n: {
    locales: ['id', 'en'],
    defaultLocale: 'id',
  },
  images: {
    domains: [],
  },
})
```

### 2.2 i18n.json (Nextra i18n config)

```json
[
  { "locale": "id", "text": "Bahasa Indonesia" },
  { "locale": "en", "text": "English" }
]
```

### 2.3 theme.config.tsx (Nextra Theme — Konfigurasi Utama)

```tsx
// theme.config.tsx
import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import Logo from './components/Logo'

const config: DocsThemeConfig = {
  logo: <Logo />,
  project: {
    link: 'https://github.com/your-org/nqrust-identity', // ganti URL
  },
  docsRepositoryBase: 'https://github.com/your-org/nqrust-identity-docs/blob/main',
  footer: {
    text: `© ${new Date().getFullYear()} NQRust-Identity. All rights reserved.`,
  },
  primaryHue: 22,         // Hue untuk orange #f36523
  primarySaturation: 90,
  useNextSeoProps() {
    return {
      titleTemplate: '%s – NQRust-Identity Docs'
    }
  },
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta property="og:title" content="NQRust-Identity Documentation" />
      <meta property="og:description" content="Official documentation for NQRust-Identity" />
    </>
  ),
  sidebar: {
    titleComponent({ title, type }) {
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true,
  },
  toc: {
    backToTop: true,
  },
  editLink: {
    text: 'Edit this page on GitHub →'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback',
  },
  i18n: [
    { locale: 'id', text: 'Bahasa Indonesia' },
    { locale: 'en', text: 'English' },
  ],
}

export default config
```

---

## Phase 3 — Tailwind & shadcn Setup

### 3.1 tailwind.config.ts

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './theme.config.tsx',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#f36523',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f36523',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      fontFamily: {
        sans: ['Geist', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

```bash
# Install animate plugin untuk shadcn
pnpm add -D tailwindcss-animate
```

### 3.2 styles/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --brand: 22 89% 54%;          /* #f36523 in HSL */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 22 89% 54%;
    --primary-foreground: 0 0% 100%;
    --radius: 0.5rem;
    /* shadcn CSS vars lainnya di-generate otomatis oleh shadcn init */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --primary: 22 89% 54%;
    --primary-foreground: 0 0% 100%;
  }
}
```

---

## Phase 4 — Branding & Theming

### 4.1 Logo Component

```bash
# Copy logo ke public (sesuaikan path asal logo kamu)
cp /path/to/nqr.png public/logo.png
```

```tsx
// components/Logo.tsx
import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.png" alt="NQRust-Identity" width={32} height={32} />
      <span className="font-bold text-[#f36523] tracking-tight hidden sm:block">
        NQRust-Identity
      </span>
    </div>
  )
}
```

### 4.2 Favicon & OG Image

```bash
# Convert logo ke favicon (pakai sharp atau imagemagick)
pnpm add -D sharp

# Script convert (tambahkan ke scripts/generate-assets.ts):
# - Input: public/logo.png
# - Output: public/favicon.ico, public/og-image.png (1200x630)
```

---

## Phase 5 — Scraper (Keycloak Guides)

### 5.1 Install Playwright

```bash
pnpm add -D playwright
pnpm dlx playwright install chromium
```

### 5.2 scripts/scraper.ts

```ts
// scripts/scraper.ts
import { chromium } from 'playwright'
import fs from 'fs'
import path from 'path'

const BASE_URL = 'https://www.keycloak.org'
const GUIDES_URL = `${BASE_URL}/guides`
const OUTPUT_DIR = './scraped-raw'

async function scrapeGuides() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  const page = await browser.newPage()

  // Step 1: Ambil daftar semua guide links dari halaman utama
  await page.goto(`${GUIDES_URL}#getting-started`)
  await page.waitForLoadState('networkidle')

  const guideLinks = await page.evaluate(() => {
    const links: { title: string; href: string; section: string }[] = []
    document.querySelectorAll('a[href*="/guides/"]').forEach((el) => {
      const href = (el as HTMLAnchorElement).href
      const title = el.textContent?.trim() || ''
      const section = el.closest('section')?.querySelector('h2')?.textContent?.trim() || 'misc'
      if (href && title) links.push({ title, href, section })
    })
    return links
  })

  console.log(`Found ${guideLinks.length} guides`)

  // Step 2: Scrape isi tiap guide
  const results: ScrapedPage[] = []

  for (const guide of guideLinks) {
    try {
      await page.goto(guide.href)
      await page.waitForLoadState('networkidle')

      const content = await page.evaluate(() => {
        const main = document.querySelector('main') || document.querySelector('article') || document.body
        return {
          title: document.querySelector('h1')?.textContent?.trim() || '',
          html: main?.innerHTML || '',
          text: main?.innerText || '',
        }
      })

      results.push({
        ...guide,
        ...content,
        slug: guide.href.replace(BASE_URL, '').replace('/guides/', '').replace(/\//g, '-'),
      })

      // Simpan per file
      fs.writeFileSync(
        path.join(OUTPUT_DIR, `${results[results.length - 1].slug}.json`),
        JSON.stringify(results[results.length - 1], null, 2)
      )

      console.log(`✅ Scraped: ${guide.title}`)
      await page.waitForTimeout(500) // throttle
    } catch (err) {
      console.error(`❌ Failed: ${guide.title}`, err)
    }
  }

  await browser.close()
  console.log(`\n🎉 Scraping done. ${results.length} pages saved to ${OUTPUT_DIR}/`)
}

interface ScrapedPage {
  title: string
  href: string
  section: string
  slug: string
  html: string
  text: string
}

scrapeGuides().catch(console.error)
```

---

## Phase 6 — Content Processing Pipeline

### 6.1 Replacement Dictionary (Lengkap)

Lihat section [Replacement Dictionary](#replacement-dictionary) di bawah.

### 6.2 scripts/process-content.ts

```ts
// scripts/process-content.ts
import fs from 'fs'
import path from 'path'

const INPUT_DIR = './scraped-raw'
const OUTPUT_DIR = './scraped-processed'

// Dictionary replacement
const REPLACEMENTS: [RegExp, string][] = [
  [/Keycloak/g, 'NQRust-Identity'],
  [/keycloak/g, 'nqrust-identity'],
  [/KEYCLOAK/g, 'NQRUST-IDENTITY'],
  [/keycloak\.org/g, 'nqrust-identity.dev'],  // ganti dengan domain kamu
  [/Red Hat/g, 'NQ Research'],                 // sesuaikan jika perlu
  // Tambahkan replacement lain sesuai kebutuhan
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
```

### 6.3 scripts/generate-mdx.ts

```ts
// scripts/generate-mdx.ts
// Konversi JSON processed → MDX files untuk Nextra
import fs from 'fs'
import path from 'path'
import TurndownService from 'turndown'

// Install turndown untuk HTML → Markdown
// pnpm add -D turndown @types/turndown

const INPUT_DIR = './scraped-processed'
const OUTPUT_EN = './pages/en/guides'
const OUTPUT_ID = './pages/id/guides'   // nanti di-translate manual/auto

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

async function generateMDX() {
  fs.mkdirSync(OUTPUT_EN, { recursive: true })
  fs.mkdirSync(OUTPUT_ID, { recursive: true })

  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'))
  const metaEntries: Record<string, string> = {}

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8'))
    const markdown = td.turndown(data.html)
    const slug = file.replace('.json', '')
    const mdxContent = `---
title: ${data.title}
description: ${data.title} - NQRust-Identity Documentation
---

# ${data.title}

${markdown}
`
    fs.writeFileSync(path.join(OUTPUT_EN, `${slug}.mdx`), mdxContent)
    metaEntries[slug] = data.title
    console.log(`✅ Generated: ${slug}.mdx`)
  }

  // Generate _meta.json for Nextra sidebar
  fs.writeFileSync(
    path.join(OUTPUT_EN, '_meta.json'),
    JSON.stringify(metaEntries, null, 2)
  )

  console.log('\n🎉 MDX generation done.')
}

generateMDX().catch(console.error)
```

```bash
# Install turndown
pnpm add -D turndown @types/turndown
```

---

## Phase 7 — Bilingual (i18n) Setup

### 7.1 Struktur Folder

```
pages/
├── en/          ← English
│   ├── _meta.json
│   └── guides/
│       ├── _meta.json
│       └── *.mdx
└── id/          ← Bahasa Indonesia
    ├── _meta.json
    └── guides/
        ├── _meta.json
        └── *.mdx  ← Copy dari en/, translate secara bertahap
```

### 7.2 _meta.json root en/

```json
{
  "index": "Beranda",
  "getting-started": "Memulai",
  "guides": "Panduan",
  "---": {
    "type": "separator"
  }
}
```

### 7.3 Strategi Terjemahan

1. **Fase awal**: Konten en/ dulu selesaikan, id/ bisa pakai copy + translate manual bertahap
2. **Prioritas terjemahan**: Getting Started dan halaman-halaman paling banyak dikunjungi
3. **Tool bantu**: Bisa pakai DeepL API atau ChatGPT batch translate untuk akselerasi

### 7.4 Language Switcher

Nextra sudah handle ini otomatis via `i18n` di `next.config.js`. Pastikan `i18n.json` sudah benar (Phase 2.2).

---

## Phase 8 — Versioning Foundation

### 8.1 Struktur (Siap, Belum Aktif)

```
pages/
└── en/
    ├── v1/          ← Saat versioning diaktifkan nanti
    │   └── ...
    └── ...          ← Saat ini, konten langsung di sini (dianggap v1)
```

### 8.2 VersionBadge Component (Siap Pakai)

```tsx
// components/VersionBadge.tsx
export function VersionBadge({ version = '1.0' }: { version?: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-brand/10 text-brand border border-brand/30">
      v{version}
    </span>
  )
}
```

### 8.3 Catatan Aktivasi Versioning

Saat versioning dibutuhkan nanti:
1. Buat folder `pages/en/v2/` (dst)
2. Tambahkan dropdown version selector di `theme.config.tsx`
3. Update `_meta.json` dengan entry versi

---

## Phase 9 — UI/UX Components

### 9.1 Halaman Landing (pages/index.mdx)

```mdx
---
title: NQRust-Identity
---

import { HeroBanner } from '../components/HeroBanner'

<HeroBanner />
```

### 9.2 HeroBanner Component

```tsx
// components/HeroBanner.tsx
import Link from 'next/link'

export function HeroBanner() {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-sm font-medium mb-6">
        ✦ Identity Management, Simplified
      </div>
      <h1 className="text-5xl font-bold mb-4 tracking-tight">
        NQRust-Identity
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
        Documentation resmi untuk NQRust-Identity — platform manajemen identitas yang cepat, aman, dan mudah dikonfigurasi.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/id/getting-started" className="px-6 py-3 bg-brand text-white rounded-lg font-medium hover:bg-brand/90 transition-colors">
          Mulai Sekarang →
        </Link>
        <Link href="/en/getting-started" className="px-6 py-3 border border-brand/30 text-brand rounded-lg font-medium hover:bg-brand/5 transition-colors">
          Get Started (EN)
        </Link>
      </div>
    </div>
  )
}
```

### 9.3 Callout / Alert Components (via MDX)

Nextra sudah punya built-in `<Callout>` component. Gunakan:

```mdx
import { Callout } from 'nextra/components'

<Callout type="info">
  Catatan penting di sini
</Callout>

<Callout type="warning">
  Perhatian!
</Callout>
```

### 9.4 Code Blocks

Nextra sudah handle syntax highlighting otomatis dengan Shiki. Tinggal pakai fenced code blocks:

````mdx
```bash
pnpm install nqrust-identity
```
````

---

## Phase 10 — Dark/Light Mode

Nextra sudah built-in dark mode toggle di navbar. Tidak perlu setup tambahan.

Untuk custom styling dark mode di komponen:

```tsx
// Gunakan Tailwind dark: prefix
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

CSS Variables sudah setup di Phase 3.2 untuk support dark/light.

---

## Phase 11 — QA & Polish

### Checklist Sebelum Launch

#### Content
- [ ] Semua kata "Keycloak" sudah terganti di semua MDX files
- [ ] Semua link internal sudah benar (tidak ada link ke keycloak.org)
- [ ] Tidak ada referensi ke Red Hat / JBoss (kecuali yang memang relevan)
- [ ] Title dan description setiap halaman sudah diisi
- [ ] Favicon sudah benar

#### UI/UX
- [ ] Dark mode ✅ semua halaman
- [ ] Light mode ✅ semua halaman
- [ ] Mobile responsive ✅
- [ ] Language switcher berfungsi (ID ↔ EN)
- [ ] Sidebar navigation benar
- [ ] Search (Flexsearch) berfungsi
- [ ] Code blocks memiliki copy button

#### Performance
- [ ] `next build` berhasil tanpa error
- [ ] Halaman utama load < 2s
- [ ] Images dioptimasi (Next.js Image component)

#### SEO
- [ ] `og:title` dan `og:description` di setiap halaman
- [ ] Sitemap ter-generate (tambahkan `next-sitemap` jika perlu)
- [ ] robots.txt ada

---

## Phase 12 — Deployment Prep

### Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Self-Hosted (Docker)

```dockerfile
# Dockerfile (buat saat dibutuhkan)
FROM node:18-alpine
RUN npm install -g pnpm
WORKDIR /app
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
```

### Static Export (GitHub Pages)

```js
// next.config.js — tambahkan:
module.exports = withNextra({
  output: 'export',
  // ...
})
```

---

## File Reference

| File | Fungsi |
|---|---|
| `next.config.js` | Next.js + Nextra config, i18n locales |
| `theme.config.tsx` | Logo, navbar, footer, search, i18n toggle |
| `tailwind.config.ts` | Brand colors, fonts, dark mode class |
| `styles/globals.css` | CSS variables untuk shadcn + brand |
| `i18n.json` | Nextra locale labels |
| `pages/_app.tsx` | Global providers (jika ada) |
| `components/Logo.tsx` | Logo component dengan gambar + text |
| `components/HeroBanner.tsx` | Landing page hero |
| `components/VersionBadge.tsx` | Badge versi untuk future use |
| `scripts/scraper.ts` | Playwright scraper Keycloak guides |
| `scripts/process-content.ts` | Replace Keycloak → NQRust-Identity |
| `scripts/generate-mdx.ts` | HTML → MDX converter |
| `public/logo.png` | Logo NQR ← **taruh file kamu di sini** |

---

## Replacement Dictionary

Daftar lengkap replacement yang dipakai di `process-content.ts`:

| Original | Replacement |
|---|---|
| `Keycloak` | `NQRust-Identity` |
| `keycloak` | `nqrust-identity` |
| `KEYCLOAK` | `NQRUST-IDENTITY` |
| `keycloak.org` | `nqrust-identity.dev` _(sesuaikan)_ |
| `Red Hat` | `NQ Research` _(sesuaikan)_ |
| `Red Hat, Inc.` | `NQ Research` _(sesuaikan)_ |
| `JBoss` | _(hapus atau ganti)_ |
| `Apache License 2.0` | _(pertahankan untuk compliance)_ |
| `the Keycloak community` | `the NQRust-Identity team` |
| `Keycloak documentation` | `NQRust-Identity documentation` |
| `Keycloak server` | `Identity server` |
| `Keycloak realm` | `Identity realm` |

> ⚠️ **PENTING**: Jangan replace referensi Apache License 2.0 karena ini kewajiban attribution dari lisensi sumber.

---

## 🚀 Quick Start Ringkasan (TL;DR)

```bash
# 1. Init project
mkdir nqrust-identity-docs && cd nqrust-identity-docs
pnpm init
pnpm add next@14 react react-dom nextra nextra-theme-docs
pnpm add -D typescript @types/react @types/node @types/react-dom tailwindcss postcss autoprefixer tsx turndown @types/turndown playwright

# 2. Setup Tailwind
pnpm dlx tailwindcss init -p

# 3. Setup shadcn
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button badge card separator tabs tooltip dropdown-menu scroll-area alert

# 4. Install Playwright browser
pnpm dlx playwright install chromium

# 5. Konfigurasi file (lihat masing-masing Phase di atas)

# 6. Jalankan pipeline scraping
pnpm docs:build

# 7. Dev server
pnpm dev
```

---

_Masterplan ini dibuat untuk project NQRust-Identity Documentation. Versi 1.0 — April 2026._