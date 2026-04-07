import Image from 'next/image'

export default function Logo() {
  return (
    <div className="flex items-center gap-2">
      <Image src="/logo.png" alt="NQRust-Identity" width={32} height={32} />
      <span className="font-bold text-[#f36523] tracking-tight hidden sm:block">
        NQRust-Identity
      </span>
    </div>
  )
}
