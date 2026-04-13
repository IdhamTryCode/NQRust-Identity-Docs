import React from 'react'
import { DocsThemeConfig } from 'nextra-theme-docs'
import Logo from './components/Logo'
import { Breadcrumb } from './components/Breadcrumb'

const config: DocsThemeConfig = {
  logo: <Logo />,
  footer: {
    text: `© ${new Date().getFullYear()} NQRust-Identity. All rights reserved.`,
  },
  primaryHue: 22,
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
      <link rel="icon" type="image/png" href="/logo.png" />
      <link rel="shortcut icon" type="image/png" href="/logo.png" />
      <link rel="apple-touch-icon" href="/logo.png" />
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
  main: ({ children }) => (
    <>
      <Breadcrumb />
      {children}
    </>
  ),
  editLink: {
    component: null,
  },
  feedback: {
    content: null,
  },
  i18n: [
    { locale: 'id', text: 'Bahasa Indonesia' },
    { locale: 'en', text: 'English' },
  ],
}

export default config
