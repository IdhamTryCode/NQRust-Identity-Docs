// scripts/post-generate.ts
// Re-apply all customizations that get wiped when generate-mdx.ts runs.
//
// After running `pnpm tsx scripts/generate-mdx.ts`, run this script to
// restore customizations that are NOT derivable from scraped HTML:
//
// 1. Top-level sidebar: add "installation" category (manually authored).
// 2. Hide `index` in each category sub-folder so the auto-generated landing
//    page (card grid) doesn't show up in the sidebar.
// 3. Remove JWT "Configuration" section — references UI elements that do
//    not exist in the NQRust-Identity (SNAPSHOT) admin console.
// 4. Remove FGAP callout + entire "Legacy token exchange" section — both
//    depend on fine-grained admin permissions which are unavailable.
// 5. Remove "Supported configurations for production environments" section —
//    links to an external Keycloak page that has no NQRust-Identity equivalent.
// 6. Remove "We gather more feedback ... this discussion" sentence inside the
//    "Preview of enhanced HTTP performance" callout — links to a keycloak
//    GitHub discussion that doesn't exist in the NQRust-Identity repo.
//
// Every deletion is repeated for EN; the ID locale is preserved from backup.

import fs from 'fs'
import path from 'path'

const EN_GUIDES = './pages/en/guides'
const ID_GUIDES = './pages/id/guides'

// 1. Top-level _meta.json — add Installation
function fixTopMeta() {
  const file = path.join(EN_GUIDES, '_meta.json')
  const meta = JSON.parse(fs.readFileSync(file, 'utf-8'))
  if (meta.installation) return // already has it
  const newMeta = { installation: 'Installation', ...meta }
  fs.writeFileSync(file, JSON.stringify(newMeta, null, 2) + '\n')
  console.log('✅ Added installation to top-level _meta.json')
}

// 2. Hide `index` in category _meta.json
function hideIndex(category: string) {
  const file = path.join(EN_GUIDES, category, '_meta.json')
  if (!fs.existsSync(file)) return
  const meta = JSON.parse(fs.readFileSync(file, 'utf-8'))
  if (meta.index) return // already has it
  const newMeta = { index: { display: 'hidden' }, ...meta }
  fs.writeFileSync(file, JSON.stringify(newMeta, null, 2) + '\n')
  console.log(`✅ Hidden index in ${category}/_meta.json`)
}

// 3. Remove Configuration section from jwt-authorization-grant
function trimJwtConfig() {
  const file = path.join(EN_GUIDES, 'securing-apps/jwt-authorization-grant.mdx')
  let c = fs.readFileSync(file, 'utf-8')
  const s = c.indexOf('\n## Configuration\n')
  const e = c.indexOf('\n## Examples', s)
  if (s !== -1 && e !== -1) {
    c = c.substring(0, s + 1) + c.substring(e + 1)
    fs.writeFileSync(file, c)
    console.log('✅ Removed Configuration section from jwt-authorization-grant.mdx')
  }
}

// 4. Remove FGAP callout and Legacy section from token-exchange
function trimTokenExchange() {
  const file = path.join(EN_GUIDES, 'securing-apps/token-exchange.mdx')
  let c = fs.readFileSync(file, 'utf-8')

  // Remove FGAP callout
  const fStart = c.indexOf('<Callout type="info">\n  If you still need legacy token exchange feature')
  if (fStart !== -1) {
    const afterCallout = c.indexOf('\n## Standard token exchange', fStart)
    if (afterCallout !== -1) {
      c = c.substring(0, fStart) + c.substring(afterCallout + 1)
      console.log('✅ Removed FGAP callout from token-exchange.mdx')
    }
  }

  // Remove Legacy section
  const legacyIdx = c.indexOf('\n## Legacy token exchange')
  if (legacyIdx !== -1) {
    c = c.substring(0, legacyIdx).trimEnd() + '\n'
    console.log('✅ Removed Legacy section from token-exchange.mdx')
  }

  fs.writeFileSync(file, c)
}

