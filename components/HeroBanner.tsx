import Link from 'next/link'

export function HeroBanner() {
  return (
    <div className="py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f36523]/10 text-[#f36523] text-sm font-medium mb-6">
        ✦ Identity Management, Simplified
      </div>
      <h1 className="text-5xl font-bold mb-4 tracking-tight">
        NQRust-Identity
      </h1>
      <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
        Official documentation for NQRust-Identity — fast, secure, and easily configurable identity management platform.
      </p>
      <div className="flex gap-4 justify-center">
        <Link href="/en/getting-started" className="px-6 py-3 bg-[#f36523] text-white rounded-lg font-medium hover:bg-[#f36523]/90 transition-colors">
          Get Started →
        </Link>
        <Link href="/id/getting-started" className="px-6 py-3 border border-[#f36523]/30 text-[#f36523] rounded-lg font-medium hover:bg-[#f36523]/5 transition-colors">
          Mulai Sekarang (ID)
        </Link>
      </div>
    </div>
  )
}
