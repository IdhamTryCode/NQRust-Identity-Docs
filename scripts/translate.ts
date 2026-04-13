// scripts/translate.ts
// Translate EN guides → ID using Kimi API (OpenAI-compatible)
import fs from 'fs'
import path from 'path'
import OpenAI from 'openai'
import { config } from 'dotenv'

config({ path: '.env.local' })

const EN_DIR = './pages/en/guides'
const ID_DIR = './pages/id/guides'

const client = new OpenAI({
  apiKey: process.env.KIMI_API_KEY,
  baseURL: 'https://api.moonshot.ai/v1',
})

const SYSTEM_PROMPT = `Kamu adalah penerjemah dokumentasi teknis profesional dari bahasa Inggris ke Bahasa Indonesia.

Aturan penerjemahan:
1. Ikuti kaidah PUEBI (Pedoman Umum Ejaan Bahasa Indonesia) yang benar
2. Kalimat harus natural dan enak dibaca, bukan terjemahan harfiah

3. Istilah teknis berikut JANGAN diterjemahkan, tetap gunakan kata aslinya:
   server, client, endpoint, token, payload, request, response, cache, cluster, node,
   container, deployment, realm, provider, proxy, gateway, load balancer, firewall,
   database, query, schema, index, credential, session, cookie, header, middleware,
   pipeline, plugin, driver, driver, port, socket, thread, buffer, stream, log, logger,
   dashboard, metric, trace, span, alert, webhook, callback, polling, timeout, retry,
   SSL, TLS, mTLS, HTTPS, HTTP, DNS, IP, URL, URI, UUID, JSON, XML, YAML, JWT, OIDC,
   SAML, OAuth, API, REST, gRPC, SDK, CLI, SPI, SLI, SLO, FIPS, LDAP, Kerberos,
   vault, secret, namespace, realm, tenant, scope, claim, grant, flow, policy,
   bootstrap, failover, rollback, rollout, replica, shard, partition, snapshot,
   throughput, latency, concurrency, throttle, rate limit, backpressure,
   authentication, authorization (boleh disingkat autentikasi/otorisasi jika konteks jelas)

4. JANGAN terjemahkan: nama produk (NQRust-Identity, Keycloak, Grafana, OpenTelemetry, dll),
   nama perintah CLI (kc.sh, kc.bat, dll), nama file, path, code blocks, URL, nama variabel,
   nama konfigurasi, nama environment variable

5. Pertahankan semua formatting Markdown/MDX: heading (##), bold (**), italic (*), list (- atau 1.), code inline (\`\`)
6. Pertahankan semua komponen MDX seperti <Callout>, <Steps>, dll apa adanya
7. Pertahankan semua frontmatter (bagian --- di awal) apa adanya, JANGAN terjemahkan
8. Output hanya konten yang sudah diterjemahkan, tanpa penjelasan tambahan`

async function translateContent(content: string, retries = 3): Promise<string> {
  const model = 'moonshot-v1-128k'
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Terjemahkan dokumen MDX berikut ke Bahasa Indonesia:\n\n${content}` },
        ],
        temperature: 0.3,
        max_tokens: 32768,
      })
      return response.choices[0].message.content || content
    } catch (err: any) {
      if (err?.status === 429 && attempt < retries) {
        const wait = attempt * 5000
        console.log(`   ⏳ Rate limited, retry ${attempt}/${retries} in ${wait/1000}s...`)
        await sleep(wait)
        continue
      }
      throw err
    }
  }
  return content
}

function getAllMdxFiles(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...getAllMdxFiles(fullPath))
    } else if (entry.name.endsWith('.mdx')) {
      results.push(fullPath)
    }
  }
  return results
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function translateAll() {
  if (!process.env.KIMI_API_KEY) {
    console.error('❌ KIMI_API_KEY not set in .env.local')
    process.exit(1)
  }

  const files = getAllMdxFiles(EN_DIR)
  console.log(`Found ${files.length} EN files to translate\n`)

  let success = 0
  let failed = 0

  for (const enFile of files) {
    const relativePath = path.relative(EN_DIR, enFile)
    const idFile = path.join(ID_DIR, relativePath)

    // Skip index files (they're just navigation placeholders)
    if (path.basename(enFile) === 'index.mdx') {
      const idDir = path.dirname(idFile)
      fs.mkdirSync(idDir, { recursive: true })
      fs.copyFileSync(enFile, idFile)
      console.log(`📋 Copied: ${relativePath}`)
      continue
    }

    try {
      const content = fs.readFileSync(enFile, 'utf-8')

      // Skip if ID file already exists and is at least 50% the size of EN
      // (means it was successfully translated before, not truncated).
      // Use --force flag to re-translate everything.
      if (fs.existsSync(idFile) && !process.argv.includes('--force')) {
        const idSize = fs.statSync(idFile).size
        const enSize = fs.statSync(enFile).size
        if (idSize > enSize * 0.5) {
          console.log(`⏭️  Skipped (already translated): ${relativePath}`)
          success++
          continue
        }
      }

      console.log(`🔄 Translating: ${relativePath}`)

      const translated = await translateContent(content)

      fs.mkdirSync(path.dirname(idFile), { recursive: true })
      fs.writeFileSync(idFile, translated)

      console.log(`✅ Done: ${relativePath}`)
      success++

      // Rate limit: wait 500ms between requests
      await sleep(500)
    } catch (err) {
      console.error(`❌ Failed: ${relativePath}`, err)
      failed++
      await sleep(1000)
    }
  }

  console.log(`\n🎉 Translation done. ✅ ${success} success, ❌ ${failed} failed`)
}

translateAll().catch(console.error)
