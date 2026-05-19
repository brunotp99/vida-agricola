import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, TrendingUp } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

export const metadata = { title: "Best Sellers | Vida Agrícola" }

export default async function BestSellersPage() {
  const raw = await ProductService.findBestSellers()
  const products = raw.map(serializeProductCard)

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Best Sellers</span>
            </nav>
          </div>
        </div>

        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">Best Sellers</h1>
                <p className="text-muted-foreground">Our most popular products loved by farmers</p>
              </div>
            </div>
          </div>
        </div>

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
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">No best sellers listed yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
