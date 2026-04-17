'use client'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'id', label: 'Bahasa Indonesia' },
]

export function LanguageSwitcher() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const currentPath = router.asPath.split('?')[0]
  const parts = currentPath.split('/').filter(Boolean)
  const currentLocale = parts[0] === 'id' ? 'id' : 'en'
  const currentLabel = LOCALES.find(l => l.code === currentLocale)?.label || 'English'

  const switchTo = (locale: string) => {
    if (locale === currentLocale) { setOpen(false); return }
    // Replace first segment (or prepend if it's not a locale)
    let newPath: string
    if (parts[0] === 'en' || parts[0] === 'id') {
      parts[0] = locale
      newPath = '/' + parts.join('/')
    } else {
      newPath = '/' + locale + currentPath
    }
    setOpen(false)
    router.push(newPath)
  }

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.375rem 0.625rem',
          background: 'transparent',
          border: '1px solid var(--nextra-border-color, #e5e7eb)',
          borderRadius: '0.375rem',
          cursor: 'pointer',
          fontSize: '0.875rem',
          color: 'inherit',
        }}
        aria-label="Change language"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span>{currentLabel}</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 0.25rem)',
          right: 0,
          minWidth: '160px',
          background: 'var(--nextra-bg, white)',
          border: '1px solid var(--nextra-border-color, #e5e7eb)',
          borderRadius: '0.5rem',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          padding: '0.25rem',
          zIndex: 100,
        }}>
          {LOCALES.map(loc => (
            <button
              key={loc.code}
              onClick={() => switchTo(loc.code)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.5rem 0.75rem',
                background: loc.code === currentLocale ? 'rgba(243,101,35,0.1)' : 'transparent',
                color: loc.code === currentLocale ? '#f36523' : 'inherit',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: loc.code === currentLocale ? 600 : 400,
              }}
              onMouseEnter={e => {
                if (loc.code !== currentLocale) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'
                }
              }}
              onMouseLeave={e => {
                if (loc.code !== currentLocale) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                }
              }}
            >
              {loc.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
