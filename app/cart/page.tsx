'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Tag,
  Truck,
  ArrowRight,
  ChevronRight,
  Home,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { products, formatPrice } from '@/lib/data'
import { ProductCard } from '@/components/product-card'

// Sample cart items using real products
const initialCartItems = [
  { ...products[0], quantity: 2 },
  { ...products[3], quantity: 1 },
  { ...products[8], quantity: 1 },
]

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems)
  const [couponCode, setCouponCode] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    )
  }

  const removeItem = (id: string) => {
    setCartItems((items) => items.filter((item) => item.id !== id))
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )
  const discount = couponApplied ? subtotal * 0.1 : 0
  const shipping = subtotal > 99 ? 0 : 9.99
  const total = subtotal - discount + shipping

  const recommendedProducts = products
    .filter((p) => !cartItems.find((c) => c.id === p.id))
    .slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/30">
        {/* Breadcrumbs */}
        <div className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="flex items-center gap-1 hover:text-foreground">
                <Home className="h-4 w-4" />
                Home
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="font-medium text-foreground">Shopping Cart</span>
            </nav>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold text-foreground">
            Shopping Cart ({cartItems.length} items)
          </h1>

          {cartItems.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <Card className="border-border">
                  <CardContent className="p-6">
                    <AnimatePresence>
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -100 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="flex gap-4 py-4">
                            {/* Image */}
                            <Link href={`/product/${item.slug}`}>
                              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                                <Image
                                  src={item.images[0]}
                                  alt={item.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            </Link>

                            {/* Details */}
                            <div className="flex flex-1 flex-col">
                              <div className="flex justify-between">
                                <div>
                                  <Link href={`/product/${item.slug}`}>
                                    <h3 className="font-medium text-foreground hover:text-primary">
                                      {item.name}
                                    </h3>
                                  </Link>
                                  <p className="text-sm text-muted-foreground">
                                    {item.brand}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="mt-auto flex items-center justify-between">
                                {/* Quantity */}
                                <div className="flex items-center rounded-lg border border-border">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, -1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">
                                    {item.quantity}
                                  </span>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => updateQuantity(item.id, 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                {/* Price */}
                                <div className="text-right">
                                  <p className="font-semibold text-foreground">
                                    {formatPrice(item.price * item.quantity)}
                                  </p>
                                  {item.quantity > 1 && (
                                    <p className="text-xs text-muted-foreground">
                                      {formatPrice(item.price)} each
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < cartItems.length - 1 && <Separator />}
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-24 border-border">
                  <CardHeader>
                    <CardTitle>Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Coupon */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Coupon code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (couponCode.toLowerCase() === 'welcome15') {
                            setCouponApplied(true)
                          }
                        }}
                      >
                        <Tag className="mr-2 h-4 w-4" />
                        Apply
                      </Button>
                    </div>
                    {couponApplied && (
                      <p className="text-sm text-primary">
                        Coupon WELCOME15 applied! 10% discount
                      </p>
                    )}

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-foreground">{formatPrice(subtotal)}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Discount</span>
                          <span className="text-primary">-{formatPrice(discount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Shipping</span>
                        <span className="text-foreground">
                          {shipping === 0 ? (
                            <span className="text-primary">Free</span>
                          ) : (
                            formatPrice(shipping)
                          )}
                        </span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>

                    {/* Free Shipping Notice */}
                    {shipping > 0 && (
                      <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3 text-sm">
                        <Truck className="h-4 w-4 text-primary" />
                        <span className="text-foreground">
                          Add {formatPrice(99 - subtotal)} more for free shipping!
                        </span>
                      </div>
                    )}

                    {/* Checkout Button */}
                    <Link href="/checkout" className="block">
                      <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                        Proceed to Checkout
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>

                    {/* Continue Shopping */}
                    <Link href="/" className="block">
                      <Button variant="outline" className="w-full">
                        Continue Shopping
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center">
              <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="mb-2 text-2xl font-semibold text-foreground">
                Your cart is empty
              </h2>
              <p className="mb-8 text-muted-foreground">
                Looks like you haven&apos;t added any items yet.
              </p>
              <Link href="/">
                <Button className="gap-2 bg-primary text-primary-foreground">
                  Start Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          )}

          {/* Recommended Products */}
          {recommendedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 text-2xl font-bold text-foreground">
                You May Also Like
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {recommendedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
