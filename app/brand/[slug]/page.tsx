import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { BrandService } from "@/lib/services/brand.service"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

interface BrandPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BrandPageProps) {
  const { slug } = await params
  const brand = await BrandService.findBySlug(slug)
  if (!brand) return {}
  return { title: brand.name }
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params

  const [brand, { products: rawProducts, total }] = await Promise.all([
    BrandService.findBySlug(slug),
    ProductService.findMany({ brandSlug: slug }),
  ])

  if (!brand) notFound()

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
              <Link href="/brands" className="hover:text-foreground">
                Brands
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{brand.name}</span>
            </nav>
          </div>
        </div>

        {/* Brand header */}
        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {brand.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="mb-1 text-3xl font-bold text-foreground md:text-4xl">
                  {brand.name}
                </h1>
                <p className="text-muted-foreground">
                  {total} product{total !== 1 ? "s" : ""}
                </p>
              </div>
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
              <div className="rounded-lg border border-border bg-card p-12 text-center">
                <p className="text-lg text-muted-foreground">No products for this brand yet.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
