import Link from 'next/link'
import { useRouter } from 'next/router'
import { CATEGORIES, pickCard, pickCategoryTitle } from './categories-data'

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

export function GuidesHomePage() {
  const router = useRouter()
  const pathParts = router.asPath.split('/').filter(Boolean)
  const locale = pathParts[0] === 'id' ? 'id' : 'en'

  const t = locale === 'id'
    ? {
        badge: 'Identity Management, Disederhanakan',
        title: 'Panduan NQRust-Identity',
        subtitle: 'Panduan langkah demi langkah untuk mengonfigurasi, men-deploy, dan mengamankan instance NQRust-Identity Anda.',
      }
    : {
        badge: 'Identity Management, Simplified',
        title: 'NQRust-Identity Guides',
        subtitle: 'Step-by-step guides to configure, deploy, and secure your NQRust-Identity instance.',
      }

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', padding: '2rem 1rem' }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <div style={{
          display: 'inline-block',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          background: 'rgba(243,101,35,0.1)',
          color: '#f36523',
          fontSize: '0.875rem',
          fontWeight: 500,
          marginBottom: '1rem',
        }}>
          {t.badge}
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          {t.title}
        </h1>
        <p style={{ fontSize: '1.125rem', opacity: 0.6, maxWidth: '36rem', margin: '0 auto' }}>
          {t.subtitle}
        </p>
      </div>

      {/* Categories */}
      {CATEGORIES.map((cat) => {
        const basePath = `/${locale}/guides/${cat.key}`
        return (
          <section key={cat.key} style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, whiteSpace: 'nowrap' }}>
                {pickCategoryTitle(cat, locale)}
              </h2>
              <div style={{ flex: 1, height: '1px', background: 'var(--nextra-border-color, #e5e7eb)' }} />
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.75rem',
            }}>
              {cat.cards.map((card) => {
                const href = card.slug ? `${basePath}/${card.slug}` : basePath
                const { title, desc } = pickCard(card, locale)
                return <Card key={href} title={title} desc={desc} href={href} />
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