// 5. Remove "Supported configurations for production environments" section
//    from configuration-production.mdx (EN). The corresponding text in the ID
//    file is preserved by backup/restore so we ALSO delete it there if
//    generate-mdx ever writes over it.
function trimSupportedConfigs() {
  const targets: { file: string; heading: string; nextHeading: string }[] = [
    {
      file: path.join(EN_GUIDES, 'server/configuration-production.mdx'),
      heading: '\n## Supported configurations for production environments\n',
      nextHeading: '\n## TLS for secure communication',
    },
    {
      file: path.join(ID_GUIDES, 'server/configuration-production.mdx'),
      heading: '\n## Konfigurasi yang didukung untuk lingkungan produksi\n',
      nextHeading: '\n## TLS untuk komunikasi yang aman',
    },
  ]
  for (const t of targets) {
    if (!fs.existsSync(t.file)) continue
    let c = fs.readFileSync(t.file, 'utf-8')
    const s = c.indexOf(t.heading)
    const e = c.indexOf(t.nextHeading, s)
    if (s !== -1 && e !== -1) {
      c = c.substring(0, s + 1) + c.substring(e + 1)
      fs.writeFileSync(t.file, c)
      console.log(`✅ Removed "Supported configurations" section from ${path.relative(process.cwd(), t.file)}`)
    }
  }
}

// 6. Remove "We gather more feedback ... this discussion" sentence from the
//    Preview callout in configuration-production.mdx (EN + ID).
function trimFeedbackSentence() {
  const patterns: { file: string; find: RegExp }[] = [
    {
      file: path.join(EN_GUIDES, 'server/configuration-production.mdx'),
      // Whole line plus trailing blank line
      find: /\n\s*We gather more feedback on this feature[^\n]*\n\n/,
    },
    {
      file: path.join(ID_GUIDES, 'server/configuration-production.mdx'),
      find: /\n\s*Kami mengumpulkan umpan balik lebih banyak[^\n]*\n\n/,
    },
  ]
  for (const p of patterns) {
    if (!fs.existsSync(p.file)) continue
    const before = fs.readFileSync(p.file, 'utf-8')
    const after = before.replace(p.find, '\n')
    if (after !== before) {
      fs.writeFileSync(p.file, after)
      console.log(`✅ Removed feedback sentence from ${path.relative(process.cwd(), p.file)}`)
    }
  }
}

// 7. Rename "Configuring the hostname (v2)" → "Configuring the hostname"
//    across every MDX and _meta.json (EN + ID). The "(v2)" suffix comes from
//    the Keycloak source title but adds no value in our docs.
function fixHostnameTitle() {
  function walk(dir: string): string[] {
    const out: string[] = []
    if (!fs.existsSync(dir)) return out
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name)
      if (e.isDirectory()) out.push(...walk(full))
      else if (e.name.endsWith('.mdx') || e.name.endsWith('.json')) out.push(full)
    }
    return out
  }
  let touched = 0
  for (const f of walk('./pages')) {
    const before = fs.readFileSync(f, 'utf-8')
    const after = before.replace(/Configuring the hostname \(v2\)/g, 'Configuring the hostname')
    if (after !== before) { fs.writeFileSync(f, after); touched++ }
  }
  if (touched > 0) console.log(`✅ Renamed hostname (v2) → hostname in ${touched} files`)
}

// 8. Remove dangling "see X" references in directory-structure that point to
//    pages not in NQRust-Identity (Configuring trusted certificates, Developing Themes).
//    Uses regex to handle both pre- and post- fix-broken-links state (link or plain text).
function trimDirStructureRefs() {
  const targets: { file: string; patterns: RegExp[] }[] = [
    {
      file: path.join(EN_GUIDES, 'server/directory-structure.mdx'),
      patterns: [
        / - see (?:\[)?Configuring trusted certificates(?:\]\([^)]+\))?/g,
        / - see (?:\[)?Developing Themes(?:\]\([^)]+\))?/g,
      ],
    },
    {
      file: path.join(ID_GUIDES, 'server/directory-structure.mdx'),
      patterns: [
        / - lihat (?:\[)?Mengonfigurasi sertifikat terpercaya(?:\]\([^)]+\))?/g,
        / - lihat (?:\[)?Mengembangkan Themes(?:\]\([^)]+\))?/g,
      ],
    },
  ]
  for (const t of targets) {
    if (!fs.existsSync(t.file)) continue
    let content = fs.readFileSync(t.file, 'utf-8')
    let changed = false
    for (const pat of t.patterns) {
      const before = content
      content = content.replace(pat, '')
      if (before !== content) changed = true
    }
    if (changed) {
      fs.writeFileSync(t.file, content)
      console.log(`✅ Removed "see ..." references in ${path.relative(process.cwd(), t.file)}`)
    }
  }
}

