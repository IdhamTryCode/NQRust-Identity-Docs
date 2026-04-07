// scripts/generate-mdx.ts
// Convert processed JSON → MDX files for Nextra, organized by category
import fs from 'fs'
import path from 'path'
import TurndownService from 'turndown'

const INPUT_DIR = './scraped-processed'
const OUTPUT_EN = './pages/en/guides'
const OUTPUT_ID = './pages/id/guides'

const td = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

// Preserve code blocks / pre tags
td.addRule('fencedCodeBlock', {
  filter: ['pre'],
  replacement(content, node) {
    const code = (node as Element).querySelector('code')
    const lang = code?.className?.replace('language-', '') || ''
    const text = code?.textContent || content
    return `\n\`\`\`${lang}\n${text}\n\`\`\`\n`
  }
})

// Category prefix → { dir, label }
const CATEGORIES: Record<string, { dir: string; label: string }> = {
  'getting-started':   { dir: 'getting-started',   label: 'Getting Started' },
  'server':            { dir: 'server',             label: 'Server' },
  'operator':          { dir: 'operator',           label: 'Operator' },
  'observability':     { dir: 'observability',      label: 'Observability' },
  'securing-apps':     { dir: 'securing-apps',      label: 'Securing Applications' },
  'high-availability': { dir: 'high-availability',  label: 'High Availability' },
  'ui-customization':  { dir: 'ui-customization',   label: 'UI Customization' },
  'migration':         { dir: 'migration',          label: 'Migration' },
}

// Predefined order per category (matches Keycloak docs order)
const CATEGORY_ORDER: Record<string, string[]> = {
  'getting-started': [
    'getting-started-zip',
    'getting-started-docker',
    'getting-started-podman',
    'getting-started-kube',
    'getting-started-openshift',
    'getting-started-scaling-and-tuning',
  ],
  'server': [
    'configuration',
    'configuration-production',
    'bootstrap-admin-recovery',
    'directory-structure',
    'containers',
    'enabletls',
    'hostname',
    'reverseproxy',
    'db',
    'caching',
    'outgoinghttp',
    'keycloak-truststore',
    'mutual-tls',
    'features',
    'configuration-provider',
    'logging',
    'fips',
    'management-interface',
    'importexport',
    'vault',
    'all-config',
    'all-provider-config',
    'update-compatibility',
    'windows-service',
  ],
  'operator': [
    'installation',
    'basic-deployment',
    'realm-import',
    'advanced-configuration',
    'rolling-updates',
    'customizing-keycloak',
  ],
  'observability': [
    'telemetry',
    'health',
    'configuration-metrics',
    'event-metrics',
    'keycloak-service-level-indicators',
    'metrics-for-troubleshooting',
    'tracing',
    'grafana-dashboards',
    'exemplars',
  ],
  'securing-apps': [
    'overview',
    'oidc-layers',
    'javascript-adapter',
    'nodejs-adapter',
    'mod-auth-openidc',
    'saml-galleon-layers',
    'mod-auth-mellon',
    'docker-registry',
    'client-registration',
    'client-registration-cli',
    'mcp-authz-server',
    'token-exchange',
    'jwt-authorization-grant',
    'specifications',
    'admin-client',
    'authz-client',
    'policy-enforcer',
    'upgrading',
  ],
  'high-availability': [
    'introduction',
    'single-cluster-introduction',
    'multi-cluster-introduction',
  ],
  'ui-customization': [
    'introduction',
    'themes',
    'quick-theme',
    'localization',
    'avatars',
    'welcome-theme',
    'creating-your-own-console',
    'themes-react',
  ],
  'migration': [
    'migrating-to-quarkus',
  ],
}

function detectCategory(slug: string): { category: string; fileSlug: string } {
  // Try longest prefix first to avoid false matches (e.g. 'securing-apps' before 'securing')
  const prefixes = Object.keys(CATEGORIES).sort((a, b) => b.length - a.length)
  for (const prefix of prefixes) {
    if (slug.startsWith(prefix + '-')) {
      return {
        category: prefix,
        fileSlug: slug.slice(prefix.length + 1),
      }
    }
  }
  return { category: 'misc', fileSlug: slug }
}

