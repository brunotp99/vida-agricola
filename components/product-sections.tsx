'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard } from './product-card'
import { products } from '@/lib/data'

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: typeof products
  viewAllHref?: string
  columns?: 4 | 5
}

export function ProductSection({
  title,
  subtitle,
  products: sectionProducts,
  viewAllHref,
  columns = 4,
}: ProductSectionProps) {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {viewAllHref && (
            <Link href={viewAllHref}>
              <Button variant="ghost" className="gap-2 text-primary hover:text-primary/80">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        <div
          className={`grid grid-cols-1 gap-6 sm:grid-cols-2 ${
            columns === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
          }`}
        >
          {sectionProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

export function BestSellers() {
  const bestSellers = products.filter((p) => p.bestSeller)
  return (
    <ProductSection
      title="Best Sellers"
      subtitle="Our most popular products loved by farmers"
      products={bestSellers}
      viewAllHref="/best-sellers"
    />
  )
}

export function NewArrivals() {
  const newArrivals = products.filter((p) => p.newArrival)
  return (
    <ProductSection
      title="New Arrivals"
      subtitle="Fresh additions to our product range"
      products={newArrivals}
      viewAllHref="/new-arrivals"
    />
  )
}

export function FeaturedProducts() {
  const featured = products.filter((p) => p.featured)
  return (
    <ProductSection
      title="Featured Products"
      subtitle="Handpicked selection of premium products"
      products={featured}
      viewAllHref="/featured"
    />
  )
}