// 9. Rename legacy keycloak-* slugs → identity-* slugs.
//    generate-mdx produces files with the original Keycloak slug. We rename
//    the file + update _meta.json entry. URL rewrites are handled separately
//    in rewriteBrokenUrls().
function renameLegacyKeycloakSlugs() {
  const renames: { category: string; oldSlug: string; newSlug: string }[] = [
    { category: 'server', oldSlug: 'keycloak-truststore', newSlug: 'identity-truststore' },
    { category: 'observability', oldSlug: 'keycloak-service-level-indicators', newSlug: 'identity-service-level-indicators' },
  ]
  for (const dir of [EN_GUIDES, ID_GUIDES]) {
    for (const r of renames) {
      const oldFile = path.join(dir, r.category, `${r.oldSlug}.mdx`)
      const newFile = path.join(dir, r.category, `${r.newSlug}.mdx`)
      if (fs.existsSync(oldFile)) {
        fs.renameSync(oldFile, newFile)
        console.log(`✅ Renamed ${r.oldSlug}.mdx → ${r.newSlug}.mdx in ${path.relative(process.cwd(), path.join(dir, r.category))}`)
      }
      const metaFile = path.join(dir, r.category, '_meta.json')
      if (fs.existsSync(metaFile)) {
        const meta = JSON.parse(fs.readFileSync(metaFile, 'utf-8'))
        if (meta[r.oldSlug]) {
          const newMeta: Record<string, unknown> = {}
          for (const [k, v] of Object.entries(meta)) {
            newMeta[k === r.oldSlug ? r.newSlug : k] = v
          }
          fs.writeFileSync(metaFile, JSON.stringify(newMeta, null, 2) + '\n')
          console.log(`✅ Updated _meta.json key in ${path.relative(process.cwd(), metaFile)}`)
        }
      }
    }
  }
}

// 10. Rewrite broken URLs inside MDX content:
//     /server/nqrust-identity-truststore → /server/identity-truststore
//     /server/importExport → /server/importexport
function rewriteBrokenUrls() {
  function walk(d: string): string[] {
    const out: string[] = []
    if (!fs.existsSync(d)) return out
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) out.push(...walk(full))
      else if (e.name.endsWith('.mdx')) out.push(full)
    }
    return out
  }
  let touched = 0
  for (const dir of [EN_GUIDES, ID_GUIDES]) {
    for (const f of walk(dir)) {
      const before = fs.readFileSync(f, 'utf-8')
      const after = before
        .replace(/\/server\/nqrust-identity-truststore/g, '/server/identity-truststore')
        .replace(/\/server\/keycloak-truststore/g, '/server/identity-truststore')
        .replace(/\/observability\/nqrust-identity-service-level-indicators/g, '/observability/identity-service-level-indicators')
        .replace(/\/observability\/keycloak-service-level-indicators/g, '/observability/identity-service-level-indicators')
        .replace(/\/server\/importExport/g, '/server/importexport')
        // Quickstarts repo + OWIN auth repo + Node.js connect: revert to upstream Keycloak (we don't host forks).
        .replace(/github\.com\/nqrust-identity\/nqrust-identity-quickstarts/g, 'github.com/keycloak/keycloak-quickstarts')
        .replace(/github\.com\/dylanplecki\/NQRust-IdentityOwinAuthentication/g, 'github.com/dylanplecki/KeycloakOwinAuthentication')
        .replace(/github\.com\/nqrust-identity\/nqrust-identity-nodejs-connect/g, 'github.com/keycloak/keycloak-nodejs-connect')
      if (after !== before) { fs.writeFileSync(f, after); touched++ }
    }
  }
  if (touched > 0) console.log(`✅ Rewrote broken URLs in ${touched} files`)
}

