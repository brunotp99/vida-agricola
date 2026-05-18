import type { Prisma } from "@/lib/generated/prisma/client"

type ShippingMethod = "standard" | "express"

type CartWithItems = {
  items: Array<{
    quantity: number
    product: { price: Prisma.Decimal }
    variant: { price: Prisma.Decimal } | null
  }>
}

type CouponData = {
  type: string
  value: Prisma.Decimal
} | null

function calculateShipping(subtotal: number, method: ShippingMethod): number {
  if (method === "express") return 19.99
  return subtotal >= 99 ? 0 : 9.99
}

function calculateTotals(
  cart: CartWithItems,
  shippingMethod: ShippingMethod,
  coupon: CouponData = null,
) {
  const subtotal = cart.items.reduce((sum, item) => {
    const price = Number(item.variant?.price ?? item.product.price)
    return sum + price * item.quantity
  }, 0)

  let discount = 0
  if (coupon) {
    if (coupon.type === "percentage") {
      discount = Math.round(subtotal * (Number(coupon.value) / 100) * 100) / 100
    } else {
      discount = Math.min(Number(coupon.value), subtotal)
    }
  }

  const shippingAmount = calculateShipping(subtotal, shippingMethod)
  const taxableAmount = subtotal - discount
  const taxAmount = Math.round(taxableAmount * 0.23 * 100) / 100
  const total = taxableAmount + shippingAmount + taxAmount

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    shippingAmount: Math.round(shippingAmount * 100) / 100,
    taxAmount,
    total: Math.round(total * 100) / 100,
  }
}

export const ShippingService = {
  calculateShipping,
  calculateTotals,
}
