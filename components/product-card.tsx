'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Star, Heart, ShoppingCart, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Product } from '@/lib/data'
import { formatPrice, calculateDiscount } from '@/lib/data'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact'
}

export function ProductCard({ product, variant = 'default' }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group relative overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg">
        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex flex-col gap-2">
          {hasDiscount && (
            <Badge className="bg-destructive text-destructive-foreground">
              -{calculateDiscount(product.price, product.originalPrice!)}%
            </Badge>
          )}
          {product.newArrival && (
            <Badge className="bg-primary text-primary-foreground">New</Badge>
          )}
          {product.bestSeller && (
            <Badge className="bg-secondary text-secondary-foreground">Best Seller</Badge>
          )}
          {product.flashDeal && (
            <Badge className="bg-destructive text-destructive-foreground">Flash Deal</Badge>
          )}
        </div>

        {/* Quick Actions */}
        <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-card shadow-md hover:bg-primary hover:text-primary-foreground"
          >
            <Heart className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="h-8 w-8 rounded-full bg-card shadow-md hover:bg-primary hover:text-primary-foreground"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Image */}
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        <CardContent className="p-4">
          {/* Category */}
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>

          {/* Title */}
          <Link href={`/product/${product.slug}`}>
            <h3 className="mb-2 line-clamp-2 text-sm font-medium text-foreground transition-colors hover:text-primary">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mb-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(product.rating)
                      ? 'fill-secondary text-secondary'
                      : 'fill-muted text-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
            <ShoppingCart className="h-4 w-4" />
            Add to Cart
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
