import { notFound } from "next/navigation"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"
import { HeaderServer } from "@/components/header-server"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductFilters, ProductSortAndView } from "@/components/product-filters"
import { CategoryService } from "@/lib/services/category.service"
import { ProductService, serializeProductCard } from "@/lib/services/product.service"

interface CategoryPageProps {
  params: Promise<{ slug: string[] }>
  searchParams: Promise<{
    priceMin?: string
    priceMax?: string
    sort?: string
    inStock?: string
    page?: string
  }>
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug: slugParts } = await params
  // Last segment is the target category (supports /category/parent/child)
  const slug = slugParts[slugParts.length - 1]
  const sp = await searchParams

  const [category, { products: rawProducts, total }] = await Promise.all([
    CategoryService.findBySlug(slug),
    ProductService.findMany({
      categorySlug: slug,
      priceMin: sp.priceMin ? Number(sp.priceMin) : undefined,
      priceMax: sp.priceMax ? Number(sp.priceMax) : undefined,
      inStock: sp.inStock === "true" ? true : undefined,
      sort: (sp.sort as "price-asc" | "price-desc" | "newest" | "rating" | "popular") || "newest",
      page: sp.page ? Number(sp.page) : 1,
    }),
  ])

  if (!category) {
    notFound()
  }

  const products = rawProducts.map(serializeProductCard)

  // Build breadcrumb: Home > [parent] > category
  const parentCategory = category.parentId
    ? await CategoryService.findBySlug(slugParts[0])
    : null

  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={null}>
        <HeaderServer />
      </Suspense>
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              {parentCategory && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <Link
                    href={`/category/${parentCategory.slug}`}
                    className="hover:text-foreground"
                  >
                    {parentCategory.name}
                  </Link>
                </>
              )}
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Products Section */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <ProductFilters />

              {/* Products Grid */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <strong>{total}</strong> products
                  </p>
                  <ProductSortAndView />
                </div>

                {/* Subcategories */}
                {category.children.length > 0 && (
                  <div className="mb-6 flex flex-wrap gap-2">
                    {category.children.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${category.slug}/${sub.slug}`}
                        className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}

                {/* Products */}
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product, index) => (
                      <ProductCard key={product.id} product={product} imagePriority={index === 0} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-12 text-center">
                    <p className="text-lg text-muted-foreground">
                      No products found in this category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
