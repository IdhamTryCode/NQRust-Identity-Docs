// scripts/translate-chunks.ts
// Re-translate files where the ID version is truncated (< 50% of EN size)
// by splitting content into chunks (on H2 boundaries) before sending to Kimi.
// This works around per-request output token limits that truncate large files.

import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { config } from 'dotenv'

config({ path: '.env.local' })

const EN_DIR = './pages/en/guides'
const ID_DIR = './pages/id/guides'
const TRUNCATION_THRESHOLD = 0.85 // ID must be > 85% of EN size, else treat as truncated
const MAX_CHUNK_CHARS = 6000     // Conservative chunk size so each fits well under output limit

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: 'https://api.moonshot.ai/v1',
  timeout: 180000,
})

const SYSTEM_PROMPT = `Kamu adalah penerjemah dokumentasi teknis profesional dari bahasa Inggris ke Bahasa Indonesia.

Aturan penerjemahan:
1. Ikuti kaidah PUEBI (Pedoman Umum Ejaan Bahasa Indonesia) yang benar
2. Kalimat harus natural dan enak dibaca, bukan terjemahan harfiah
3. Istilah teknis seperti server, client, endpoint, token, cluster, container, deployment, realm, provider, proxy, database, session, cookie, header, log, dashboard, metric, trace, SSL, TLS, HTTPS, HTTP, DNS, IP, URL, JWT, OIDC, SAML, OAuth, API, REST, CLI, vault, secret, namespace, scope, claim, grant, flow, policy, replica, throughput, latency, authentication, authorization JANGAN diterjemahkan
4. JANGAN terjemahkan: nama produk (NQRust-Identity, Keycloak, dll), nama perintah, nama file, path, code blocks, URL, nama variabel
5. Pertahankan semua formatting Markdown/MDX
6. Pertahankan semua komponen MDX seperti <Callout> apa adanya — PENTING: setiap <Callout> yang dibuka HARUS ditutup dengan </Callout>
7. Pertahankan frontmatter (--- di awal) apa adanya, JANGAN terjemahkan
8. JANGAN tambahkan atau hilangkan heading (## ...)
9. Output hanya konten yang sudah diterjemahkan, tanpa penjelasan tambahan`

function splitIntoChunks(content: string): { frontmatter: string; imports: string; chunks: string[] } {
  // Extract frontmatter
  const fmMatch = content.match(/^---\n[\s\S]*?\n---\n/)
  const frontmatter = fmMatch ? fmMatch[0] : ''
  let body = fmMatch ? content.slice(fmMatch[0].length) : content

  // Extract import statements and H1 (keep them separate from chunks)
  const headerLines: string[] = []
  const lines = body.split('\n')
  let bodyStart = 0
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i]
    if (l.trim().startsWith('# ') || l.trim().startsWith('import ') || l.trim() === '' || l.trim().startsWith('{/*')) {
      headerLines.push(l)
      bodyStart = i + 1
    } else {
      break
    }
  }
  const imports = headerLines.join('\n')
  body = lines.slice(bodyStart).join('\n')

  // Split body on H2 boundaries (## Heading)
  const sections: string[] = []
  const h2Re = /^## /gm
  const indices: number[] = []
  let m
  while ((m = h2Re.exec(body)) !== null) indices.push(m.index)

  if (indices.length === 0) {
    sections.push(body)
  } else {
    // Content before first H2
    if (indices[0] > 0) sections.push(body.slice(0, indices[0]))
    // Each H2 section
    for (let i = 0; i < indices.length; i++) {
      const start = indices[i]
      const end = i + 1 < indices.length ? indices[i + 1] : body.length
      sections.push(body.slice(start, end))
    }
  }

  // Merge small adjacent sections into chunks of MAX_CHUNK_CHARS
  const chunks: string[] = []
  let current = ''
  for (const section of sections) {
    if (section.length > MAX_CHUNK_CHARS) {
      // Section too big on its own — flush current, then push section as its own chunk
      if (current) { chunks.push(current); current = '' }
      chunks.push(section)
    } else if ((current + section).length > MAX_CHUNK_CHARS) {
      chunks.push(current)
      current = section
    } else {
      current += section
    }
  }
  if (current) chunks.push(current)

  return { frontmatter, imports, chunks }
}

