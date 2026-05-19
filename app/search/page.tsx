import { Suspense } from "react"
import Link from "next/link"
import { Home, ChevronRight, SearchX } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductSortAndView } from "@/components/product-filters"
import { SearchService } from "@/lib/services/search.service"
import { serializeProductCard } from "@/lib/services/product.service"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    priceMin?: string
    priceMax?: string
    sort?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  return { title: q ? `Search: "${q}"` : "Search Products" }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams
  const query = sp.q ?? ""
  const page = sp.page ? Number(sp.page) : 1

  const {
    products: rawProducts,
    total,
    pages,
  } = await SearchService.search({
    query,
    categorySlug: sp.category,
    priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
    priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
    sort: (sp.sort as "relevance" | "price-asc" | "price-desc" | "newest") ?? "relevance",
    page,
    limit: 12,
  })

  const products = rawProducts.map(serializeProductCard)

  function pageHref(p: number) {
    const params = new URLSearchParams(
      Object.entries(sp).filter(([, v]) => v !== undefined) as [string, string][],
    )
    params.set("page", String(p))
    return `/search?${params.toString()}`
  }

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
              <span className="font-medium text-foreground">
                {query ? `Search: "${query}"` : "Search"}
              </span>
            </nav>
          </div>
        </div>

        {/* Page header */}
        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-1 text-3xl font-bold text-foreground md:text-4xl">
              {query ? `Results for "${query}"` : "All Products"}
            </h1>
            {total > 0 && (
              <p className="text-muted-foreground">
                Showing {Math.min((page - 1) * 12 + 1, total)}–{Math.min(page * 12, total)} of{" "}
                {total} result{total !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {/* Products */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            {products.length > 0 ? (
              <>
                <div className="mb-6 flex justify-end">
                  <ProductSortAndView />
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {pages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-3">
                    {page > 1 && (
                      <Link
                        href={pageHref(page - 1)}
                        className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                      >
                        Previous
                      </Link>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Page {page} of {pages}
                    </span>
                    {page < pages && (
                      <Link
                        href={pageHref(page + 1)}
                        className="rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="rounded-lg border border-border bg-card p-16 text-center">
                <SearchX className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h2 className="mb-2 text-xl font-semibold text-foreground">No results found</h2>
                <p className="mb-6 text-muted-foreground">
                  {query
                    ? `We couldn't find any products matching "${query}". Try a different search term.`
                    : "No products available."}
                </p>
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
