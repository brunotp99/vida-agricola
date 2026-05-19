"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  Star,
  Heart,
  Share2,
  Minus,
  Plus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
  ChevronRight,
  Home,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { SerializedProductDetail, SerializedProductCard } from "@/lib/services/product.service"
import { formatPrice, calculateDiscount } from "@/lib/utils"
import { ProductCard } from "@/components/product-card"
import { ReviewForm } from "@/components/account/review-form"
import { authClient } from "@/lib/auth-client"

interface ProductDetailProps {
  product: SerializedProductDetail
  relatedProducts: SerializedProductCard[]
  canReview?: boolean
}

export function ProductDetailComponent({
  product,
  relatedProducts,
  canReview = false,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const { data: session } = authClient.useSession()

  const price = product.price
  const compareAtPrice = product.compareAtPrice
  const hasDiscount = compareAtPrice !== null && compareAtPrice > price
  const totalStock = product.variants.reduce((s, v) => s + v.stock, 0)
  const inStock = product.variants.some((v) => v.stock > 0)
  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
      : 0

  const categorySlug = product.category?.slug ?? ""
  const categoryName = product.category?.name ?? ""

  return (
    <div>
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-muted">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground">
              <Home className="h-4 w-4" />
              Home
            </Link>
            {categorySlug && (
              <>
                <ChevronRight className="h-4 w-4" />
                <Link href={`/category/${categorySlug}`} className="hover:text-foreground">
                  {categoryName}
                </Link>
              </>
            )}
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground line-clamp-1">{product.name}</span>
          </nav>
        </div>
      </div>

      {/* Product Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Images */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-xl bg-muted">
              <Image
                src={
                  product.images[selectedImage]?.url ?? product.images[0]?.url ?? "/placeholder.jpg"
                }
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {hasDiscount && (
                <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                  -{calculateDiscount(price, compareAtPrice!)}% OFF
                </Badge>
              )}
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={image.url}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-sm font-medium uppercase tracking-wider text-primary">
                {product.brand?.name ?? ""}
              </p>
              <h1 className="mb-4 text-3xl font-bold text-foreground text-balance">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(avgRating)
                          ? "fill-secondary text-secondary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {avgRating.toFixed(1)} ({product._count.reviews} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">{formatPrice(price)}</span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(compareAtPrice!)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {inStock ? (
                <>
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">
                    In Stock ({totalStock} available)
                  </span>
                </>
              ) : (
                <span className="font-medium text-destructive">Out of Stock</span>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center rounded-lg border border-border">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity(Math.min(totalStock, quantity + 1))}
                  disabled={quantity >= totalStock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!inStock}
              >
                <ShoppingCart className="h-5 w-5" />
                Add to Cart
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Buy Now */}
            <Button
              size="lg"
              className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90"
              disabled={!inStock}
            >
              Buy Now
            </Button>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <Truck className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <Shield className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground">Secure Payment</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <RotateCcw className="h-6 w-6 text-primary" />
                <span className="text-xs text-muted-foreground">30-Day Returns</span>
              </div>
            </div>

            {/* SKU */}
            <p className="text-sm text-muted-foreground">
              SKU: <span className="font-mono">{product.sku}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description">
            <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Reviews ({product._count.reviews})
              </TabsTrigger>
              <TabsTrigger
                value="shipping"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Shipping
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none text-muted-foreground">
                <p>{product.description}</p>
                <h3 className="mt-6 text-lg font-semibold text-foreground">Key Features</h3>
                <ul className="mt-4 space-y-2">
                  <li>Premium quality ingredients sourced from trusted suppliers</li>
                  <li>Scientifically formulated for optimal results</li>
                  <li>Easy to use and store</li>
                  <li>Suitable for both beginners and professionals</li>
                </ul>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              <div className="rounded-lg border border-border">
                {product.specifications.length > 0 ? (
                  product.specifications.map((spec, index) => (
                    <div
                      key={spec.key}
                      className={`flex justify-between px-4 py-3 ${
                        index % 2 === 0 ? "bg-muted/50" : ""
                      }`}
                    >
                      <span className="font-medium text-foreground">{spec.key}</span>
                      <span className="text-muted-foreground">{spec.value}</span>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-3 text-muted-foreground">No specifications available.</p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{avgRating.toFixed(1)}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(avgRating)
                              ? "fill-secondary text-secondary"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product._count.reviews} reviews
                    </p>
                  </div>
                </div>
                {product.reviews.length > 0 ? (
                  product.reviews.map((review) => (
                    <div key={review.id} className="border-b border-border py-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-foreground">{review.user.name}</span>
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < review.rating
                                  ? "fill-secondary text-secondary"
                                  : "fill-muted text-muted"
                              }`}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <Badge variant="outline" className="text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {review.title && (
                        <p className="font-medium text-foreground mb-1">{review.title}</p>
                      )}
                      <p className="text-muted-foreground">{review.body}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
                )}

                {/* Review form or CTA */}
                {session ? (
                  canReview ? (
                    <ReviewForm productId={product.id} productSlug={product.slug} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Purchase this product to leave a review.
                    </p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">
                    <Link href="/login" className="text-primary underline">
                      Sign in
                    </Link>{" "}
                    to leave a review.
                  </p>
                )}
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Free Shipping:</strong> Orders over $99
                  qualify for free standard shipping.
                </p>
                <p>
                  <strong className="text-foreground">Standard Shipping:</strong> 3-5 business days
                  - $9.99
                </p>
                <p>
                  <strong className="text-foreground">Express Shipping:</strong> 1-2 business days -
                  $19.99
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How long does shipping take?</AccordionTrigger>
              <AccordionContent>
                Standard shipping typically takes 3-5 business days. Express shipping is available
                for 1-2 business day delivery.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What is your return policy?</AccordionTrigger>
              <AccordionContent>
                We offer a 30-day return policy for all unused products in their original packaging.
                Please contact our support team to initiate a return.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is this product suitable for my animals?</AccordionTrigger>
              <AccordionContent>
                Please refer to the product specifications and description for detailed information
                about suitability. If you have specific questions, our customer support team is
                happy to help.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">Related Products</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