// 11. Remove dangling "see X" / reference phrases to pages not in NQRust-Identity.
//     Use regex so both hyperlink form and plain-text form are matched.
function trimDanglingRefs() {
  const patterns = [
    // Whole-sentence form: "See the X guide for ... ." (at start of line or after newline)
    // Covers cases like line 76 and 273 in db.mdx.
    /[\s]*See the (?:\[)?Running NQRust-Identity in a container(?:\]\([^)]+\))? guide[^.\n]*\.(?: and the (?:\[)?Using custom NQRust-Identity images(?:\]\([^)]+\))? guide[^.\n]*\.)?/gi,
    /[\s]*See the (?:\[)?Using custom NQRust-Identity images(?:\]\([^)]+\))? guide[^.\n]*\./gi,
    /[\s]*See the (?:\[)?Migrating the database(?:\]\([^)]+\))? guide[^.\n]*\./gi,
    /[\s]*See the (?:\[)?User Storage SPI(?:\]\([^)]+\))? guide[^.\n]*\./gi,
    // "For more information, check the X documentation."
    /\s*For more information, check the (?:\[)?Migrating the database(?:\]\([^)]+\))? documentation\./gi,
    // "... in the X documentation." (whole sentence)
    /\s*You can find more details[^.\n]*?(?:\[)?User Storage SPI(?:\]\([^)]+\))?[^.\n]*\./gi,
    // "as described in the Running NQRust-Identity in a container" (phrase only, keep sentence)
    /\s*as described in the (?:\[)?Running NQRust-Identity in a container(?:\]\([^)]+\))?/gi,
    // "including Running NQRust-Identity in a container, " (in a comma list)
    /(?:\s*including\s+)?(?:\[)?Running NQRust-Identity in a container(?:\]\([^)]+\))?,\s*/gi,
    // Indonesian: "seperti yang dijelaskan di Menjalankan NQRust-Identity ..."
    /\s*seperti yang dijelaskan di (?:\[)?Menjalankan NQRust-Identity (?:di|dalam) (?:kontainer|container)(?:\]\([^)]+\))?/gi,
    // Indonesian: "termasuk Menjalankan NQRust-Identity ..., "
    /(?:\s*termasuk\s+)?(?:\[)?Menjalankan NQRust-Identity (?:di|dalam) (?:kontainer|container)(?:\]\([^)]+\))?,\s*/gi,
    // logging.mdx: "For more details ... see:\n- Console logging\n- File logging\n- Syslog logging"
    /\s*For more details on how to configure specific log handlers, see:\s*\n(?:\s*-\s*(?:Console|File|Syslog) logging\s*\n)+/gi,
    /\s*Untuk detail lebih lanjut tentang cara mengonfigurasi penangan log tertentu, lihat:\s*\n(?:\s*-\s*Pencatatan (?:Konsol|File|Syslog)\s*\n)+/gi,
    // mutual-tls.mdx: "For more information on how to configure X.509 Authentication, see X.509 Client Certificate User Authentication section."
    /\s*For more information on how to configure X\.509 Authentication, see X\.509 Client Certificate User Authentication section\./gi,
    /\s*Untuk informasi lebih lanjut tentang cara mengonfigurasi Otentikasi X\.509, lihat bagian Otentikasi Pengguna Sertifikat Klien X\.509\./gi,
    // configuration-provider.mdx References list item
    /\n-\s*(?:\[)?Server Developer Documentation(?:\]\([^)]+\))?/gi,
    /\n-\s*(?:\[)?Dokumentasi Pengembang Server(?:\]\([^)]+\))?/gi,
    // vault.mdx: "To learn more about key resolvers, see Key resolvers section in the Server Administration guide."
    /\s*To learn more about key resolvers, see Key resolvers section in the Server Administration guide\./gi,
    /\s*Untuk mempelajari lebih lanjut tentang penyelesai kunci, lihat bagian Penyelesai Kunci di Panduan Administrasi Server\./gi,
    // event-metrics.mdx: "See the Server Administration Guide on event types for an overview of the available events."
    /\s*See the (?:\[)?Server Administration Guide on event types(?:\]\([^)]+\))? for an overview of the available events\./gi,
    /\s*Lihat (?:\[)?Panduan Administrasi Server tentang tipe peristiwa(?:\]\([^)]+\))? untuk melihat tinjauan peristiwa yang tersedia\./gi,
    // event-metrics.mdx: "See Self-provided metrics for a description of the metrics collected."
    /\s*See (?:\[)?Self-provided metrics(?:\]\([^)]+\))? for a description of the metrics collected\./gi,
    /\s*Lihat (?:\[)?Metrik yang Disediakan Sendiri(?:\]\([^)]+\))? untuk deskripsi metrik yang dikumpulkan\./gi,
    // metrics-for-troubleshooting.mdx: remove "## List of NQRust-Identity key metrics"
    // section entirely (links to pages we don't have). Match heading + bullet list
    // until end of file or next ## heading.
    /\n## List of NQRust-Identity key metrics\n[\s\S]*?(?=\n## |\n*$)/g,
    /\n## Daftar Metrik (?:Utama|Kunci) NQRust-Identity\n[\s\S]*?(?=\n## |\n*$)/g,
    // tracing.mdx: trim "For more information, see the Advanced configuration." (Operator-only ref).
    /\s*For more information, see the (?:\[)?Advanced configuration(?:\]\([^)]+\))?\./gi,
    /\s*Untuk informasi lebih lanjut, lihat (?:\[)?Konfigurasi Lanjutan(?:\]\([^)]+\))?\./gi,
    // securing-apps: trim trailing "(see Server Administration Guide ...)" / "(see Panduan Administrasi Server ...)" parentheticals.
    /\s*\(see (?:\[)?Server Administration Guide(?:\]\([^)]+\))? for more details\)/gi,
    /\s*\(lihat (?:\[)?Panduan Administrasi Server(?:\]\([^)]+\))? untuk detail lebih lanjut\)/gi,
    // securing-apps: trim sentence-ending "See Server Administration Guide for more details."
    /\s*See (?:\[)?Server Administration Guide(?:\]\([^)]+\))? for more details\./gi,
    /\s*Lihat (?:\[)?Panduan Administrasi Server(?:\]\([^)]+\))? untuk detail lebih lanjut\./gi,
    // saml-galleon-layers: "More details in the Server Administration Guide."
    /\s*More details in the (?:\[)?Server Administration Guide(?:\]\([^)]+\))?\./gi,
    /\s*Detail lebih lanjut dalam (?:\[)?(?:Panduan Administrasi Server|Server Administration Guide)(?:\]\([^)]+\))?\./gi,
    // authz-client: "For more details see the `Authentication SPI` section in Server Developer Guide."
    /\s*For more details see the `?Authentication SPI`? section in (?:\[)?Server Developer Guide(?:\]\([^)]+\))?\./gi,
    /\s*Untuk detail lanjut, lihat bagian `?Authentication SPI`? di (?:\[)?Panduan Pengembang Server(?:\]\([^)]+\))?\./gi,
    // grafana-dashboards.mdx: trim broken dashboard repo reference (no such repo under our org).
    /\s*JSON definitions of NQRust-Identity Grafana dashboards are available in the (?:\[)?[^.\n]*?nqrust-identity-grafana-dashboard[^.\n]*?(?:\]\([^)]+\))?\./gi,
    /\s*Definisi JSON dari dasbor Grafana NQRust-Identity tersedia di (?:\[)?[^.\n]*?nqrust-identity-grafana-dashboard[^.\n]*?(?:\]\([^)]+\))?\./gi,
    // exemplars.mdx: trim "See the guide HTTP metrics / Self-provided metrics ..." (no such pages).
    // Each occurs as its own paragraph between bullet items, so we eat the surrounding blank lines too.
    /\n\nSee the guide (?:\[)?HTTP metrics(?:\]\([^)]+\))? for details on this metric\./g,
    /\n\nSee the guide (?:\[)?Self-provided metrics(?:\]\([^)]+\))?\s* for details on this metric\./g,
    /\n\nLihat panduan (?:\[)?HTTP metrics(?:\]\([^)]+\))? untuk detail tentang metrik ini\./g,
    /\n\nLihat panduan (?:\[)?Self-provided metrics(?:\]\([^)]+\))? untuk detail tentang metrik ini\./g,
    // " - see X" or ", see X" list-tail / inline refs
    /\s*[-,]\s*see\s+(?:\[)?Running NQRust-Identity in a container(?:\]\([^)]+\))?/gi,
    /\s*[-,]\s*see\s+(?:\[)?Using custom NQRust-Identity images(?:\]\([^)]+\))?/gi,
    /\s*[-,]\s*see\s+(?:\[)?Migrating the database(?:\]\([^)]+\))?/gi,
    /\s*[-,]\s*see\s+(?:\[)?User Storage SPI(?:\]\([^)]+\))?/gi,
    // Indonesian variants — "Lihat panduan Menjalankan NQRust-Identity di/dalam kontainer..."
    /[\s]*Lihat panduan (?:\[)?Menjalankan NQRust-Identity (?:di|dalam) (?:kontainer|container)(?:\]\([^)]+\))?[^.\n]*?(?:\.|(?=\n))/gi,
    /[\s]*Lihat panduan (?:\[)?Menggunakan gambar NQRust-Identity (?:kustom|khusus)(?:\]\([^)]+\))?[^.\n]*?(?:\.|(?=\n))/gi,
    /[\s]*Lihat panduan (?:\[)?Migrasi database(?:\]\([^)]+\))?[^.\n]*\./gi,
    /[\s]*Lihat panduan (?:\[)?User Storage SPI(?:\]\([^)]+\))?[^.\n]*\./gi,
    // "Untuk informasi lebih lanjut, periksa Migrating the database dokumentasi."
    /\s*Untuk informasi lebih lanjut, periksa (?:\[)?Migrating the database(?:\]\([^)]+\))? dokumentasi\./gi,
    // "Anda dapat menemukan detail lebih lanjut ... User Storage SPI."
    /\s*Anda dapat menemukan detail lebih lanjut[^.\n]*?(?:\[)?User Storage SPI(?:\]\([^)]+\))?[^.\n]*\./gi,
    // Inline " - lihat X" or ", lihat X"
    /\s*[-,]\s*lihat\s+(?:\[)?Menjalankan NQRust-Identity (?:di|dalam) (?:kontainer|container)(?:\]\([^)]+\))?/gi,
    /\s*[-,]\s*lihat\s+(?:\[)?Menggunakan gambar NQRust-Identity (?:kustom|khusus)(?:\]\([^)]+\))?/gi,
    /\s*[-,]\s*lihat\s+(?:\[)?Migrasi database(?:\]\([^)]+\))?/gi,
    /\s*[-,]\s*lihat\s+(?:\[)?User Storage SPI(?:\]\([^)]+\))?/gi,
  ]
  function walk(d: string): string[] {
    const out: string[] = []
    if (!fs.existsSync(d)) return out
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, e.name)
      if (e.isDirectory()) out.push(...walk(full))
      else if (e.name.endsWith('.mdx')) out.push(full)
    }
    return out
  }
  let touched = 0
  for (const dir of [EN_GUIDES, ID_GUIDES]) {
    for (const f of walk(dir)) {
      const before = fs.readFileSync(f, 'utf-8')
      let after = before
      for (const p of patterns) after = after.replace(p, '')
      if (after !== before) { fs.writeFileSync(f, after); touched++ }
    }
  }
  if (touched > 0) console.log(`✅ Removed dangling "see X" references in ${touched} files`)
}

