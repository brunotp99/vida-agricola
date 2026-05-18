"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "./product-card"
import type { SerializedProductCard } from "@/lib/services/product.service"

interface ProductSectionProps {
  title: string
  subtitle?: string
  products: SerializedProductCard[]
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
            <h2 className="mb-2 text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
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
            columns === 5 ? "lg:grid-cols-5" : "lg:grid-cols-4"
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
