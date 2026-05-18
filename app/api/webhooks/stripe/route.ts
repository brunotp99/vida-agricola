import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { OrderService } from "@/lib/services/order.service"
import { CartService } from "@/lib/services/cart.service"
import { InventoryService } from "@/lib/services/inventory.service"
import { EmailService } from "@/lib/services/email.service"
import { prisma } from "@/lib/prisma"
import type Stripe from "stripe"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or secret" }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent
    const { cartId, userId, couponId, shippingMethod, shippingAddress } = pi.metadata

    const existing = await prisma.order.findUnique({ where: { paymentIntentId: pi.id } })
    if (existing) return NextResponse.json({ received: true })

    try {
      const parsedAddress = JSON.parse(shippingAddress)
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true, variant: true } } },
      })
      if (!cart) return NextResponse.json({ received: true })

      const subtotal = cart.items.reduce((sum, item) => {
        return sum + Number(item.variant?.price ?? item.product.price) * item.quantity
      }, 0)

      const shippingAmount = shippingMethod === "express" ? 19.99 : subtotal >= 99 ? 0 : 9.99
      const discountAmount = pi.amount_received / 100 - subtotal - shippingAmount - subtotal * 0.23

      const order = await OrderService.createOrder({
        userId: userId === "guest" ? "guest" : userId,
        cartId,
        paymentIntentId: pi.id,
        shippingAddress: parsedAddress,
        shippingAmount,
        discountAmount: Math.max(0, Math.round(-discountAmount * 100) / 100),
        couponId: couponId || undefined,
      })

      await CartService.clearCart(cartId)

      for (const item of cart.items) {
        await InventoryService.logMovement(
          item.productId,
          item.variantId,
          -item.quantity,
          "sale",
          order.id,
        )
      }

      if (userId !== "guest") {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        if (user) {
          await EmailService.sendOrderConfirmation({ ...order, user })
        }
      }
    } catch (err) {
      console.error("Webhook order creation failed:", err)
      return NextResponse.json({ error: "Order creation failed" }, { status: 500 })
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object as Stripe.PaymentIntent
    const { cartId } = pi.metadata
    if (cartId) {
      const cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: true },
      })
      if (cart) {
        for (const item of cart.items) {
          await InventoryService.releaseStock(item.productId, item.variantId, item.quantity)
        }
      }
    }
  }

  return NextResponse.json({ received: true })
}
