import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { BrandService } from "@/lib/services/brand.service"

export const dynamic = "force-dynamic"
export const metadata = { title: "Brands" }

export default async function BrandsPage() {
  const brands = await BrandService.findWithProductCount()

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Brands</span>
            </nav>
          </div>
        </div>

        {/* Header */}
        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">All Brands</h1>
            <p className="text-muted-foreground">
              Explore our curated selection of trusted agricultural brands
            </p>
          </div>
        </div>

        {/* Brands grid */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brand/${brand.slug}`}
                  className="group flex flex-col items-center rounded-xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-bold text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    {brand.name.charAt(0).toUpperCase()}
                  </div>
                  <h2 className="mb-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {brand.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {brand.productCount} product{brand.productCount !== 1 ? "s" : ""}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
