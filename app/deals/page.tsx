import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, Zap } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { DealsCountdown } from "@/components/deals-countdown"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

export const dynamic = "force-dynamic"
export const metadata = { title: "Deals & Offers" }

export default async function DealsPage() {
  const { products: rawProducts, total } = await ProductService.findMany({
    onSale: true,
    sort: "newest",
    limit: 48,
  })

  const products = rawProducts.map(serializeProductCard)

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
              <span className="font-medium text-foreground">Deals</span>
            </nav>
          </div>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-r from-destructive to-destructive/80 py-10 text-destructive-foreground">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Zap className="h-8 w-8" />
                <div>
                  <h1 className="text-3xl font-bold md:text-4xl">Today's Deals</h1>
                  <p className="text-destructive-foreground/80">
                    {total} discounted product{total !== 1 ? "s" : ""} — limited time offers
                  </p>
                </div>
              </div>
              <DealsCountdown />
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-16 text-center">
                <Zap className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold">No active deals right now</h2>
                <p className="mb-6 text-muted-foreground">Check back soon for new offers.</p>
                <Link
                  href="/"
                  className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Browse all products
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
