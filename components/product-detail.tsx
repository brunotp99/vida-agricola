'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import type { Product } from '@/lib/data'
import { formatPrice, calculateDiscount, products } from '@/lib/data'
import { ProductCard } from '@/components/product-card'

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const hasDiscount = product.originalPrice && product.originalPrice > product.price

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

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
            <ChevronRight className="h-4 w-4" />
            <Link href={`/category/${product.category}`} className="hover:text-foreground">
              {product.category.replace('-', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-medium text-foreground line-clamp-1">
              {product.name}
            </span>
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
                src={product.images[selectedImage] || product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              {hasDiscount && (
                <Badge className="absolute left-4 top-4 bg-destructive text-destructive-foreground">
                  -{calculateDiscount(product.price, product.originalPrice!)}% OFF
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
                      selectedImage === index
                        ? 'border-primary'
                        : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
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
                {product.brand}
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
                        i < Math.floor(product.rating)
                          ? 'fill-secondary text-secondary'
                          : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.rating} ({product.reviewCount} reviews)
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {hasDiscount && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatPrice(product.originalPrice!)}
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <Check className="h-5 w-5 text-primary" />
                  <span className="font-medium text-primary">
                    In Stock ({product.stockCount} available)
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
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  disabled={quantity >= product.stockCount}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button
                size="lg"
                className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!product.inStock}
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
              disabled={!product.inStock}
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
                Reviews ({product.reviewCount})
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
                {Object.entries(product.specifications).map(([key, value], index) => (
                  <div
                    key={key}
                    className={`flex justify-between px-4 py-3 ${
                      index % 2 === 0 ? 'bg-muted/50' : ''
                    }`}
                  >
                    <span className="font-medium text-foreground">{key}</span>
                    <span className="text-muted-foreground">{value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-foreground">{product.rating}</p>
                    <div className="flex gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(product.rating)
                              ? 'fill-secondary text-secondary'
                              : 'fill-muted text-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {product.reviewCount} reviews
                    </p>
                  </div>
                </div>
                <Button variant="outline">Write a Review</Button>
              </div>
            </TabsContent>
            <TabsContent value="shipping" className="mt-6">
              <div className="space-y-4 text-muted-foreground">
                <p>
                  <strong className="text-foreground">Free Shipping:</strong> Orders
                  over $99 qualify for free standard shipping.
                </p>
                <p>
                  <strong className="text-foreground">Standard Shipping:</strong>{' '}
                  3-5 business days - $9.99
                </p>
                <p>
                  <strong className="text-foreground">Express Shipping:</strong>{' '}
                  1-2 business days - $19.99
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* FAQ */}
        <div className="mt-12">
          <h2 className="mb-6 text-2xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How long does shipping take?</AccordionTrigger>
              <AccordionContent>
                Standard shipping typically takes 3-5 business days. Express
                shipping is available for 1-2 business day delivery.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>What is your return policy?</AccordionTrigger>
              <AccordionContent>
                We offer a 30-day return policy for all unused products in their
                original packaging. Please contact our support team to initiate a
                return.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Is this product suitable for my animals?</AccordionTrigger>
              <AccordionContent>
                Please refer to the product specifications and description for
                detailed information about suitability. If you have specific
                questions, our customer support team is happy to help.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Related Products
            </h2>
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
