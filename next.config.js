// next.config.js
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  defaultShowCopyCode: true,
  flexsearch: {
    codeblocks: false
  },
  staticImage: true,
})

module.exports = withNextra({
  images: {
    domains: [],
  },
})
