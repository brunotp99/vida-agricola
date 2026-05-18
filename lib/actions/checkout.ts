"use server"

import { headers, cookies } from "next/headers"
import { auth } from "@/lib/auth"
import { CartService } from "@/lib/services/cart.service"
import { ShippingService } from "@/lib/services/shipping.service"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { AddressSchema } from "@/lib/validations/checkout.schema"

const CreatePaymentIntentSchema = z.object({
  cartId: z.string(),
  shippingMethod: z.enum(["standard", "express"]),
  shippingAddress: AddressSchema,
  couponCode: z.string().optional(),
})

export async function createPaymentIntentAction(input: unknown) {
  try {
    const parsed = CreatePaymentIntentSchema.safeParse(input)
    if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

    const { cartId, shippingMethod, shippingAddress, couponCode } = parsed.data

    const session = await auth.api.getSession({ headers: await headers() })
    const userId = session?.user.id ?? "guest"

    const cookieStore = await cookies()
    const sessionId = cookieStore.get("guest-session-id")?.value

    const cart =
      userId !== "guest"
        ? await CartService.getCartWithItems({ userId })
        : sessionId
          ? await CartService.getCartWithItems({ sessionId })
          : null

    if (!cart || cart.items.length === 0) {
      return { success: false, error: "Cart is empty" }
    }

    if (cart.id !== cartId) {
      return { success: false, error: "Cart mismatch" }
    }

    let coupon = null
    let couponId: string | undefined
    if (couponCode) {
      coupon = await prisma.coupon.findFirst({
        where: { code: { equals: couponCode, mode: "insensitive" }, active: true },
      })
      if (coupon) couponId = coupon.id
    }

    const totals = ShippingService.calculateTotals(cart, shippingMethod, coupon)

    const pi = await stripe.paymentIntents.create({
      amount: Math.round(totals.total * 100),
      currency: "eur",
      metadata: {
        cartId,
        userId,
        couponId: couponId ?? "",
        shippingMethod,
        shippingAddress: JSON.stringify(shippingAddress),
      },
    })

    return { success: true, data: { clientSecret: pi.client_secret!, totals } }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create payment intent",
    }
  }
}
