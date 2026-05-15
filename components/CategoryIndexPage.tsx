import Link from 'next/link'
import { useRouter } from 'next/router'
import { findCategory, pickCard } from './categories-data'

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} style={{
      display: 'block',
      textDecoration: 'none',
      border: '1px solid var(--nextra-border-color, #e5e7eb)',
      borderRadius: '0.75rem',
      padding: '1.25rem',
      transition: 'box-shadow 0.2s, border-color 0.2s',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
      ;(e.currentTarget as HTMLElement).style.borderColor = '#f36523'
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.boxShadow = 'none'
      ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--nextra-border-color, #e5e7eb)'
    }}
    >
      <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{title}</div>
      <div style={{ fontSize: '0.875rem', opacity: 0.6 }}>{desc}</div>
    </Link>
  )
}

export function CategoryIndexPage({ category }: { category: string }) {
  const router = useRouter()
  // Detect current locale from URL (e.g. "/en/guides/server" → "en")
  const pathParts = router.asPath.split('/').filter(Boolean)
  const locale = pathParts[0] === 'id' ? 'id' : 'en'

  const cat = findCategory(category)
  if (!cat) return <div>Category not found: {category}</div>

  const basePath = `/${locale}/guides/${cat.key}`

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.75rem',
      }}>
        {cat.cards.filter((card) => !card.hidden).map((card) => {
          const href = card.slug ? `${basePath}/${card.slug}` : basePath
          const { title, desc } = pickCard(card, locale)
          return <Card key={href} title={title} desc={desc} href={href} />
        })}
      </div>
    </div>
  )
}