function cleanDir(dir: string) {
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      const full = path.join(dir, f)
      if (fs.statSync(full).isFile()) fs.unlinkSync(full)
    }
  } else {
    fs.mkdirSync(dir, { recursive: true })
  }
}

async function generateMDX() {
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.json'))

  if (files.length === 0) {
    console.log('No processed files found. Run pnpm process first.')
    process.exit(1)
  }

  // Clean and recreate category dirs
  for (const { dir } of Object.values(CATEGORIES)) {
    cleanDir(path.join(OUTPUT_EN, dir))
    cleanDir(path.join(OUTPUT_ID, dir))
  }

  // Per-category meta entries: { category → { slug → title } }
  const enMeta: Record<string, Record<string, string>> = {}
  const idMeta: Record<string, Record<string, string>> = {}

  for (const file of files) {
    const data = JSON.parse(fs.readFileSync(path.join(INPUT_DIR, file), 'utf-8'))
    const markdown = td.turndown(data.html)
    const slug = file.replace('.json', '')
    const { category, fileSlug } = detectCategory(slug)

    if (!CATEGORIES[category]) {
      console.warn(`⚠️  Unknown category for: ${slug}`)
      continue
    }

    if (!enMeta[category]) enMeta[category] = {}
    if (!idMeta[category]) idMeta[category] = {}

    const enDir = path.join(OUTPUT_EN, CATEGORIES[category].dir)
    const idDir = path.join(OUTPUT_ID, CATEGORIES[category].dir)

    // English MDX
    const enContent = `---
title: ${data.title}
description: ${data.title} - NQRust-Identity Documentation
---

# ${data.title}

${markdown}
`
    fs.writeFileSync(path.join(enDir, `${fileSlug}.mdx`), enContent)
    enMeta[category][fileSlug] = data.title

    // Indonesian MDX
    const idContent = `---
title: ${data.title}
description: ${data.title} - Dokumentasi NQRust-Identity
---

# ${data.title}

{/* TODO: Translate this page to Bahasa Indonesia */}

import { Callout } from 'nextra/components'

<Callout type="info">
  Halaman ini belum diterjemahkan. Silakan baca versi [English](/en/guides/${CATEGORIES[category].dir}/${fileSlug}).
</Callout>

${markdown}
`
    fs.writeFileSync(path.join(idDir, `${fileSlug}.mdx`), idContent)
    idMeta[category][fileSlug] = data.title

    console.log(`✅ Generated: ${category}/${fileSlug}.mdx`)
  }

  // Write per-category _meta.json in predefined order
  for (const [cat, { dir }] of Object.entries(CATEGORIES)) {
    if (!enMeta[cat]) continue

    const order = CATEGORY_ORDER[cat] || []
    const orderedEn: Record<string, string> = {}
    const orderedId: Record<string, string> = {}

    // Add in predefined order first
    for (const slug of order) {
      if (enMeta[cat][slug]) {
        orderedEn[slug] = enMeta[cat][slug]
        orderedId[slug] = idMeta[cat][slug]
      }
    }
    // Append any remaining pages not in the predefined order
    for (const slug of Object.keys(enMeta[cat])) {
      if (!orderedEn[slug]) {
        orderedEn[slug] = enMeta[cat][slug]
        orderedId[slug] = idMeta[cat][slug]
      }
    }

    fs.writeFileSync(path.join(OUTPUT_EN, dir, '_meta.json'), JSON.stringify(orderedEn, null, 2))
    fs.writeFileSync(path.join(OUTPUT_ID, dir, '_meta.json'), JSON.stringify(orderedId, null, 2))
  }

  // Write top-level guides _meta.json (categories as sections)
  const guidesMeta: Record<string, string> = {}
  for (const [cat, { dir, label }] of Object.entries(CATEGORIES)) {
    if (enMeta[cat]) guidesMeta[dir] = label
  }
  fs.writeFileSync(path.join(OUTPUT_EN, '_meta.json'), JSON.stringify(guidesMeta, null, 2))
  fs.writeFileSync(path.join(OUTPUT_ID, '_meta.json'), JSON.stringify(guidesMeta, null, 2))

  console.log(`\n🎉 MDX generation done. ${files.length} pages generated into categories.`)
}

generateMDX().catch(console.error)
