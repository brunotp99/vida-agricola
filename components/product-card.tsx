"use client"

import { useOptimistic, useTransition, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Star, Heart, ShoppingCart, Eye, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { authClient } from "@/lib/auth-client"
import { addToCartAction } from "@/lib/actions/cart"
import { toggleWishlistAction } from "@/lib/actions/wishlist"
import type { SerializedProductCard } from "@/lib/services/product.service"
import { formatPrice, calculateDiscount } from "@/lib/utils"

interface ProductCardProps {
  product: SerializedProductCard
  variant?: "default" | "compact"
  isWishlisted?: boolean
}

export function ProductCard({
  product,
  variant = "default",
  isWishlisted = false,
}: ProductCardProps) {
  const price = product.price
  const compareAtPrice = product.compareAtPrice
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const { toast } = useToast()
  const router = useRouter()
  const { data: session } = authClient.useSession()

  const [isPendingCart, startCartTransition] = useTransition()
  const [isPendingWishlist, startWishlistTransition] = useTransition()
  const [optimisticWishlisted, setOptimisticWishlisted] = useOptimistic(isWishlisted)

  function handleAddToCart() {
    startCartTransition(async () => {
      const result = await addToCartAction(product.id)
      if (result.success) {
        toast({ title: "Added to cart", description: product.name })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

  function handleToggleWishlist() {
    if (!session) {
      router.push(`/login?redirect=/product/${product.slug}`)
      return
    }
    startWishlistTransition(async () => {
      setOptimisticWishlisted(!optimisticWishlisted)
      const result = await toggleWishlistAction(product.id)
      if (result.success) {
        toast({
          title: result.wishlisted ? "Added to wishlist" : "Removed from wishlist",
          description: product.name,
        })
      } else {
        toast({ title: "Error", description: result.error, variant: "destructive" })
      }
    })
  }

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
              -{calculateDiscount(price, compareAtPrice!)}%
            </Badge>
          )}
          {product.newArrival && <Badge className="bg-primary text-primary-foreground">New</Badge>}
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
            onClick={handleToggleWishlist}
            disabled={isPendingWishlist}
            className="h-8 w-8 rounded-full bg-card shadow-md hover:bg-primary hover:text-primary-foreground"
            aria-label={optimisticWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={`h-4 w-4 transition-colors ${optimisticWishlisted ? "fill-destructive text-destructive" : ""}`}
            />
          </Button>
          <Link href={`/product/${product.slug}`}>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-card shadow-md hover:bg-primary hover:text-primary-foreground"
              aria-label="View product"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Image */}
        <Link href={`/product/${product.slug}`}>
          <div className="relative aspect-square overflow-hidden bg-muted">
            <Image
              src={product.images[0]?.url ?? "/placeholder.jpg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </Link>

        <CardContent className="p-4">
          {/* Brand */}
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand?.name ?? ""}
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
                    i < Math.floor(avgRating)
                      ? "fill-secondary text-secondary"
                      : "fill-muted text-muted"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">({product._count.reviews})</span>
          </div>

          {/* Price */}
          <div className="mb-4 flex items-center gap-2">
            <span className="text-lg font-bold text-foreground">{formatPrice(price)}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(compareAtPrice!)}
              </span>
            )}
          </div>

          {/* Add to Cart */}
          <Button
            onClick={handleAddToCart}
            disabled={isPendingCart}
            className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isPendingCart ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
            {isPendingCart ? "Adding..." : "Add to Cart"}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
