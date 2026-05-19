"use client"

import Image from "next/image"
import { Lock, Truck } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/utils"

type CartItem = {
  id: string
  quantity: number
  product: {
    name: string
    price: { toString(): string }
    images: Array<{ url: string }>
  }
  variant: { price: { toString(): string } } | null
}

type Totals = {
  subtotal: number
  discount: number
  shippingAmount: number
  taxAmount: number
  total: number
}

type Props = {
  items: CartItem[]
  totals: Totals
  couponCode?: string
}

export function OrderSummary({ items, totals, couponCode }: Props) {
  return (
    <Card className="sticky top-24 border-border">
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => {
            const price = Number(item.variant?.price ?? item.product.price)
            const image = item.product.images[0]?.url
            return (
              <div key={item.id} className="flex items-center gap-3">
                {image && (
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    <Image src={image} alt={item.product.name} fill className="object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm text-foreground shrink-0">
                  {formatPrice(price * item.quantity)}
                </span>
              </div>
            )
          })}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatPrice(totals.subtotal)}</span>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount {couponCode && `(${couponCode})`}</span>
              <span>-{formatPrice(totals.discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{totals.shippingAmount === 0 ? "Free" : formatPrice(totals.shippingAmount)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax (23% VAT)</span>
            <span>{formatPrice(totals.taxAmount)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>{formatPrice(totals.total)}</span>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Lock className="h-3 w-3" />
            Secure checkout
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Truck className="h-3 w-3" />
            Fast delivery
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
