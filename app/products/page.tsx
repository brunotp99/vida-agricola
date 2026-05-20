import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, Package } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductSortAndView } from "@/components/product-filters"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

export const metadata = { title: "All Products | Vida Agrícola" }

interface ProductsPageProps {
  searchParams: Promise<{
    sort?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const sp = await searchParams
  const t = await getTranslations("products")
  const tCommon = await getTranslations("common")
  const { products: rawProducts, total } = await ProductService.findMany({
    sort: (sp.sort as "price-asc" | "price-desc" | "newest" | "rating" | "popular") || "newest",
    page: sp.page ? Number(sp.page) : 1,
    limit: 24,
  })

  const products = rawProducts.map(serializeProductCard)

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
                {tCommon("home")}
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{t("title")}</span>
            </nav>
          </div>
        </div>

        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-3xl font-bold text-foreground md:text-4xl">{t("title")}</h1>
                <p className="text-muted-foreground">{t("available", { count: total })}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-sm text-muted-foreground">
                {t("showing", { count: products.length, total })}
              </p>
              <ProductSortAndView />
            </div>
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border bg-card p-16 text-center">
                <Package className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg text-muted-foreground">{t("noProducts")}</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
