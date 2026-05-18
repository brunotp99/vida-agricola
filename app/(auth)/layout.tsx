import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Vida Agrícola | Account",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-3">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-GpwpwSRanjgVXt8ByFMWwyHcFTNx7O.png"
          alt="Vida Agrícola"
          width={36}
          height={36}
          className="h-9 w-auto"
        />
        <span className="text-xl font-bold tracking-tight text-foreground">Vida Agrícola</span>
      </Link>
      {children}
    </div>
  )
}
