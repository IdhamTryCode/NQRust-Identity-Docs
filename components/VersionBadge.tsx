export function VersionBadge({ version = '1.0' }: { version?: string }) {
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#f36523]/10 text-[#f36523] border border-[#f36523]/30">
      v{version}
    </span>
  )
}