// 12. Restore landing/index pages that generate-mdx doesn't produce.
//     Routes /en, /en/guides, /en/guides/<category> (and /id equivalents)
//     would 404 without these — they render card grids via shared components.
function restoreLandingPages() {
  const homePages: { file: string; title: string; depth: number }[] = [
    { file: 'pages/en/index.mdx', title: 'NQRust-Identity Guides', depth: 2 },
    { file: 'pages/id/index.mdx', title: 'Panduan NQRust-Identity', depth: 2 },
    { file: 'pages/en/guides/index.mdx', title: 'NQRust-Identity Guides', depth: 3 },
    { file: 'pages/id/guides/index.mdx', title: 'Panduan NQRust-Identity', depth: 3 },
  ]
  for (const p of homePages) {
    if (fs.existsSync(p.file)) continue
    const up = '../'.repeat(p.depth)
    fs.writeFileSync(p.file,
      `---\ntitle: ${p.title}\n---\n\nimport { GuidesHomePage } from '${up}components/GuidesHomePage'\n\n<GuidesHomePage />\n`)
    console.log(`✅ Restored landing page ${p.file}`)
  }
  const categories: { category: string; title: string }[] = [
    { category: 'server', title: 'Server' },
    { category: 'observability', title: 'Observability' },
    { category: 'securing-apps', title: 'Securing Applications' },
    { category: 'high-availability', title: 'High Availability' },
  ]
  for (const locale of ['en', 'id']) {
    for (const c of categories) {
      const file = `pages/${locale}/guides/${c.category}/index.mdx`
      if (fs.existsSync(file)) continue
      fs.writeFileSync(file,
        `---\ntitle: ${c.title}\n---\n\nimport { CategoryIndexPage } from '../../../../components/CategoryIndexPage'\n\n<CategoryIndexPage category="${c.category}" />\n`)
      console.log(`✅ Restored category index ${file}`)
    }
  }
}

fixTopMeta()
restoreLandingPages()
for (const cat of ['server', 'observability', 'securing-apps', 'high-availability']) {
  hideIndex(cat)
}
trimJwtConfig()
trimTokenExchange()
trimSupportedConfigs()
trimFeedbackSentence()
fixHostnameTitle()
trimDirStructureRefs()
renameLegacyKeycloakSlugs()
rewriteBrokenUrls()
trimDanglingRefs()
console.log('\n🎉 Post-generate customizations applied.')
