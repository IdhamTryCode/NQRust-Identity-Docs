// scripts/fix-mdx.ts
import fs from 'fs'
import path from 'path'

function fixMdx(content: string): string {
  const lines = content.split('\n')
  const result: string[] = []
  let inCodeBlock = false

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      inCodeBlock = !inCodeBlock
      result.push(line)
      continue
    }

    if (inCodeBlock) {
      result.push(line)
      continue
    }

    // Skip lines that are JSX components (start with < uppercase or </ or end with />)
    // Only fix inline text with <lowercase-word> patterns
    let fixed = line

    // Replace <lowercase-word...> with HTML entities (NOT real HTML tags, NOT JSX components)
    // Real HTML tags to preserve: a, p, div, span, ul, ol, li, table, etc.
    // Only preserve tags that are commonly used as actual HTML in MDX docs
    const htmlTags = new Set(['a', 'p', 'div', 'span', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th',
      'thead', 'tbody', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'hr', 'img',
      'input', 'code', 'pre', 'strong', 'em', 'blockquote'])

    // Fix <lowercase-word> and </lowercase-word> that aren't real HTML
    fixed = fixed.replace(/<\/?([a-z][a-z0-9_\- \.]*?)>/g, (match, inner) => {
      const tag = inner.trim().split(' ')[0].split('-')[0]
      if (htmlTags.has(tag)) return match
      // Replace < > with HTML entities
      return match.replace('<', '&lt;').replace('>', '&gt;')
    })

    // Process {} patterns, but skip content inside inline code backticks
    const segments = fixed.split(/(`[^`]*`)/g)
    fixed = segments.map(segment => {
      // Leave inline code segments (backtick-wrapped) unchanged
      if (segment.startsWith('`') && segment.endsWith('`') && segment.length > 1) {
        return segment
      }
      // Escape {} patterns in prose text
      return segment.replace(/\{([^}]*?)\}/g, (match, inner) => {
        // Keep JSX comment blocks {/* ... */}
        if (inner.startsWith('/*')) return match
        // Escape simple identifiers like {id}, {version}, {realm-name}, {ENV_VAR}
        // These are URL path params or env vars, not valid JSX expressions
        if (/^[a-zA-Z_$][a-zA-Z0-9_$\-]*$/.test(inner.trim())) {
          return '&#123;' + inner + '&#125;'
        }
        // Keep expressions that have operators/property access (likely real JSX)
        if (/^[a-zA-Z_$'"`\d\.\[\]()=>!&|?:+\-*/%,\s]*$/.test(inner)) return match
        // Escape anything else that isn't valid JS
        return match.replace('{', '&#123;').replace('}', '&#125;')
      })
    }).join('')

    result.push(fixed)
  }

  return result.join('\n')
}

function processDir(dir: string) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      processDir(fullPath)
    } else if (entry.name.endsWith('.mdx')) {
      const original = fs.readFileSync(fullPath, 'utf-8')
      const fixed = fixMdx(original)
      if (fixed !== original) {
        fs.writeFileSync(fullPath, fixed)
        console.log(`✅ Fixed: ${path.relative(process.cwd(), fullPath)}`)
      }
    }
  }
}

console.log('Fixing MDX files...')
processDir('./pages/en/guides')
processDir('./pages/id/guides')
console.log('Done.')
