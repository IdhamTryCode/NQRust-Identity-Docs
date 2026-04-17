'use client'
import Link from 'next/link'
import { useRouter } from 'next/router'

const LABELS: Record<string, string> = {
  'en': 'en',
  'id': 'id',
  'guides': 'Guides',
  'getting-started': 'Getting Started',
  'server': 'Server',
  'operator': 'Operator',
  'observability': 'Observability',
  'securing-apps': 'Securing Applications',
  'high-availability': 'High Availability',
  'ui-customization': 'UI Customization',
  'migration': 'Migration',
}

// Segments that should render as plain text (no landing page exists for them)
const NON_CLICKABLE = new Set(['en', 'id', 'guides'])

export function Breadcrumb() {
  const router = useRouter()
  const parts = router.asPath.split('?')[0].split('/').filter(Boolean)

  if (parts.length === 0) return null

  const crumbs = parts.map((part, i) => {
    const href = '/' + parts.slice(0, i + 1).join('/')
    const label = LABELS[part] || part
      .split('-')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
    const isLast = i === parts.length - 1
    const isClickable = !isLast && !NON_CLICKABLE.has(part)
    return { href, label, isLast, isClickable }
  })

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.4rem',
      fontSize: '0.875rem',
      marginBottom: '1.5rem',
      flexWrap: 'wrap',
    }}>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {i > 0 && <span style={{ opacity: 0.4 }}>›</span>}
          {crumb.isLast ? (
            <span style={{ fontWeight: 600 }}>{crumb.label}</span>
          ) : crumb.isClickable ? (
            <Link href={crumb.href} style={{
              color: 'inherit',
              textDecoration: 'none',
              opacity: 0.6,
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
            >
              {crumb.label}
            </Link>
          ) : (
            <span style={{ opacity: 0.6 }}>{crumb.label}</span>
          )}
        </span>
      ))}
    </div>
  )
}
