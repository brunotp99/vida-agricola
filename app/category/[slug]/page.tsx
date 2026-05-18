import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ProductCard } from '@/components/product-card'
import { ProductFilters, ProductSortAndView } from '@/components/product-filters'
import { categories, products } from '@/lib/data'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return categories.map((category) => ({
    slug: category.slug,
  }))
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = categories.find((c) => c.slug === slug)

  if (!category) {
    notFound()
  }

  const categoryProducts = products.filter(
    (p) => p.category === category.id || p.category === slug
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Breadcrumbs */}
        <div className="border-b border-border bg-muted">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">{category.name}</span>
            </nav>
          </div>
        </div>

        {/* Category Header */}
        <div className="bg-card py-8">
          <div className="container mx-auto px-4">
            <h1 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              {category.name}
            </h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>

        {/* Products Section */}
        <div className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Filters Sidebar */}
              <ProductFilters selectedCategory={category.id} />

              {/* Products Grid */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <p className="text-sm text-muted-foreground">
                    Showing <strong>{categoryProducts.length}</strong> products
                  </p>
                  <ProductSortAndView />
                </div>

                {/* Subcategories */}
                <div className="mb-6 flex flex-wrap gap-2">
                  {category.subcategories.map((sub) => (
                    <Link
                      key={sub.id}
                      href={`/category/${category.slug}/${sub.slug}`}
                      className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {sub.name}
                    </Link>
                  ))}
                </div>

                {/* Products */}
                {categoryProducts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categoryProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-lg border border-border bg-card p-12 text-center">
                    <p className="text-lg text-muted-foreground">
                      No products found in this category.
                    </p>
                  </div>
                )}

                {/* Load More */}
                {categoryProducts.length > 0 && (
                  <div className="mt-8 text-center">
                    <button className="rounded-lg bg-primary px-8 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                      Load More Products
                    </button>
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