async function translateChunk(chunk: string, retries = 3): Promise<string> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: 'moonshot-v1-128k',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Terjemahkan konten MDX berikut ke Bahasa Indonesia. Ini adalah bagian dari dokumen yang lebih besar, jadi pertahankan struktur heading dan tidak perlu menambahkan frontmatter.\n\n${chunk}` },
        ],
        temperature: 0.3,
        max_tokens: 8192,
      })
      return response.choices[0]?.message?.content || chunk
    } catch (err: any) {
      if (attempt < retries) {
        const wait = attempt * 5000
        console.log(`   ⏳ Error (${err?.message || err}), retry ${attempt}/${retries} in ${wait/1000}s...`)
        await new Promise(r => setTimeout(r, wait))
        continue
      }
      throw err
    }
  }
  return chunk
}

function autoFixCallouts(content: string): string {
  const opens = (content.match(/<Callout/g) || []).length
  const closes = (content.match(/<\/Callout>/g) || []).length
  if (opens > closes) {
    for (let i = 0; i < opens - closes; i++) content += '\n</Callout>'
  }
  return content
}

function walk(dir: string): string[] {
  const out: string[] = []
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name)
    if (e.isDirectory()) out.push(...walk(full))
    else if (e.name.endsWith('.mdx') && e.name !== 'index.mdx') out.push(full)
  }
  return out
}

async function run() {
  if (!process.env.KIMI_API_KEY) {
    console.error('❌ KIMI_API_KEY not set in .env.local')
    process.exit(1)
  }

  // Find truncated files
  const enFiles = walk(EN_DIR)
  const targets: { en: string; id: string; name: string }[] = []
  for (const enFile of enFiles) {
    const rel = path.relative(EN_DIR, enFile)
    const idFile = path.join(ID_DIR, rel)
    if (!fs.existsSync(idFile)) continue
    const enSize = fs.statSync(enFile).size
    const idSize = fs.statSync(idFile).size
    if (idSize < enSize * TRUNCATION_THRESHOLD) {
      targets.push({ en: enFile, id: idFile, name: rel })
    }
  }

  if (targets.length === 0) {
    console.log('✅ No truncated files found.')
    return
  }

  console.log(`Found ${targets.length} truncated files to re-translate\n`)

  let success = 0
  let failed = 0

  for (const { en, id, name } of targets) {
    try {
      const enContent = fs.readFileSync(en, 'utf-8')
      const { frontmatter, imports, chunks } = splitIntoChunks(enContent)
      console.log(`🔄 ${name} — ${chunks.length} chunks (${(enContent.length/1024).toFixed(1)} KB)`)

      const translatedChunks: string[] = []
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i]
        console.log(`   📦 chunk ${i + 1}/${chunks.length} (${chunk.length} chars)`)
        const translated = await translateChunk(chunk)
        translatedChunks.push(translated)
        await new Promise(r => setTimeout(r, 1500))
      }

      // Rebuild file: frontmatter (from EN, not translated) + imports + translated body
      let finalContent = frontmatter + imports + '\n' + translatedChunks.join('\n\n')
      finalContent = autoFixCallouts(finalContent)
      fs.writeFileSync(id, finalContent)

      const newSize = fs.statSync(id).size
      const enSize = fs.statSync(en).size
      const ratio = Math.round(newSize / enSize * 100)
      console.log(`   ✅ Done — ${ratio}% of EN size`)
      success++
    } catch (err: any) {
      console.error(`   ❌ Failed: ${err?.message || err}`)
      failed++
    }
  }

  console.log(`\n🎉 Done. ✅ ${success} success, ❌ ${failed} failed`)
}

run().catch(console.error)
